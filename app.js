import {localDate, dayDiff, getDailyTasks, completeTask, updateExamPart, skillStatus, SKILLS, STATUS, newId, ROTATION_LABELS, setRotation} from './model.js';
import {createAppState,normalizeAppState} from './state.js';
import {renderSchool,handleSchoolClick,handleSchoolChange,handleSchoolSubmit} from './school-ui.js';
import {SUBJECTS} from './school-model.js';
import {createFocusTimer} from './focus-timer.js';
import {rememberStudyPanel} from './school-content-ui.js';
import {createLessonImageViewer} from './school-images-ui.js';

const KEY = 'b1-moi-ngay-v1';
let storageError = '';
let blockedStorage = false;
let unreadableBackup = '';
let state;
try { unreadableBackup = localStorage.getItem(KEY)||''; state = unreadableBackup ? normalizeAppState(JSON.parse(unreadableBackup)) : createAppState(); unreadableBackup=''; }
catch { state = createAppState(); blockedStorage=true; storageError = 'Chưa đọc được dữ liệu cũ. Mở Cài đặt để xuất bản gốc hoặc nhập bản sao. Dữ liệu cũ chưa bị ghi đè.'; }
let view = 'today', selectedDate = localDate(), examFilter = 'all', currentDialog = null;
let lastToday = localDate();
const focusTimer = createFocusTimer({notify});
const lessonImageViewer = createLessonImageViewer();
let toastTimeout;
const main = document.querySelector('#main');
main.addEventListener('toggle', rememberStudyPanel, true);
const modal = document.querySelector('#modal');
const escape = (v='') => String(v).replace(/[&<>"']/g, x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const fmt = (date) => new Intl.DateTimeFormat('vi-VN',{day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
const skill = id => SKILLS.find(s=>s.id===id);
const statusLabel = id => STATUS.find(s=>s.id===id)?.label || 'Chưa làm';
const safeURL = url => {try {const u=new URL(url);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}};
const resource = id => state.resources.find(r=>r.id===id);
const TASK_TEMPLATES = ['Viết B1 · 1 Teil → chữa 3 lỗi','Viết tự do · 10 phút → sửa 3 câu','Nói B1 · 1 chủ đề → ghi âm → nói lại','Nói liên tục · 2–3 phút × 2 lượt','Shadowing · 5 câu Nicos Weg','Nghe và đọc · 1 đoạn ngắn','Nghe đề B1 · 1 Teil → chữa đáp án','Đọc B1 · 1 Teil → tìm bằng chứng','Ngữ pháp · 10 câu → tự đặt 3 câu'];
function notify(message) {const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('show'),3200);}
function save() {if(blockedStorage)return false;try {localStorage.setItem(KEY,JSON.stringify(state));storageError='';return true;}catch {storageError='Bộ nhớ chưa lưu được. Hãy xuất bản sao dữ liệu.';notify(storageError);return false;}}
function header(kicker,title,subtitle,actions='') {return `<header class="page-header"><div><div class="eyebrow">${kicker}</div><h1 class="page-title">${title}</h1><p class="muted">${subtitle}</p></div><div class="header-actions">${actions}<button class="icon-btn theme-button" data-action="theme" aria-label="Đổi giao diện sáng tối" title="Đổi sáng/tối">◐</button><button class="icon-btn" data-action="settings" aria-label="Mở cài đặt" title="Cài đặt">⚙</button></div></header>`;}
function schoolContext() {return {state,save,render,showDialog,notify,localDate,newId,escape,safeURL,dialog:currentDialog};}
function applyTheme(theme) {document.documentElement.dataset.theme=theme;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#111416':'#f6f5ef');try{localStorage.setItem('study-theme',theme);}catch{}}
function toggleTheme(){applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');}
function render() {
  document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===view;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  main.innerHTML=(storageError?`<div class="alert" role="alert">${escape(storageError)}</div>`:'')+(view==='school'?header('ĐỨC LÀ CHÍNH · THPT GIỮ NHỊP','Toán · Lý · Tin','Từng bài, từng bước. Chọn buổi học khi rảnh.')+renderSchool(state):({today:renderToday,exams:renderExams,resources:renderResources,progress:renderProgress}[view]||renderToday)());
  focusTimer.mount();
}
function renderToday() {
  let tasks=getDailyTasks(state,selectedDate);if(state.days[selectedDate].planVersion===1&&selectedDate>=localDate()){setRotation(state,selectedDate,state.days[selectedDate].rotation);tasks=getDailyTasks(state,selectedDate);}save();
  const day=state.days[selectedDate];
  const pinned=state.pinned.filter(t=>t.date===selectedDate);
  const done=tasks.filter(t=>day.completed[t.id]).length+pinned.filter(t=>t.done).length;
  const total=tasks.length+pinned.length, percent=total?Math.round(done/total*100):0;
  const daysLeft=dayDiff(state.settings.readyDate,localDate());
  const dayOfWeek=new Date(selectedDate+'T12:00:00Z').getUTCDay();
  const teacher=[4,6].includes(dayOfWeek);
  const rotationLabels=day.planVersion===1?{A:'Viết + ngữ pháp (cũ)',B:'Đọc + nói (cũ)',C:'Viết + VHS (cũ)'}:ROTATION_LABELS;
  const readyText=daysLeft>0?`Còn ${daysLeft} ngày`:daysLeft===0?'Mốc hôm nay':'Đã tới mốc ôn tập';
  return header('KẾ HOẠCH CỦA BẠN','Học một chút. Đều mỗi ngày.','Nghe + từ mỗi ngày. Phần còn lại xoay vòng.',`<span class="pill green">Goethe B1</span>`)+`
    <section class="card hero"><div class="hero-main"><div class="eyebrow">MỐC SẴN SÀNG · ${escape(fmt(state.settings.readyDate))}</div><div class="countdown">${readyText}</div><p class="muted">${state.settings.examDate?'Ngày thi: '+escape(fmt(state.settings.examDate)):'Ngày thi chưa chốt · sửa trong Cài đặt'}</p><div class="progress-track" role="progressbar" aria-label="Việc hôm nay" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill" style="width:${percent}%"></div></div><div class="task-meta">${done}/${total} việc đã xong <span>·</span> ${percent}%</div></div><div class="hero-side">${focusTimer.renderCompact()}</div></section>
    <div class="section-heading"><div><h2>Checklist ${selectedDate===localDate()?'hôm nay':escape(fmt(selectedDate))}</h2><p class="muted">${day.light?'Ngày bận · giữ nhịp nhẹ nhàng':`Vòng ${day.rotation} · ${rotationLabels[day.rotation]||''}`} · khoảng ${tasks.reduce((a,t)=>a+t.minutes,0)} phút</p></div><div class="header-actions"><input class="date-nav" type="date" id="study-date" value="${selectedDate}" aria-label="Chọn ngày học"><button class="btn secondary small" data-action="light">${day.light?'Học đủ':'Hôm nay bận'}</button></div></div>
    ${teacher?'<div class="class-notice"><span>◷</span><div><strong>Lớp tiếng Đức · 18:00–20:00</strong><p>Giữ nghe + từ. Ưu tiên bài giáo viên giao.</p></div></div>':[1,3,5].includes(dayOfWeek)?'<div class="class-notice"><span>◷</span><div><strong>Hôm nay có học thêm Toán / Lý</strong><p>Đức là chính. Buổi THPT tự học có thể để hôm khác.</p></div></div>':''}
    <div class="rotation-picker"><label for="rotation-select">Đổi vòng hôm nay</label><select id="rotation-select">${Object.entries(ROTATION_LABELS).map(([id,label])=>`<option value="${id}" ${id===day.rotation?'selected':''}>${id} · ${escape(label)}</option>`).join('')}</select><span class="muted small-text">Từ + Nicos cố định. Các phần thêm thay đổi theo vòng.</span></div><div class="task-list">${tasks.map(t=>renderTask(t,Boolean(day.completed[t.id]))).join('')}${pinned.map(t=>renderPinned(t)).join('')}</div>
    <div class="section-heading"><button class="btn ghost" data-action="add-task">＋ Thêm việc / bài giáo viên</button><span class="muted">Chọn việc bất kỳ. Không cần đúng thứ tự.</span></div>
    <section class="card school-section"><div class="section-heading"><div><h2>THPT · học kèm</h2><p class="muted">${state.school.weeklySessions} buổi / tuần · 1 Toán, 1 Lý, 1 tùy chọn. Tin khi cần.</p></div><button class="btn secondary small" data-nav="school">Mở THPT →</button></div><div class="three-col">${SUBJECTS.map(s=>`<button class="subject-card" data-action="school-session" data-subject="${s.id}"><span>${escape(s.id==='it'?'Tin':s.label)}</span><strong>${Number(state.school.targets[s.id]).toLocaleString('vi-VN')}${s.id==='it'?'':'+'}</strong><small>＋ Chọn việc cho hôm nay</small></button>`).join('')}</div></section>
    <div class="two-col"><section class="card"><div class="section-heading"><h2>Đang học đến đâu?</h2><button class="btn ghost small" data-nav="resources">Tài liệu →</button></div>${state.resources.filter(r=>['memrise-a2','memrise-b1','nicos'].includes(r.id)).map(r=>`<div class="resource-position"><span>${escape(r.title)}</span><button class="btn ghost small" data-action="resource" data-id="${r.id}">${escape(r.position||'Ghi vị trí →')}</button></div>`).join('')}</section><section class="card"><h2>Ghi nhanh</h2><label class="field"><span class="muted">Đoạn nghe / trang sách / việc để nhớ</span><textarea id="day-note" rows="3" placeholder="Ví dụ: Nicos B1, 00:30–01:20…">${escape(day.note)}</textarea></label><p class="muted small-text">Tự lưu khi rời ô.</p></section></div>`;
}
function renderTask(t,done) {
  const r=resource(t.resourceId);const url=safeURL(r?.url);
  return `<article class="task-card ${done?'done':''}"><div class="task-top"><button class="check-btn" data-action="task-check" data-id="t:${t.id}" role="checkbox" aria-checked="${done}" aria-label="${done?'Bỏ đánh dấu':'Hoàn thành'}: ${escape(t.title)}">${done?'✓':''}</button><div class="task-body"><div class="task-title">${escape(t.title)}</div><div class="task-meta"><span>${t.minutes} phút</span>${r?.position?`<span>·</span><span>${escape(r.position)}</span>`:''}</div></div><span class="pill ${['hearing','review'].includes(t.id)?'amber':''}">${escape(({hearing:'NGHE',review:'ÔN TỪ',writing:'VIẾT',reading:'ĐỌC',speaking:'NÓI','speaking-free':'NÓI','exam-listening':'NGHE ĐỀ',grammar:'NGỮ PHÁP',vhs:'VHS'})[t.id]||'TỪ VỰNG')}</span></div><details class="task-detail"><summary>Cách làm${url?' & tài liệu':''}</summary><ol class="step-list">${t.steps.map(s=>`<li>${escape(s)}</li>`).join('')}</ol><div class="task-actions">${url?`<a class="btn secondary small" href="${escape(url)}" target="_blank" rel="noopener noreferrer">Mở tài liệu ↗</a>`:''}${['writing','speaking','speaking-free'].includes(t.id)?`<button class="btn ghost small" data-action="prompt" data-kind="${t.id==='speaking-free'?'speaking-free':t.id}">Chép lời nhắc AI</button>`:''}<button class="btn ghost small" data-nav="exams">Chọn phần trong 15 đề →</button></div></details></article>`;
}
function renderPinned(t) {return `<article class="task-card ${t.done?'done':''}"><div class="task-top"><button class="check-btn" role="checkbox" aria-checked="${Boolean(t.done)}" aria-label="Hoàn thành ${escape(t.title)}" data-action="task-check" data-id="p:${escape(t.id)}">${t.done?'✓':''}</button><div class="task-body"><div class="task-title">${escape(t.title)}</div><span class="task-meta">${t.subject?'THPT · '+escape(SUBJECTS.find(s=>s.id===t.subject)?.label||''):t.exam?'Từ sách 15 đề':'Việc bạn thêm'}</span></div><button class="icon-btn" data-action="delete-task" data-id="${escape(t.id)}" aria-label="Xóa việc">×</button></div></article>`;}
function renderExams() {
  const examEntries=Array.from({length:15},(_,i)=>[String(i+1),state.exams[String(i+1)]]);
  const complete=examEntries.reduce((n,[,e])=>n+SKILLS.filter(s=>skillStatus(e[s.id].parts)==='done').length,0);
  return header('ZERTIFIKAT B1 NEU','15 đề. Từng phần một.','Đánh dấu từng Teil; ghi điểm và chữa lỗi riêng.',`<a class="btn secondary small" href="${escape(safeURL(resource('book15-audio')?.url))}" target="_blank" rel="noopener noreferrer">Audio 15 đề ↗</a>`)+`
    <section class="card"><div class="section-heading"><div><strong>${complete}/60 kỹ năng đã làm</strong><p class="muted">Tiến độ ban đầu để trống. Cập nhật các phần bạn đã làm.</p></div><span class="pill">${Math.round(complete/60*100)}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${complete/60*100}%"></div></div></section>
    <div class="filter-bar" role="group" aria-label="Lọc tiến độ">${[['all','Tất cả'],['todo','Chưa làm'],['doing','Đang làm'],['uncorrected','Chưa chữa'],['done','Đã làm']].map(([id,label])=>`<button class="chip ${examFilter===id?'active':''}" data-action="exam-filter" data-id="${id}" aria-pressed="${examFilter===id}">${label}</button>`).join('')}</div>
    <div class="exam-grid">${examEntries.filter(([,e])=>examFilter==='all'||SKILLS.some(s=>examFilter==='uncorrected'?skillStatus(e[s.id].parts)==='done'&&!e[s.id].corrected:skillStatus(e[s.id].parts)===examFilter)).map(([num,e])=>`<article class="card exam-card"><div class="section-heading"><span class="exam-number">Đề ${num.padStart(2,'0')}</span><span class="muted">${SKILLS.reduce((n,s)=>n+e[s.id].parts.filter(p=>p==='done').length,0)}/15 Teil</span></div><div class="skill-grid">${SKILLS.map(s=>{const st=skillStatus(e[s.id].parts);return `<button class="skill-btn ${st}" data-action="exam" data-exam="${num}" data-skill="${s.id}"><span>${s.label}</span><strong>${statusLabel(st)}</strong><small>${e[s.id].parts.filter(p=>p==='done').length}/${s.parts} Teil${e[s.id].corrected?' · Đã chữa':''}</small></button>`;}).join('')}</div></article>`).join('')||'<div class="empty-state">Chưa có phần nào trong mục này.</div>'}</div>`;
}
function renderResources() {return header('TẤT CẢ Ở MỘT CHỖ','Tài liệu của bạn','Giữ tài liệu quen thuộc. Ghi lại đúng chỗ đang học.')+`<div class="two-col">${state.resources.map(r=>`<article class="card resource-card"><div class="eyebrow">${r.id.includes('memrise')?'TỪ VỰNG':r.id==='nicos'?'NGHE':r.id==='vhs'?'LUYỆN TẬP':'SÁCH CỦA BẠN'}</div><h2>${escape(r.title)}</h2><p>${escape(r.position||'Chưa ghi vị trí đang học')}</p><p class="muted">${escape(r.note||'Thêm link hoặc ghi chú của riêng bạn.')}</p><div class="resource-actions">${safeURL(r.url)?`<a class="btn primary small" href="${escape(safeURL(r.url))}" target="_blank" rel="noopener noreferrer">Mở tài liệu ↗</a>`:'<span class="pill">Sách giấy / file của bạn</span>'}<button class="btn secondary small" data-action="resource" data-id="${r.id}">Sửa vị trí & link</button></div></article>`).join('')}</div><section class="card"><h2>Lời nhắc AI</h2><p class="muted">Tự nói / tự viết trước. Nhờ AI sửa sau.</p><div class="header-actions"><button class="btn secondary" data-action="prompt" data-kind="speaking">Luyện nói</button><button class="btn secondary" data-action="prompt" data-kind="writing">Chữa bài viết</button><button class="btn secondary" data-action="prompt" data-kind="understand">Giải thích đề</button></div></section>`;}
function renderProgress() {
  const today=localDate();const dates=Array.from({length:7},(_,i)=>{const d=new Date(today+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-6+i);return d.toISOString().slice(0,10);});
  const dailyCount=dates.filter(d=>state.days[d]?.completed.hearing).length;
  const recent=state.scores.filter(s=>!s.baseline);
  return header('NHÌN LẠI ĐỂ ĐI TIẾP','Tiến bộ thật, từng tuần.','Tick việc để giữ nhịp. Điểm luyện để biết mình đang ở đâu.',`<button class="btn primary small" data-action="score">＋ Ghi điểm</button>`)+`
    <div class="three-col"><div class="card metric"><div class="eyebrow">NGHE 7 NGÀY QUA</div><strong>${dailyCount}<span>/7 buổi</span></strong></div><div class="card metric"><div class="eyebrow">BÀI LUYỆN ĐÃ GHI</div><strong>${recent.length}<span> kết quả</span></strong></div><div class="card metric"><div class="eyebrow">LỖI ĐÃ ÔN</div><strong>${state.mistakes.filter(m=>m.resolved).length}<span>/${state.mistakes.length} lỗi</span></strong></div></div>
    <section class="card"><h2>Nhịp nghe tuần này</h2><div class="week-strip">${dates.map(d=>`<button class="day-dot ${state.days[d]?.completed.hearing?'done':''}" data-action="date" data-date="${d}" title="Xem ${d}"><span>${['CN','T2','T3','T4','T5','T6','T7'][new Date(d+'T12:00:00Z').getUTCDay()]}</span><strong>${d.slice(8)}</strong><span>${state.days[d]?.completed.hearing?'✓':'·'}</span></button>`).join('')}</div></section>
    <div class="two-col"><section class="card"><div class="section-heading"><h2>Bốn kỹ năng</h2><span class="pill">Mục tiêu luyện: ≥70</span></div><p class="muted">Mốc luyện tự đặt. Không phải kết luận đậu thi.</p>${SKILLS.map(s=>{const list=state.scores.filter(x=>x.skill===s.id).sort((a,b)=>b.date.localeCompare(a.date)||Number(a.baseline)-Number(b.baseline));const latest=list[0];const base=state.scores.find(x=>x.skill===s.id&&x.baseline);return `<div class="score-row"><div class="section-heading"><strong>${s.label}</strong><span class="score-value">${latest?latest.score+' / 100':'Chưa ghi'}</span></div><div class="progress-track"><div class="progress-fill" style="width:${latest?.score||0}%"></div></div><div class="task-meta">${latest?escape(latest.baseline?'Điểm thi cũ · 09–10/2026':latest.date+' · '+latest.source):''}${base&&!latest?.baseline?` · Điểm cũ: ${base.score}`:''}</div></div>`;}).join('')}</section>
    <section class="card"><div class="section-heading"><h2>Lỗi cần ôn</h2><button class="btn secondary small" data-action="mistake">＋ Thêm</button></div><p class="muted">Mỗi buổi giữ 1–3 lỗi quan trọng.</p>${state.mistakes.length?`<div class="compact-list">${state.mistakes.slice().reverse().map(m=>`<div class="mistake-row"><label><input type="checkbox" data-mistake="${escape(m.id)}" ${m.resolved?'checked':''}><span class="${m.resolved?'resolved':''}">${escape(m.text)}</span></label><button class="icon-btn" data-action="delete-mistake" data-id="${escape(m.id)}" aria-label="Xóa lỗi">×</button></div>`).join('')}</div>`:'<div class="empty-state">Ghi lỗi đầu tiên sau buổi học hôm nay.</div>'}</section></div>
    <section class="card"><h2>Lịch sử điểm luyện</h2>${recent.length?`<div class="history-list">${recent.slice().reverse().map(s=>`<div class="history-row"><div><strong>${skill(s.skill)?.label||''} · ${s.score}/100</strong><p class="muted">${escape(s.date)} · ${escape(s.source)}</p></div><button class="icon-btn" data-action="delete-score" data-id="${escape(s.id)}" aria-label="Xóa kết quả">×</button></div>`).join('')}</div>`:'<p class="muted">Chưa có điểm luyện mới. Dùng đề chưa xem đáp án để đo tiến bộ.</p>'}</section>`;
}
function showDialog(title,body,kind,context={}) {currentDialog={kind,...context};modal.innerHTML=`<form id="dialog-form"><div class="dialog-head"><h2>${title}</h2><button type="button" class="icon-btn close-dialog" data-action="close" aria-label="Đóng">×</button></div><div class="dialog-body">${body}</div><div class="dialog-actions"><button type="button" class="btn secondary" data-action="close">Đóng</button>${['exam','prompt'].includes(kind)?'':'<button class="btn primary" type="submit">Lưu</button>'}</div></form>`;if(!modal.open)modal.showModal();}
function openExam(num,id) {
  const s=skill(id),e=state.exams[num][id];
  showDialog(`Đề ${String(num).padStart(2,'0')} · ${s.label}`,`<p class="muted">Đổi trạng thái từng phần. Tiến độ tự lưu.</p>${e.parts.map((st,i)=>`<div class="part-row"><strong>Teil ${i+1}</strong><select class="status-select" data-exam-part="${i}" aria-label="Trạng thái Teil ${i+1}">${STATUS.map(x=>`<option value="${x.id}" ${x.id===st?'selected':''}>${x.label}</option>`).join('')}</select><button type="button" class="btn ghost small" data-action="pin-part" data-part="${i}">＋ Hôm nay</button></div>`).join('')}<label class="checkbox-field"><input id="exam-corrected" type="checkbox" ${e.corrected?'checked':''}> Đã chữa bài / nhận phản hồi</label><p class="muted small-text">Bài đã làm chưa chữa xuất hiện ở bộ lọc “Chưa chữa”.</p><label class="field">Ghi chú<textarea id="exam-note" rows="2" placeholder="Lỗi thường gặp, đã xem đáp án…">${escape(e.note)}</textarea></label><div class="section-heading"><h3>Điểm các lần làm</h3><button type="button" class="btn secondary small" data-action="exam-score">＋ Ghi điểm</button></div><p class="muted small-text">Ghi nguồn đề và đánh dấu nếu đã xem đáp án trong ghi chú.</p>${e.attempts.length?e.attempts.map(a=>`<div class="history-row"><span>${escape(a.date)} · <strong>${a.score}/100</strong></span><button type="button" class="icon-btn" data-action="delete-attempt" data-id="${escape(a.id)}" aria-label="Xóa lần làm">×</button></div>`).join(''):'<p class="muted">Chưa có điểm.</p>'}`,'exam',{exam:String(num),skill:id});
}
function settings() {showDialog('Cài đặt & bản sao',`<div class="form-grid"><label class="field">Mốc sẵn sàng<input name="readyDate" type="date" value="${state.settings.readyDate}" required></label><label class="field">Ngày thi thật<input name="examDate" type="date" value="${state.settings.examDate}"></label></div><p class="muted">Mốc sẵn sàng: 31/12/2026. Ngày thi thật để trống đến khi bạn chốt.</p><div class="alert">Bản local lưu trên trình duyệt này. Chưa tự đồng bộ điện thoại/iPad.</div><h3>Sao lưu & chuyển thiết bị</h3><p class="muted">Xuất một file JSON. Nhập lại trên thiết bị khác. Dữ liệu nhập sẽ thay thế dữ liệu hiện tại.</p><div class="header-actions"><button type="button" class="btn secondary" data-action="export">Xuất bản sao</button><button type="button" class="btn secondary" data-action="import">Nhập bản sao</button></div><input type="file" id="import-file" accept="application/json,.json" hidden><p id="import-error" class="error-text" role="alert"></p>`,'settings');}
const prompts={
  'speaking-free':'Luyện tự nói tiếng Đức B1 với tôi. Đề xuất một chủ đề quen thuộc và cho tôi 30 giây ghi 3 ý. Để tôi nói 2–3 phút, không ngắt lời. Nếu tôi bí chỉ gợi ý một từ. Cuối lượt chọn 3 lỗi quan trọng, giải thích ngắn bằng tiếng Việt. Cho tôi nói lại cùng chủ đề, cố gắng liền mạch hơn. Không viết sẵn cả bài.',
  speaking:'Luyện Goethe B1 với tôi theo đề tôi gửi. Cho tôi tự chuẩn bị 5 ý. Hỏi từng câu và đợi tôi trả lời. Khi tôi bí, chỉ gợi ý một ý ngắn. Cuối buổi chọn 3 lỗi quan trọng về ngữ pháp, từ vựng hoặc diễn đạt. Giải thích ngắn bằng tiếng Việt, cho tôi tự sửa rồi nói lại. Không viết sẵn cả bài. Với Teil 1, đóng vai bạn thi và cùng tôi lên kế hoạch; với Teil 2, cho tôi trình bày; với Teil 3, hỏi và phản hồi.',
  writing:'Hãy chữa bài viết Goethe B1 tôi gửi kèm đề. Trước hết kiểm tra tôi đã đáp ứng từng yêu cầu đề chưa. Chỉ ra 3 lỗi quan trọng nhất, giải thích ngắn bằng tiếng Việt và cho tôi tự sửa. Sau đó nhận xét nội dung, bố cục, từ vựng và ngữ pháp theo trình độ B1. Không viết thay cả bài và không coi điểm ước lượng của AI là điểm thi chính thức.',
  understand:'Hãy giải thích đề Goethe B1 tôi gửi bằng tiếng Việt ngắn gọn. Liệt kê: tôi đang viết/nói với ai, mục đích là gì, từng ý bắt buộc phải làm. Giải thích các từ khóa khó. Chưa đưa bài mẫu hay làm hộ; hỏi lại để kiểm tra tôi hiểu đề.'
};
function promptDialog(kind) {showDialog('Lời nhắc cho AI',`<p class="muted">Chép rồi gửi kèm đề / bài của bạn vào AI đang dùng.</p><textarea id="prompt-text" rows="9" readonly>${escape(prompts[kind]||prompts.speaking)}</textarea><button type="button" class="btn primary" data-action="copy-prompt">Chép lời nhắc</button>`,'prompt');}
function openScore(context={}) {showDialog('Ghi điểm luyện',`<div class="form-grid"><label class="field">Kỹ năng<select name="skill">${SKILLS.map(s=>`<option value="${s.id}" ${context.skill===s.id?'selected':''}>${s.label}</option>`).join('')}</select></label><label class="field">Điểm / 100<input name="score" type="number" min="0" max="100" required step="1"></label><label class="field">Ngày làm<input name="date" type="date" value="${localDate()}" required></label><label class="field">Nguồn bài<input name="source" maxlength="160" value="${context.exam?'Đề '+context.exam:''}" placeholder="Đề 1 · chưa xem đáp án" required></label></div>`,'score',context);}
document.addEventListener('click',async ev=>{
  const nav=ev.target.closest('[data-view],[data-nav]');if(nav){view=nav.dataset.view||nav.dataset.nav;render();window.scrollTo({top:0});return;}
  const b=ev.target.closest('[data-action]');if(!b)return;const a=b.dataset.action,id=b.dataset.id;
  if(lessonImageViewer.handleAction(b))return;
  if(a.startsWith('school-')&&handleSchoolClick(b,schoolContext()))return;
  if(a==='theme')toggleTheme();
  if(a==='settings')settings();
  if(a==='close')modal.close();
  if(a==='light'){state.days[selectedDate].light=!state.days[selectedDate].light;save();render();}
  if(a==='task-check'){if(id.startsWith('t:')){const key=id.slice(2);completeTask(state,selectedDate,key,!state.days[selectedDate].completed[key]);}else {const p=state.pinned.find(t=>t.id===id.slice(2));if(p){p.done=!p.done;if(p.exam&&p.skill&&Number.isInteger(p.part))updateExamPart(state,p.exam,p.skill,p.part,p.done?'done':'doing');if(p.subject){const session=state.school.sessions.find(s=>s.id===p.id);if(session)session.done=p.done;const lesson=state.school.lessons.find(l=>l.id===p.lessonId);if(lesson&&p.stage){lesson.steps[p.stage]=p.done||state.pinned.some(t=>t.id!==p.id&&t.lessonId===p.lessonId&&t.stage===p.stage&&t.done);if(p.done&&lesson.status==='todo')lesson.status='doing';}}}}save();render();}
  if(a==='add-task')showDialog('Thêm việc hôm nay',`<label class="field">Chọn mẫu nhanh<select id="task-template"><option value="">Tự nhập việc</option>${TASK_TEMPLATES.map(t=>`<option value="${escape(t)}">${escape(t)}</option>`).join('')}</select></label><label class="field">Việc cụ thể<input name="title" maxlength="180" placeholder="Làm bài giáo viên: trang 42, bài 3" required></label>`,'task');
  if(a==='delete-task'){state.pinned=state.pinned.filter(t=>t.id!==id);state.school.sessions=state.school.sessions.filter(s=>s.id!==id);save();render();}
  if(a==='exam-filter'){examFilter=id;render();}
  if(a==='exam')openExam(b.dataset.exam,b.dataset.skill);
  if(a==='pin-part'){const c=currentDialog;const part=Number(b.dataset.part);const label=`Đề ${c.exam} · ${skill(c.skill).label} · Teil ${part+1}`;const date=localDate();if(!state.pinned.some(t=>t.date===date&&t.exam===c.exam&&t.skill===c.skill&&t.part===part)){state.pinned.push({id:newId(),date,title:label,done:false,exam:c.exam,skill:c.skill,part});if(state.exams[c.exam][c.skill].parts[part]==='todo')updateExamPart(state,c.exam,c.skill,part,'doing');save();openExam(c.exam,c.skill);render();}notify('Đã thêm vào checklist hôm nay.');}
  if(a==='exam-score')openScore({exam:currentDialog.exam,skill:currentDialog.skill});
  if(a==='delete-attempt'){const c=currentDialog;state.exams[c.exam][c.skill].attempts=state.exams[c.exam][c.skill].attempts.filter(x=>x.id!==id);state.scores=state.scores.filter(x=>x.id!==id);save();openExam(c.exam,c.skill);render();}
  if(a==='resource'){const r=resource(id);showDialog(escape(r.title),`<label class="field">Link tài liệu<input name="url" type="url" value="${escape(r.url)}" placeholder="https://…"></label><label class="field">Đang học đến đâu?<input name="position" maxlength="180" value="${escape(r.position)}" placeholder="A2 · Lektion 5 · phần 2"></label><label class="field">Ghi chú<textarea name="note" rows="3" maxlength="1500">${escape(r.note)}</textarea></label>`,'resource',{id});}
  if(a==='prompt')promptDialog(b.dataset.kind);
  if(a==='copy-prompt'){const textarea=document.querySelector('#prompt-text');try{await navigator.clipboard.writeText(textarea.value);notify('Đã chép lời nhắc.');}catch{textarea.focus();textarea.select();notify('Đã chọn nội dung. Nhấn sao chép.');}}
  if(a==='timer-toggle')focusTimer.toggle();
  if(a==='timer-set')focusTimer.setMinutes(Number(b.dataset.minutes));
  if(a==='timer-reset')focusTimer.reset();
  if(a==='timer-expand')focusTimer.openExpanded();
  if(a==='date'){selectedDate=b.dataset.date;view='today';render();}
  if(a==='score')openScore();
  if(a==='delete-score'){state.scores=state.scores.filter(s=>s.id!==id);for(const e of Object.values(state.exams))for(const s of SKILLS)e[s.id].attempts=e[s.id].attempts.filter(x=>x.id!==id);save();render();}
  if(a==='mistake')showDialog('Ghi một lỗi cần ôn',`<label class="field">Câu sai → câu sửa / điều cần nhớ<textarea name="text" rows="3" maxlength="1000" required></textarea></label><label class="field">Kỹ năng<select name="skill">${SKILLS.map(s=>`<option value="${s.id}">${s.label}</option>`).join('')}</select></label>`,'mistake');
  if(a==='delete-mistake'){state.mistakes=state.mistakes.filter(m=>m.id!==id);save();render();}
  if(a==='export'){const body=blockedStorage&&unreadableBackup?unreadableBackup:JSON.stringify(state,null,2);const blob=new Blob([body],{type:'application/json'});const u=URL.createObjectURL(blob);const link=document.createElement('a');link.href=u;link.download=`b1-moi-ngay-${blockedStorage?'ban-goc-':''}${localDate()}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(u),2000);notify('Đã xuất bản sao.');}
  if(a==='import')document.querySelector('#import-file').click();
});
document.querySelector('#settings-open')?.addEventListener('click',settings);
document.querySelector('#theme-toggle')?.addEventListener('click',toggleTheme);
document.addEventListener('change',async ev=>{
  const el=ev.target;
  if(el.id==='task-template'){const input=el.form?.querySelector('[name="title"]');if(input)input.value=el.value;return;}
  if(el.id==='rotation-select'){setRotation(state,selectedDate,el.value);save();render();return;}
  if(handleSchoolChange(el,schoolContext()))return;
  if(el.id==='study-date'&&/^\d{4}-\d{2}-\d{2}$/.test(el.value)){selectedDate=el.value;render();}
  if(el.id==='day-note'){state.days[selectedDate].note=el.value.slice(0,2000);save();}
  if(el.dataset.examPart!==undefined){const c=currentDialog;updateExamPart(state,c.exam,c.skill,Number(el.dataset.examPart),el.value);save();render();}
  if(el.id==='exam-corrected'){const c=currentDialog;state.exams[c.exam][c.skill].corrected=el.checked;save();render();}
  if(el.id==='exam-note'){const c=currentDialog;state.exams[c.exam][c.skill].note=el.value.slice(0,2000);save();}
  if(el.dataset.mistake){const m=state.mistakes.find(m=>m.id===el.dataset.mistake);if(m){m.resolved=el.checked;save();render();}}
  if(el.id==='import-file'&&el.files[0]){
    try{if(el.files[0].size>3000000)throw new Error('File quá lớn.');const incoming=normalizeAppState(JSON.parse(await el.files[0].text()));if(!confirm('Nhập bản sao sẽ thay thế tiến độ hiện tại. Bạn đã xuất bản sao chưa?'))return;const old=state,wasBlocked=blockedStorage;state=incoming;blockedStorage=false;if(!save()){state=old;blockedStorage=wasBlocked;throw new Error('Không lưu được bản nhập.');}unreadableBackup='';modal.close();render();notify('Đã nhập dữ liệu.');}catch(error){const e=document.querySelector('#import-error');if(e)e.textContent='Không nhập được: '+error.message;}finally{el.value='';}
  }
});
document.addEventListener('submit',ev=>{
  if(ev.target.id!=='dialog-form')return;ev.preventDefault();const data=Object.fromEntries(new FormData(ev.target)),c=currentDialog;
  if(c.kind.startsWith('school-')){if(handleSchoolSubmit(data,c,schoolContext())){save();modal.close();render();notify('Đã lưu.');}return;}
  if(c.kind==='settings'){state.settings.readyDate=data.readyDate;state.settings.examDate=data.examDate||'';}
  if(c.kind==='task'&&data.title.trim())state.pinned.push({id:newId(),date:selectedDate,title:data.title.trim(),done:false});
  if(c.kind==='resource'){const r=resource(c.id);r.url=data.url.trim();r.position=data.position.trim();r.note=data.note.trim();}
  if(c.kind==='mistake'&&data.text.trim())state.mistakes.push({id:newId(),text:data.text.trim(),skill:data.skill,date:localDate(),resolved:false});
  if(c.kind==='score'){const score=Number(data.score);if(!Number.isFinite(score)||score<0||score>100)return;const entry={id:newId(),date:data.date,skill:data.skill,score,source:data.source.trim(),baseline:false};state.scores.push(entry);if(c.exam)state.exams[c.exam][data.skill].attempts.push({id:entry.id,date:entry.date,score});}
  save();modal.close();render();notify('Đã lưu.');
});
render();
function checkNewDay() {const today=localDate();if(today!==lastToday){if(selectedDate===lastToday)selectedDate=today;lastToday=today;render();notify('Ngày mới. Checklist đã sẵn sàng.');}}
setInterval(checkNewDay,30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkNewDay();});
