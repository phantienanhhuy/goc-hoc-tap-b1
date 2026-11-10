// Locally stored, open-licensed images; metadata from Wikimedia Commons.
const assets = {
  "extrema": {
    "id": "extrema",
    "src": "./assets/learning/science/extrema.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Extrempunkte demonstrationsgraph.svg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Extrempunkte_demonstrationsgraph.svg",
    "author": "Johannes Schneider",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "width": 960,
    "height": 459
  },
  "solenoid": {
    "id": "solenoid",
    "src": "./assets/learning/science/solenoid.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Picture of solenoid.png",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Picture_of_solenoid.png",
    "author": "P.wormer",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "width": 800,
    "height": 435
  },
  "faraday": {
    "id": "faraday",
    "src": "./assets/learning/science/faraday.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Faraday's law of induction.svg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Faraday%27s_law_of_induction.svg",
    "author": "J\u00e4hmefyysikko",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "width": 634,
    "height": 1000
  },
  "generator": {
    "id": "generator",
    "src": "./assets/learning/science/generator.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Electric-generator-3D-with-voltmeter.svg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Electric-generator-3D-with-voltmeter.svg",
    "author": "MikeRun",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "width": 960,
    "height": 780
  },
  "transformer": {
    "id": "transformer",
    "src": "./assets/learning/science/transformer.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Transformer under load (alternative version).svg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Transformer_under_load_(alternative_version).svg",
    "author": "Gutten p\u00e5 Hemsen",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "width": 960,
    "height": 768
  },
  "decay": {
    "id": "decay",
    "src": "./assets/learning/science/decay.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Half-life example graph.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Half-life_example_graph.jpg",
    "author": "Pradana Aumars",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "width": 960,
    "height": 538
  },
  "xyz": {
    "id": "xyz",
    "src": "./assets/learning/science/xyz.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 3D vector component.png",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:3D_vector_component.png",
    "author": "Aboalbiss",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "width": 945,
    "height": 796
  },
  "boxplot": {
    "id": "boxplot",
    "src": "./assets/learning/science/boxplot.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Box plot description.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Box_plot_description.jpg",
    "author": "Dcbmariano",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "width": 437,
    "height": 457
  },
  "spread": {
    "id": "spread",
    "src": "./assets/learning/science/spread.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Standard deviation graph.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Standard_deviation_graph.jpg",
    "author": "Rohanukhade",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "width": 960,
    "height": 615
  },
  "probability": {
    "id": "probability",
    "src": "./assets/learning/science/probability.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Probability tree diagram.svg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Probability_tree_diagram.svg",
    "author": "Gnathan87",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "width": 960,
    "height": 660
  },
  "states": {
    "id": "states",
    "src": "./assets/learning/science/states.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 States of Matter.JPG",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:States_of_Matter.JPG",
    "author": "Original uploader was  M.manary  at  en.wikibooks",
    "license": "Public domain",
    "licenseUrl": "https://commons.wikimedia.org/wiki/Commons:Public_domain",
    "width": 577,
    "height": 557
  },
  "charles": {
    "id": "charles",
    "src": "./assets/learning/science/charles.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Charles's law graph.png",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Charles%27s_law_graph.png",
    "author": "Physchim62",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "width": 960,
    "height": 590
  },
  "magnet": {
    "id": "magnet",
    "src": "./assets/learning/science/magnet.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Bar-magnet-iron-filings max.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Bar-magnet-iron-filings_max.jpg",
    "author": "MikeRun , Vera Wurmsdobler",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "width": 960,
    "height": 528
  },
  "normal": {
    "id": "normal",
    "src": "./assets/learning/science/normal.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Normal vectors.svg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Normal_vectors.svg",
    "author": "Elembis",
    "license": "Public domain",
    "licenseUrl": "https://commons.wikimedia.org/wiki/Commons:Public_domain",
    "width": 783,
    "height": 1000
  },
  "sphere": {
    "id": "sphere",
    "src": "./assets/learning/science/sphere.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Plane-Sphere Intersection.svg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Plane-Sphere_Intersection.svg",
    "author": "Zephyris; redraw by Pbroks13",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "width": 960,
    "height": 443
  },
  "integral": {
    "id": "integral",
    "src": "./assets/learning/science/integral.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Integral-area-under-curve.svg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Integral-area-under-curve.svg",
    "author": "helix84",
    "license": "Public domain",
    "licenseUrl": "https://commons.wikimedia.org/wiki/Commons:Public_domain",
    "width": 960,
    "height": 594
  },
  "boyle": {
    "id": "boyle",
    "src": "./assets/learning/science/boyle.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Boyles Law.svg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Boyles_Law.svg",
    "author": "Krishnavedala",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "width": 960,
    "height": 937
  },
  "fission": {
    "id": "fission",
    "src": "./assets/learning/science/fission.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Nuclear fission.svg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nuclear_fission.svg",
    "author": "Fastfission",
    "license": "Public domain",
    "licenseUrl": "https://commons.wikimedia.org/wiki/Commons:Public_domain",
    "width": 640,
    "height": 1000
  },
  "chain": {
    "id": "chain",
    "src": "./assets/learning/science/chain.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Fission chain reaction.svg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Fission_chain_reaction.svg",
    "author": "User:Fastfission",
    "license": "Public domain",
    "licenseUrl": "https://commons.wikimedia.org/wiki/Commons:Public_domain",
    "width": 649,
    "height": 1000
  },
  "heating": {
    "id": "heating",
    "src": "./assets/learning/science/heating.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Heating curve blank labelled exam.svg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Heating_curve_blank_labelled_exam.svg",
    "author": "Bohrium2b",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "width": 960,
    "height": 546
  },
  "nucleus": {
    "id": "nucleus",
    "src": "./assets/learning/science/nucleus.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Helium atom QM.svg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Helium_atom_QM.svg",
    "author": "User:Yzmo",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "width": 960,
    "height": 964
  },
  "spectrum": {
    "id": "spectrum",
    "src": "./assets/learning/science/spectrum.webp",
    "sourceTitle": "Wikimedia Commons \u00b7 Electromagnetic radiation spectrum - en.svg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Electromagnetic_radiation_spectrum_-_en.svg",
    "author": "Philip Ronan",
    "license": "CC BY-SA 2.5",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5",
    "width": 960,
    "height": 457
  }
};

// Commons raster thumbnails converted to WebP for local display.
Object.assign(assets.states, {sourceTitle:'Wikimedia Commons · Phase change - en.svg', sourceUrl:'https://commons.wikimedia.org/wiki/File:Phase_change_-_en.svg', author:'Flanker and penubag', license:'Public domain', licenseUrl:'https://commons.wikimedia.org/wiki/Commons:Public_domain', width:940, height:1000});
Object.assign(assets.decay, {sourceTitle:'Wikimedia Commons · Radioactive decay of Carbon-14 SVG.svg', sourceUrl:'https://commons.wikimedia.org/wiki/File:Radioactive_decay_of_Carbon-14_SVG.svg', author:'ExeterPaul', license:'CC BY-SA 3.0', licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/', width:1000, height:750});

// Notes are written for the displayed image, including labels in English.
const details = {
  extrema: ['Đồ thị và cực trị', 'Đường cong với một cực đại và một cực tiểu.', 'Một đồ thị minh họa sự thay đổi chiều biến thiên.', ['Theo dõi đồ thị từ trái sang phải để tìm đoạn tăng và đoạn giảm.', 'Tại hai điểm đổi chiều, tiếp tuyến nằm ngang; đọc giá trị trên trục tung.']],
  xyz: ['Vectơ trong hệ trục Oxyz', 'Vectơ được phân tích thành ba thành phần theo các trục x, y, z.', 'Các thành phần vectơ theo ba trục vuông góc.', ['Xác định gốc và chiều dương của ba trục.', 'Quan sát vectơ tổng và các thành phần tương ứng với từng trục.']],
  normal: ['Pháp tuyến của mặt phẳng', 'Hai vectơ pháp tuyến ngược chiều cùng vuông góc mặt phẳng.', 'Hai hướng pháp tuyến của cùng một mặt phẳng.', ['Nhìn kí hiệu góc vuông giữa pháp tuyến và mặt phẳng.', 'Hai vectơ ngược hướng vẫn có thể là pháp tuyến của cùng mặt phẳng.']],
  sphere: ['Mặt cầu và mặt phẳng', 'Ba hình lần lượt không giao, tiếp xúc và cắt theo đường tròn.', 'Các vị trí tương đối của mặt phẳng và mặt cầu.', ['So sánh khoảng cách từ tâm cầu đến mặt phẳng với bán kính.', 'Từ trái sang phải: không giao, tiếp xúc tại một điểm, giao theo đường tròn.']],
  boxplot: ['Sơ đồ hộp và tứ phân vị', 'Hình hộp thể hiện trung vị, các tứ phân vị và điểm ngoại lệ.', 'Sơ đồ hộp biểu diễn vị trí tứ phân vị.', ['Đọc first quartile là Q₁, median là Q₂ và third quartile là Q₃; chiều cao hộp biểu diễn IQR = Q₃ − Q₁.', 'Trong hình, điểm rời phía trên là ngoại lệ; đầu râu ghi maximum là giá trị lớn nhất không tính điểm ngoại lệ, không phải lớn nhất toàn bộ dữ liệu. Quy ước râu có thể khác giữa các tài liệu.']],
  spread: ['Độ lệch chuẩn trên đường cong chuẩn', 'Hình chuông phân bố chuẩn với các khoảng tính theo độ lệch chuẩn.', 'Ví dụ trực quan về độ lệch chuẩn trong phân bố chuẩn.', ['Tâm đường cong là giá trị trung bình; các vạch cách tâm một hoặc hai độ lệch chuẩn.', 'Các phần trăm trong hình chỉ áp dụng cho phân bố chuẩn, không phải mọi tập số liệu.']],
  integral: ['Diện tích dưới đường cong', 'Miền tô màu nằm giữa đồ thị dương và trục hoành từ a đến b.', 'Diện tích và tích phân khi hàm không âm.', ['Xác định hai cận a, b và miền tô màu dưới đồ thị f.', 'Trong hình f không âm nên diện tích bằng tích phân từ a đến b; nếu đổi dấu phải chia miền hoặc dùng trị tuyệt đối.']],
  probability: ['Cây xác suất hai bước', 'Cây gồm nhánh A, A bổ sung và các nhánh có điều kiện B.', 'Sơ đồ cây diễn tả xác suất có điều kiện.', ['Nhánh đầu là A hoặc biến cố đối; nhánh sau ghi xác suất B theo điều kiện ở nhánh đầu.', 'Nhân xác suất dọc một nhánh để được xác suất giao; cộng các nhánh thích hợp để tìm xác suất toàn phần.']],
  states: ['Các thể và chuyển thể', 'Sơ đồ các thể rắn, lỏng, khí, plasma và các mũi tên chuyển thể.', 'Tập trung ba thể rắn–lỏng–khí; plasma là phần mở rộng.', ['Solid là rắn, liquid là lỏng, gas là khí; melting là nóng chảy, freezing là đông đặc.', 'Vaporization là hóa hơi, condensation là ngưng tụ; sublimation là thăng hoa, deposition là ngưng kết.', 'Mũi tên bên phải biểu diễn enthalpy, một đại lượng năng lượng, không phải nhiệt độ. Sơ đồ không theo tỉ lệ.']],
  heating: ['Đường đun nóng qua các giai đoạn', 'Đường nhiệt độ theo thời gian gồm các đoạn nghiêng và hai đoạn nằm ngang.', 'Đường đun nóng lí tưởng khi chuyển thể.', ['Trục đứng là nhiệt độ, trục ngang là thời gian; đoạn nghiêng biểu thị nhiệt độ thay đổi.', 'Đoạn B–C và D–E nằm ngang biểu thị chuyển thể ở nhiệt độ không đổi trong mô hình này.']],
  boyle: ['Đồ thị đẳng nhiệt', 'Đồ thị áp suất giảm theo thể tích dạng hypebol.', 'Quan hệ áp suất–thể tích của lượng khí ở nhiệt độ không đổi.', ['Trục ngang là thể tích, trục đứng là áp suất; khi V tăng thì p giảm.', 'Với cùng lượng khí lí tưởng đẳng nhiệt, tích pV không đổi; hai trạng thái trên cùng đường thỏa p₁V₁ = p₂V₂.']],
  charles: ['Thể tích theo nhiệt độ Celsius', 'Hai đường thẳng V theo nhiệt độ Celsius được kéo dài tới gần âm 273 độ C.', 'Ngoại suy quan hệ đẳng áp theo nhiệt độ.', ['Trục ngang dùng nhiệt độ Celsius; đường chấm là phần ngoại suy của mô hình.', 'Khi tính tỉ số V/T phải đổi sang Kelvin; khí thực có thể hóa lỏng trước khi tới 0 K.']],
  magnet: ['Mạt sắt quanh nam châm', 'Mạt sắt xếp thành các dải cong quanh nam châm thanh.', 'Mạt sắt giúp quan sát hình dạng từ trường.', ['Quan sát các dải mạt sắt quanh hai cực N và S.', 'Mạt sắt cho biết hình dạng tương đối của từ trường nhưng hình không tự chỉ chiều đường sức.']],
  solenoid: ['Từ trường của ống dây', 'Dòng điện trong ống dây và đường sức từ quanh ống.', 'Chiều từ trường được minh họa quanh ống dây có dòng điện.', ['Theo các mũi tên dòng điện chạy quanh vòng dây; đường xanh cho hướng từ trường trong và ngoài ống.', 'Dùng quy tắc nắm tay phải: các ngón theo chiều dòng, ngón cái chỉ chiều từ trường bên trong ống dây.']],
  faraday: ['Cảm ứng do từ thông biến thiên', 'Ba khung minh họa chuyển động tương đối và từ trường biến thiên qua mạch.', 'Các cách làm thay đổi từ thông qua mạch kín.', ['Dấu nhân biểu diễn từ trường hướng vào trang; quan sát vùng từ trường đi qua khung.', 'Mạch chuyển động, vùng từ trường chuyển động hoặc độ lớn B thay đổi đều có thể làm từ thông biến thiên.']],
  generator: ['Máy phát điện xoay chiều', 'Khung dây quay giữa hai cực nam châm nối với vôn kế.', 'Mô hình khung dây quay trong từ trường.', ['Xác định khung dây, hai cực nam châm và bộ phận nối với vôn kế.', 'Khung quay làm góc và từ thông biến thiên tuần hoàn, gây suất điện động cảm ứng.']],
  transformer: ['Máy biến áp có tải', 'Cuộn sơ cấp và thứ cấp cùng lõi, phía thứ cấp nối tải.', 'Sơ đồ máy biến áp lí tưởng.', ['Nhận biết nguồn xoay chiều, cuộn sơ cấp Np, thứ cấp Ns và tải ZL.', 'Trong mô hình lí tưởng, tỉ số điện áp bằng tỉ số số vòng; hình dùng quy ước dấu dòng riêng.']],
  spectrum: ['Phổ sóng điện từ', 'Thang tần số và bước sóng từ sóng vô tuyến tới tia gamma.', 'Phổ điện từ theo tần số và bước sóng.', ['Quan sát thứ tự vô tuyến, vi ba, hồng ngoại, ánh sáng thấy được, tử ngoại, tia X và gamma.', 'Trong chân không, tần số tăng thì bước sóng giảm theo c = λf; dải màu là phần nhìn thấy.']],
  nucleus: ['Hạt nhân trong nguyên tử heli', 'Minh họa đám mây electron và hình phóng to hạt nhân heli.', 'Hình khái niệm về nguyên tử heli và hạt nhân.', ['Vùng mờ biểu diễn phân bố electron; ô phóng to minh họa các nucleon trong hạt nhân.', 'So sánh các thước tỉ lệ trong hình: kích thước hạt nhân rất nhỏ so với nguyên tử.']],
  decay: ['Đồ thị phân rã carbon-14', 'Đường cong phần trăm carbon-14 còn lại theo thời gian tính bằng năm.', 'Minh họa quy luật bán rã của carbon-14.', ['Trục ngang là thời gian theo năm; trục đứng là phần trăm số hạt carbon-14 ban đầu còn lại.', 'Từ đồ thị, phần còn lại giảm xấp xỉ một nửa sau 5.730 năm; với mẫu nhỏ số thực tế có dao động ngẫu nhiên.']],
  fission: ['Phân hạch uranium', 'Neutron đi vào uranium-235 tạo hạt nhân kích thích và các mảnh phân hạch.', 'Một ví dụ phản ứng phân hạch do neutron.', ['Theo thứ tự từ trên xuống: neutron tới, hạt nhân uranium rồi các mảnh và neutron phát ra.', 'Kiểm tra tổng số khối và điện tích khi viết phương trình; các sản phẩm trong hình chỉ là một kênh phản ứng.']],
  chain: ['Phản ứng phân hạch dây chuyền', 'Các neutron từ một phân hạch gây thêm những phân hạch tiếp theo.', 'Sơ đồ phát triển phản ứng phân hạch dây chuyền.', ['Theo các neutron tỏa ra từ mỗi sự kiện phân hạch.', 'Chỉ một số neutron tiếp tục gây phân hạch; trong lò phản ứng số neutron hữu hiệu được điều khiển.']]
};

const mapping = {
 'math-01':['extrema'], 'math-02':['extrema'], 'math-04':['extrema'], 'math-05':['extrema'],
 'math-06':['xyz'], 'math-07':['xyz'], 'math-08':['xyz'], 'math-09':['boxplot'], 'math-10':['spread'],
 'math-11':['integral'], 'math-12':['integral'], 'math-13':['integral'], 'math-14':['normal'],
 'math-16':['normal'], 'math-17':['sphere'], 'math-18':['probability'], 'math-19':['probability'],
 'physics-01':['states'], 'physics-03':['heating'], 'physics-04':['heating'], 'physics-05':['heating'], 'physics-06':['heating'], 'physics-07':['heating'],
 'physics-09':['boyle'], 'physics-10':['charles'], 'physics-11':['boyle','charles'], 'physics-13':['boyle','charles'],
 'physics-14':['magnet','solenoid'], 'physics-16':['faraday'], 'physics-17':['generator'], 'physics-18':['transformer'], 'physics-19':['spectrum'], 'physics-20':['faraday'],
 'physics-21':['nucleus'], 'physics-22':['fission'], 'physics-23':['decay'], 'physics-24':['chain'], 'physics-25':['decay']
};
export const SCIENCE_IMAGES = Object.fromEntries(Object.entries(mapping).map(([lesson, keys]) => [lesson, keys.map(key => {
  const [title, alt, caption, explanation] = details[key];
  return {...assets[key], licenseUrl: assets[key].licenseUrl.replace(/^http:\/\//, 'https://'), id: `${lesson}-${key}`, title, alt, caption, explanation};
})]));
