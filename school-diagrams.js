// Original vector illustrations; no remote image or executable lesson markup.
export const DIAGRAM_TYPES = ['cubic', 'vectors', 'integral-area', 'plane-line', 'bayes-tree', 'boxplot', 'phase-change', 'gas-process', 'magnetic-force', 'induction', 'decay', 'network', 'html-tree', 'box-model', 'ml-pipeline', 'confusion-matrix'];
const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = (x, y, s, extra = '') => `<text x="${x}" y="${y}" ${extra}>${e(s)}</text>`;
const line = (x1, y1, x2, y2, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${extra}/>`;
const box = (x, y, w, h, label, extra = '') => `<rect class="diagram-box" x="${x}" y="${y}" width="${w}" height="${h}" rx="10" ${extra}/>${text(x + w / 2, y + h / 2 + 6, label, 'text-anchor="middle"')}`;
const point = (x, y) => `<circle class="diagram-point" cx="${x}" cy="${y}" r="5"/>`;

function diagramBody(type, arrow) {
  const arr = `marker-end="url(#${arrow})"`;
  const axes = (x, y, w, h, xlabel, ylabel) => line(x, y, x + w, y, arr) + line(x, y, x, y - h, arr) + text(x + w - 6, y + 28, xlabel) + text(x - 26, y - h + 5, ylabel);
  switch (type) {
    case 'cubic': {
      const curve = [];
      for (let x = -2.1; x <= 2.101; x += .025) curve.push(`${curve.length ? 'L' : 'M'}${(320 + x * 110).toFixed(2)},${(156 - (x ** 3 - 3 * x) * 36).toFixed(2)}`);
      return line(70, 156, 575, 156, arr) + text(568, 184, 'x') + line(320, 286, 320, 24, arr) + text(299, 32, 'y') + `<path class="diagram-curve" d="${curve.join(' ')}"/>` + point(210, 84) + point(430, 228) + text(118, 66, '(−1; 2) · cực đại') + text(437, 251, '(1; −2)') + text(437, 275, 'cực tiểu') + text(332, 177, 'O') + text(418, 32, 'y = x³ − 3x');
    }
    case 'vectors':
      return line(110, 248, 320, 248, arr) + line(320, 248, 475, 75, arr) + line(110, 248, 475, 75, `${arr} class="diagram-emphasis"`) + text(87, 275, 'A') + text(321, 275, 'B') + text(485, 72, 'C') + text(202, 277, 'u = AB') + text(420, 177, 'v = BC') + text(179, 131, 'AC = u + v') + text(110, 34, 'Cộng vectơ theo quy tắc tam giác');
    case 'integral-area':
      return axes(110, 255, 430, 215, 'x', 'y') + `<path class="diagram-area" d="M110,255 L390,75 L390,255 Z"/>` + line(110, 255, 445, 40, 'class="diagram-curve"') + line(390, 75, 390, 255, 'stroke-dasharray="7 5"') + text(380, 280, '2') + text(82, 280, '0') + text(405, 91, 'y = x') + text(250, 224, 'S = 2') + text(210, 37, 'S = ∫₀² x dx = 2');
    case 'plane-line':
      return `<path class="diagram-area" d="M105,235 L405,235 L540,135 L240,135 Z"/>` + line(320, 183, 320, 43, `${arr} class="diagram-emphasis"`) + line(320, 183, 320, 282, 'stroke-dasharray="6 6"') + line(320, 183, 377, 183) + `<path fill="none" d="M320,161 L342,161 L342,183"/>` + point(320, 183) + text(332, 46, 'n ≠ 0') + text(337, 208, 'M₀') + text(155, 222, '(P)') + text(93, 302, 'n vuông góc mọi vectơ nằm trong (P)');
    case 'bayes-tree':
      return point(66, 163) + line(66, 163, 230, 83) + line(66, 163, 230, 243) + line(265, 83, 465, 43) + line(265, 83, 465, 123) + line(265, 243, 465, 203) + line(265, 243, 465, 283) + text(115, 100, 'P(A)') + text(115, 242, 'P(Ā)') + text(240, 89, 'A') + text(240, 249, 'Ā') + text(324, 42, 'P(B|A)') + text(324, 129, 'P(B̄|A)') + text(324, 199, 'P(B|Ā)') + text(324, 297, 'P(B̄|Ā)') + text(481, 49, 'A ∩ B') + text(481, 129, 'A ∩ B̄') + text(481, 209, 'Ā ∩ B') + text(481, 289, 'Ā ∩ B̄');
    case 'boxplot':
      return line(75, 260, 570, 260, arr) + line(110, 147, 530, 147) + line(110, 116, 110, 178) + line(530, 116, 530, 178) + `<rect class="diagram-area" x="220" y="102" width="220" height="90"/>` + line(315, 102, 315, 192, 'class="diagram-emphasis"') + text(205, 219, 'Q₁') + text(301, 219, 'Q₂') + text(426, 219, 'Q₃') + text(259, 71, 'IQR = Q₃ − Q₁') + text(103, 293, 'Sơ đồ vị trí các tứ phân vị, không biểu diễn số liệu cụ thể');
    case 'phase-change':
      return box(25, 120, 130, 62, 'RẮN') + box(255, 120, 130, 62, 'LỎNG') + box(485, 120, 130, 62, 'KHÍ') + line(155, 129, 253, 129, arr) + line(255, 174, 157, 174, arr) + line(385, 129, 483, 129, arr) + line(485, 174, 387, 174, arr) + text(171, 92, 'Nóng chảy') + text(172, 113, 'thu nhiệt') + text(167, 207, 'Đông đặc') + text(172, 228, 'tỏa nhiệt') + text(401, 92, 'Hóa hơi') + text(402, 113, 'thu nhiệt') + text(395, 207, 'Ngưng tụ') + text(403, 228, 'tỏa nhiệt') + text(87, 283, 'Thăng hoa: rắn → khí; ngưng kết: khí → rắn');
    case 'gas-process': {
      const pts = [];
      for (let v = 1; v <= 5; v += .04) pts.push(`${pts.length ? 'L' : 'M'}${100 + v * 84},${270 - 210 / v}`);
      return axes(100, 270, 450, 235, 'V', 'p') + `<path class="diagram-curve" d="${pts.join(' ')}"/>` + point(268, 165) + point(436, 217.5) + text(270, 145, 'pV = hằng số') + text(320, 56, 'Đẳng nhiệt · T không đổi') + text(338, 83, 'Lượng khí xác định');
    }
    case 'magnetic-force':
      return Array.from({length: 18}, (_, i) => text(92 + (i % 6) * 87, 78 + Math.floor(i / 6) * 70, '×', 'class="field-symbol"')).join('') + line(90, 160, 535, 160, `${arr} class="diagram-emphasis"`) + line(316, 160, 316, 43, `${arr} class="diagram-emphasis"`) + text(540, 165, 'I') + text(332, 48, 'F') + text(99, 290, '×: B hướng vào trang · I sang phải ⇒ F hướng lên');
    case 'induction':
      return axes(95, 263, 450, 213, 't', 'Φ') + line(137, 228, 480, 85, 'class="diagram-curve"') + `<path fill="none" stroke-dasharray="6 5" d="M220,193 L420,193 L420,110"/>` + text(286, 218, 'Δt') + text(430, 157, 'ΔΦ') + text(267, 49, '|ε̄| = N|ΔΦ|/Δt') + text(160, 306, 'Độ dốc lớn hơn ⇒ suất điện động cảm ứng lớn hơn');
    case 'decay': {
      const pts = [];
      for (let t = 0; t <= 4.001; t += .025) pts.push(`${pts.length ? 'L' : 'M'}${100 + t * 110},${268 - 220 * 2 ** (-t)}`);
      return axes(100, 268, 460, 230, 't/T', 'N/N₀') + `<path class="diagram-curve" d="${pts.join(' ')}"/>` + [1, 2, 3].map(t => line(100 + t * 110, 268, 100 + t * 110, 268 - 220 * 2 ** (-t), 'stroke-dasharray="5 5"') + point(100 + t * 110, 268 - 220 * 2 ** (-t)) + text(94 + t * 110, 293, String(t))).join('') + text(63, 53, '1') + text(218, 143, '1/2') + text(330, 203, '1/4') + text(444, 230, '1/8') + text(302, 58, 'N = N₀ · 2^(−t/T)');
    }
    case 'network':
      return box(22, 45, 145, 58, 'Máy tính') + box(22, 215, 145, 58, 'Máy in') + box(215, 130, 130, 58, 'Switch') + box(395, 130, 130, 58, 'Router') + box(382, 20, 190, 58, 'Mạng khác') + line(167, 74, 215, 150) + line(167, 244, 215, 169) + line(345, 159, 395, 159) + line(460, 130, 477, 78) + text(205, 287, 'LAN: thiết bị đầu cuối qua switch') + text(399, 218, 'Kết nối giữa mạng');
    case 'html-tree':
      return box(250, 22, 140, 50, 'html') + box(100, 118, 140, 50, 'head') + box(400, 118, 140, 50, 'body') + box(45, 236, 110, 50, 'meta') + box(187, 236, 110, 50, 'title') + box(355, 236, 110, 50, 'h1') + box(497, 236, 110, 50, 'p') + line(320, 72, 170, 118) + line(320, 72, 470, 118) + line(170, 168, 100, 236) + line(170, 168, 242, 236) + line(470, 168, 410, 236) + line(470, 168, 552, 236);
    case 'box-model':
      return `<rect class="diagram-layer layer-margin" x="50" y="24" width="540" height="272" rx="10"/><rect class="diagram-layer layer-border" x="100" y="70" width="440" height="184" rx="7"/><rect class="diagram-layer layer-padding" x="130" y="100" width="380" height="122" rx="4"/><rect class="diagram-box" x="205" y="142" width="230" height="48"/>` + text(67, 52, 'margin') + text(112, 93, 'border') + text(143, 125, 'padding') + text(320, 173, 'content', 'text-anchor="middle"') + text(216, 280, 'Từ trong ra ngoài');
    case 'ml-pipeline':
      return box(28, 30, 180, 52, 'Dữ liệu') + box(28, 130, 180, 52, 'Tập huấn luyện') + box(28, 235, 180, 52, 'Tập kiểm tra') + box(280, 130, 150, 52, 'Huấn luyện') + box(480, 130, 130, 52, 'Mô hình') + box(280, 235, 330, 52, 'Đánh giá trên dữ liệu chưa học') + line(118, 82, 118, 128, arr) + `<path fill="none" d="M28,56 H13 V261 H26" ${arr}/>` + line(208, 156, 278, 156, arr) + line(430, 156, 478, 156, arr) + line(208, 261, 278, 261, arr) + line(545, 182, 545, 233, arr) + text(262, 63, 'Tách dữ liệu trước khi học');
    case 'confusion-matrix':
      return text(375, 44, 'Dự đoán', 'text-anchor="middle"') + text(285, 78, 'Dương') + text(453, 78, 'Âm') + text(25, 173, 'Thực tế') + text(130, 142, 'Dương') + text(144, 239, 'Âm') + box(215, 93, 160, 90, 'TP') + box(385, 93, 160, 90, 'FN') + box(215, 193, 160, 90, 'FP') + box(385, 193, 160, 90, 'TN');
    default: return '';
  }
}

export function renderLessonDiagram(diagram, id) {
  if (!DIAGRAM_TYPES.includes(diagram?.type)) return '';
  const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, '-');
  const titleId = `${safeId}-title`, arrow = `${safeId}-arrow`;
  return `<figure class="study-figure"><div class="study-diagram-scroll" tabindex="0" role="region" aria-label="Hình minh họa, có thể cuộn ngang"><svg class="study-diagram" viewBox="0 0 640 320" role="img" aria-labelledby="${titleId}" xmlns="http://www.w3.org/2000/svg"><title id="${titleId}">${e(diagram.title)}. ${e(diagram.caption)}</title><defs><marker id="${arrow}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" class="diagram-arrow"/></marker></defs>${diagramBody(diagram.type, arrow)}</svg></div><figcaption><strong>${e(diagram.title)}.</strong> ${e(diagram.caption)} <span class="school-note">Hình minh họa; sơ đồ không theo tỉ lệ.</span></figcaption></figure>`;
}
