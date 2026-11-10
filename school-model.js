import { CURRICULUM } from './school-curriculum.js';
import { CASIO_TIPS } from './school-library.js';
export const SUBJECTS = [{ id: 'math', label: 'Toán' }, { id: 'physics', label: 'Vật lí' }, { id: 'it', label: 'Tin học · Khoa học máy tính' }];
export const STAGES = [{ id: 'theory', label: 'Lý thuyết' }, { id: 'basic', label: 'Cơ bản' }, { id: 'advanced', label: 'Nâng cao' }, { id: 'correction', label: 'Sửa lỗi' }, { id: 'casio', label: 'Casio' }];
const isObject = x => x && typeof x === 'object' && !Array.isArray(x);
const text = (x, n = 2000) => typeof x === 'string' ? x.slice(0, n) : '';
const dateOk = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && !Number.isNaN(Date.parse(x + 'T00:00:00Z')) && new Date(x + 'T00:00:00Z').toISOString().slice(0, 10) === x;
const subjectOk = x => SUBJECTS.some(s => s.id === x);
const stageOk = x => STAGES.some(s => s.id === x);
const status = x => ['todo', 'doing', 'done'].includes(x) ? x : 'todo';
const url = x => /^(https?:\/\/|$)/i.test(text(x, 2048).trim()) ? text(x, 2048).trim() : '';
const num = (x, fallback, min, max) => Number.isFinite(Number(x)) && Number(x) >= min && Number(x) <= max ? Number(x) : fallback;
export function createSchoolState() { return { targets: { math: 9.25, physics: 8.75, it: 10 }, semesterDate: '', examDate: '', weeklySessions: 3, sessionMinutes: 75, calculatorModel: 'fx-580VN X', casioDone: [], books: { math: 'Kết nối tri thức', physics: 'Kết nối tri thức', it: 'Kết nối tri thức · Khoa học máy tính' }, lessons: CURRICULUM.map(x => ({ ...x, status: 'todo', steps: Object.fromEntries(STAGES.map(s => [s.id, false])), quantity: 10, note: '', url: '' })), papers: [], sessions: [] }; }
export function normalizeSchoolState(raw) {
  const out = createSchoolState(); if (!isObject(raw)) return out;
  out.calculatorModel = text(raw.calculatorModel, 100).trim() || out.calculatorModel; if (Array.isArray(raw.casioDone)) out.casioDone = [...new Set(raw.casioDone.filter(id => CASIO_TIPS.some(t => t.id === id)))];
  for (const s of SUBJECTS) { out.targets[s.id] = num(raw.targets?.[s.id], out.targets[s.id], 0, 10); if (typeof raw.books?.[s.id] === 'string') out.books[s.id] = text(raw.books[s.id], 200); }
  out.semesterDate = dateOk(raw.semesterDate) ? raw.semesterDate : ''; out.examDate = dateOk(raw.examDate) ? raw.examDate : '';
  out.weeklySessions = Math.round(num(raw.weeklySessions, 3, 1, 7)); out.sessionMinutes = Math.round(num(raw.sessionMinutes, 75, 10, 600));
  if (Array.isArray(raw.lessons)) out.lessons = raw.lessons.filter(x => isObject(x) && subjectOk(x.subject) && text(x.id, 100)).map(x => ({ id: text(x.id, 100), subject: x.subject, chapter: text(x.chapter, 200), title: text(x.title, 200), status: status(x.status), steps: Object.fromEntries(STAGES.map(s => [s.id, x.steps?.[s.id] === true])), quantity: Math.round(num(x.quantity, 10, 1, 500)), note: text(x.note), url: url(x.url) }));
  if (Array.isArray(raw.papers)) out.papers = raw.papers.filter(x => isObject(x) && subjectOk(x.subject) && text(x.id, 100)).map(x => ({ id: text(x.id, 100), subject: x.subject, title: text(x.title, 200), status: status(x.status), url: url(x.url), attempts: Array.isArray(x.attempts) ? x.attempts.filter(a => isObject(a) && text(a.id, 100) && dateOk(a.date) && typeof a.score === 'number' && Number.isFinite(a.score) && a.score >= 0 && a.score <= 10).map(a => ({ id: text(a.id, 100), date: a.date, score: a.score, minutes: num(a.minutes, 0, 0, 600), wrongQuestions: text(a.wrongQuestions, 1000), weakTopics: text(a.weakTopics, 1000), corrected: a.corrected === true, note: text(a.note) })) : [] }));
  if (Array.isArray(raw.sessions)) out.sessions = raw.sessions.filter(x => isObject(x) && text(x.id, 100) && dateOk(x.date) && subjectOk(x.subject)).map(x => ({ id: text(x.id, 100), date: x.date, subject: x.subject, lessonId: text(x.lessonId, 100), stage: stageOk(x.stage) ? x.stage : 'theory', quantity: Math.round(num(x.quantity, 10, 1, 500)), duration: Math.round(num(x.duration, 75, 10, 600)), done: x.done === true }));
  return out;
}
export function addSchoolSession(state, data, id) {
  const school = state.school; const lesson = school.lessons.find(l => l.id === data.lessonId);
  if ((data.lessonId && (!lesson || lesson.subject !== data.subject)) || !subjectOk(data.subject) || !dateOk(data.date) || !stageOk(data.stage)) throw new TypeError('Thông tin buổi học chưa hợp lệ');
  const session = { id, date: data.date, subject: data.subject, lessonId: lesson?.id || '', stage: data.stage, quantity: Math.round(num(data.quantity, 10, 1, 500)), duration: Math.round(num(data.duration, school.sessionMinutes, 10, 600)), done: false };
  const stage = STAGES.find(s => s.id === session.stage).label;
  const title = text(data.title, 200).trim() || lesson?.title || SUBJECTS.find(s => s.id === session.subject).label;
  school.sessions.push(session); state.pinned.push({ id, date: session.date, title: `${title} · ${stage}${session.stage === 'theory' ? '' : ` · ${session.quantity} câu`} · ${session.duration} phút`, done: false, subject: session.subject, lessonId: session.lessonId, stage: session.stage }); return session;
}
export function weekRange(date) { const d = new Date(date + 'T00:00:00Z'); const offset = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - offset); const start = d.toISOString().slice(0, 10); d.setUTCDate(d.getUTCDate() + 6); return [start, d.toISOString().slice(0, 10)]; }
