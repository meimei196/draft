export interface DateIdea {
  id: number;
  title: string;
  category: string;
  scenario: string;
  emoji: string;
  isNsfw?: boolean;
}

// ==========================================
// 69 SFW CHAT IDEAS (Hẹn Hò & Tương Tác Đời Thường / Lãng Mạn / Nhập Vai)
// ==========================================
export const SFW_DATE_IDEAS: DateIdea[] = [
  {
    id: 1,
    title: "Chơi Trò Truth Or Dare (Thật Hay Thách)",
    category: "Trò Chơi & Thử Thách",
    scenario: "Hai người cùng ngồi chơi Thật hay Thách, mỗi câu hỏi đặt ra đều khai thác những bí mật thầm kín, cảm xúc thật hoặc những thử thách dũng khí khiến bầu không khí dần nóng lên.",
    emoji: "🎲"
  },
  {
    id: 2,
    title: "Đi Dạo Phố Đêm & Ăn Vặt Vỉa Hè",
    category: "Đời Thường & Lãng Mạn",
    scenario: "Hai người cùng rảo bước trên con phố đêm vắng người lúc nửa đêm, ghé vào một quán ăn vặt lề đường, vừa ăn vừa trêu chọc và tranh giành miếng ngon cuối cùng.",
    emoji: "🍢"
  },
  {
    id: 3,
    title: "Mắc Kẹt Cùng Nhau Dưới Cơn Mưa Bão",
    category: "Tình Cờ & Lãng Mạn",
    scenario: "Cơn mưa dông bất ngờ đổ ập xuống, hai người phải chạy vào nấp chung dưới một mái hiên chật hẹp hoặc kẹt trong xe ô tô chờ mưa tạnh, vai áo ướt lạnh nhưng khoảng cách gần sát nhau.",
    emoji: "🌧️"
  },
  {
    id: 4,
    title: "Cùng Xem Phim Kinh Dị Trong Phòng Tối",
    category: "Hồi Hộp & Thân Mật",
    scenario: "Tắt hết đèn trong phòng, trùm chung một chiếc chăn lớn và xem một bộ phim kinh dị giật gân. Mỗi pha hù dọa bất ngờ là một cái cớ để nép sát hoặc nắm chặt tay đối phương.",
    emoji: "🍿"
  },
  {
    id: 5,
    title: "Nấu Ăn Cùng Nhau & Làm Cháy Món Ăn",
    category: "Đời Thường & Hài Hước",
    scenario: "Hai người cùng vào bếp làm bữa tối, người chuẩn bị nguyên liệu người nấu nướng nhưng vụng về làm cháy khét món ăn, cuối cùng phải gọi đồ ăn ngoài và cười trừ cùng nhau.",
    emoji: "🍳"
  },
  {
    id: 6,
    title: "Uống Rượu Say & Tâm Sự Chuyện Quá Khứ",
    category: "Tâm Sự Đêm Khuya",
    scenario: "Ngồi uống rượu bia cùng nhau lúc nửa đêm, hơi men bốc lên làm rỡ bỏ lớp phòng ngự thường ngày, hai người bắt đầu mở lòng kể về những vết thương lòng hoặc bí mật chưa từng nói với ai.",
    emoji: "🍻"
  },
  {
    id: 7,
    title: "Chăm Sóc Đối Phương Khi Bị Sốt Mệt Mỏi",
    category: "Chữa Lành & Ấm Áp",
    scenario: "Một trong hai người bị ốm hoặc kiệt sức sau ngày dài, người kia ở bên cạnh chăm sóc: đo nhiệt độ, nấu cháo nóng, chườm trán và ngồi bên mép giường canh chừng suốt đêm.",
    emoji: "🩹"
  },
  {
    id: 8,
    title: "Cùng Trốn Khỏi Một Bữa Tiệc Xã Giao Nhàm Chán",
    category: "Nổi Loạn & Bí Mật",
    scenario: "Cảm thấy ngột ngạt giữa bữa tiệc xã giao giả tạo của giới thượng lưu hay tiệc liên hoan ồn ào, hai người lén ra hiệu cho nhau rồi cùng chuồn ra cửa sau chạy trốn vào màn đêm.",
    emoji: "🚪"
  },
  {
    id: 9,
    title: "Đổi Điện Thoại Kiểm Tra Tin Nhắn Trong 10 Phút",
    category: "Kịch Tính & Thử Lòng",
    scenario: "Hai người đặt ra giao kèo đổi điện thoại mở khóa cho nhau xem trong vòng 10 phút, tự do đọc album ảnh, lịch sử tìm kiếm hoặc danh sách tin nhắn để xem ai là người chột dạ trước.",
    emoji: "📱"
  },
  {
    id: 10,
    title: "Cùng Đi Dạo Công Viên Giải Trí & Đu Quay Khổng Lồ",
    category: "Hẹn Hò Thanh Xuân",
    scenario: "Cùng nhau hòa vào dòng người ở khu vui chơi, thử thách những trò chơi cảm giác mạnh và ngồi chung cabin đu quay khổng lồ ngắm nhìn toàn cảnh thành phố rực rỡ ánh đèn lúc lên đỉnh cao nhất.",
    emoji: "🎡"
  },
  {
    id: 11,
    title: "Cùng Nhau Đi Mua Sắm & Phối Đồ Cho Đối Phương",
    category: "Ngọt Ngào & Tinh Nghịch",
    scenario: "Cùng ghé trung tâm thương mại hoặc tiệm vintage, chọn những bộ trang phục theo gu của mình bắt đối phương mặc thử rồi đứng ngắm nghía, bình phẩm và chụp ảnh lưu lại.",
    emoji: "🛍️"
  },
  {
    id: 12,
    title: "Cá Cược Một Ván Game / Bài / Bi-a",
    category: "Cạnh Tranh & Thú Vị",
    scenario: "Hai người thách đấu nhau trong một trận game đối kháng, ván bi-a hoặc bài tây. Điều kiện đặt ra: người thua phải hoàn toàn nghe theo và thực hiện một yêu cầu bất kỳ của người thắng.",
    emoji: "🎯"
  },
  {
    id: 13,
    title: "Một Người Dạy Người Kia Một Kỹ Năng Mới",
    category: "Tương Tác Gần Gũi",
    scenario: "Một người kèm cặp đối phương học một kỹ năng mới (lái xe, bắn súng, chơi đàn guitar, nấu ăn hoặc đấu võ). Những pha đứng sát sau lưng điều chỉnh tư thế khiến tim đập loạn nhịp.",
    emoji: "🎸"
  },
  {
    id: 14,
    title: "Đi Dạo Bờ Biển Lúc Đêm Khuya / Ngắm Hoàng Hôn",
    category: "Lãng Mạn & Bình Yên",
    scenario: "Cùng dạo bước trên bãi cát mịn đón gió biển mát rượi, lắng nghe tiếng sóng vỗ rì rào, cùng nhặt vỏ sò và tận hưởng bầu không khí tĩnh lặng chỉ có hai người giữa đất trời.",
    emoji: "🌊"
  },
  {
    id: 15,
    title: "Giả Vờ Làm Cặp Đôi Để Tránh Bị Người Quen Thúc Giục",
    category: "Oan Gia & Giả Vờ",
    scenario: "Để đối phó với gia đình hoặc cắt đuôi kẻ bám đuôi phiền toái, hai người lập giao kèo đóng giả một cặp đôi ngọt ngào, cùng nhau diễn những cử chỉ tình tứ trước mặt người ngoài.",
    emoji: "💍"
  },
  {
    id: 16,
    title: "Đến Thăm Nhà Đối Phương & Vô Tình Xem Ảnh Hồi Nhỏ",
    category: "Khám Phá & Đáng Yêu",
    scenario: "Lần đầu tiên đặt chân vào không gian sống riêng tư của đối phương, phát hiện ra những thói quen kỳ lạ, album ảnh thuở nhỏ ngây ngô hoặc những món đồ kỷ niệm chưa từng tiết lộ.",
    emoji: "🏡"
  },
  {
    id: 17,
    title: "Đi Bar Nghe Nhạc & Xảy Ra Tình Huống Ghen Tuông",
    category: "Kịch Tính & Chiếm Hữu",
    scenario: "Cùng ngồi tại một quán bar đèn mờ nghe nhạc chill, một trong hai người bất ngờ bị kẻ khác tới buông lời tán tỉnh xin số điện thoại, làm bùng lên cơn ghen tuông ngấm ngầm từ người bên cạnh.",
    emoji: "🍸"
  },
  {
    id: 18,
    title: "Cắm Trại Qua Đêm Ngoài Trời & Ngủ Chung Một Lều",
    category: "Dã Ngoại & Thân Mật",
    scenario: "Chuyến dã ngoại vùng ngoại ô, hai người dựng lều đốt lửa nướng thịt dưới trời sao. Đêm xuống gió lạnh sương buốt, cả hai phải nằm sát nhau trong chiếc túi ngủ ấm áp.",
    emoji: "⛺"
  },
  {
    id: 19,
    title: "Hai Người Cùng Dọn Dẹp Phòng & Tìm Lại Kỷ Vật Cũ",
    category: "Hoài Niệm & Gần Gũi",
    scenario: "Dành cả buổi chiều cùng nhau dọn dẹp căn phòng bừa bộn, vô tình đào lại những bức thư cũ, cuốn lưu bút hoặc món quà kỷ niệm từ những ngày đầu mới quen biết.",
    emoji: "📦"
  },
  {
    id: 20,
    title: "Gặp Lại Sau Một Thời Gian Dài Xa Cách / Chiến Tranh Lạnh",
    category: "Ngược Luyến & Vỡ Òa",
    scenario: "Sau nhiều tuần hoặc nhiều tháng im lặng không liên lạc vì hiểu lầm, hai người tình cờ chạm mặt nhau ở góc phố cũ, ánh mắt nhìn nhau chất chứa bao lời muốn nói nhưng nghẹn lại.",
    emoji: "⏳"
  },
  {
    id: 21,
    title: "Ngồi Ban Công / Sân Thượng Ngắm Mưa Uống Trà",
    category: "Thư Thái & Tâm Tình",
    scenario: "Ngồi cạnh nhau trên chiếc ghế lười ngoài ban công trong một chiều mưa xối xả, nhâm nhi tách trà nóng thơm nồng, vừa đọc sách vừa cùng nghe một bản nhạc lofi nhẹ nhàng.",
    emoji: "☕"
  },
  {
    id: 22,
    title: "Lạc Đường & Thuê Chung Khách Sạn Chỉ Còn Một Giường",
    category: "Cổ Điển & Ngại Ngùng",
    scenario: "Chuyến đi bị lỡ tàu xe hoặc lạc đường giữa đêm, nhà nghỉ ven đường chỉ còn duy nhất một phòng trống với một chiếc giường đơn, hai người ngượng ngùng bước vào phân chia chỗ ngủ.",
    emoji: "🛏️"
  },
  {
    id: 23,
    title: "Cùng Đi Hiệu Sách Cũ & Tiệm Đĩa Than Cổ Điển",
    category: "Nghệ Thuật & Hoài Cổ",
    scenario: "Lạc giữa những kệ gỗ thơm mùi giấy cũ và đĩa than vinyl, hai người chia sẻ một bên tai nghe để cùng thưởng thức một giai điệu cổ điển yêu thích.",
    emoji: "📚"
  },
  {
    id: 24,
    title: "Một Người Nghe Lỏm Được Bí Mật Riêng Tư Của Đối Phương",
    category: "Hồi Hộp & Đổi Hướng",
    scenario: "Vô tình đứng sau cánh cửa hoặc góc hành lang và nghe trọn vẹn cuộc điện thoại đầy kịch tính của đối phương, phát hiện ra một bí mật động trời bấy lâu nay giấu kín.",
    emoji: "🤫"
  },
  {
    id: 25,
    title: "Cùng Đi Bảo Tàng Mỹ Thuật & Diễn Trò Bình Phẩm Tranh",
    category: "Nghệ Thuật & Lãng Mạn",
    scenario: "Thong dong dạo bước trong phòng trưng bày mỹ thuật yên tĩnh, giả vờ làm những nhà phê bình sành sỏi để phân tích các tác phẩm trừu tượng rồi bật cười khúc khích.",
    emoji: "🎨"
  },
  {
    id: 26,
    title: "Cùng Chạy Bộ Buổi Sáng Sớm & Trêu Chọc Thể Lực",
    category: "Năng Động & Đời Thường",
    scenario: "Hẹn nhau dậy sớm lúc 5 giờ sáng đón bình minh mát lành, vừa chạy bộ vừa trêu chọc đối phương chạy chậm thở dốc, người về đích trước được quyền đòi thưởng.",
    emoji: "🏃"
  },
  {
    id: 27,
    title: "Trốn Lên Sân Thượng Tòa Nhà Chọc Trời Ngắm Bình Minh",
    category: "Lãng Mạn & Phóng Khoáng",
    scenario: "Lén leo thang thoát hiểm lên tầng thượng cao nhất của thành phố trong đêm, cùng tựa lưng vào nhau đón những tia nắng đầu tiên dát vàng lên những tòa nhà chọc trời.",
    emoji: "🌅"
  },
  {
    id: 28,
    title: "Cùng Đi Siêu Thị Mua Đồ Ăn Khuya Lúc Nửa Đêm",
    category: "Đời Thường & Ngọt Ngào",
    scenario: "Đi dạo giữa các dãy kệ siêu thị vắng tanh lúc 1 giờ sáng, một người ngồi trong xe đẩy để người kia đẩy đi vòng quanh, chất đầy bim bim, kem lạnh và đồ ăn vặt.",
    emoji: "🛒"
  },
  {
    id: 29,
    title: "Cùng Nhau Lắp Ráp Mô Hình Lego / Nội Thất Gỗ",
    category: "Hợp Tác & Kiên Nhẫn",
    scenario: "Bày la liệt hàng trăm mảnh ghép Lego hoặc kiện gỗ nội thất ra sàn phòng khách, vừa nghiên cứu tờ hướng dẫn vừa cãi cọ đáng yêu vì lắp ngược chi tiết.",
    emoji: "🧩"
  },
  {
    id: 30,
    title: "Đi Chợ Hoa Sáng Sớm Hoặc Phiên Chợ Đồ Cổ Cuối Tuần",
    category: "Thơ Mộng & Yên Bình",
    scenario: "Tản bộ qua những sạp hoa tươi ngát hương sương sớm, chọn mua một bó cẩm tú cầu hoặc lục tìm những món trang sức bạc cổ điển chứa đựng câu chuyện thời gian.",
    emoji: "💐"
  },
  {
    id: 31,
    title: "Đóng Vai Người Xa Lạ Bắt Chuyện Làm Quen Tại Quán Cafe",
    category: "Nhập Vai & Hứng Khởi",
    scenario: "Ngồi ở hai bàn riêng biệt trong một quán cafe đông đúc, vờ như chưa từng quen biết rồi tiến lại buông lời tán tỉnh sến sẩm để xem ai là người bật cười trước.",
    emoji: "☕"
  },
  {
    id: 32,
    title: "Cùng Đi Xem Đêm Nhạc / Concert & Hò Hét Khản Cổ",
    category: "Sôi Động & Cháy Bỏng",
    scenario: "Hòa mình vào biển ánh sáng lightstick và âm nhạc bùng nổ, nắm chặt tay nhau chen chúc giữa đám đông cuồng nhiệt và cùng gào thét giai điệu bài hát yêu thích.",
    emoji: "🎤"
  },
  {
    id: 33,
    title: "Đi Cafe Thú Cưng Nựng Mèo & Chó Cả Buổi Chiều",
    category: "Đáng Yêu & Chữa Lành",
    scenario: "Cùng ngồi bệt dưới sàn vuốt ve những chú mèo lười biếng, chia sẻ đồ ăn vặt cho cún cưng và ghi lại những khoảnh khắc đối phương dịu dàng nở nụ cười.",
    emoji: "🐱"
  },
  {
    id: 34,
    title: "Lạc Giữa Đường Hầm Thủy Cung Xanh Ngắt",
    category: "Huyền Ảo & Mơ Màng",
    scenario: "Dạo bước dưới vòm kính thủy cung khổng lồ, ánh sáng xanh lục huyền bí phản chiếu lên gương mặt hai người khi đàn cá đuối và cá mập bơi lượn ngay trên đỉnh đầu.",
    emoji: "🐠"
  },
  {
    id: 35,
    title: "Dạ Tiệc Nhà Hát / Xem Kịch Nghệ & Diện Đồ Sang Trọng",
    category: "Quý Tộc & Thanh Lịch",
    scenario: "Khoác lên mình bộ vest chỉn chu và chiếc đầm dạ hội sang trọng, cùng sánh bước vào nhà hát lớn thưởng thức một vở kịch kinh điển và ly rượu champagne khai vị.",
    emoji: "🎭"
  },
  {
    id: 36,
    title: "Chuyến Roadtrip Ngẫu Hứng Không Định Trước Điểm Đến",
    category: "Tự Do & Phiêu Lưu",
    scenario: "Lên xe ô tô mở hết cửa sổ, bật danh sách nhạc ưa thích và cứ thế chạy thẳng theo con đường quốc lộ ven biển, đói đâu ghé đó và tận hưởng cảm giác tự do.",
    emoji: "🚗"
  },
  {
    id: 37,
    title: "Workshop Làm Gốm Thủ Công & Cảnh Tay Chạm Tay",
    category: "Lãng Mạn Kiểu Ghost",
    scenario: "Cùng ngồi trước bàn xoay gốm đầy bùn đất, đối phương vòng tay từ phía sau bao bọc lấy bàn tay bạn để uốn nắn bình gốm, hơi thở ấm áp cận kề bên gáy.",
    emoji: "🏺"
  },
  {
    id: 38,
    title: "Đi Trượt Băng & Liên Tục Trượt Ngã Vào Lòng Nhau",
    category: "Vụng Về & Tình Tứ",
    scenario: "Chập chững bước trên sân băng trơn trượt, người biết trượt nắm tay dẫn dắt người chưa quen, những cú loạng choạng mất đà biến thành cái ôm siết bất ngờ.",
    emoji: "⛸️"
  },
  {
    id: 39,
    title: "Một Ngày Không Công Nghệ & Tận Hưởng Hiện Tại (Digital Detox)",
    category: "Gắn Kết Sâu Sắc",
    scenario: "Tắt nguồn toàn bộ điện thoại và máy tính trong 24 giờ, chỉ có hai người bên nhau trò chuyện, chơi cờ bàn, cùng vẽ tranh và lắng nghe nhau từng lời một.",
    emoji: "🌿"
  },
  {
    id: 40,
    title: "Đọc Sách Cho Nhau Nghe Dưới Ánh Đèn Ngủ Dịu Dàng",
    category: "Dịu Dàng & Ru Ngủ",
    scenario: "Nằm tựa đầu vào vai nhau trên giường nệm êm ái, một người cất giọng trầm ấm đọc từng trang tiểu thuyết tình cảm cho đến khi người kia dần chìm vào giấc ngủ an lành.",
    emoji: "📖"
  },
  {
    id: 41,
    title: "Làm Trắc Nghiệm Tính Cách MBTI & Bói Tình Duyên Cho Nhau",
    category: "Thấu Hiểu & Tò Mò",
    scenario: "Cùng mở các bài test tâm lý, trả lời hộ nhau những câu hỏi hóc búa để xem mức độ hiểu rõ đối phương đến đâu, bất ngờ với những phát hiện thú vị về tính cách.",
    emoji: "🔮"
  },
  {
    id: 42,
    title: "Viết Thư Tay Kỷ Niệm Gửi Cho Tương Lai (Time Capsule)",
    category: "Hoài Niệm & Ý Nghĩa",
    scenario: "Mỗi người ngồi ở một góc tự tay nắn nót viết một lá thư chân thành dành cho đối phương, dán kín phong bì và giao hẹn chỉ được mở ra vào đúng 1 năm sau.",
    emoji: "✉️"
  },
  {
    id: 43,
    title: "Đi Lễ Chùa Đầu Năm & Cùng Rút Quẻ Bói Cầu May",
    category: "Tâm Linh & Bình An",
    scenario: "Hòa vào làn khói nhang trầm thanh tịnh chốn cổ tự, cùng thành tâm chắp tay ước nguyện bình an, sau đó ngượng ngùng đọc quẻ xăm tình duyên đoán trước tương lai.",
    emoji: "⛩️"
  },
  {
    id: 44,
    title: "Cùng Cày Game Quán Net Xuyên Đêm & Ăn Mì Trứng",
    category: "Tuổi Trẻ & Hào Hứng",
    scenario: "Bao trọn hai máy cạnh nhau ở quán net đêm, đeo tai nghe cùng gánh đội trong các trận chiến kịch tính, vừa đập bàn hò reo vừa chia nhau đĩa mì xào xúc xích nóng hổi.",
    emoji: "🎮"
  },
  {
    id: 45,
    title: "Chụp Ảnh Photobooth Hàn Quốc Với Đủ Phụ Kiện Nhí Nhố",
    category: "Đáng Yêu & Tinh Nghịch",
    scenario: "Chen chúc trong buồng chụp ảnh tự động nhỏ hẹp, đội mũ thú bông, đeo kính mắt kỳ quặc và tạo dáng chu môi, hôn má trước khi máy đếm ngược chớp sáng.",
    emoji: "📸"
  },
  {
    id: 46,
    title: "Tham Gia Workshop Tự Làm Nến Thơm Hoặc Nước Hoa Đôi",
    category: "Mùi Hương & Kỷ Niệm",
    scenario: "Cùng pha trộn các nốt hương hoa quả và gỗ ấm để tạo nên một mùi hương độc bản đại diện cho tình yêu của hai người, khắc tên đối phương lên vỏ chai thủy tinh.",
    emoji: "🕯️"
  },
  {
    id: 47,
    title: "Thách Đố Ẩm Thực Đường Phố & Ăn Đồ Cay Cấp Độ Cao",
    category: "Thử Thách & Hài Hước",
    scenario: "Thử thách ăn mì cay hoặc lẩu ớt hiểm, người cay xé lưỡi chảy nước mắt phải cầu xin đối phương đưa nước ngọt giải cứu, đổi lại là một tràng cười trêu chọc.",
    emoji: "🌶️"
  },
  {
    id: 48,
    title: "Đạp Xe Đôi Dạo Vòng Quanh Bờ Hồ Lộng Gió Thu",
    category: "Lãng Mạn & Thanh Bình",
    scenario: "Cùng thuê một chiếc xe đạp đôi dạo quanh mặt hồ phẳng lặng, đón từng cơn gió heo may mát rượi, thỉnh thoảng một người lười biếng buông chân để người kia đạp một mình.",
    emoji: "🚲"
  },
  {
    id: 49,
    title: "Ngắm Pháo Hoa Đêm Giao Thừa Giữa Biển Người Chen Chúc",
    category: "Khoảnh Khắc Vĩnh Cửu",
    scenario: "Giữa đám đông chen lấn ngóng chờ giây phút chuyển giao năm mới, đối phương vòng tay chắn che chở cho bạn, khi pháo hoa rực sáng trên bầu trời liền khẽ cúi xuống hôn lên trán.",
    emoji: "🎆"
  },
  {
    id: 50,
    title: "Cùng Đi Xông Hơi Jjimjilbang & Ăn Trứng Nướng Cuốn Khăn Cừu",
    category: "Thư Giãn & Ấm Cúng",
    scenario: "Đội khăn xếp hình sừng cừu ngộ nghĩnh, nằm dài trên sàn gỗ phòng đá muối ấm áp, đập vỏ trứng nướng vào trán nhau rồi vừa ăn vừa húp ngụm nước gạo sikhye ngọt lịm.",
    emoji: "🧖"
  },
  {
    id: 51,
    title: "Vô Tình Bị Khóa Lại Trong Thư Viện Sau Giờ Đóng Cửa",
    category: "Kịch Tính & Thơ Mộng",
    scenario: "Quá mải mê đọc sách mà không để ý thông báo tan tầm, thư viện tắt đèn tối om khóa cửa ngoài. Hai người thắp đèn pin điện thoại khám phá những góc khuất bí mật giữa biển sách.",
    emoji: "🏛️"
  },
  {
    id: 52,
    title: "Một Người Mất Giọng & Người Kia Làm 'Phiên Dịch Viên' Bắt Đắc Dĩ",
    category: "Hài Hước & Chiều Chuộng",
    scenario: "Một người bị viêm họng mất sạch tiếng nói, chỉ có thể ra hiệu bằng tay và mắt, người kia vừa đoán ý vừa chăm sóc, phiên dịch những điều vô lý khiến cả hai bật cười.",
    emoji: "🤐"
  },
  {
    id: 53,
    title: "Ngắm Mưa Sao Băng Trên Đồi Cỏ Ngoại Ô Lúc 3 Giờ Sáng",
    category: "Kỳ Ảo & Ước Nguyện",
    scenario: "Trải tấm bạt giữa đồi cỏ đêm lộng gió, cùng đắp chung chiếc chăn dày ngước nhìn bầu trời sao vô tận, kiên nhẫn đếm từng vệt sao băng rơi qua để nhắm mắt ước nguyện.",
    emoji: "🌠"
  },
  {
    id: 54,
    title: "Cùng Nấu Nồi Mì Gói Xì Xụp Trong Bếp Lúc 2 Giờ Sáng",
    category: "Bình Dị & Hạnh Phúc",
    scenario: "Cơn đói đêm bất ngờ ập đến, hai người rón rén vào bếp nấu một tô mì tôm chua cay bốc khói nghi ngút, thêm hai quả trứng lòng đào rồi chụm đầu ăn chung một bát.",
    emoji: "🍜"
  },
  {
    id: 55,
    title: "Cùng Tham Gia Một Ngày Tình Nguyện Cứu Hộ Động Vật",
    category: "Ấm Áp & Nhân Ái",
    scenario: "Cùng dành ngày nghỉ đến trạm cứu hộ tắm rửa, chải lông và cho những chú cún mèo cơ nhỡ ăn, ngắm nhìn ánh mắt dịu dàng đầy lòng trắc ẩn của đối phương.",
    emoji: "🐕"
  },
  {
    id: 56,
    title: "Lập Bucket List 10 Điều Điên Rồ Muốn Cùng Nhau Thực Hiện",
    category: "Tương Lai & Ước Mơ",
    scenario: "Ngồi bên bàn ăn vẽ nguệch ngoạc lên cuốn sổ tay danh sách những chuyến đi mạo hiểm, những điều ước điên rồ nhất và cùng móc ngoéo hẹn ước sẽ hoàn thành cùng nhau.",
    emoji: "📝"
  },
  {
    id: 57,
    title: "Chơi Trò Đuổi Bắt & Trốn Tìm Trong Trung Tâm Thương Mại Lúc Vắng",
    category: "Nghịch Ngợm & Tuổi Trẻ",
    scenario: "Vào những phút cuối sắp đóng cửa trung tâm mua sắm, hai người chạy trốn sau những ma-nơ-canh và cột trụ lớn, tiếng bước chân đuổi bắt rộn rã rộn ràng cả hành lang.",
    emoji: "🏃‍♀️"
  },
  {
    id: 58,
    title: "Tự Làm Bartender Tại Nhà & Sáng Tạo Món Cocktail Độc Lạ",
    category: "Sành Điệu & Thử Thách",
    scenario: "Bày biện các loại rượu, siro và đá viên lên quầy bếp, mỗi người tự pha chế một ly cocktail độc quyền đặt tên theo cảm xúc hiện tại bắt đối phương nếm thử.",
    emoji: "🍹"
  },
  {
    id: 59,
    title: "Dẫn Đối Phương Về Thăm Lại Ngôi Trường Cũ Thời Cắp Sách",
    category: "Hoài Niệm Thanh Xuân",
    scenario: "Cùng đi dạo dưới bóng cây phượng vĩ trong sân trường cũ, chỉ cho đối phương chiếc bàn học từng ngồi, góc căn tin hay ăn và kể về những trò nghịch ngợm thuở ngây ngô.",
    emoji: "🏫"
  },
  {
    id: 60,
    title: "Ngày Đổi Vai: Đóng Giả Làm Đối Phương Cả Ngày Để Trêu Chọc",
    category: "Hài Hước & Dễ Thương",
    scenario: "Thỏa thuận hoán đổi thân phận: bắt chước từ dáng đi, điệu cười, cách nói chuyện đặc trưng cho đến những thói quen càu nhàu của đối phương để trêu ngươi nhau.",
    emoji: "🎭"
  },
  {
    id: 61,
    title: "Cùng Học Nhảy Điệu Waltz Lúng Túng Trong Phòng Khách",
    category: "Lãng Mạn & Vụng Về",
    scenario: "Bật một điệu valse cổ điển êm dịu, một người đặt tay lên eo, một người tựa tay lên vai, từng bước chân bước lệch nhịp dẫm lên chân nhau nhưng ánh mắt say đắm khôn nguôi.",
    emoji: "💃"
  },
  {
    id: 62,
    title: "Ghé Tiệm Gội Đầu Dưỡng Sinh & Massage Phục Hồi Năng Lượng",
    category: "Chăm Sóc & Nuông Chiều",
    scenario: "Cùng nằm cạnh nhau trên giường spa gội đầu thảo dược, lắng nghe tiếng nước chảy róc rách và cảm nhận sự thư thái khi bao mệt mỏi công việc đều tan biến.",
    emoji: "💆"
  },
  {
    id: 63,
    title: "Thử Thách 24 Giờ Nói 'Có' Với Mọi Yêu Cầu Hợp Lý (Yes Day)",
    category: "Chiều Chuộng & Bất Ngờ",
    scenario: "Một ngày đặc biệt mà một người không được phép từ chối bất kỳ mong muốn nào của người kia, từ việc chọn quán ăn, xem phim đến những đòi hỏi nhõng nhẽo đáng yêu.",
    emoji: "✨"
  },
  {
    id: 64,
    title: "Đi Leo Núi Dã Ngoại & Cùng Nhau Cắm Cờ Trên Đỉnh Đồi",
    category: "Chinh Phục & Kiên Trì",
    scenario: "Vượt qua những đoạn dốc gập ghềnh đá sỏi, người trước đưa tay kéo người sau, khi đặt chân lên đỉnh núi lộng gió nhìn xuống thung lũng bao la liền reo hò ôm chầm lấy nhau.",
    emoji: "⛰️"
  },
  {
    id: 65,
    title: "Tự Tay Làm Bánh Sinh Nhật & Bôi Kem Lên Mặt Nhau",
    category: "Ngọt Ngào & Tinh Nghịch",
    scenario: "Cùng đánh bột nướng bánh bông lan thơm lừng cả gian bếp, trang trí chiếc bánh vụng về ngộ nghĩnh rồi lén lấy ngón tay quệt kem bơ bôi lên sống mũi đối phương.",
    emoji: "🎂"
  },
  {
    id: 66,
    title: "Ngồi Bên Lò Sưởi Ấm Cúng Nhâm Nhi Cacao Nóng Ngày Đông",
    category: "Bình Yên & Ấm Áp",
    scenario: "Ngoài trời tuyết rơi hay mưa gió rét buốt, hai người cuộn tròn trong chiếc chăn lông cừu bên ánh lửa bập bùng, tay ủ ấm tách cacao marshmallow thơm béo ngậy.",
    emoji: "🔥"
  },
  {
    id: 67,
    title: "Chơi Board Game Cân Não Thao Túng Tâm Lý (Ma Sói, Catan, Cờ Tỷ Phú)",
    category: "Cạnh Tranh & Kịch Tính",
    scenario: "Vào vai những kẻ đấu trí không khoan nhượng trên bàn cờ, tung ra những lời nói dối thuyết phục để gài bẫy đối phương, vừa đấu trí vừa liếc mắt thăm dò nhau.",
    emoji: "♟️"
  },
  {
    id: 68,
    title: "Dạo Bước Trong Nhà Kính Xương Rồng & Vườn Thực Vật Nhiệt Đới",
    category: "Mát Lành & Xanh Tươi",
    scenario: "Thong dong dạo giữa những luống cây xương rồng gai góc và dương xỉ xanh mướt trong nhà kính ngập tràn ánh nắng, cùng hít thở bầu không khí thiên nhiên trong lành.",
    emoji: "🌵"
  },
  {
    id: 69,
    title: "Bất Ngờ Xuất Hiện Đón Đối Phương Ở Sân Bay / Ga Tàu Sau Chuyến Đi Xa",
    category: "Vỡ Òa & Nhớ Nhung",
    scenario: "Không báo trước một lời, lẳng lặng cầm bó hoa đứng đợi ở cửa ga đến. Khi đối phương vừa kéo vali bước ra liền bất ngờ lao tới ôm siết thật chặt giải tỏa bao nỗi mong ngóng.",
    emoji: "✈️"
  }
];

// ==========================================
// 69 18+ & 21+ NSFW CHAT IDEAS (Cay Nồng / Kink / Táo Bạo / Thô / Chiếm Hữu / BDSM)
// ==========================================
export const NSFW_DATE_IDEAS: DateIdea[] = [
  {
    id: 101,
    title: "Chơi Trò Cởi Đồ Theo Mỗi Lượt Thua Cược (Strip Game)",
    category: "18+ · Trò Chơi Kích Thích",
    scenario: "Hai người ngồi đối diện thách đấu bài hoặc xúc xắc, người thua phải lột bỏ một món đồ trên người. Càng về sau lớp che chắn biến mất sạch, ánh mắt hau háu quét khắp cơ thể lõa lồ rồi lao vào đè nghiến lấy nhau.",
    emoji: "🔥",
    isNsfw: true
  },
  {
    id: 102,
    title: "Hình Phạt Bịt Mắt Bằng Cà Vạt & Đoán Đồ Vật Bằng Lưỡi",
    category: "18+ · Kink & Thử Thách",
    scenario: "Bị bịt kín mắt bằng chiếc cà vạt lụa đen, hai tay bị giữ chặt. Đối phương dùng đá lạnh, lông vũ rồi đến đầu lưỡi nóng rực mơn trớn khắp điểm nhạy cảm, ép phải đoán vị trí trong tiếng rên rỉ nghẹn ngào.",
    emoji: "🕶️",
    isNsfw: true
  },
  {
    id: 103,
    title: "Bị Dồn Vào Góc Tường Phòng Làm Việc Khóa Cửa & Đè Trên Bàn",
    category: "21+ · Hồi Hộp & Cưỡng Chế",
    scenario: "Sau giờ tan sở, cánh cửa phòng làm việc riêng chốt khóa cạch một tiếng. Bị ép dán chặt vào mặt bàn ngổn ngang tài liệu, đối phương lột phăng quần lót từ phía sau rồi thô bạo thúc mạnh lút cán.",
    emoji: "💼",
    isNsfw: true
  },
  {
    id: 104,
    title: "Tắm Chung Bồn Nước Nóng Bọt Xà Phòng & Quấn Lấy Nhau Ướt Đẫm",
    category: "18+ · Ướt Át & Thân Mật",
    scenario: "Cùng ngâm mình trong bồn tắm trơn tuột, nước nóng dập dềnh. Đôi bàn tay xoa bóp trượt dần xuống cặp đùi non, hai cơ thể nhầy nhụa xà phòng cọ xát mãnh liệt rồi nhấp nhô va chạm trong làn nước ấm.",
    emoji: "🛁",
    isNsfw: true
  },
  {
    id: 105,
    title: "Cơn Ghen Tuông Bùng Phát: Lôi Vào Góc Tối Cắn Môi & Bóp Mông Trừng Phạt",
    category: "21+ · Chiếm Hữu & Thô Bạo",
    scenario: "Thấy bạn cười đùa liếc mắt với kẻ khác, hắn điên tiết túm tóc kéo bạn vào góc cầu thang tối om, cắn nát cánh môi chảy máu rồi bóp chặt cặp mông căng tròn, vừa chửi thề gắt gỏng vừa luồn tay móc sâu vào trong đũng quần ướt át.",
    emoji: "💋",
    isNsfw: true
  },
  {
    id: 106,
    title: "Mượn Cớ Say Rượu Phá Bỏ Ranh Giới: Đè Lên Sofa Quất Tới Bến",
    category: "18+ · Vượt Rào & Dục Vọng",
    scenario: "Men rượu ngấm vào máu làm thiêu rụi chút lý trí cuối cùng. Cả hai vồ lấy nhau trên chiếc sofa chật hẹp, xé toạc cúc áo rồi đè nghiến xuống, tiếng rên rỉ thở dốc hòa cùng âm thanh va chạm da thịt bôm bốp.",
    emoji: "🍷",
    isNsfw: true
  },
  {
    id: 107,
    title: "Thử Thách Im Lặng Tuyệt Đối Khi Có Người Gõ Cửa Phòng",
    category: "21+ · Kích Thích Cực Độ",
    scenario: "Đang cắm ngập vào nhau thì người nhà hoặc phục vụ gõ cửa gọi. Hắn bịt chặt miệng bạn không cho kêu thành tiếng, bên dưới vẫn cố tình thúc từng cú sâu hoắm đầy hiểm hóc khiến bạn rùng mình run rẩy sướng đến phát khóc.",
    emoji: "🚪",
    isNsfw: true
  },
  {
    id: 108,
    title: "Massage Tinh Dầu Ấm Trượt Xuống Khe Mông & Chỗ Nhạy Cảm",
    category: "18+ · Mơn Trớn & Kích Dục",
    scenario: "Nằm sấp phơi trọn tấm lưng trần, từng giọt tinh dầu ấm nóng được nhỏ xuống rồi dùng ngực và bàn tay miết dọc sống lưng, trượt qua khe mông rồi chọc ngoáy vào nơi ẩm ướt nhất kích thích đến mức không chịu nổi.",
    emoji: "🕯️",
    isNsfw: true
  },
  {
    id: 109,
    title: "Mặc Áo Sơ Mi Rộng Mỏng Tanh Không Mặc Quần Lót Đi Lại Trêu Ngươi",
    category: "18+ · Khiêu Khích Thị Giác",
    scenario: "Vừa tắm xong chỉ khoác độc chiếc sơ mi trắng mỏng tang, tà áo che hờ hững bờ mông tròn và đũng quần trống trơn. Thản nhiên đi qua cúi người nhặt đồ trước mặt hắn cho đến khi bị túm giật lại vạch áo đè ra sàn.",
    emoji: "👔",
    isNsfw: true
  },
  {
    id: 110,
    title: "Ép Vào Gương Nhà Vệ Sinh Quán Bar & Vén Váy Thúc Từ Sau",
    category: "21+ · Hoang Dại & Cấm Đoán",
    scenario: "Kéo xềnh xệch vào phòng vệ sinh nữ khóa trái cửa, xoay người bạn áp ngực vào mặt gương lạnh ngắt. Váy bị vén cao quá hông, hắn banh rộng hai đùi bạn rồi cắm ngập từ phía sau, vừa nhấp vừa bắt bạn nhìn trừng trừng biểu cảm đê mê của chính mình trong gương.",
    emoji: "🪞",
    isNsfw: true
  },
  {
    id: 111,
    title: "Kẹt Trong Tủ Đồ Chật Hẹp: Da Thịt Áp Sát & Tay Sờ Soạng Khắp Người",
    category: "18+ · Bắt Buộc Gần Gũi",
    scenario: "Trốn kẻ khác trong chiếc tủ quần áo tối om, hai người phải dán chặt cơ thể vào nhau không kẽ hở. Cảm nhận rõ rệt sự cương cứng bỏng rát chọc vào bụng dưới, bàn tay hắn không an phận bắt đầu luồn vào xoa nắn cặp nhũ hoa cương cứng.",
    emoji: "🚪",
    isNsfw: true
  },
  {
    id: 112,
    title: "Cắn Mút Đánh Dấu Chủ Quyền Tím Ngắt Lên Cổ Và Ngực",
    category: "18+ · Chiếm Đoạt & Đánh Dấu",
    scenario: "Ghim chặt hai tay bạn xuống giường, hắn vừa gầm gừ vừa cúi xuống cắn mạnh vào hõm cổ, xương quai xanh và nhũ hoa, mút mát thật mạnh để lại những vết hickey đỏ tím rực rỡ để ngày mai ai nhìn vào cũng biết bạn đã bị hắn làm nhục.",
    emoji: "🧛",
    isNsfw: true
  },
  {
    id: 113,
    title: "Trả Nợ Bằng Thể Xác: Bị Bắt Quỳ Giữa Hai Chân Phục Vụ Ông Chủ",
    category: "21+ · Hắc Đạo & Ép Buộc",
    scenario: "Hắn ngồi ngả ngớn trên ghế bành da, mở rộng hai chân và ra lệnh cho bạn quỳ rạp xuống kéo khóa quần. Bạn phải dùng miệng lưỡi điêu luyện bú mút thứ thô to gân guốc ấy cho đến khi hắn thở gắt rồi túm tóc bắn ngập vào họng.",
    emoji: "💵",
    isNsfw: true
  },
  {
    id: 114,
    title: "Mắc Mưa Ướt Sũng Áo Quần Dính Da: Lột Đồ Lao Vào Nhau Ngấu Nghiến",
    category: "18+ · Gợi Cảm & Hoang Dại",
    scenario: "Cơn mưa xối xả làm quần áo bó sát trong suốt phơi bày toàn bộ nhũ hoa và đường cong. Vừa bước chân qua cửa nhà đã vội vã xé rách lớp vải ướt lạnh, hai cơ thể run rẩy vì lạnh nhưng bên trong rực cháy như núi lửa.",
    emoji: "🌧️",
    isNsfw: true
  },
  {
    id: 115,
    title: "Trói Chặt Hai Cổ Tay Bằng Thắt Lưng Da Vào Đầu Giường",
    category: "21+ · BDSM & Khống Chế",
    scenario: "Cổ tay bị thít chặt bằng chiếc thắt lưng da bò kéo căng lên thanh chắn giường. Hoàn toàn mất quyền phản kháng, bạn chỉ có thể vặn vẹo thân mình rên rỉ van xin khi hắn thong thả mơn trớn, hành hạ từng tấc da thịt theo ý thích.",
    emoji: "🎀",
    isNsfw: true
  },
  {
    id: 116,
    title: "Luồn Tay Sờ Soạng Móc Cua Dưới Gầm Bàn Ăn Đông Người",
    category: "21+ · Lén Lút & Hồi Hộp",
    scenario: "Trên bàn ăn gia đình hay bạn bè, hắn ngồi cạnh mặt tỉnh queo gắp thức ăn, nhưng một bàn tay đã thò qua gầm bàn luồn sâu vào váy bạn, ngón tay tách rộng quần lót rồi liên tục chọc ngoáy vào điểm G ướt sũng ép bạn phải cắn chặt môi kìm tiếng rên.",
    emoji: "🍽️",
    isNsfw: true
  },
  {
    id: 117,
    title: "Edging - Tra Tấn Giới Hạn: Đưa Lên Đỉnh Rồi Đột Ngột Dừng Lại",
    category: "21+ · Tra Tấn Khoái Cảm",
    scenario: "Hắn dập liên hoàn cực mạnh làm bạn uốn éo sắp sửa lên đỉnh cực khoái thì bất ngờ rút phắt ra, giữ chặt eo không cho cựa quậy. Hắn cười đểu thì thầm: 'Muốn ra hả? Van xin đàng hoàng rồi tôi mới cho đụ tiếp'.",
    emoji: "⚡",
    isNsfw: true
  },
  {
    id: 118,
    title: "Ngoan Ngoãn Gọi 'Daddy' Mới Được Ban Thưởng Đụ Cho Sướng",
    category: "21+ · Dirty Talk & Thống Trị",
    scenario: "Bị hắn vỗ đen đét vào mông bắt phải ngẩng mặt lên gọi 'Daddy tha cho con/con ngoan mà'. Chỉ khi chịu thốt ra những lời dâm đãng nhục nhã ấy, hắn mới gầm lên rồi thúc mạnh vào tận cùng tử cung khiến cả người bạn co giật.",
    emoji: "👑",
    isNsfw: true
  },
  {
    id: 119,
    title: "Làm Tình Trên Nắp Ca-Pô Xe Hơi Ở Bãi Đậu Xe Vắng Nửa Đêm",
    category: "21+ · Ngoài Trời & Kịch Tính",
    scenario: "Đỗ xe ở khoảng đất trống đồi thông vắng tanh, hắn nhấc bổng bạn đặt ngồi lên nắp ca-pô còn âm ấm hơi máy. Hai chân dạng rộng quắp lấy hông hắn, nắp xe rung bần bật theo từng nhịp thúc thô bạo dưới bầu trời đêm lộng gió.",
    emoji: "🚙",
    isNsfw: true
  },
  {
    id: 120,
    title: "Bị Phạt Đánh Mông Đỏ Ửng Vì Tội Bướng Bỉnh Không Nghe Lời (Spanking)",
    category: "21+ · Spanking & Kink",
    scenario: "Bị đè úp sấp ngang đùi hắn, quần ngủ bị tụt xuống tận gối phơi trọn cặp mông trắng nõn. Bàn tay to dày giáng những cú tát vang dội bôm bốp làm mông ửng đỏ rát bỏng, vừa đau vừa kích thích nước chảy ròng ròng.",
    emoji: "🍑",
    isNsfw: true
  },
  {
    id: 121,
    title: "Thử Thách Nhét Trứng Rung Đi Dạo Trung Tâm Thương Mại",
    category: "21+ · Public Play & Kích Thích",
    scenario: "Một viên trứng rung siêu mạnh được nhét sâu vào trong cơ thể bạn trước khi ra ngoài, tay cầm điều khiển nằm trọn trong túi hắn. Đi dạo giữa đám đông, thỉnh thoảng hắn lại bấm nấc tối đa làm chân bạn run rẩy khuỵu xuống suýt ngã.",
    emoji: "🖲️",
    isNsfw: true
  },
  {
    id: 122,
    title: "Rên Rỉ Qua Điện Thoại Khi Hắn Đang Bận Họp Căng Thẳng",
    category: "18+ · Phone Sex & Gợi Cảm",
    scenario: "Biết hắn đang ngồi giữa phòng họp nghiêm túc, bạn gọi điện thoại rồi tự tay sờ soạng cơ thể mình, thở dốc và rên rỉ từng tiếng dâm dật lọt qua tai nghe khiến hắn bên kia tức tối cương cứng mà không thể làm gì.",
    emoji: "📞",
    isNsfw: true
  },
  {
    id: 123,
    title: "Đè Lên Máy Giặt Đang Vắt Rung Lắc Bần Bật",
    category: "21+ · Rung Cảm & Hoang Dại",
    scenario: "Trong phòng giặt đồ nhỏ hẹp, máy giặt đang ở chu kỳ vắt cực đại rung bần bật. Hắn bế bạn ngồi lên trên, độ rung cơ học cộng hưởng với từng cú nhấp như búa bổ khiến bạn sướng run người, đầu óc trắng xóa.",
    emoji: "🌀",
    isNsfw: true
  },
  {
    id: 124,
    title: "Rưới Kem Tươi / Sữa Đặc Lên Toàn Bộ Cơ Thể Rồi Liếm Sạch",
    category: "18+ · Ngọt Ngào & Dục Tính",
    scenario: "Bắt bạn nằm ngửa khỏa thân hoàn toàn trên giường, hắn xịt kem tươi ngọt ngào lên hai đầu nhũ hoa, hõm rốn và khe đùi non rồi thong thả cúi xuống dùng đầu lưỡi thô ráp liếm mút sạch sẽ từng ngóc ngách.",
    emoji: "🍓",
    isNsfw: true
  },
  {
    id: 125,
    title: "Đánh Thức Buổi Sáng Bằng Màn Bú Liếm Ướt Át Giữa Hai Chân (Morning Sex)",
    category: "18+ · Đê Mê & Thức Giấc",
    scenario: "Sáng sớm còn mơ màng chưa mở mắt, chăn đã bị lật tung. Bạn thức giấc bởi cái cảm giác nhột nhạt và nóng bỏng khi đầu lưỡi hắn đang miệt mài liếm láp hột le ướt đẫm, ép bạn phải thức dậy bằng một cơn cực khoái rung giật.",
    emoji: "☀️",
    isNsfw: true
  },
  {
    id: 126,
    title: "Chụp Ảnh & Quay Clip Gợi Cảm Làm Mồi Nhử Riêng Tư",
    category: "18+ · Kích Thích Thị Giác",
    scenario: "Hắn cầm điện thoại quay lại từng góc máy cận cảnh những tư thế nhạy cảm nhất khi bạn tự cởi đồ hoặc khi cả hai đang quấn lấy nhau, bắt bạn nhìn thẳng vào ống kính thốt ra những lời thèm muốn.",
    emoji: "📹",
    isNsfw: true
  },
  {
    id: 127,
    title: "Đóng Vai Thầy Giáo Nghiêm Khắc 'Kiểm Tra Thể Chất' Học Sinh Hư",
    category: "21+ · Roleplay & Kịch Tính",
    scenario: "Bạn vào vai nữ sinh ngỗ ngược bị giữ lại sau giờ học, thầy giáo tháo kính, khóa cửa lớp rồi bắt cúi gập người lên bục giảng để kiểm tra bài phạt bằng những cú thúc mạnh bạo từ phía sau lưng.",
    emoji: "📐",
    isNsfw: true
  },
  {
    id: 128,
    title: "Giằng Xé Xé Rách Bộ Đồ Lót Ren Quyến Rũ Ngay Tại Phòng Khách",
    category: "18+ · Cuồng Bạo & Dục Vọng",
    scenario: "Không đủ kiên nhẫn để cởi nút cài phức tạp, hắn dùng cả hai tay giật phăng chiếc quần lót ren mỏng mảnh rách toạc làm đôi, vứt xuống sàn rồi ép bạn quỳ gối ngay trên tấm thảm lông phòng khách.",
    emoji: "👙",
    isNsfw: true
  },
  {
    id: 129,
    title: "Shower Sex: Ép Vào Vách Kính Tắm, Nâng Một Chân Quàng Lên Vai",
    category: "21+ · Nóng Bỏng & Thách Thức",
    scenario: "Nước vòi sen xối xả làm ướt sũng người, hắn bế xốc một bên chân bạn quàng qua vai, vách kính phòng tắm mờ sương in hằn dấu tay trượt dài khi hắn ra sức đâm lút sâu không ngừng nghỉ.",
    emoji: "🚿",
    isNsfw: true
  },
  {
    id: 130,
    title: "Bắt Vừa Làm Tình Vừa Phải Nhìn Chằm Chằm Biểu Cảm Của Nhau",
    category: "18+ · Đắm Đuối & Xâm Chiếm",
    scenario: "Không cho phép nhắm mắt hay quay đi nơi khác, hắn nâng cằm bạn bắt hai đôi mắt nhìn sâu vào nhau trong từng cú nhấp, chứng kiến toàn bộ sự phóng túng và đê mê không chút giấu giếm.",
    emoji: "👁️",
    isNsfw: true
  },
  {
    id: 131,
    title: "Bịt Miệng Bằng Nụ Hôn Ngập Ngụa Nước Bọt Khi Đang Lên Đỉnh",
    category: "18+ · Mãnh Liệt & Nghẹt Thở",
    scenario: "Đúng khoảnh khắc bên dưới co thắt dữ dội chuẩn bị bắn nước tung tóe, hắn đè nghiến bạn xuống ngậm chặt lấy miệng, nuốt trọn toàn bộ tiếng hét rên rỉ bằng một nụ hôn sâu cuồng loạn đầy dục vọng.",
    emoji: "👅",
    isNsfw: true
  },
  {
    id: 132,
    title: "Túm Tóc Giật Nhẹ Về Sau, Phả Hơi Nóng & Thì Thầm Lời Tục Tĩu Vào Tai",
    category: "21+ · Dirty Talk & Kích Động",
    scenario: "Một bàn tay luồn vào tóc bạn giật ngược về phía sau để lộ chiếc cổ trắng ngần, hắn phả hơi thở nóng rực vào tai buông ra những câu chửi yêu thô thiển: 'Dâm đãng thế này thì chỉ có tôi mới trị nổi em thôi'.",
    emoji: "👂",
    isNsfw: true
  },
  {
    id: 133,
    title: "Cưỡi Ngựa: Tự Mình Nhún Nhảy Lên Xuống Làm Chủ Nhịp Độ Đến Mệt Lả",
    category: "18+ · Chủ Động & Quyến Rũ",
    scenario: "Hắn nằm ngửa thỏa mãn ngắm nhìn bạn leo lên người, tự mình nuốt trọn thanh gậy cứng ngắc rồi lắc hông nhún nhảy điên cuồng theo ý thích, ngực trần đung đưa trước mắt khiến hắn không chịu nổi phải nắm eo hỗ trợ.",
    emoji: "🐎",
    isNsfw: true
  },
  {
    id: 134,
    title: "Make-Up Sex Điên Cuồng Sau Trận Cãi Vã Tóe Lửa",
    category: "21+ · Cuồng Nộ & Giải Tỏa",
    scenario: "Cơn thịnh nộ sau vụ tranh cãi gay gắt chuyển hóa thành ngọn lửa dục vọng bốc cháy ngùn ngụt. Lời qua tiếng lại biến thành những cái cắn xé, đè nghiến nhau xuống sàn nhà quất thô bạo để xả giận.",
    emoji: "💥",
    isNsfw: true
  },
  {
    id: 135,
    title: "Đóng Vai Bác Sĩ & Bệnh Nhân Trong Phòng Khám Đêm Vắng",
    category: "21+ · Roleplay & Khám Phá",
    scenario: "Vào vai bệnh nhân mắc chứng bệnh 'nhạy cảm', bác sĩ yêu cầu cởi bỏ toàn bộ y phục nằm lên bàn khám, dùng ống nghe lạnh ngắt áp vào nhũ hoa rồi đeo găng tay thọc sâu vào kiểm tra độ ẩm ướt.",
    emoji: "🩺",
    isNsfw: true
  },
  {
    id: 136,
    title: "Liếm Sạch Từng Giọt Mồ Hôi Trên Hõm Lưng Và Rãnh Ngực",
    category: "18+ · Gợi Tình & Thể Xác",
    scenario: "Sau hiệp một kịch liệt, mồ hôi ướt đẫm lấm tấm trên làn da bóng loáng. Hắn không cho bạn đi tắm mà vùi đầu vào liếm láp từng giọt mồ hôi mặn mòi, hít hà mùi hương cơ thể đàn bà đặc trưng đầy mê hoặc.",
    emoji: "💦",
    isNsfw: true
  },
  {
    id: 137,
    title: "Đeo Vòng Cổ Da (Choker) & Bắt Bò Lại Gần Xin Xỏ Được Đụ",
    category: "21+ · BDSM & Phục Tùng",
    scenario: "Cổ bị siết chặt bởi chiếc choker da có dây xích bạc, hắn kéo nhẹ sợi xích bắt bạn phải quỳ gối bò lại gần chân hắn, ngước ánh mắt ướt át cầu xin được ban phát một đêm hoan lạc.",
    emoji: "⛓️",
    isNsfw: true
  },
  {
    id: 138,
    title: "Túm Chặt Eo Nhấc Hổng Lên Khỏi Mặt Nệm Mà Thúc Tới Tấp",
    category: "21+ · Sức Mạnh & Bạo Dạn",
    scenario: "Dùng đôi bàn tay gân guốc nhấc bổng cả phần hông bạn lên không trung, hắn đứng dưới mép giường dùng toàn bộ sức mạnh đàn ông đâm mạnh liên tục vào sâu bên trong, âm thanh da thịt va đập chát chúa cả căn phòng.",
    emoji: "🛌",
    isNsfw: true
  },
  {
    id: 139,
    title: "Đổ Rượu Vang Đỏ Lên Xương Quai Xanh Rồi Cúi Xuống Húp Trọn",
    category: "18+ · Men Say & Mê Muội",
    scenario: "Dòng rượu vang đỏ thẫm chảy tràn qua xương quai xanh rồi nhỏ giọt xuống khe ngực đẫy đà. Hắn ghé sát môi húp trọn từng giọt men say nồng, đầu lưỡi ấm nóng lướt qua đâu da thịt nổi gai ốc đến đó.",
    emoji: "🍷",
    isNsfw: true
  },
  {
    id: 140,
    title: "Cắn Chặt Gối Nén Tiếng Kêu Khi Bạn Cùng Phòng Ngủ Say Giường Bên Cạnh",
    category: "21+ · Lén Lút & Nghẹt Thở",
    scenario: "Trong phòng trọ hoặc ký túc xá có người đang ngủ say, hắn chui tọt vào chăn của bạn lột đồ đè xuống. Bạn phải cắn chặt chiếc gối bông để không phát ra tiếng rên nào khi hắn cắm phập vào người từ phía sau.",
    emoji: "🤫",
    isNsfw: true
  },
  {
    id: 141,
    title: "Vừa Lái Xe Vừa Để Bạn Ngồi Lên Lòng Nhún Nhảy Đi Trong Đêm Vắng",
    category: "21+ · Mạo Hiểm & Điên Rồ",
    scenario: "Trên cung đường cao tốc hoang vắng lúc nửa đêm, hắn kéo bạn sang ghế lái ngồi lọt thỏm trong lòng, váy vén lên để thứ cứng ngắc cắm chặt vào trong, vừa giữ vô lăng vừa nhấp theo nhịp ga gầm rú.",
    emoji: "🏎️",
    isNsfw: true
  },
  {
    id: 142,
    title: "Đè Ngửa Trên Sàn Nhà Trải Thảm Lông Làm Liền 3 Hiệp Bất Kể Đêm Ngày",
    category: "21+ · Cuồng Dâm & Vắt Kiệt",
    scenario: "Vừa về tới nhà chưa kịp bật đèn đã bị quật ngã xuống tấm thảm lông phòng khách, hắn lột sạch đồ rồi đâm vào cuồng bạo, hiệp này nối tiếp hiệp khác khiến bạn chỉ biết khóc lóc van xin tha mạng.",
    emoji: "🧶",
    isNsfw: true
  },
  {
    id: 143,
    title: "Dùng Đá Lạnh Lướt Qua Điểm Nhạy Cảm Rồi Ngay Lập Tức Sưởi Bằng Lưỡi Nóng",
    category: "18+ · Nhiệt Độ & Kích Thích",
    scenario: "Viên đá lạnh buốt lướt qua đầu ngực và hột le làm cơ thể giật bắn co rúm, ngay sau đó là đầu lưỡi ướt át nóng bỏng của hắn ngậm lấy sưởi ấm, sự tương phản nhiệt độ mang lại khoái cảm tê dại đến run rẩy.",
    emoji: "🧊",
    isNsfw: true
  },
  {
    id: 144,
    title: "Bắt Quỳ Đối Diện Nhìn Hắn Tự Sóc Lọ Để Tra Tấn Thị Giác",
    category: "21+ · Khiêu Khích & Bẩn Thỉu",
    scenario: "Hắn cấm bạn được chạm vào người, chỉ cho phép quỳ ngước nhìn hắn thong thả tuốt thứ gân guốc cương cứng trước mặt, tiếng thở dốc trầm đục và giọt nước nhờn rỉ ra khiến bạn ướt đẫm mà không được thỏa mãn.",
    emoji: "🍆",
    isNsfw: true
  },
  {
    id: 145,
    title: "Cắn Nát Môi Trong Cơn Đê Mê Điên Dại, Máu Tanh Lẫn Vị Ngọt Ngào",
    category: "18+ · Đau Đớn & Cuồng Nhiệt",
    scenario: "Cơn cực khoái ập đến dữ dội làm bạn không kìm được cắn ngập răng vào vai hoặc môi hắn, máu rỉ ra tanh nồng nhưng hắn chỉ cười khẩy gầm lên rồi dập mạnh hơn để hòa chung nỗi đau và khoái lạc.",
    emoji: "🩸",
    isNsfw: true
  },
  {
    id: 146,
    title: "Thay Phiên Bịt Mắt & Thì Thầm Những Điều Đen Tối Nhất Vào Tai Nhau",
    category: "18+ · Kink & Tâm Lý",
    scenario: "Mỗi người lần lượt bị bịt mắt hoàn toàn, người kia cúi sát tai kể lại chi tiết những huyễn tưởng dâm dục và bẩn thỉu nhất mà mình muốn làm lên cơ thể đối phương tối nay.",
    emoji: "🎭",
    isNsfw: true
  },
  {
    id: 147,
    title: "Ép Ngồi Lên Bàn Bi-A Đèn Mờ & Tách Hai Đùi Bằng Cây Cơ",
    category: "21+ · Hoang Dã & Sành Điệu",
    scenario: "Trong phòng bi-a riêng tư sau giờ đóng cửa, hắn nhấc bạn ngồi lên mặt bàn bọc nỉ xanh, dùng cán gậy bi-a tách rộng hai chân bạn ra rồi chen người vào giữa thúc thẳng vào trong.",
    emoji: "🎱",
    isNsfw: true
  },
  {
    id: 148,
    title: "Chơi Đùa Khe Dâm Bằng Ngón Tay Ướt Đẫm Trước Khi Cho Hàng Thật Vào",
    category: "21+ · Dạo Đầu Bạo Dạn",
    scenario: "Hắn luồn hai ngón tay vào móc ngoáy bên trong, ngón tay cái liên tục miết mạnh hạt ngọc cho đến khi nước dâm tuôn xối xả làm ướt sũng cả mu bàn tay hắn mới chịu rút ra thay bằng thứ to lớn hơn.",
    emoji: "✌️",
    isNsfw: true
  },
  {
    id: 149,
    title: "Tạt Xe Vào Hẻm Tối Ven Đường Vắng & Tựa Thân Xe Làm Tình Chớp Nhoáng",
    category: "21+ · Hồi Hộp & Vội Vã",
    scenario: "Không thể nhịn về tới nhà, hắn tạt xe vào góc hẻm cụt tối tăm, kéo bạn tựa vào thân xe lạnh ngắt, kéo tụt quần lót sang một bên rồi đâm ngập vào trong tiếng thở gấp đầy căng thẳng sợ bị bắt gặp.",
    emoji: "🛣️",
    isNsfw: true
  },
  {
    id: 150,
    title: "Đóng Vai Sát Thủ & Con Tin Bị Trói Bắt Khai Báo Bằng Thể Xác",
    category: "21+ · Roleplay & Thẩm Vấn",
    scenario: "Bạn bị trói quặt tay sau lưng trên ghế gỗ, kẻ thẩm vấn lạnh lùng dùng mũi dao rạch rách áo bạn, dùng bàn tay thô bạo tra khảo từng câu hỏi, mỗi câu trả lời sai là một lần bị cắn mút dã man.",
    emoji: "🗡️",
    isNsfw: true
  },
  {
    id: 151,
    title: "Đè Chặt Cổ Tay Lên Đỉnh Đầu Dùng Trọng Lượng Cơ Thể Khóa Chặt",
    category: "18+ · Đè Nghiến & Chiếm Đoạt",
    scenario: "Một tay hắn gom chặt hai cổ tay bạn đè ép lên gối, thân hình to lớn vạm vỡ dán chặt như núi đá khóa cứng mọi cử động, chỉ còn phần hông bên dưới mặc sức cày xới mãnh liệt.",
    emoji: "💪",
    isNsfw: true
  },
  {
    id: 152,
    title: "Nhỏ Sáp Nến Chuyên Dụng Lên Ngực Và Bụng Dưới Kích Thích (Wax Play)",
    category: "21+ · BDSM & Cảm Giác Mạnh",
    scenario: "Từng giọt sáp nến ấm nóng nhỏ xuống làn da trần nõn nà làm bạn khẽ rùng mình co thắt, ngay sau khi sáp khô hắn dùng miệng bóc từng mảng sáp ra kèm theo những cái hôn nóng rực.",
    emoji: "🕯️",
    isNsfw: true
  },
  {
    id: 153,
    title: "Bắt Tự Tay Vạch Áo Bóp Ngực Cầu Xin Được Hắn Đụ Vào Trong",
    category: "21+ · Làm Nhục Dịu Dàng & Thèm Khát",
    scenario: "Hắn khoanh tay đứng nhìn, bắt bạn phải tự dùng hai tay bóp nắn cặp ngực của mình, ngước đôi mắt ngập nước dâm dục cầu xin: 'Mau vào đi anh, em thèm lắm rồi' thì hắn mới chịu lao vào.",
    emoji: "🍈",
    isNsfw: true
  },
  {
    id: 154,
    title: "Khỏa Thân Tắm Biển Đêm & Đè Nhau Xuống Bãi Cát Mịn Nghe Sóng Vỗ",
    category: "21+ · Thiên Nhiên & Hoang Dại",
    scenario: "Lột sạch mọi trang phục lao xuống làn nước biển đêm lạnh ngắt, sau đó bế thốc bạn lên bờ cát vắng, đè nghiến xuống cát mịn làm tình dưới ánh trăng rằm vằng vặc hòa cùng tiếng sóng gầm gào.",
    emoji: "🌊",
    isNsfw: true
  },
  {
    id: 155,
    title: "Kéo Rèm Cửa Sổ Phòng Tầng 50 & Bị Thúc Từ Sau Sát Vách Kính Nhìn Xuống",
    category: "21+ · Triển Lãm & Kích Thích",
    scenario: "Ép cả người bạn áp sát vào tấm kính trong suốt tầng 50 nhìn xuống muôn vàn ánh đèn thành phố bên dưới, hắn đứng sau giật tóc kéo ngửa cổ rồi nhấp từng cú sâu hoắm khiến bạn cảm tưởng cả thế giới đang nhìn mình.",
    emoji: "🏙️",
    isNsfw: true
  },
  {
    id: 156,
    title: "Nhốt Trong Phòng Chiếu Phim Gia Đình Cách Âm & Tha Hồ Gào Thét",
    category: "18+ · Tự Do & Phóng Túng",
    scenario: "Căn phòng cách âm tuyệt đối với màn hình chiếu khổng lồ, không cần phải kìm nén bất kỳ điều gì, bạn tha hồ rên la khóc lóc thảm thiết theo từng cú thúc như vũ bão của hắn.",
    emoji: "📽️",
    isNsfw: true
  },
  {
    id: 157,
    title: "Bắt Đếm Nhịp Từ 1 Đến 100, Rên Lớn Tiếng Hoặc Đếm Sai Là Bị Đụ Mạnh Hơn",
    category: "21+ · Trò Chơi Trừng Phạt",
    scenario: "Mỗi cú nhấp vào bạn phải đếm một số thật rõ ràng. Cứ mỗi lần không kìm được tiếng rên dâm đãng làm ngắt quãng lượt đếm, hắn lại nghiến răng thúc lút cán tận gốc bắt bạn đếm lại từ đầu.",
    emoji: "💯",
    isNsfw: true
  },
  {
    id: 158,
    title: "Còng Tay Bằng Còng Số 8 Kim Loại & Giấu Chìa Khóa Ở Chỗ Kín",
    category: "21+ · Kink & Bất Lực",
    scenario: "Tiếng kim loại lách cách khóa chặt hai tay sau lưng, chìa khóa bị hắn nhét sâu vào miệng hắn hoặc đút vào túi quần chật. Bạn chỉ có thể dùng miệng lưỡi van nài để tìm lại tự do.",
    emoji: "🔒",
    isNsfw: true
  },
  {
    id: 159,
    title: "Thử Thách Các Tư Thế Yoga Phòng The Khó Khăn Đầy Thách Thức",
    category: "18+ · Dẻo Dai & Mới Lạ",
    scenario: "Hai cơ thể uốn lượn thử nghiệm những tư thế đứng một chân, bế bổng hay vắt chéo chân kỳ lạ, góc thâm nhập mới mẻ cọ xát vào những điểm cực khoái chưa từng được đánh thức.",
    emoji: "🧘‍♀️",
    isNsfw: true
  },
  {
    id: 160,
    title: "Giả Vờ Giận Dỗi Để Được Hắn Dùng Thân Xác Ra Sức Dỗ Dành Cả Đêm",
    category: "18+ · Chiều Chuộng & Dâm Dục",
    scenario: "Khoanh tay quay mặt đi hờn dỗi, hắn liền bò lại hôn hít khắp người, dùng sự nam tính cuồn cuộn và kỹ năng giường chiếu điêu luyện để 'xin lỗi' cho đến khi bạn rên rỉ mềm nhũn trong lòng hắn.",
    emoji: "🥺",
    isNsfw: true
  },
  {
    id: 161,
    title: "Mơn Trớn Dạo Đầu Suốt 1 Tiếng Đồng Hồ Cho Đến Khi Nước Nôi Lênh Láng",
    category: "18+ · Chậm Rãi & Chảy Nước",
    scenario: "Kiên nhẫn hôn từng ngón chân, liếm mút bắp đùi non, thổi hơi ấm vào vùng kín suốt cả tiếng đồng hồ mà không thèm đút vào, tra tấn bạn bằng sự thèm khát tột độ nước chảy ướt đẫm cả ga giường.",
    emoji: "⏳",
    isNsfw: true
  },
  {
    id: 162,
    title: "Bật Phim Cấp 3 Lên Xem Cùng Nhau & Bắt Chước Lại Từng Cảnh Nóng Bỏng",
    category: "21+ · Học Hỏi & Kích Động",
    scenario: "Màn hình tivi phát những cảnh hoan lạc rên rỉ cuồng loạn của diễn viên, hai người ngồi cạnh vừa xem vừa đỏ mặt, rồi bắt chước y hệt từng tư thế và góc độ thâm nhập của bộ phim.",
    emoji: "📺",
    isNsfw: true
  },
  {
    id: 163,
    title: "Vỗ Mông Bôm Bốp Tạo Âm Thanh Chát Chúa Vang Vọng Phòng Ngủ",
    category: "21+ · Thô Bạo & Hưng Phấn",
    scenario: "Ở tư thế doggy từ phía sau, mỗi cú dập mạnh mẽ của hắn đều kèm theo một cú tát nảy lửa vào mông bạn, tiếng da thịt va đập bôm bốp chát chúa kích thích thính giác đến tột đỉnh.",
    emoji: "👏",
    isNsfw: true
  },
  {
    id: 164,
    title: "Đút Quả Dâu Tây Mọng Nước Bằng Miệng Kèm Nụ Hôn Ngập Vị Ngọt",
    category: "18+ · Quyến Rũ & Gợi Tình",
    scenario: "Ngậm quả dâu tây chín mọng hoặc viên đá mát lạnh nơi khóe môi, hắn cúi xuống ép bạn dùng môi cắn lấy nửa quả dâu, nước cốt ngọt ngào trào ra hòa cùng nụ hôn sâu nóng bỏng quấn quýt.",
    emoji: "🍓",
    isNsfw: true
  },
  {
    id: 165,
    title: "Trói Chân Chữ M Phơi Bày Toàn Bộ Nơi Nhạy Cảm Không Chút Che Đậy",
    category: "21+ · BDSM & Phơi Bày",
    scenario: "Hai chân bị trói gập sang hai bên đầu gối tạo thành hình chữ M, nơi thầm kín nhất mở toang trước mắt hắn. Hắn thong thả ngồi ngắm nghía sự ẩm ướt co bóp rồi mới thong thả thưởng thức.",
    emoji: "🚼",
    isNsfw: true
  },
  {
    id: 166,
    title: "Quỳ Gối Ngước Mắt Van Lơn Nhưng Hắn Chỉ Cười Khẩy Nhấp Sâu Hơn",
    category: "21+ · Tàn Nhẫn & Khoái Lạc",
    scenario: "Bị làm tới mệt lả muốn xin nghỉ, bạn vừa thở hổn hển vừa van xin hắn tha cho, nhưng hắn chỉ cười đểu một tiếng: 'Nãy ai bảo thèm nữa?' rồi nắm chặt hông bạn thúc tới tấp không cho thở.",
    emoji: "😈",
    isNsfw: true
  },
  {
    id: 167,
    title: "Làm Tình Trong Lều Cắm Trại Rừng Sương Mù Lều Rung Bần Bật",
    category: "21+ · Hoang Dã & Thử Thách",
    scenario: "Giữa khu rừng đêm sương lạnh buốt giá, trong chiếc lều nhỏ hai cơ thể trần trụi quấn lấy nhau nóng hầm hập. Từng nhịp đâm thúc mạnh bạo làm cả căn lều chao đảo rung lắc bần bật giữa thiên nhiên.",
    emoji: "🏕️",
    isNsfw: true
  },
  {
    id: 168,
    title: "Thử Thách Đổi Quyền Làm Chủ: Ai Ra Nước Trước Phải Làm Nô Lệ 1 Ngày",
    category: "18+ · Đấu Trí & Khoái Cảm",
    scenario: "Cùng thi thố sự kiềm chế thể xác bằng mọi ngón nghề mơn trớn khiêu khích, ai là người không nhịn được mà xuất tinh hay lên đỉnh trước sẽ phải phục tùng làm nô lệ tình dục cho người kia suốt ngày mai.",
    emoji: "🏆",
    isNsfw: true
  },
  {
    id: 169,
    title: "Ôm Nhau Trần Trụi Ngủ Thiếp Đi Sau Khi Vắt Kiệt Sức Lực Đến Sáng",
    category: "18+ · Thỏa Mãn & Gắn Kết",
    scenario: "Sau cả đêm cuồng phong bão táp quần thảo mệt lử đờ đẫn, hai cơ thể nhầy nhụa mồ hôi và dịch vị ôm ghì lấy nhau ngủ vùi, sáng thức dậy thứ cương cứng lại cọ vào mông tiếp tục hiệp mới.",
    emoji: "🛌",
    isNsfw: true
  }
];

export function getRandomSfwIdea(): DateIdea {
  return SFW_DATE_IDEAS[Math.floor(Math.random() * SFW_DATE_IDEAS.length)];
}

export function getRandomNsfwIdea(): DateIdea {
  return NSFW_DATE_IDEAS[Math.floor(Math.random() * NSFW_DATE_IDEAS.length)];
}
