export const SKILLS = [
  { id: 'lesen', label: 'Đọc', parts: 5 }, { id: 'hoeren', label: 'Nghe', parts: 4 },
  { id: 'schreiben', label: 'Viết', parts: 3 }, { id: 'sprechen', label: 'Nói', parts: 3 },
];
export const STATUS = [{ id: 'todo', label: 'Chưa làm' }, { id: 'doing', label: 'Đang làm' }, { id: 'done', label: 'Đã làm' }];
export const ROTATION_LABELS = { A: 'Đọc + ngữ pháp', B: 'Viết + nói theo chủ đề', C: 'Nghe đề + VHS', D: 'Đọc + nói liên tục' };
const rotations = Object.keys(ROTATION_LABELS);
const rotationIds = { A: ['reading', 'grammar'], B: ['writing', 'speaking'], C: ['exam-listening', 'vhs'], D: ['reading', 'speaking-free'] };
const legacyIds = { A: ['writing', 'grammar'], B: ['reading', 'speaking'], C: ['writing', 'vhs'] };
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + 'T00:00:00Z')) && new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value;
const str = value => typeof value === 'string' ? value : '';
const object = value => value && typeof value === 'object' && !Array.isArray(value);
export function newId() { return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
export function localDate(date = new Date()) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date); }
export function dayDiff(target, today = localDate()) { return validDate(target) && validDate(today) ? Math.round((Date.parse(target + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000) : null; }
const seedResources = () => [
  { id: 'memrise-a2', title: 'Memrise A2', url: 'https://community-courses.memrise.com/community/course/6394179/netzwerk-neu-a21-ctt/', position: '', note: '' },
  { id: 'memrise-b1', title: 'Memrise B1', url: 'https://community-courses.memrise.com/community/course/6705928/netzwerk-neu-b11-cuthientrang/', position: '', note: '' },
  { id: 'nicos', title: 'Nicos Weg', url: 'https://www.youtube.com/watch?v=LkufozluseI', position: '', note: '' },
  { id: 'vhs', title: 'VHS Lernportal', url: 'https://b1.vhs-lernportal.de/wws/9.php#/wws/100002.php', position: '', note: '' },
  { id: 'book15', title: 'Zertifikat B1 neu – 15 Übungsprüfungen', url: '', position: '', note: '' },
  { id: 'book15-audio', title: 'Nghe · 15 đề B1', url: 'https://www.youtube.com/watch?v=ZwuCm_v7Nzk&list=PLwko0QEqHNu-gE7oIQnR8d46y3ftx5qwB&index=1', position: '', note: '' },
  { id: 'grammar', title: 'Netzwerk neu A1–B1 · Grammatik', url: '', position: '', note: '' },
];
const exams = () => Object.fromEntries(Array.from({ length: 15 }, (_, i) => [String(i + 1), Object.fromEntries(SKILLS.map(s => [s.id, { parts: Array(s.parts).fill('todo'), corrected: false, attempts: [], note: '' }]))]));
export function createState() { return { version: 1, settings: { readyDate: '2026-12-31', examDate: '', dailyMinutes: 120 }, days: {}, exams: exams(), resources: seedResources(), mistakes: [], scores: [['hoeren', 27], ['lesen', 53], ['schreiben', 39], ['sprechen', 47]].map(([skill, score]) => ({ id: `baseline-${skill}`, date: '2026-10-02', skill, score, source: 'Kỳ thi 09–10/2026', baseline: true })), pinned: [] }; }
export function getRotation(state, before = '9999-99-99') { const completed = Object.entries(state.days || {}).filter(([date, day]) => date < before && day && !day.light && (day.planVersion === 1 ? legacyIds : rotationIds)[day.rotation]?.every(id => day.completed?.[id] === true)).sort(([a], [b]) => a.localeCompare(b)); const last = completed.at(-1)?.[1]; return last ? rotations[(rotations.indexOf(last.rotation) + 1) % rotations.length] : 'A'; }
const task = (id, title, minutes, category, steps, resourceId) => ({ id, title, minutes, category, steps, ...(resourceId ? { resourceId } : {}) });
export function getDailyTasks(state, date = localDate()) {
  if (!validDate(date)) throw new TypeError('Ngày không hợp lệ');
  if (!state.days[date]) state.days[date] = { completed: {}, rotation: getRotation(state, date), light: false, note: '', planVersion: 2, manualRotation: false };
  const day = state.days[date];
  if (!day.manualRotation && !Object.values(day.completed).some(Boolean)) { day.rotation = getRotation(state, date); day.planVersion = 2; }
  const hearing = light => task('hearing', 'Nghe kỹ · 1 đoạn Nicos Weg', light ? 15 : 35, 'Nghe', light ? [
    'Chọn đoạn khoảng 45 giây; nghe 2 lần không nhìn lời', 'Nghe từng đoạn 5–10 giây, tối đa 3 lần', 'Phân biệt từ chưa biết và từ đã biết nhưng không nghe ra', 'Đọc và hiểu lời; ghi tối đa 3 cụm từ', 'Nghe lại nếu còn thời gian'
  ] : [
    'Chọn đoạn 45–90 giây; nghe 2 lần không nhìn lời', 'Nghe và nhắc lại từng đoạn 5–10 giây, tối đa 3 lần', 'Phân biệt từ chưa biết và từ đã biết nhưng không nghe ra', 'Đọc và hiểu lời; ghi tối đa 5 cụm từ', 'Nghe 2 lần không nhìn lời', 'Viết 3 câu', 'Nếu có thời gian, nghe lại đoạn hôm qua'
  ], 'nicos');
  if (day.light) return [task('review', 'Ôn từ · 10 phút', 10, 'Ôn tập', ['Ôn trong 10 phút']), hearing(true), task('corrections', 'Sửa lỗi · 3 câu', 5, 'Ôn tập', ['Sửa và viết 3 câu'])];
  const fixed = [task('memrise-a2', 'Memrise A2 · 10 từ mới', 10, 'Từ vựng', ['Học 10 từ mới'], 'memrise-a2'), task('memrise-b1', 'Memrise B1 · 10 từ mới', 10, 'Từ vựng', ['Học 10 từ mới'], 'memrise-b1'), task('review', 'Ôn từ · 10 phút + 3 câu', 10, 'Ôn tập', ['Ôn 10 phút', 'Viết 3 câu']), hearing(false)];
  const writing = () => task('writing', 'Viết · 1 Teil', 30, 'Viết', ['Phân tích yêu cầu đề', 'Viết 1 Teil', 'Nhận phản hồi và chọn 3 lỗi', 'Viết lại 3 câu'], 'book15');
  const reading = () => task('reading', 'Đọc · 1 Teil', 30, 'Đọc', ['Làm 1 Teil có bấm giờ', 'Kiểm tra đáp án', 'Tìm bằng chứng trong bài'], 'book15');
  const grammar = () => task('grammar', 'Ngữ pháp · 10 câu + 3 câu tự viết', 25, 'Ngữ pháp', ['Làm 10 câu', 'Tự sửa lỗi', 'Viết 3 câu'], 'grammar');
  const speaking = () => task('speaking', 'Nói · 1 chủ đề B1, 5 ý', 25, 'Nói', ['Chọn 1 chủ đề, ghi 5 ý', 'Ghi âm', 'Sửa lỗi và nói lại']);
  const vhs = () => task('vhs', 'VHS · 3 hoạt động trong 20 phút', 20, 'Luyện tập', ['Làm 3 hoạt động trong 20 phút'], 'vhs');
  const options = day.planVersion === 1 ? { A: [writing(), grammar()], B: [reading(), speaking()], C: [writing(), vhs()] } : {
    A: [reading(), grammar()], B: [writing(), speaking()],
    C: [task('exam-listening', 'Nghe đề · 1 Teil', 30, 'Nghe', ['Làm 1 Teil trong bộ 15 đề', 'Kiểm tra đáp án và sửa lỗi'], 'book15-audio'), vhs()],
    D: [reading(), task('speaking-free', 'Nói liên tục · 2–3 phút × 2', 25, 'Nói', ['Chọn 1 chủ đề; ghi 3 ý trong 30 giây', 'Nói 2–3 phút, ghi âm; không đọc bài soạn', 'Nghe lại; chọn 3 lỗi để sửa', 'Nói lại 2–3 phút cùng chủ đề'])],
  };
  return [...fixed, ...(options[day.rotation] || options.A)];
}
export function completeTask(state, date, id, done) { getDailyTasks(state, date); if (typeof id !== 'string' || !id) return state; state.days[date].completed[id] = Boolean(done); return state; }
export function setRotation(state, date, rotation) { if (!rotations.includes(rotation)) return state; getDailyTasks(state, date); Object.assign(state.days[date], { rotation, planVersion: 2, manualRotation: true }); return state; }
export function updateExamPart(state, exam, skill, part, status) { const item = state.exams?.[String(exam)]?.[skill]; if (!item || !Number.isInteger(part) || part < 0 || part >= item.parts.length || !STATUS.some(s => s.id === status)) return state; item.parts[part] = status; return state; }
export function skillStatus(parts) { if (!Array.isArray(parts) || !parts.length || parts.every(p => p === 'todo')) return 'todo'; return parts.every(p => p === 'done') ? 'done' : 'doing'; }
export function normalizeState(raw) {
  if (!object(raw) || raw.version !== 1) throw new TypeError('Dữ liệu không hợp lệ hoặc phiên bản không được hỗ trợ');
  const state = createState();
  if (object(raw.settings)) { const s = raw.settings; if (validDate(s.readyDate)) state.settings.readyDate = s.readyDate; if (s.examDate === '' || validDate(s.examDate)) state.settings.examDate = s.examDate; if (Number.isFinite(s.dailyMinutes) && s.dailyMinutes > 0 && s.dailyMinutes <= 1440) state.settings.dailyMinutes = s.dailyMinutes; }
  if (object(raw.days)) for (const [date, day] of Object.entries(raw.days)) { if (!validDate(date) || !object(day)) continue; const completed = {}; if (object(day.completed)) for (const [id, value] of Object.entries(day.completed)) if (id !== '__proto__' && id !== 'constructor' && id !== 'prototype' && typeof value === 'boolean') completed[id] = value; const started = Object.values(completed).some(Boolean); const planVersion = day.planVersion === 2 ? 2 : day.planVersion === 1 || started ? 1 : 2; state.days[date] = { completed, rotation: rotations.includes(day.rotation) && (planVersion === 2 || day.rotation !== 'D') ? day.rotation : 'A', light: day.light === true, note: str(day.note), planVersion, manualRotation: day.manualRotation === true }; }
  if (object(raw.exams)) for (const [number, skills] of Object.entries(state.exams)) for (const skill of SKILLS) { const input = raw.exams[number]?.[skill.id]; if (!object(input)) continue; skills[skill.id] = { parts: Array.from({ length: skill.parts }, (_, i) => STATUS.some(s => s.id === input.parts?.[i]) ? input.parts[i] : 'todo'), corrected: input.corrected === true, attempts: Array.isArray(input.attempts) ? input.attempts.filter(a => object(a) && validDate(a.date) && typeof a.score === 'number' && Number.isFinite(a.score) && a.score >= 0 && a.score <= 100).map(a => ({ id: str(a.id) || newId(), date: a.date, score: a.score })) : [], note: str(input.note) }; }
  if (Array.isArray(raw.resources)) state.resources = state.resources.map(seed => { const r = raw.resources.find(item => object(item) && item.id === seed.id); if (!r) return seed; let url = str(r.url).slice(0, 2048).trim(); const defaults = { 'memrise-a2': ['https://www.memrise.com/', 'https://www.memrise.com'], 'memrise-b1': ['https://www.memrise.com/', 'https://www.memrise.com'], nicos: ['https://learngerman.dw.com/en/nicos-weg/c-36519789'], vhs: ['https://www.vhs-lernportal.de/wws/home.php','https://b1.vhs-lernportal.de/wws/9.php'] }; if (!url || defaults[seed.id]?.includes(url)) url = seed.url; return { id: seed.id, title: typeof r.title === 'string' ? r.title.slice(0, 200) : seed.title, url: /^(https?:\/\/|$)/i.test(url) ? url : '', position: str(r.position).slice(0, 180), note: str(r.note).slice(0, 2000) }; });
  if (Array.isArray(raw.mistakes)) state.mistakes = raw.mistakes.filter(m => object(m) && SKILLS.some(s => s.id === m.skill) && validDate(m.date)).map(m => ({ id: str(m.id) || newId(), text: str(m.text), skill: m.skill, date: m.date, resolved: m.resolved === true }));
  if (Array.isArray(raw.scores)) state.scores = raw.scores.filter(s => object(s) && SKILLS.some(x => x.id === s.skill) && validDate(s.date) && typeof s.score === 'number' && Number.isFinite(s.score) && s.score >= 0 && s.score <= 100).map(s => ({ id: str(s.id) || newId(), date: s.date, skill: s.skill, score: s.score, source: str(s.source), ...(s.baseline === true ? { baseline: true } : {}) }));
  if (Array.isArray(raw.pinned)) state.pinned = raw.pinned.filter(p => object(p) && validDate(p.date)).map(p => ({ id: str(p.id) || newId(), date: p.date, title: str(p.title), done: p.done === true, ...(Number.isInteger(Number(p.exam)) && Number(p.exam) >= 1 && Number(p.exam) <= 15 ? { exam: String(Number(p.exam)) } : {}), ...(SKILLS.some(s => s.id === p.skill) ? { skill: p.skill } : {}), ...(Number.isInteger(p.part) && p.part >= 0 && p.part < (SKILLS.find(s => s.id === p.skill)?.parts || 0) ? { part: p.part } : {}) }));
  return state;
}

