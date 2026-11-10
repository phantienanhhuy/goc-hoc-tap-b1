import { lessonContent } from './school-content.js';
import { renderLessonDiagram } from './school-diagrams.js';
import { renderLearningGallery } from './school-images-ui.js';
import { renderConceptDiagram } from './school-concept-diagrams.js';

const openPanels = new Set();
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const list = (items, tag = 'ul') => `<${tag}>${items.map(x => `<li>${escape(x)}</li>`).join('')}</${tag}>`;
const safeLink = value => { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } };
const panel = (key, title, body, extra = '') => `<details class="study-panel ${extra}" data-study-key="${escape(key)}" ${openPanels.has(key) ? 'open' : ''}><summary>${escape(title)}</summary><div class="study-panel-body">${body}</div></details>`;

export function rememberStudyPanel(event) {
  const key = event.target?.dataset?.studyKey;
  if (!key || !event.target.isConnected) return;
  if (event.target.open) openPanels.add(key);
  else openPanels.delete(key);
}

function renderTable(table) {
  if (!table) return '';
  return `<div class="study-table-wrap" role="region" aria-label="Bảng kiến thức" tabindex="0"><table class="study-table"><thead><tr>${table.headers.map(x => `<th scope="col">${escape(x)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row => `<tr>${row.map(x => `<td>${escape(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function renderSection(section) {
  return `${list(section.bullets)}${(section.formulas || []).map(f => `<div class="study-formula"><div class="formula-expression">${escape(f.expression)}</div><p>${escape(f.meaning)}</p>${f.conditions ? `<p class="formula-condition"><strong>Điều kiện:</strong> ${escape(f.conditions)}</p>` : ''}</div>`).join('')}${renderTable(section.table)}${section.code ? `<pre class="study-code" tabindex="0" aria-label="Mã minh họa"><code>${escape(section.code)}</code></pre>` : ''}`;
}

export function renderLessonContent(lesson) {
  const c = lessonContent(lesson);
  if (!c) return '<p class="school-note">Bài tự thêm: dùng ghi chú và liên kết tài liệu của bạn.</p>';
  const key = lesson.id;
  const gallery = renderLearningGallery(key);
  const diagram = c.diagram ? renderLessonDiagram(c.diagram, `${key}-figure`) : renderConceptDiagram(key);
  const theory = c.sections.map((s, i) => panel(`${key}-topic-${i}`, s.title, renderSection(s), 'study-topic')).join('') + (gallery ? diagram : '');
  const examples = c.examples.map((ex, i) => `<article class="study-example"><h5>Ví dụ ${i + 1}</h5><p>${escape(ex.question)}</p>${panel(`${key}-example-${i}`, 'Xem cách giải', `${list(ex.steps, 'ol')}<p class="study-answer"><strong>Kết quả:</strong> ${escape(ex.answer)}</p>`, 'study-solution')}</article>`).join('');
  const questions = `<p class="school-note">Tự trả lời trước, rồi mở đáp án.</p>${c.questions.map((q, i) => `<article class="study-question"><p><strong>Câu ${i + 1}.</strong> ${escape(q.question)}</p>${panel(`${key}-answer-${i}`, 'Đáp án & giải thích', `<p class="study-answer">${escape(q.answer)}</p>${q.explanation ? `<p>${escape(q.explanation)}</p>` : ''}`, 'study-solution')}</article>`).join('')}`;
  const sources = `<p class="school-note">Nội dung được biên soạn để ôn tập. Các nguồn dưới đây dùng đối chiếu kiến thức; tài liệu quốc tế có thể dùng ký hiệu hoặc thứ tự khác SGK.</p><ul class="study-sources">${c.sources.map(source => {
    const url = safeLink(source.url);
    return `<li>${url ? `<a class="resource-link" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)} ↗</a>` : escape(source.title)}${source.note ? `<p class="school-note">${escape(source.note)}</p>` : ''}</li>`;
  }).join('')}</ul>`;
  return `<section class="lesson-study" aria-label="Nội dung bài học"><p class="study-overview">${escape(c.overview)}</p>${gallery || diagram}${panel(`${key}-goals`, `Cần nắm · ${c.objectives.length} ý`, list(c.objectives))}${panel(`${key}-theory`, `Kiến thức & công thức · ${c.sections.length} mục`, theory)}${panel(`${key}-examples`, `Ví dụ có lời giải · ${c.examples.length} bài`, examples)}${panel(`${key}-mistakes`, 'Lỗi dễ mất điểm', list(c.mistakes))}${panel(`${key}-quiz`, `Tự kiểm tra · ${c.questions.length} câu`, questions)}${panel(`${key}-sources`, 'Nguồn đối chiếu', sources)}</section>`;
}
