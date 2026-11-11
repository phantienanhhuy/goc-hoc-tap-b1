import {stateToRecords, recordsToState, recordIdentity} from './sync-model.js';

const copy = value => structuredClone(value);
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const valueOf = row => row && !row.deleted ? row.value : undefined;
const mapRows = rows => new Map(rows.map(row => [recordIdentity(row), copy(row)]));

export function createSyncEngine({transport, initialState, cache, accountId, onRemoteState = () => {}, onStatus = () => {}}) {
  if (!transport || !cache || !accountId) throw new TypeError('Missing sync configuration');
  const cacheKey = `sync:${accountId}`;
  let visible = mapRows(stateToRecords(initialState));
  let remote = new Map(), pending = new Map(), conflictRows = [];
  let state = {phase:'idle', pending:0}, stopped = false, generation = 0, running = null, persistence = Promise.resolve(), inFlight = new Set();
  const active = token => !stopped && token === generation;
  const status = () => copy({...state, pending:pending.size});
  const setStatus = (phase, extra = {}) => { if (!stopped) { state = {phase,...extra}; onStatus(status()); } };
  const persist = () => {
    const snapshot = {pending:[...pending], visible:[...visible]};
    persistence = persistence.catch(() => {}).then(() => cache.set(cacheKey, snapshot));
    return persistence;
  };
  const desired = () => {
    const result = new Map(remote);
    for (const [id, change] of pending) result.set(id, {collection:change.collection,key:change.key,value:copy(change.value),deleted:change.deleted});
    return result;
  };
  const publish = () => {
    const merged = desired();
    visible = mapRows(stateToRecords(recordsToState([...merged.values()])));
    onRemoteState(recordsToState([...merged.values()]));
  };
  const detectConflicts = () => {
    const conflicts = [];
    for (const [id, change] of pending) {
      const current = remote.get(id), version = current?.version || 0;
      if (version !== change.expected_version && !same(valueOf(current), change.deleted ? undefined : change.value)) conflicts.push({change:copy(change), remote:current ? copy(current) : null});
    }
    return conflicts;
  };
  async function read(token) {
    const rows = await transport.readAll();
    if (!active(token)) return false;
    remote = mapRows(rows);
    return true;
  }
  async function reconcile(token, allowEmpty = false) {
    if (!await read(token)) return;
    if (!remote.size && !allowEmpty) { setStatus('empty'); return 'empty'; }
    conflictRows = detectConflicts();
    publish();
    if (!active(token)) return;
    if (conflictRows.length) { await persist(); setStatus('conflict', {conflicts:copy(conflictRows)}); return 'conflict'; }
    // An identical value already on the server needs no write.
    for (const [id, change] of pending) if (same(valueOf(remote.get(id)), change.deleted ? undefined : change.value)) pending.delete(id);
    await persist();
    if (!active(token)) return;
    if (pending.size) return flush(token);
    setStatus('synced'); return 'ready';
  }
  async function flush(token) {
    while (active(token) && pending.size) {
      const batch = [...pending].map(([id,c]) => [id,copy(c)]);
      inFlight = new Set(batch.map(([id]) => id));
      let result;
      try { result = await transport.apply(batch.map(([,c]) => c)); }
      finally { inFlight = new Set(); }
      if (!active(token)) return;
      if (!result?.ok) {
        await read(token); if (!active(token)) return;
        conflictRows = detectConflicts();
        if (!conflictRows.length) { setStatus('error', {error:'Write was rejected'}); return 'error'; }
        publish(); await persist(); setStatus('conflict', {conflicts:copy(conflictRows)}); return 'conflict';
      }
      const acknowledgedRows = mapRows(result.records || []);
      if (batch.some(([id]) => !Number.isInteger(acknowledgedRows.get(id)?.version))) throw new Error('Incomplete sync acknowledgment');
      for (const [id,row] of acknowledgedRows) remote.set(id,row);
      for (const [id, sent] of batch) {
        const current = pending.get(id), acknowledged = remote.get(id);
        if (current && same(current,sent)) pending.delete(id);
        else if (current && acknowledged) current.expected_version = acknowledged.version;
      }
      // A successful response must include every accepted version; otherwise it
      // is unsafe to claim success or use the response as a new CAS base.
      await persist();
    }
    if (active(token)) { publish(); setStatus('synced'); return 'ready'; }
  }
  const run = fn => {
    if (stopped) return Promise.resolve();
    if (running) return running;
    const token = generation;
    running = Promise.resolve().then(() => fn(token)).catch(error => {
      if (active(token)) setStatus('error', {error:String(error?.message || error)});
      return 'error';
    }).finally(() => { running = null; });
    return running;
  };
  return {
    status,
    async start() {
      return run(async token => {
        setStatus('loading');
        const saved = await cache.get(cacheKey);
        if (!active(token)) return;
        if (saved && Array.isArray(saved.pending)) pending = new Map(saved.pending);
        if (saved && Array.isArray(saved.visible) && pending.size) visible = new Map(saved.visible);
        return reconcile(token);
      });
    },
    localChanged(nextState) {
      if (stopped) return Promise.resolve();
      const next = mapRows(stateToRecords(nextState));
      const ids = new Set([...visible.keys(), ...next.keys()]);
      let changed = false;
      for (const id of ids) {
        const before = visible.get(id), after = next.get(id);
        if (same(valueOf(before),valueOf(after))) continue;
        changed = true;
        const existing = pending.get(id), base = remote.get(id);
        const row = after || before;
        const change = {collection:row.collection,key:row.key,value:after ? copy(after.value) : null,deleted:!after,expected_version:existing?.expected_version ?? base?.version ?? 0};
        if (!inFlight.has(id) && same(valueOf(base), after ? after.value : undefined)) pending.delete(id);
        else pending.set(id,change);
      }
      if (!changed) return Promise.resolve();
      visible = next;
      if (!['loading','empty','conflict','error'].includes(state.phase)) setStatus(pending.size ? 'pending' : 'synced');
      return persist().catch(error => { setStatus('error',{error:String(error?.message || error)}); });
    },
    syncNow() { return run(async token => { setStatus('syncing'); await persistence; return reconcile(token); }); },
    initializeRemote(nextState) {
      return run(async token => {
        setStatus('syncing');
        if (!await read(token)) return;
        if (remote.size) { setStatus('error',{error:'Cloud is no longer empty'}); return 'error'; }
        visible = new Map(); pending = new Map();
        await this.localChanged(nextState);
        if (!active(token)) return;
        return flush(token);
      });
    },
    resolveConflict(choice) {
      return run(async token => {
        if (!['local','remote'].includes(choice)) throw new TypeError('Invalid conflict resolution');
        if (!await read(token)) return;
        const conflicts = detectConflicts();
        for (const {change} of conflicts) {
          const id = recordIdentity(change);
          if (choice === 'remote') pending.delete(id);
          else pending.get(id).expected_version = remote.get(id)?.version || 0;
        }
        conflictRows = []; publish(); await persist();
        if (!active(token)) return;
        return pending.size ? flush(token) : (setStatus('synced'), 'ready');
      });
    },
    stop() { stopped = true; generation++; },
  };
}
