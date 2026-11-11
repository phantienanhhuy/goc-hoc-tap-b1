import {createAppState, normalizeAppState} from './state.js';

const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
const clone = value => structuredClone(value);
const key = path => JSON.stringify(path);
const arrays = ['resources', 'mistakes', 'scores', 'pinned'];
const schoolArrays = ['lessons', 'papers', 'sessions'];
const schoolCollections = {lessons:'school_lessons', papers:'school_papers', sessions:'school_sessions'};

// The record identity is independent of array position. The order manifests also
// distinguish an intentionally empty collection from an uninitialized one.
export function stateToRecords(state) {
  const records = [];
  const put = (collection, path, value) => records.push({collection, key:key(path), value:clone(value), deleted:false});
  const fields = (collection, prefix, object) => {
    for (const [name, value] of Object.entries(object || {})) {
      if (!forbidden.has(name)) put(collection, [...prefix, name], value);
    }
  };
  fields('settings', [], state.settings);
  for (const [date, day] of Object.entries(state.days || {})) {
    if (forbidden.has(date)) continue;
    const {completed = {}, ...core} = day;
    put('days', [date, 'core'], core);
    fields('days', [date, 'completed'], completed);
  }
  for (const [number, skills] of Object.entries(state.exams || {})) for (const [skill, exam] of Object.entries(skills || {})) {
    if (forbidden.has(number) || forbidden.has(skill)) continue;
    const {parts = [], attempts = [], ...core} = exam;
    fields('exams', [number, skill, 'core'], core);
    parts.forEach((value, i) => put('exams', [number, skill, 'part', String(i)], value));
    put('exams', [number, skill, 'attempt_order'], attempts.map(x => x.id));
    for (const attempt of attempts) if (typeof attempt.id === 'string' && !forbidden.has(attempt.id)) put('exams', [number, skill, 'attempt', attempt.id], attempt);
  }
  const entities = (collection, items, kind) => {
    put(collection, ['order'], items.map(x => x.id));
    for (const item of items) {
      if (typeof item.id !== 'string' || forbidden.has(item.id)) continue;
      const copy = clone(item);
      if (kind === 'lessons') {
        const steps = copy.steps || {}; delete copy.steps;
        put(collection, ['item', item.id], copy);
        fields(collection, ['step', item.id], steps);
      } else if (kind === 'papers') {
        const attempts = copy.attempts || []; delete copy.attempts;
        put(collection, ['item', item.id], copy);
        put(collection, ['attempt_order', item.id], attempts.map(x => x.id));
        for (const attempt of attempts) if (typeof attempt.id === 'string' && !forbidden.has(attempt.id)) put(collection, ['attempt', item.id, attempt.id], attempt);
      } else put(collection, ['item', item.id], copy);
    }
  };
  for (const name of arrays) entities(name, state[name] || [], name);
  entities('writing_entries', state.writingEntries || [], 'writingEntries');
  const school = state.school || {};
  for (const [name, value] of Object.entries(school)) if (!schoolArrays.includes(name) && !forbidden.has(name)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) fields('school_settings', [name], value);
    else put('school_settings', [name], value);
  }
  for (const name of schoolArrays) entities(schoolCollections[name], school[name] || [], name);
  return records;
}

export function recordsToState(rows) {
  const state = createAppState();
  state.days = {};
  for (const name of arrays) state[name] = [];
  state.writingEntries = [];
  for (const name of schoolArrays) state.school[name] = [];
  const maps = new Map();
  for (const row of rows || []) {
    if (row.deleted) continue;
    let path; try { path = JSON.parse(row.key); } catch { continue; }
    if (!Array.isArray(path) || !path.length || path.some(p => typeof p !== 'string' || forbidden.has(p))) continue;
    if (!maps.has(row.collection)) maps.set(row.collection, new Map());
    maps.get(row.collection).set(key(path), clone(row.value));
  }
  const entries = collection => [...(maps.get(collection) || new Map())].map(([k,v]) => [JSON.parse(k),v]);
  for (const [p,v] of entries('settings')) if (p.length === 1 && Object.hasOwn(state.settings,p[0])) state.settings[p[0]] = v;
  for (const [p,v] of entries('school_settings')) {
    if (!Object.hasOwn(state.school,p[0]) || schoolArrays.includes(p[0])) continue;
    if (p.length === 1) state.school[p[0]] = v;
    else if (p.length === 2 && state.school[p[0]] && typeof state.school[p[0]] === 'object' && Object.hasOwn(state.school[p[0]],p[1])) state.school[p[0]][p[1]] = v;
  }
  for (const [p,v] of entries('days')) if (p.length >= 2) {
    state.days[p[0]] ||= {completed:{}};
    if (p[1] === 'core' && v && typeof v === 'object' && !Array.isArray(v)) state.days[p[0]] = {...v, completed:state.days[p[0]].completed};
    if (p[1] === 'completed' && p.length === 3) state.days[p[0]].completed[p[2]] = v;
  }
  const examAttempts = new Map();
  for (const [p,v] of entries('exams')) {
    const exam = state.exams?.[p[0]]?.[p[1]]; if (!exam) continue;
    if (p[2] === 'core' && p.length === 4 && Object.hasOwn(exam,p[3]) && !['parts','attempts'].includes(p[3])) exam[p[3]] = v;
    if (p[2] === 'part' && p.length === 4 && /^\d+$/.test(p[3]) && +p[3] < exam.parts.length) exam.parts[+p[3]] = v;
    const id = key(p.slice(0,2)); if (!examAttempts.has(id)) examAttempts.set(id, {exam,order:[],items:new Map()});
    if (p[2] === 'attempt_order' && Array.isArray(v)) examAttempts.get(id).order = v;
    if (p[2] === 'attempt' && p.length === 4) examAttempts.get(id).items.set(p[3],v);
  }
  const ordered = (order, items) => {
    const ids = [], seen = new Set();
    for (const id of [...order, ...items.keys()]) if (typeof id === 'string' && items.has(id) && !seen.has(id)) { seen.add(id); ids.push(id); }
    return ids.map(id => items.get(id));
  };
  for (const {exam,order,items} of examAttempts.values()) exam.attempts = ordered(order, items);
  const restore = (collection, kind) => {
    const items = new Map(), steps = new Map(), attempts = new Map(), orders = new Map(); let order = [];
    for (const [p,v] of entries(collection)) {
      if (p[0] === 'order' && Array.isArray(v)) order = v;
      if (p[0] === 'item' && p.length === 2 && v && typeof v === 'object') items.set(p[1],v);
      if (p[0] === 'step' && p.length === 3) { if (!steps.has(p[1])) steps.set(p[1],{}); steps.get(p[1])[p[2]] = v; }
      if (p[0] === 'attempt_order' && p.length === 2 && Array.isArray(v)) orders.set(p[1],v);
      if (p[0] === 'attempt' && p.length === 3) { if (!attempts.has(p[1])) attempts.set(p[1],new Map()); attempts.get(p[1]).set(p[2],v); }
    }
    return ordered(order, items).map(item => {
      const id = item.id;
      if (kind === 'lessons') item.steps = steps.get(id) || {};
      if (kind === 'papers') item.attempts = ordered(orders.get(id) || [], attempts.get(id) || new Map());
      return item;
    });
  };
  for (const name of arrays) state[name] = restore(name,name);
  state.writingEntries = restore('writing_entries','writingEntries');
  for (const name of schoolArrays) state.school[name] = restore(schoolCollections[name],name);
  const normalized = normalizeAppState(state);
  // The legacy normalizer unconditionally restores all seeded resources.
  const resourceIds = new Set(state.resources.map(x => x.id));
  normalized.resources = normalized.resources.filter(x => resourceIds.has(x.id));
  return normalized;
}

export const recordIdentity = row => JSON.stringify([row.collection,row.key]);
