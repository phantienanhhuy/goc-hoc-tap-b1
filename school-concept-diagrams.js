// Sơ đồ gốc tự biên soạn, không có nội dung hoặc tài nguyên bên ngoài.
export const CONCEPT_DIAGRAMS = {
  'math-03': { type: 'asymptotes', title: 'Hai tiệm cận của đồ thị', caption: 'Với y = 1/(x − 2), đường x = 2 là tiệm cận đứng và y = 0 là tiệm cận ngang.' },
  'math-15': { type: 'space-line', title: 'Đường thẳng trong không gian', caption: 'M₀ thuộc đường thẳng; vectơ u ≠ 0 chỉ phương và M = M₀ + tu.' },
  'physics-02': { type: 'first-law', title: 'Sự biến thiên nội năng', caption: 'Theo quy ước công hệ nhận là dương, ΔU = Q + A.' },
  'physics-08': { type: 'gas-motion', title: 'Chuyển động phân tử khí', caption: 'Phân tử va chạm với thành bình; mũi tên biểu thị vận tốc tức thời minh họa.' },
  'physics-12': { type: 'gas-motion', title: 'So sánh hai trạng thái khí', caption: 'Với cùng lượng khí lí tưởng và thể tích, khi nhiệt độ tuyệt đối tăng thì áp suất tăng.' },
  'it-01': { type: 'ai-tasks', title: 'Một nhiệm vụ của hệ AI', caption: 'Mô hình nhận dữ liệu đầu vào và tạo dự đoán; ví dụ phân loại ảnh.' },
  'it-02': { type: 'ai-tasks', title: 'AI hỗ trợ phân loại ảnh', caption: 'Kết quả có thể sai và cần được con người kiểm tra phù hợp với mục đích sử dụng.' }
};

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const text = (x, y, value, attrs = '') => `<text x="${x}" y="${y}" ${attrs}>${escape(value)}</text>`;
const line = (x1, y1, x2, y2, attrs = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${attrs}/>`;
const box = (x, y, w, h, label) => `<rect class="diagram-box" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>${text(x + w / 2, y + h / 2 + 6, label, 'text-anchor="middle"')}`;
const dot = (x, y) => `<circle class="diagram-point" cx="${x}" cy="${y}" r="5"/>`;

function body(type, arrow) {
  const tip = `marker-end="url(#${arrow})"`;
  if (type === 'asymptotes') {
    // x is mapped to 280 + 50x and y to 160 - 55y; stop at the viewport edge.
    const limit = 55 / 115;
    const branch = (a, b) => {
      const points = [];
      for (let i = 0; i <= 180; i++) {
        const x = a + (b - a) * i / 180;
        points.push(`${i ? 'L' : 'M'}${(280 + 50 * x).toFixed(2)},${(160 - 55 / (x - 2)).toFixed(2)}`);
      }
      return `<path class="diagram-curve" d="${points.join(' ')}"/>`;
    };
    return line(65, 160, 585, 160, `${tip} stroke-dasharray="7 5"`) + line(280, 282, 280, 32, tip)
      + line(380, 35, 380, 285, 'stroke-dasharray="7 5"') + branch(-4.3, 2 - limit) + branch(2 + limit, 6)
      + text(590, 165, 'x') + text(268, 30, 'y') + text(264, 184, 'O') + text(374, 182, '2')
      + text(392, 56, 'x = 2') + text(76, 151, 'y = 0') + text(405, 94, 'y = 1/(x − 2)');
  }
  if (type === 'space-line') {
    return line(115, 225, 210, 272, tip) + line(115, 225, 248, 174, tip) + line(115, 225, 115, 52, tip)
      + text(98, 245, 'O') + text(211, 290, 'x') + text(253, 174, 'y') + text(103, 44, 'z')
      + line(255, 249, 508, 83) + dot(300, 219) + dot(430, 134)
      + line(337, 194, 387, 161, `${tip} class="diagram-emphasis"`)
      + text(275, 243, 'M₀') + text(436, 129, 'M') + text(352, 216, 'u ≠ 0')
      + text(300, 49, 'M = M₀ + tu') + text(265, 294, 't thay đổi ⇒ M chạy trên đường thẳng');
  }
  if (type === 'first-law') {
    return box(230, 94, 180, 112, 'HỆ · nội năng U')
      + line(50, 123, 225, 123, tip) + text(61, 107, 'Q > 0: nhận nhiệt')
      + line(225, 181, 50, 181, tip) + text(61, 210, 'Q < 0: tỏa nhiệt')
      + line(590, 123, 415, 123, tip) + text(425, 107, 'A > 0: nhận công')
      + line(415, 181, 590, 181, tip) + text(425, 210, 'A < 0: sinh công')
      + text(320, 268, 'ΔU = Q + A', 'text-anchor="middle"') + text(320, 298, 'Q và A là đại lượng có dấu', 'text-anchor="middle"');
  }
  if (type === 'gas-motion') {
    const particles = [[48, 45, 1, 0], [110, 30, -0.7, 0.7], [172, 63, -1, 0], [75, 111, 0.7, -0.7], [150, 130, 0, -1]];
    const vessel = (x, speed) => `<rect x="${x}" y="65" width="220" height="160" rx="3"/>` + particles.map(([dx, dy, vx, vy]) => {
      const px = x + dx, py = 65 + dy;
      return dot(px, py) + line(px, py, px + vx * speed, py + vy * speed, `${tip} class="diagram-emphasis"`);
    }).join('');
    return vessel(60, 17) + vessel(360, 31) + text(170, 47, 'T₁', 'text-anchor="middle"') + text(470, 47, 'T₂ > T₁', 'text-anchor="middle"')
      + text(320, 263, 'Cùng lượng khí và thể tích', 'text-anchor="middle"')
      + text(320, 294, 'Khí lí tưởng: T tăng ⇒ động năng trung bình và p tăng', 'text-anchor="middle"');
  }
  if (type === 'ai-tasks') {
    return box(30, 105, 150, 70, 'Ảnh đầu vào') + box(245, 105, 150, 70, 'Mô hình AI') + box(460, 105, 150, 70, 'Nhãn dự đoán')
      + line(183, 140, 238, 140, tip) + line(398, 140, 453, 140, tip)
      + text(105, 208, 'Ví dụ: ảnh mèo', 'text-anchor="middle"') + text(535, 208, '“mèo” hoặc nhãn khác', 'text-anchor="middle"')
      + text(320, 265, 'Đối chiếu kết quả với ảnh thực tế', 'text-anchor="middle"')
      + text(320, 295, 'Nhãn dự đoán không bảo đảm luôn đúng', 'text-anchor="middle"');
  }
  return '';
}

export function renderConceptDiagram(lessonId) {
  const diagram = Object.hasOwn(CONCEPT_DIAGRAMS, lessonId) ? CONCEPT_DIAGRAMS[lessonId] : null;
  if (!diagram) return '';
  const safeId = String(lessonId).replace(/[^a-zA-Z0-9_-]/g, '-');
  const titleId = `concept-${safeId}-title`, arrow = `concept-${safeId}-arrow`;
  return `<figure class="study-figure"><div class="study-diagram-scroll" tabindex="0" role="region" aria-label="Hình minh họa, có thể cuộn ngang"><svg class="study-diagram" viewBox="0 0 640 320" role="img" aria-labelledby="${titleId}" xmlns="http://www.w3.org/2000/svg"><title id="${titleId}">${escape(diagram.title)}. ${escape(diagram.caption)}</title><defs><marker id="${arrow}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" class="diagram-arrow"/></marker></defs>${body(diagram.type, arrow)}</svg></div><figcaption><strong>${escape(diagram.title)}.</strong> ${escape(diagram.caption)} <span class="school-note">Hình minh họa, không theo tỉ lệ.</span></figcaption></figure>`;
}
