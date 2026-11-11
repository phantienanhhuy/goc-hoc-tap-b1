import { getDailyTasks, localDate, SKILLS } from './model.js';

export const weekdaysVN = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
function weekday(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new TypeError('Ngày không hợp lệ');
  const d = new Date(date + 'T00:00:00Z');
  if (Number.isNaN(d.valueOf()) || d.toISOString().slice(0, 10) !== date) throw new TypeError('Ngày không hợp lệ');
  return d.getUTCDay();
}
export function getDayLabel(date = localDate()) { return weekdaysVN[weekday(date)]; }
export function getNextExamPart(state, skill) {
  const count = SKILLS.find(s => s.id === skill)?.parts;
  if (!count) return null;
  for (let exam = 1; exam <= 15; exam++) for (let part = 0; part < count; part++) {
    const item = state.exams?.[String(exam)]?.[skill];
    if (item?.parts?.[part] !== 'done') return { exam: String(exam), part, review: false };
  }
  for (let exam = 1; exam <= 15; exam++) if (!state.exams?.[String(exam)]?.[skill]?.corrected) return { exam: String(exam), part: 0, review: true };
  return { exam: '1', part: 0, review: true };
}
const task = (id, title, minutes, category, steps, resourceId) => ({ id, title, minutes, category, steps, ...(resourceId ? { resourceId } : {}) });
function selection(state, day, skill) {
  const count = SKILLS.find(s => s.id === skill).parts;
  const saved = day.dailyPlan?.[skill];
  if (saved && /^(?:[1-9]|1[0-5])$/.test(String(saved.exam)) && Number.isInteger(saved.part) && saved.part >= 0 && saved.part < count && typeof saved.review === 'boolean') return saved;
  const next = getNextExamPart(state, skill);
  day.dailyPlan[skill] = next;
  return next;
}
function linked(date, skill, selected, title, minutes, category, steps, resourceId) {
  const { exam, part, review } = selected;
  return { ...task(`schedule-${date}-${skill}-${exam}-${part}`, `${title} · Đề ${exam} · Teil ${part + 1}${review ? ' · ôn lại' : ''}`, minutes, category, steps, resourceId), exam, skill, part, review };
}
export function getScheduledTasks(state, date = localDate()) {
  const w = weekday(date);
  getDailyTasks(state, date);
  const day = state.days[date];
  const vocab = [
    task('memrise-a2', 'Memrise A2 · ôn và nghe', 10, 'Từ vựng', ['Ôn 10 phút, tự nhớ nghĩa trước khi xem đáp án; nghe và nhắc lại', 'Gợi ý bắt đầu: tối đa 5 từ mới nếu đã ôn xong; còn từ đến hạn thì không thêm mới', 'Chọn 1–2 cụm có thể dùng'], 'memrise-a2'),
    task('memrise-b1', 'Memrise B1 · ôn và nghe', 10, 'Từ vựng', ['Ôn 10 phút, tự nhớ nghĩa trước khi xem đáp án; nghe và nhắc lại', 'Gợi ý bắt đầu: tối đa 5 từ mới nếu đã ôn xong; còn từ đến hạn thì không thêm mới', 'Chọn 1–2 cụm có thể dùng'], 'memrise-b1'),
    task('review', 'Ôn từ · đặt 3 câu', 10, 'Ôn tập', ['Không nhìn đáp án: nhớ lại các cụm đã học', 'Chọn 3 từ khó và viết hoặc nói 3 câu, mỗi câu dùng một từ']),
  ];
  const intensive = [1, 3, 5].includes(w);
  const hearing = task('hearing', intensive ? 'Nghe kỹ · Nicos Weg 30–35 phút' : 'Nghe Nicos Weg · 10 phút', intensive ? 35 : 10, 'Nghe', intensive ? [
    'Chọn một đoạn 45–90 giây; nghe 2 lần không nhìn lời', 'Nghe từng đoạn 5–10 giây và nhắc lại, tối đa 3 lần mỗi đoạn', 'Phân biệt từ chưa biết với từ đã biết nhưng chưa nghe ra', 'Đọc lời, hiểu nội dung và chọn tối đa 5 cụm hữu ích', 'Nghe lại 2 lần không nhìn lời; nói hoặc viết 3 câu',
  ] : ['Chọn đoạn khoảng 45 giây; nghe 2 lần không nhìn lời', 'Đọc lời để kiểm tra; chọn 1–2 cụm và nghe lại'], 'nicos');
  if (day.light) return [vocab[2], task('hearing', 'Nghe Nicos Weg · 10 phút', 10, 'Nghe', ['Chọn đoạn khoảng 45 giây; nghe 2 lần không nhìn lời', 'Đọc lời để kiểm tra; chọn 1–2 cụm và nghe lại'], 'nicos'), task('busy-speaking', 'Nói ngắn · 3 câu', 10, 'Nói', ['Chọn 3 từ khó và nói 3 câu ngắn', 'Nghe lại hoặc tự sửa lỗi'])];
  if (w === 0) return [...vocab, hearing, task('sunday-review', 'Chủ nhật · sửa lỗi và học bù', 20, 'Ôn tập', ['Chọn một bài chưa xong trong tuần hoặc 3 lỗi thường gặp', 'Sửa lại 3 câu, nghe hoặc nói lại; nghỉ nếu đã hoàn thành'])];
  if (!day.dailyPlan || day.dailyPlan.version !== 1 || typeof day.dailyPlan !== 'object') day.dailyPlan = { version: 1 };
  if (intensive) {
    const selected = selection(state, day, 'sprechen');
    const modes = [
      ['Teil 1 · cùng lập kế hoạch', 'Mở Sprechen của đề trong sách; đọc yêu cầu và ghi 5 ý: việc, thời gian, nơi, chuẩn bị, phân công', 'Tập đề xuất, đồng ý hoặc từ chối lịch sự; ghi âm 3 phút'],
      ['Teil 2 · trình bày chủ đề', 'Mở Sprechen của đề trong sách, chọn chủ đề; ghi 5 ý ngắn', 'Nói khoảng 3 phút: trải nghiệm, tình hình, ưu nhược điểm và ý kiến'],
      ['Teil 3 · phản hồi và câu hỏi', 'Dùng chủ đề của đề trong sách; chuẩn bị phản hồi và câu hỏi', 'Nói nhận xét, đặt câu hỏi và tập trả lời câu hỏi tiếp theo'],
    ][selected.part];
    const speaking = linked(date, 'sprechen', selected, 'Nói', 25, 'Nói', [modes[0], modes[1], modes[2], 'Nghe lại bản ghi, sửa 3 lỗi và nói lại không đọc nguyên văn'], 'book15');
    const result = [...vocab, hearing, speaking];
    if (w === 3) {
      const h = selection(state, day, 'hoeren');
      result.push(linked(date, 'hoeren', h, 'Nghe đề', 20, 'Nghe', [`Mở đề ${h.exam}, Hören Teil ${h.part + 1} trong sách và tìm đúng bài nghe`, 'Làm theo hướng dẫn của phần thi; kiểm tra đáp án và ghi 2 lỗi'], 'book15-audio'));
    }
    return result;
  }
  const reading = selection(state, day, 'lesen');
  const writing = selection(state, day, 'schreiben');
  const minutes = [20, 25, 15][writing.part];
  const writingKinds = ['email cá nhân, khoảng 80 từ', 'bài nêu ý kiến, khoảng 80 từ', 'email trang trọng, khoảng 40 từ'];
  return [...vocab, hearing,
    linked(date, 'lesen', reading, 'Đọc', 25, 'Đọc', [`Mở đề ${reading.exam}, Lesen Teil ${reading.part + 1} trong sách`, 'Bấm giờ, tự làm phần đó trước khi xem đáp án', 'Kiểm tra đáp án; gạch bằng chứng và ghi 2 lỗi'], 'book15'),
    linked(date, 'schreiben', writing, 'Viết', minutes + 10, 'Viết', [`Mở đề ${writing.exam}, Schreiben Teil ${writing.part + 1} trong sách; đọc kỹ yêu cầu`, `Lập ý và viết ${writingKinds[writing.part]} trong khoảng ${minutes} phút`, 'Kiểm tra đủ yêu cầu, bố cục, động từ và liên từ', 'Nhận phản hồi, chọn 3 lỗi và viết lại 3 câu'], 'book15'),
  ];
}
