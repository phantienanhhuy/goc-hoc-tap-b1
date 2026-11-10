// Danh mục bài đánh số trong SGK lớp 12 Kết nối tri thức.
const groups = [
  ['math', 'Chương I. Ứng dụng đạo hàm', [
    'Tính đơn điệu và cực trị của hàm số', 'Giá trị lớn nhất và nhỏ nhất của hàm số', 'Tiệm cận của đồ thị hàm số', 'Khảo sát biến thiên và vẽ đồ thị hàm số', 'Ứng dụng đạo hàm trong thực tiễn'
  ]],
  ['math', 'Chương II. Vectơ và tọa độ trong không gian', [
    'Vectơ trong không gian', 'Hệ trục tọa độ trong không gian', 'Tọa độ của các phép toán vectơ'
  ]],
  ['math', 'Chương III. Độ phân tán của số liệu ghép nhóm', [
    'Khoảng biến thiên và khoảng tứ phân vị', 'Phương sai và độ lệch chuẩn'
  ]],
  ['math', 'Chương IV. Nguyên hàm và tích phân', [
    'Nguyên hàm', 'Tích phân', 'Ứng dụng hình học của tích phân'
  ]],
  ['math', 'Chương V. Phương pháp tọa độ trong không gian', [
    'Phương trình mặt phẳng', 'Phương trình đường thẳng trong không gian', 'Công thức tính góc trong không gian', 'Phương trình mặt cầu'
  ]],
  ['math', 'Chương VI. Xác suất có điều kiện', [
    'Xác suất có điều kiện', 'Công thức xác suất toàn phần và Bayes'
  ]],
  ['physics', 'Chương I. Vật lí nhiệt', [
    'Cấu trúc của chất và sự chuyển thể', 'Nội năng và định luật I nhiệt động lực học', 'Nhiệt độ, thang nhiệt độ và nhiệt kế', 'Nhiệt dung riêng', 'Nhiệt nóng chảy riêng', 'Nhiệt hóa hơi riêng', 'Bài tập về vật lí nhiệt'
  ]],
  ['physics', 'Chương II. Khí lí tưởng', [
    'Mô hình động học phân tử chất khí', 'Định luật Boyle', 'Định luật Charles', 'Phương trình trạng thái khí lí tưởng', 'Áp suất khí, động năng phân tử và nhiệt độ', 'Bài tập về khí lí tưởng'
  ]],
  ['physics', 'Chương III. Từ trường', [
    'Từ trường', 'Lực từ và cảm ứng từ', 'Từ thông và cảm ứng điện từ', 'Máy phát điện xoay chiều', 'Ứng dụng cảm ứng điện từ', 'Điện từ trường và mô hình sóng điện từ', 'Bài tập về từ trường'
  ]],
  ['physics', 'Chương IV. Vật lí hạt nhân', [
    'Cấu trúc hạt nhân', 'Phản ứng hạt nhân và năng lượng liên kết', 'Hiện tượng phóng xạ', 'Công nghiệp hạt nhân', 'Bài tập về vật lí hạt nhân'
  ]],
  ['it', 'Chủ đề 1. Máy tính và xã hội tri thức', [
    'Làm quen với trí tuệ nhân tạo', 'Trí tuệ nhân tạo trong khoa học và đời sống'
  ]],
  ['it', 'Chủ đề 2. Mạng máy tính và Internet', [
    'Một số thiết bị mạng thông dụng', 'Giao thức mạng', 'Thực hành chia sẻ tài nguyên trên mạng'
  ]],
  ['it', 'Chủ đề 3. Đạo đức, pháp luật và văn hóa số', [
    'Giao tiếp và ứng xử trong không gian mạng'
  ]],
  ['it', 'Chủ đề 4. Giải quyết vấn đề với máy tính', [
    'HTML và cấu trúc trang web', 'Định dạng văn bản', 'Tạo danh sách và bảng', 'Tạo liên kết', 'Chèn đa phương tiện và khung nội tuyến', 'Tạo biểu mẫu', 'Khái niệm và vai trò của CSS', 'Định dạng văn bản bằng CSS', 'Tạo màu cho chữ và nền', 'Định dạng khung', 'Các mức ưu tiên của bộ chọn', 'Thực hành tổng hợp thiết kế trang web'
  ]],
  ['it', 'Chủ đề 5. Hướng nghiệp với tin học', [
    'Dịch vụ sửa chữa và bảo trì máy tính', 'Nhóm nghề quản trị trong công nghệ thông tin', 'Hội thảo hướng nghiệp'
  ]],
  ['it', 'Chủ đề 6. Mạng máy tính và Internet', [
    'Tìm hiểu thiết bị mạng', 'Đường truyền mạng và ứng dụng', 'Sơ bộ về thiết kế mạng'
  ]],
  ['it', 'Chủ đề 7. Giải quyết vấn đề với máy tính', [
    'Làm quen với học máy', 'Làm quen với khoa học dữ liệu', 'Máy tính và khoa học dữ liệu', 'Thực hành trích rút thông tin và tri thức', 'Mô phỏng trong giải quyết vấn đề', 'Ứng dụng mô phỏng trong giáo dục'
  ]]
];

const counters = { math: 0, physics: 0, it: 0 };
export const CURRICULUM = groups.flatMap(([subject, chapter, lessons]) => lessons.map((name) => {
  const number = ++counters[subject];
  return { id: `${subject}-${String(number).padStart(2, '0')}`, subject, chapter, title: `Bài ${number}. ${name}` };
}));

export const CURRICULUM_SOURCES = [
  { subject: 'math', title: 'Mục lục Toán 12 Kết nối tri thức', url: 'https://www.thivien.org/toan-12-kn/index.jsp' },
  { subject: 'physics', title: 'Tài liệu bồi dưỡng sử dụng SGK Vật lí 12', url: 'https://locthanhbaoloc.lamdong.edu.vn/home/uploads/news/2024_08/tai-lieu-boi-duong-su-dung-sgk-vat-li-12-ruot-23.4.2024-1.pdf' },
  { subject: 'it', title: 'Tin học 12 định hướng Khoa học máy tính', url: 'https://www.thivien.org/tin-hoc-12-kn/tin-hoc-12-khoa-hoc-may-tinh.jsp' }
];
