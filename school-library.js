export const DOL_LINKS = { math: 'https://dolthpt.vn/tot-nghiep-thpt/toan', physics: 'https://dolthpt.vn/tot-nghiep-thpt/ly', it: 'https://dolthpt.vn/tot-nghiep-thpt/tin' };
const videos = { 'math-11': ['Nguyên hàm cơ bản', 'https://www.youtube.com/watch?v=j615s9znk4U'], 'math-12': ['Tích phân và toán thực tế', 'https://www.youtube.com/watch?v=cNDQkKzfsfw'], 'math-01': ['Đơn điệu và cực trị', 'https://www.youtube.com/watch?v=C64H0h3qiRc'] };
export const CASIO_TIPS = [
  { id: 'table', title: 'Bảng giá trị', purpose: 'Quan sát xu hướng của hàm số.', steps: ['Chọn TABLE và miền hợp lệ.', 'Mẫu điểm giúp dự đoán, không chứng minh toàn miền.'], example: 'f(x) = x²: f(1) = 1, f(2) = 4.' },
  { id: 'derivative', title: 'Đạo hàm số', purpose: 'Kiểm tra giá trị đạo hàm tại một điểm.', steps: ['Nhập hàm và điểm cần xét.', 'So sánh với kết quả giải tay.'], example: 'f(x) = x³ tại x = 2: f′(2) = 12.' },
  { id: 'primitive', title: 'Kiểm tra nguyên hàm', purpose: 'Sàng lọc một nguyên hàm dự đoán.', steps: ['Lấy đạo hàm số của đáp án tại vài điểm hợp lệ.', 'Khớp tại vài điểm chưa phải chứng minh.'], example: 'F(x) = x³/3 có F′(2) = 4, khớp f(x) = x².' },
  { id: 'integral', title: 'Tích phân số', purpose: 'Kiểm tra kết quả tích phân xác định.', steps: ['Nhập biểu thức và hai cận.', 'Kiểm tra miền xác định trước khi tính.'], example: '∫₀¹ x² dx = 1/3.' },
  { id: 'quadratic', title: 'Phương trình bậc hai', purpose: 'Kiểm tra nghiệm của phương trình.', steps: ['Nhập đúng hệ số.', 'Thay nghiệm vào phương trình để kiểm tra.'], example: 'x² − 5x + 6 = 0 có nghiệm 2 và 3.' },
  { id: 'solve', title: 'Tìm nghiệm số', purpose: 'Tìm một nghiệm gần giá trị ban đầu.', steps: ['Chọn giá trị bắt đầu phù hợp.', 'Thử các khoảng khác: một lần SOLVE không đảm bảo tìm đủ nghiệm.'], example: 'x² − 5x + 6 = 0 có thể cho nghiệm 2 hoặc 3 tùy điểm bắt đầu.' },
  { id: 'combination', title: 'Tổ hợp', purpose: 'Kiểm tra số cách chọn.', steps: ['Chọn đúng n và r.', 'Phân biệt tổ hợp với chỉnh hợp.'], example: '10C3 = 120.' },
  { id: 'angles', title: 'Độ, radian và ký hiệu khoa học', purpose: 'Tránh sai đơn vị trong Vật lí.', steps: ['Kiểm tra chế độ góc trước khi tính.', 'Kiểm tra số mũ và đơn vị của kết quả.'], example: 'sin 30° = 0,5; 3 × 10⁸ m/s.' },
];
const manual580 = 'https://support.casio.com/global/vi/fx/manual/fx-580VNX/';
const manual580Pdf = 'https://www.casio.com/content/dam/casio/global/support/manuals/calculators/pdf/004-vi/f/fx-580VNX_VI.pdf';
const instructions580 = {
  table: ['MENU → Table; nhập f(x), rồi xác nhận.', 'Nhập Start, End và Step; xem bảng giá trị.'],
  derivative: ['MENU → Calculate; nhấn SHIFT rồi phím ∫ để mở d/dx.', 'Nhập hàm và điểm x; nhấn = để tính gần đúng. Với hàm lượng giác, chọn Radian.'],
  primitive: ['MENU → Calculate; nhấn SHIFT rồi phím ∫ để mở d/dx.', 'Nhập nguyên hàm dự đoán và lần lượt thử vài điểm hợp lệ.'],
  integral: ['MENU → Calculate; nhấn phím ∫.', 'Nhập hàm, cận dưới và cận trên; nhấn =. Với hàm lượng giác, chọn Radian.'],
  quadratic: ['MENU → Equation/Func → Polynomial → bậc 2.', 'Nhập lần lượt hệ số a, b, c; xem từng nghiệm.'],
  solve: ['MENU → Calculate; nhập biểu thức theo x.', 'Nhấn SHIFT → CALC (SOLVE), nhập giá trị đầu và nhấn =.'],
  combination: ['MENU → Calculate; nhập n.', 'Nhấn SHIFT rồi phím có nhãn nCr, nhập r và nhấn =.'],
  angles: ['SHIFT → MENU (SETUP) → Angle Unit → Degree để tính theo độ.', 'Nhập sin(30) rồi =; kiểm tra đơn vị và số mũ khi làm Lý.'],
};
const source580 = id => id === 'solve' ? 'https://support.casio.com/global/vi/fx/manual/fx-580VNX_VI/function_calculations/using_solve/' : ['derivative', 'primitive'].includes(id) ? 'https://support.casio.com/global/vi/fx/manual/fx-580VNX_VI/function_calculations/differential_calculations/' : id === 'integral' ? 'https://support.casio.com/global/vi/fx/manual/fx-580VNX_VI/function_calculations/integration_calculations/' : manual580;
export function lessonResourceLinks(lesson) {
  if (lesson.subject !== 'math') return [];
  const exact = videos[lesson.id];
  return exact ? [{ label: `Thầy Nguyễn Phan Tiến · ${exact[0]}`, url: exact[1] }] : [{ label: 'Tìm bài giảng thầy Tiến', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${lesson.title} Nguyễn Phan Tiến`)}` }];
}
export function renderSchoolLibrary(s, subject, e, expanded = false) {
  const dol = DOL_LINKS[subject];
  const is580 = !s.calculatorModel || /^(?:fx-?)?580\s*vn\s*x$/i.test(s.calculatorModel.trim());
  const is880 = /880\s*btg/i.test(s.calculatorModel || '');
  const manual = is580 ? manual580 : is880 ? 'https://support.casio.com/global/vi/calc/manual/fx-880BTG_vi/index.html' : '';
  const pdf = is580 ? manual580Pdf : is880 ? 'https://www.casio.com/content/dam/casio/global/support/manuals/calculators/pdf/004-vi/f/fx-880BTG_VI.pdf' : '';
  return `<details class="school-section" ${expanded?'open':''}><summary>Học liệu ${e(subject === 'math' ? 'Toán' : subject === 'physics' ? 'Vật lí' : 'Tin học')}</summary><p><a href="${e(dol)}" target="_blank" rel="noopener noreferrer">Mở DOL luyện tập</a> · Bài luyện theo chủ đề và đề tham khảo.</p><p>Mở DOL để làm bài; sau đó ghi kết quả thủ công tại đây.</p><button class="btn secondary small" type="button" data-action="school-dol-paper" data-subject="${e(subject)}">Ghi kết quả DOL</button>${subject === 'math' ? `<details ${expanded?'open':''}><summary>Máy tính Casio · ${s.casioDone.length}/${CASIO_TIPS.length} đã luyện</summary><p>Máy đang dùng: ${e(s.calculatorModel || 'fx-580VN X')}. ${is580 ? 'Các bước dưới đây dành cho fx-580VN X.' : 'Chọn chức năng theo máy đang dùng.'}</p>${manual ? `<p><a href="${e(manual)}" target="_blank" rel="noopener noreferrer">Hướng dẫn ${e(s.calculatorModel || 'fx-580VN X')}</a> · <a href="${e(pdf)}" target="_blank" rel="noopener noreferrer">Bản PDF</a></p>` : ''}${CASIO_TIPS.map(t => `<article class="school-note"><strong>${e(t.title)}</strong><p>${e(t.purpose)}</p><ul>${[...(is580 ? instructions580[t.id] : []), ...t.steps].map(x => `<li>${e(x)}</li>`).join('')}</ul><p>Ví dụ: ${e(t.example)}</p>${is580 ? `<a href="${e(source580(t.id))}" target="_blank" rel="noopener noreferrer">Hướng dẫn Casio</a>` : ''}<label><input type="checkbox" data-school-casio="${e(t.id)}" ${s.casioDone.includes(t.id) ? 'checked' : ''}> Đã luyện</label></article>`).join('')}</details>` : ''}</details>`;
}
