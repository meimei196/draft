export interface TarotCard {
  id: number;
  name: string;
  nameEn: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  symbol: string;
  keywords: string;
  meaning: string;
  advice: string;
}

export const TAROT_78_CARDS: TarotCard[] = [
  // --- 22 MAJOR ARCANA ---
  {
    id: 0,
    name: "0. The Fool - Kẻ Khờ Khạo",
    nameEn: "The Fool",
    arcana: "major",
    symbol: "🃏",
    keywords: "Khởi đầu mới, ngây thơ, tự do, phiêu lưu dũng cảm",
    meaning: "Một chương mới toanh chuẩn bị mở ra với tâm hồn thuần khiết. Nàng đang đứng trước một ngã rẽ đầy phấn khích, nơi mọi giới hạn cũ kỹ đều bị thổi bay.",
    advice: "Đừng sợ vấp ngã. Hãy để trái tim dẫn đường, tin vào năng lực của bản thân và dũng cảm đón nhận những khởi đầu mới một cách vô tư nhất!"
  },
  {
    id: 1,
    name: "I. The Magician - Nhà Ảo Thuật",
    nameEn: "The Magician",
    arcana: "major",
    symbol: "🪄",
    keywords: "Bản lĩnh, quyền năng tạo tác, sự quyến rũ, hiện thực hóa",
    meaning: "Nàng sở hữu tất cả công cụ và bản lĩnh để biến những ý tưởng thành hiện thực. Sự tự tin của nàng lúc này chính là sức hút mạnh mẽ nhất.",
    advice: "Hãy chủ động nắm bắt cơ hội. Những kế hoạch nàng ấp ủ bấy lâu, hãy tự tin bắt tay vào thực hiện ngay hôm nay!"
  },
  {
    id: 2,
    name: "II. The High Priestess - Nữ Tu Sĩ",
    nameEn: "The High Priestess",
    arcana: "major",
    symbol: "🌙",
    keywords: "Trực giác nhạy bén, bí ẩn cuốn hút, sự tĩnh lặng sâu lắng",
    meaning: "Có những điều không cần nói ra thành lời nhưng linh cảm của nàng đã đoán trước. Sức quyến rũ chết người của nàng nằm ở nét bí ẩn và sự tinh tế.",
    advice: "Lắng nghe giác quan thứ sáu của nàng hôm nay. Những giấc mơ hoặc cảm giác thoáng qua đều mang thông điệp thật lòng."
  },
  {
    id: 3,
    name: "III. The Empress - Hoàng Hậu",
    nameEn: "The Empress",
    arcana: "major",
    symbol: "👑",
    keywords: "Dịu dàng, sự chở che, sắc đẹp nở rộ, tình yêu trù phú",
    meaning: "Biểu tượng của sự nữ tính ngọt ngào nhất. Nàng xứng đáng được nâng niu, chiều chuộng và bao bọc bởi những tình cảm ấm áp nhất trần đời.",
    advice: "Tự thưởng cho bản thân một món quà, ăn một món thật ngon hoặc làm đẹp. Nàng càng yêu thương mình, người khác càng say đắm nàng."
  },
  {
    id: 4,
    name: "IV. The Emperor - Hoàng Đế",
    nameEn: "The Emperor",
    arcana: "major",
    symbol: "🏛️",
    keywords: "Vững chãi, kỷ luật kiên định, tự chủ và quyền uy",
    meaning: "Sự hiện diện của một điểm tựa vững chãi như núi. Đã đến lúc nàng thiết lập tính kỷ luật, ranh giới rõ ràng và làm chủ cuộc sống của mình một cách dứt khoát.",
    advice: "Tìm kiếm sự an tâm trong những hành động thực tế, kiên định với kế hoạch và giữ vững lập trường của chính mình."
  },
  {
    id: 5,
    name: "V. The Hierophant - Giáo Hoàng",
    nameEn: "The Hierophant",
    arcana: "major",
    symbol: "📜",
    keywords: "Cam kết chân thành, giá trị bền vững, sự thấu hiểu sâu sắc",
    meaning: "Một sự gắn kết mang tính định mệnh và nghiêm túc. Đã đến lúc nhìn nhận mọi việc dựa trên giá trị cốt lõi, sự tôn trọng và hiểu biết sâu sắc.",
    advice: "Hãy trân trọng những lời khuyên chân thành từ người đi trước và giữ sự chính trực trong mọi quyết định."
  },
  {
    id: 6,
    name: "VI. The Lovers - Tình Nhân & Sự Lựa Chọn",
    nameEn: "The Lovers",
    arcana: "major",
    symbol: "💖",
    keywords: "Hòa hợp tâm hồn, sự lựa chọn của con tim, kết nối chân thành",
    meaning: "Sự thăng hoa của các mối liên kết và khoảnh khắc đứng trước sự lựa chọn quan trọng. Hãy dung hòa giữa lý trí và cảm xúc để tìm thấy sự bình an.",
    advice: "Hãy thành thật với chính mình. Lắng nghe trực giác và đưa ra sự lựa chọn phù hợp nhất với giá trị của bản thân."
  },
  {
    id: 7,
    name: "VII. The Chariot - Cỗ Xe Chiến Thắng",
    nameEn: "The Chariot",
    arcana: "major",
    symbol: "🏹",
    keywords: "Quyết tâm, vượt qua trở ngại, tiến về phía trước",
    meaning: "Không rào cản nào có thể ngăn cản bước chân của nàng. Nàng đang làm chủ vận mệnh tình cảm của chính mình với một ý chí kiên định phi thường.",
    advice: "Tập trung vào mục tiêu. Sự dứt khoát và rõ ràng sẽ mang lại chiến thắng giòn giã."
  },
  {
    id: 8,
    name: "VIII. Strength - Sức Mạnh Nhu Thuận",
    nameEn: "Strength",
    arcana: "major",
    symbol: "🦁",
    keywords: "Nhu thắng cương, lòng kiên nhẫn, tình thương thuần khiết",
    meaning: "Không cần gào thét hay đe dọa, sự dịu dàng và thấu cảm vô bờ của nàng có thể thuần hóa ngay cả chú sư tử hung dữ nhất.",
    advice: "Lấy nhu chế cương. Một nụ cười ngọt ngào hay cái ôm ấm áp sẽ giải quyết mọi giận hờn."
  },
  {
    id: 9,
    name: "IX. The Hermit - Ẩn Sĩ",
    nameEn: "The Hermit",
    arcana: "major",
    symbol: "🕯️",
    keywords: "Tĩnh lặng nội tâm, soi sáng tâm hồn, thấu hiểu bản thân",
    meaning: "Khoảng lặng cần thiết để quay về soi chiếu chính mình. Đôi khi sự cô đơn không phải là thiếu vắng ai đó, mà là cơ hội để tìm lại ánh sáng bên trong.",
    advice: "Dành riêng cho mình một buổi tối yên tĩnh, đọc sách, nghe nhạc lofi và trò chuyện với tâm can."
  },
  {
    id: 10,
    name: "X. Wheel of Fortune - Vòng Xoay Vận Mệnh",
    nameEn: "Wheel of Fortune",
    arcana: "major",
    symbol: "☸️",
    keywords: "Duyên phận bất ngờ, bước ngoặt định mệnh, thời cơ vàng",
    meaning: "Bánh xe định mệnh đang xoay chuyển mang theo những cơ duyên kỳ diệu. Một cuộc gặp gỡ tình cờ hay tin nhắn bất ngờ có thể thay đổi tất cả.",
    advice: "Hãy cởi mở đón nhận mọi điều bất ngờ xảy ra hôm nay, vũ trụ đang gửi tín hiệu lành đấy!"
  },
  {
    id: 11,
    name: "XI. Justice - Công Lý & Cân Bằng",
    nameEn: "Justice",
    arcana: "major",
    symbol: "⚖️",
    keywords: "Công bằng, sự thật tỏ tường, trách nhiệm và bình đẳng",
    meaning: "Những gì nàng bỏ ra bằng tất cả tấm lòng sẽ nhận lại sự đền đáp xứng đáng. Sự thật và công bằng sẽ chữa lành mọi hiểu lầm.",
    advice: "Giữ sự thẳng thắn và công tâm trong mọi cuộc đối thoại. Sự thật luôn là liều thuốc giải độc tốt nhất."
  },
  {
    id: 12,
    name: "XII. The Hanged Man - Người Treo Ngược",
    nameEn: "The Hanged Man",
    arcana: "major",
    symbol: "🕊️",
    keywords: "Đổi góc nhìn, chấp nhận buông bỏ, sự hy sinh có ý nghĩa",
    meaning: "Nhìn mọi chuyện từ một góc độ hoàn toàn khác. Việc tạm dừng lại không phải là thất bại mà là lúc để tích lũy nhận thức mới sâu sắc hơn.",
    advice: "Đừng cố cưỡng cầu hay thúc ép. Thả lỏng và chờ đợi mọi thứ tự nhiên đơm hoa."
  },
  {
    id: 13,
    name: "XIII. Death - Sự Tái Sinh",
    nameEn: "Death",
    arcana: "major",
    symbol: "🥀",
    keywords: "Khép lại quá khứ, lột xác, tái sinh huy hoàng",
    meaning: "Lá bài kết thúc những muộn phiền cũ để nhường chỗ cho một bình minh rực rỡ hơn. Cánh cửa này đóng lại là để cánh cửa khác rộng mở đón nàng.",
    advice: "Dũng cảm cắt đứt những nguồn năng lượng độc hại hay vương vấn không đáng có. Nàng sắp bước vào thời kỳ lột xác rực rỡ."
  },
  {
    id: 14,
    name: "XIV. Temperance - Điềm Đạm Dung Hòa",
    nameEn: "Temperance",
    arcana: "major",
    symbol: "💧",
    keywords: "Hòa hợp, kiên nhẫn, dòng chảy chữa lành êm dịu",
    meaning: "Sự cân bằng hoàn mỹ giữa lý trí và cảm xúc. Một nguồn năng lượng xoa dịu như dòng suối mát lành tưới tắm tâm hồn đang khô cằn.",
    advice: "Giữ tâm thế nhẹ nhàng, không vội vã. Mọi điều tốt đẹp đều cần thời gian để ủ hương."
  },
  {
    id: 15,
    name: "XV. The Devil - Chiếc Lồng Dục Vọng",
    nameEn: "The Devil",
    arcana: "major",
    symbol: "⛓️",
    keywords: "Mê đắm, quyến rũ nguy hiểm, đam mê cuồng nhiệt, sự ràng buộc",
    meaning: "Sức hút xác thịt hay sự si mê khó cưỡng lại. Có một nỗi ám ảnh ngọt ngào khiến nàng đắm chìm vào những cảm xúc mãnh liệt nhất.",
    advice: "Tận hưởng sự cuồng nhiệt nhưng hãy giữ lại cho mình một chút tỉnh táo để không đánh mất tự do."
  },
  {
    id: 16,
    name: "XVI. The Tower - Sấm Sét Đổ Vỡ",
    nameEn: "The Tower",
    arcana: "major",
    symbol: "⚡",
    keywords: "Đột phá bất ngờ, phá vỡ ảo tưởng, thức tỉnh chân lý",
    meaning: "Một sự thật bất ngờ phơi bày hay một biến cố làm vỡ tan những ảo tưởng cũ kỹ. Đau đớn thoáng qua nhưng giúp nàng xây dựng nền móng chân thật hơn.",
    advice: "Đừng bám víu vào những thứ mục rỗng. Dọn sạch đống đổ nát để sẵn sàng cho một tòa lâu đài kiên cố mới."
  },
  {
    id: 17,
    name: "XVII. The Star - Ánh Sao Hy Vọng",
    nameEn: "The Star",
    arcana: "major",
    symbol: "🌟",
    keywords: "Hy vọng rạng rỡ, niềm tin hồi sinh, vẻ đẹp thuần khiết",
    meaning: "Ánh sao hy vọng lấp lánh sau đêm dài giông bão. Nàng đang được bao bọc bởi ánh sáng dịu lành của sự may mắn và thanh thản.",
    advice: "Hãy giữ trọn niềm tin vào tình yêu và cuộc sống. Vũ trụ đang lắng nghe và chuẩn bị hồi đáp nguyện ước của nàng."
  },
  {
    id: 18,
    name: "XVIII. The Moon - Vầng Trăng Ảo Mộng",
    nameEn: "The Moon",
    arcana: "major",
    symbol: "🌕",
    keywords: "Mơ mộng, nỗi bất an mơ hồ, chiều sâu vô thức",
    meaning: "Vùng nước sâu thẳm của cảm xúc nơi ánh trăng tạo nên những cái bóng huyễn hoặc. Có thể nàng đang lo lắng vì những điều chưa rõ ràng.",
    advice: "Đừng để nỗi sợ vô căn cứ đánh lừa nàng. Chờ đợi ánh mặt trời lên, mọi hoài nghi sẽ tan biến như sương mai."
  },
  {
    id: 19,
    name: "XIX. The Sun - Ánh Dương Rạng Ngời",
    nameEn: "The Sun",
    arcana: "major",
    symbol: "☀️",
    keywords: "Hạnh phúc trọn vẹn, ấm áp tỏa sáng, thành công rực rỡ",
    meaning: "Lá bài hạnh phúc nhất trong bộ bài! Mọi đám mây mù đều tan biến, chỉ còn lại nụ cười rạng rỡ, sự nồng ấm và nguồn sinh khí ngập tràn.",
    advice: "Hãy cười thật tươi và lan tỏa nguồn năng lượng rạng rỡ của nàng đến mọi người xung quanh!"
  },
  {
    id: 20,
    name: "XX. Judgement - Tiếng Kèn Thức Tỉnh",
    nameEn: "Judgement",
    arcana: "major",
    symbol: "🎺",
    keywords: "Tha thứ, thức tỉnh tâm thức, tiếng gọi định mệnh",
    meaning: "Thời khắc đưa ra quyết định quan trọng để giải phóng chính mình khỏi gánh nặng xưa. Nàng đang được tha thứ và sẵn sàng cho một kiếp sống mới.",
    advice: "Buông bỏ tự trách móc. Hãy tha thứ cho người khác và tha thứ cho chính mình để thanh thản bước tiếp."
  },
  {
    id: 21,
    name: "XXI. The World - Thế Giới Viên Mãn",
    nameEn: "The World",
    arcana: "major",
    symbol: "🌍",
    keywords: "Viên mãn, tròn đầy trọn vẹn, đích đến hạnh phúc",
    meaning: "Một hành trình dài đã cán đích trong vinh quang và bình yên. Nàng đã tìm thấy mảnh ghép còn thiếu và chạm tới sự hòa hợp toàn vẹn.",
    advice: "Tận hưởng cảm giác mãn nguyện này. Cả thế giới dường như đang mỉm cười chúc phúc cho nàng."
  },

  // --- 14 WANDS (BỘ GẬY) ---
  {
    id: 22,
    name: "Ace of Wands - Nhất Gậy",
    nameEn: "Ace of Wands",
    arcana: "minor",
    suit: "wands",
    symbol: "🔥",
    keywords: "Tia lửa đam mê, cảm hứng dồi dào, khởi đầu bùng nổ",
    meaning: "Một ngọn lửa nhiệt huyết vừa được thắp sáng. Nàng tràn ngập ý tưởng và sự khao khát cháy bỏng với một người hay một dự án mới.",
    advice: "Hãy chớp lấy tia lửa này và thổi bùng nó thành ngọn lửa đam mê tuyệt đẹp!"
  },
  {
    id: 23,
    name: "Two of Wands - Nhị Gậy",
    nameEn: "Two of Wands",
    arcana: "minor",
    suit: "wands",
    symbol: "🗺️",
    keywords: "Hoạch định tương lai, tầm nhìn xa, đứng trước lựa chọn",
    meaning: "Nàng đang đứng trên cao nhìn ra chân trời rộng lớn, tự hỏi bước đi tiếp theo cho mối quan hệ này sẽ đi về đâu.",
    advice: "Dám ước mơ lớn và bước ra khỏi vùng an toàn quen thuộc."
  },
  {
    id: 24,
    name: "Three of Wands - Tam Gậy",
    nameEn: "Three of Wands",
    arcana: "minor",
    suit: "wands",
    symbol: "⛵",
    keywords: "Mở rộng tầm mắt, những chuyến tàu cập bến, chờ đón tin vui",
    meaning: "Những hạt giống nàng gieo đang bắt đầu trổ hoa. Sự kiên nhẫn bấy lâu nay sắp được đền đáp bằng những tin tức ngọt ngào từ phương xa.",
    advice: "Giữ vững sự lạc quan, chuyến tàu chở hạnh phúc đang trên đường hướng về phía nàng."
  },
  {
    id: 25,
    name: "Four of Wands - Tứ Gậy",
    nameEn: "Four of Wands",
    arcana: "minor",
    suit: "wands",
    symbol: "🏰",
    keywords: "Gia đình ấm cúng, lễ kỷ niệm, sự gắn kết bình yên",
    meaning: "Khung cảnh sum vầy đầy hoa và tiếng cười. Một mái ấm an yên hoặc một cột mốc đáng nhớ trong cuộc sống.",
    advice: "Hãy dành thời gian sum họp cùng những người thân thương hoặc tự thưởng cho mình một buổi tối ấm cúng để thư giãn."
  },
  {
    id: 26,
    name: "Five of Wands - Ngũ Gậy",
    nameEn: "Five of Wands",
    arcana: "minor",
    suit: "wands",
    symbol: "🥊",
    keywords: "Xung đột nhỏ, ganh đua, sự bất đồng quan điểm",
    meaning: "Những màn tranh cãi vặt vãnh hay cảm giác phải cạnh tranh để giành lấy sự chú ý. Tuy nhiên đây chỉ là gia vị kích thích nếu biết tiết chế.",
    advice: "Đừng biến chuyện bé xé ra to. Dùng nụ cười để hóa giải những tranh cãi không cần thiết."
  },
  {
    id: 27,
    name: "Six of Wands - Lục Gậy",
    nameEn: "Six of Wands",
    arcana: "minor",
    suit: "wands",
    symbol: "🏆",
    keywords: "Chiến thắng vang dội, được công nhận, tự hào kiêu hãnh",
    meaning: "Nàng như một vị nữ tướng khải hoàn trên lưng ngựa trắng giữa tiếng reo hò. Sự nỗ lực và tài năng của nàng được mọi người công nhận xứng đáng.",
    advice: "Tự tin ngẩng cao đầu. Nàng hoàn toàn xứng đáng với vương miện của ngày hôm nay."
  },
  {
    id: 28,
    name: "Seven of Wands - Thất Gậy",
    nameEn: "Seven of Wands",
    arcana: "minor",
    suit: "wands",
    symbol: "🛡️",
    keywords: "Kiên cường bảo vệ lập trường, giữ vững ranh giới",
    meaning: "Nàng đang dũng cảm đứng lên bảo vệ quan điểm và ranh giới cá nhân trước những dèm pha hay thử thách bên ngoài.",
    advice: "Đừng nhượng bộ những gì thuộc về nguyên tắc cốt lõi của nàng."
  },
  {
    id: 29,
    name: "Eight of Wands - Bát Gậy",
    nameEn: "Eight of Wands",
    arcana: "minor",
    suit: "wands",
    symbol: "⚡",
    keywords: "Tốc độ nhanh chóng, tin tức bất ngờ, tiến triển thần tốc",
    meaning: "Mọi thứ diễn ra nhanh như chớp! Những tin tức dồn dập, những cơ hội bất ngờ ùa tới khiến nàng tràn đầy phấn khích.",
    advice: "Đừng chần chừ khi thời cơ đến. Tốc độ và sự quyết đoán chính là chìa khóa mang lại bước đột phá cho nàng hôm nay."
  },
  {
    id: 30,
    name: "Nine of Wands - Cửu Gậy",
    nameEn: "Nine of Wands",
    arcana: "minor",
    suit: "wands",
    symbol: "🩹",
    keywords: "Bền bỉ đến cùng, phòng thủ cảnh giác, sắp chạm đích",
    meaning: "Dù mang trên mình vài vết thương lòng từ quá khứ, nàng vẫn kiên cường đứng vững. Nàng chỉ còn cách đích đến một bước chân ngắn nữa thôi.",
    advice: "Đừng bỏ cuộc ngay trước ngưỡng cửa thành công. Hãy giữ thêm chút kiên nhẫn nữa."
  },
  {
    id: 31,
    name: "Ten of Wands - Thập Gậy",
    nameEn: "Ten of Wands",
    arcana: "minor",
    suit: "wands",
    symbol: "📦",
    keywords: "Gánh nặng quá tải, mệt mỏi vì ôm đồm, cần buông bớt",
    meaning: "Nàng đang ôm quá nhiều trách nhiệm và lo âu vào lòng. Tâm trí trở nên nặng nề khi chỉ có một mình gánh vác.",
    advice: "Học cách buông bớt những áp lực không cần thiết và nhờ người khác san sẻ. Đừng gồng mình làm mọi thứ một mình."
  },
  {
    id: 32,
    name: "Page of Wands - Tiểu Đồng Gậy",
    nameEn: "Page of Wands",
    arcana: "minor",
    suit: "wands",
    symbol: "🌱",
    keywords: "Nhiệt huyết trẻ trung, sự tò mò háo hức, thông điệp vui tươi",
    meaning: "Năng lượng đáng yêu, tinh nghịch như chú cún nhỏ vẫy đuôi. Một lời rủ rê đi chơi hoặc một tin nhắn dễ thương sắp tới.",
    advice: "Đón nhận niềm vui giản dị với sự háo hức trẻ thơ."
  },
  {
    id: 33,
    name: "Knight of Wands - Hiệp Sĩ Gậy",
    nameEn: "Knight of Wands",
    arcana: "minor",
    suit: "wands",
    symbol: "🐎",
    keywords: "Cháy hết mình, phiêu lưu táo bạo, chàng trai cuốn hút",
    meaning: "Một hình bóng tràn đầy sức sống, quyến rũ và bốc lửa lao tới cuộc đời nàng như một cơn gió lốc mùa hạ.",
    advice: "Tận hưởng cuộc phiêu lưu đầy kích thích này, nhưng hãy nhớ giữ lại chút nhịp thở riêng."
  },
  {
    id: 34,
    name: "Queen of Wands - Nữ Hoàng Gậy",
    nameEn: "Queen of Wands",
    arcana: "minor",
    suit: "wands",
    symbol: "🌻",
    keywords: "Tỏa sáng độc lập, ấm áp rạng ngời, tự tin quyến rũ",
    meaning: "Nàng chính là đóa hoa hướng dương rực rỡ nhất trong căn phòng! Bất cứ nơi nào nàng bước tới, nụ cười và thần thái của nàng đều sưởi ấm mọi ánh nhìn.",
    advice: "Hãy tiếp tục tỏa sáng rực rỡ theo cách của riêng nàng. Nàng chính là tâm điểm!"
  },
  {
    id: 35,
    name: "King of Wands - Vua Gậy",
    nameEn: "King of Wands",
    arcana: "minor",
    suit: "wands",
    symbol: "🦁",
    keywords: "Thủ lĩnh truyền cảm hứng, quyết đoán bản lĩnh, người đàn ông ấm áp",
    meaning: "Hình mẫu người đàn ông bản lĩnh, có chí lớn, biết cách che chở và luôn biến những mục tiêu thành hiện thực với năng lượng ngút ngàn.",
    advice: "Lấy cảm hứng từ sự quyết đoán này để vạch ra con đường tình yêu nàng mong muốn."
  },

  // --- 14 CUPS (BỘ CỐC) ---
  {
    id: 36,
    name: "Ace of Cups - Nhất Cốc",
    nameEn: "Ace of Cups",
    arcana: "minor",
    suit: "cups",
    symbol: "🍷",
    keywords: "Dòng suối tình yêu, cảm xúc dâng trào, con tim mở lối",
    meaning: "Chiếc chén thánh tràn ngập rượu ngọt của tình yêu! Một cảm xúc rung động tinh khôi, dịu dàng đang tưới mát tâm hồn nàng.",
    advice: "Hãy mở rộng trái tim, nàng sắp sửa đắm chìm trong biển trời yêu thương."
  },
  {
    id: 37,
    name: "Two of Cups - Nhị Cốc",
    nameEn: "Two of Cups",
    arcana: "minor",
    suit: "cups",
    symbol: "🥂",
    keywords: "Tri kỷ tương phùng, nâng ly hòa hợp, tình cảm song phương",
    meaning: "Sự kết nối tuyệt vời giữa hai con người như sinh ra để dành cho nhau. Tình cảm đến từ cả hai phía, ngọt ngào và bình đẳng.",
    advice: "Hãy nâng ly chúc mừng cho sự đồng điệu này. Nàng đã tìm thấy người hiểu từng ánh mắt của mình."
  },
  {
    id: 38,
    name: "Three of Cups - Tam Cốc",
    nameEn: "Three of Cups",
    arcana: "minor",
    suit: "cups",
    symbol: "🎉",
    keywords: "Niềm vui hội ngộ, hội bạn thân thiết, tiếng cười rộn rã",
    meaning: "Khoảng thời gian tuyệt vời để tâm sự, tám chuyện và chia sẻ niềm vui bên hội chị em bạn bè hoặc cộng đồng yêu quý.",
    advice: "Lên lịch tụ tập hoặc chia sẻ tâm sự trên Forum Tám Zai ngay thôi nào!"
  },
  {
    id: 39,
    name: "Four of Cups - Tứ Cốc",
    nameEn: "Four of Cups",
    arcana: "minor",
    suit: "cups",
    symbol: "☕",
    keywords: "Thờ ơ lãnh đạm, cảm giác chán chường, bỏ quên cơ hội",
    meaning: "Nàng đang ngồi khoanh tay dưới gốc cây, ngập trong cảm giác uể oải và không buồn để ý chiếc cốc tình yêu đang được chìa ra trước mặt.",
    advice: "Ngước mắt lên nhìn xung quanh xem. Có người đang âm thầm quan tâm nàng nhiều hơn nàng tưởng đấy."
  },
  {
    id: 40,
    name: "Five of Cups - Ngũ Cốc",
    nameEn: "Five of Cups",
    arcana: "minor",
    suit: "cups",
    symbol: "🥀",
    keywords: "Nuối tiếc chuyện cũ, giọt lệ chia ly, vẫn còn hy vọng phía sau",
    meaning: "Nàng đang mải cúi nhìn ba chiếc cốc đã đổ mà quên mất sau lưng vẫn còn hai chiếc cốc nguyên vẹn đang chờ đợi.",
    advice: "Quá khứ đã qua rồi. Hãy quay lưng lại và đón nhận những điều tốt đẹp vẫn còn vẹn nguyên bên cạnh."
  },
  {
    id: 41,
    name: "Six of Cups - Lục Cốc",
    nameEn: "Six of Cups",
    arcana: "minor",
    suit: "cups",
    symbol: "🌸",
    keywords: "Hoài niệm ngọt ngào, tình thơ ấu, người cũ trở lại, sự ngây ngô",
    meaning: "Mùi hương kỷ niệm xưa ùa về. Có thể một người từ quá khứ xuất hiện lại, hoặc những khoảnh khắc ngọt ngào như thuở mới biết yêu đang sống lại.",
    advice: "Trân trọng những ký ức đẹp đẽ nhưng hãy sống trọn vẹn cho hiện tại."
  },
  {
    id: 42,
    name: "Seven of Cups - Thất Cốc",
    nameEn: "Seven of Cups",
    arcana: "minor",
    suit: "cups",
    symbol: "💭",
    keywords: "Ảo mộng nhiều lựa chọn, mơ mộng viển vông, cần thực tế",
    meaning: "Bảy chiếc cốc lơ lửng trên mây với đủ loại ước mơ kỳ lạ. Nàng đang có quá nhiều suy nghĩ và viễn cảnh trong đầu nhưng chưa chọn được hướng đi cụ thể.",
    advice: "Lọc bớt những mộng tưởng hão huyền. Chọn ra một điều mà trái tim nàng khao khát nhất để theo đuổi."
  },
  {
    id: 43,
    name: "Eight of Cups - Bát Cốc",
    nameEn: "Eight of Cups",
    arcana: "minor",
    suit: "cups",
    symbol: "🚶‍♀️",
    keywords: "Dứt áo ra đi, tìm kiếm giá trị cao hơn, buông bỏ dĩ vãng",
    meaning: "Dù tám chiếc cốc đã xếp ngay ngắn nhưng con tim nàng biết nơi này không còn thuộc về mình. Nàng dũng cảm cất bước lên núi tìm kiếm chân trời mới.",
    advice: "Buông bỏ những gì không còn đem lại hạnh phúc là hành động dũng cảm nhất."
  },
  {
    id: 44,
    name: "Nine of Cups - Cửu Cốc",
    nameEn: "Nine of Cups",
    arcana: "minor",
    suit: "cups",
    symbol: "✨",
    keywords: "Lá bài ước nguyện (Wish Card), thỏa mãn viên mãn, tự hào",
    meaning: "Lá bài mang lại điều ước nhiệm màu! Những mong muốn thầm kín nhất của nàng đang lần lượt thành hiện thực với sự thỏa mãn vô bờ.",
    advice: "Cầu nguyện và tin tưởng. Điều ước ngọt ngào nhất của nàng hôm nay sẽ được vũ trụ hồi đáp."
  },
  {
    id: 45,
    name: "Ten of Cups - Thập Cốc",
    nameEn: "Ten of Cups",
    arcana: "minor",
    suit: "cups",
    symbol: "🌈",
    keywords: "Cầu vồng hạnh phúc, gia đình viên mãn, bình yên trọn đời",
    meaning: "Cầu vồng mười chiếc cốc tỏa sáng rực rỡ trên bầu trời bình yên. Một kết thúc có hậu như trong truyện cổ tích dành cho đôi lứa.",
    advice: "Tận hưởng trọn vẹn từng khoảnh khắc bình yên và ấm áp bên cạnh những người nàng yêu quý."
  },
  {
    id: 46,
    name: "Page of Cups - Tiểu Đồng Cốc",
    nameEn: "Page of Cups",
    arcana: "minor",
    suit: "cups",
    symbol: "🐟",
    keywords: "Ngọt ngào ngây thơ, thông điệp tỏ tình, chú cá trong ly nước",
    meaning: "Một lời tỏ tình e ấp, một tin nhắn vụng về nhưng tràn ngập chân tình như chú cá nhảy múa trong ly pha lê.",
    advice: "Đừng cười sự ngượng ngùng của ai đó, sự chân thành ấy là hiếm có khó tìm đấy."
  },
  {
    id: 47,
    name: "Knight of Cups - Hiệp Sĩ Cốc",
    nameEn: "Knight of Cups",
    arcana: "minor",
    suit: "cups",
    symbol: "🦄",
    keywords: "Bạch mã hoàng tử, lãng mạn bay bổng, lời tỏ tình ngọt ngào",
    meaning: "Chàng hiệp sĩ ôm chiếc cốc tình yêu cưỡi ngựa trắng thong dong tiến về phía nàng với những lời thơ tình êm ái.",
    advice: "Cho phép bản thân được đắm chìm trong sự lãng mạn bay bổng của tình yêu một lần."
  },
  {
    id: 48,
    name: "Queen of Cups - Nữ Hoàng Cốc",
    nameEn: "Queen of Cups",
    arcana: "minor",
    suit: "cups",
    symbol: "🪞",
    keywords: "Trái tim thấu cảm, dịu dàng ấm áp, tình yêu vô điều kiện",
    meaning: "Người phụ nữ sở hữu trái tim bao la như biển cả, luôn biết lắng nghe, vỗ về và thấu hiểu mọi nỗi niềm của người khác.",
    advice: "Hãy trở thành bến đỗ bình yên cho chính mình và trao gửi sự dịu dàng cho người nàng yêu thương."
  },
  {
    id: 49,
    name: "King of Cups - Vua Cốc",
    nameEn: "King of Cups",
    arcana: "minor",
    suit: "cups",
    symbol: "🌊",
    keywords: "Làm chủ cảm xúc, điềm tĩnh vững vàng, người che chở thâm trầm",
    meaning: "Người đàn ông ngồi trên ngai vàng giữa biển cả sóng gió nhưng nội tâm vẫn tĩnh lặng như mặt hồ. Sự che chở sâu sắc, không ồn ào nhưng kiên cố.",
    advice: "Học cách giữ bình tĩnh trước mọi sóng gió cảm xúc, sự điềm đạm là chìa khóa của sức hút."
  },

  // --- 14 SWORDS (BỘ KIẾM) ---
  {
    id: 50,
    name: "Ace of Swords - Nhất Kiếm",
    nameEn: "Ace of Swords",
    arcana: "minor",
    suit: "swords",
    symbol: "🗡️",
    keywords: "Sự thật sáng tỏ, trí tuệ sắc bén, quyết định dứt khoát",
    meaning: "Thanh kiếm công lý chém đứt mọi làn sương mù dối trá. Một sự thật được phơi bày giúp đầu óc nàng bừng tỉnh và thông suốt hơn bao giờ hết.",
    advice: "Nói thẳng, nói thật. Sự rõ ràng lúc này tốt hơn vạn lần những lời an ủi mơ hồ."
  },
  {
    id: 51,
    name: "Two of Swords - Nhị Kiếm",
    nameEn: "Two of Swords",
    arcana: "minor",
    suit: "swords",
    symbol: "🙈",
    keywords: "Thế tiến thoái lưỡng nan, bịt mắt trốn tránh, bế tắc lý trí",
    meaning: "Nàng đang bịt mắt, cầm hai thanh kiếm bắt chéo trước ngực vì không dám đối diện với quyết định khó khăn trước mắt.",
    advice: "Tháo dải băng bịt mắt ra và đối diện với thực tế. Trốn tránh không làm vấn đề biến mất."
  },
  {
    id: 52,
    name: "Three of Swords - Tam Kiếm",
    nameEn: "Three of Swords",
    arcana: "minor",
    suit: "swords",
    symbol: "💔",
    keywords: "Trái tim tan vỡ, nỗi đau nhức nhối, bài học trưởng thành",
    meaning: "Ba thanh kiếm đâm xuyên qua trái tim trong cơn mưa rào. Nỗi đau lòng, sự thất vọng hay tổn thương đang gặm nhấm tâm tư.",
    advice: "Khóc một trận thật đã nếu nàng muốn. Nước mắt sẽ rửa trôi vết thương để trái tim nàng mạnh mẽ hơn."
  },
  {
    id: 53,
    name: "Four of Swords - Tứ Kiếm",
    nameEn: "Four of Swords",
    arcana: "minor",
    suit: "swords",
    symbol: "🛌",
    keywords: "Nghỉ ngơi hồi phục, tĩnh dưỡng tâm hồn, tạm dừng chiến trận",
    meaning: "Hiệp sĩ nằm tĩnh dưỡng trong giáo đường thanh tịnh. Nàng đã chiến đấu quá mệt mỏi và bây giờ là lúc để sạc lại năng lượng.",
    advice: "Tạm thời tắt điện thoại, đi ngủ sớm và đừng nghĩ ngợi gì cả. Nghỉ ngơi là ưu tiên hàng đầu."
  },
  {
    id: 54,
    name: "Five of Swords - Ngũ Kiếm",
    nameEn: "Five of Swords",
    arcana: "minor",
    suit: "swords",
    symbol: "♟️",
    keywords: "Chiến thắng cay đắng, tổn thương cái tôi, được tiếng mất miếng",
    meaning: "Thắng một cuộc cãi vã nhưng làm tổn thương sâu sắc người đối diện. Cảm giác hả hê thoáng qua nhường chỗ cho sự hụt hẫng cô độc.",
    advice: "Tự hỏi xem: Nàng muốn mình đúng, hay nàng muốn có được hạnh phúc?"
  },
  {
    id: 55,
    name: "Six of Swords - Lục Kiếm",
    nameEn: "Six of Swords",
    arcana: "minor",
    suit: "swords",
    symbol: "🚣‍♀️",
    keywords: "Chuyến đò rời bão giông, hướng về vùng nước êm, chữa lành",
    meaning: "Con thuyền đang chèo lái rời khỏi vùng nước cuộn sóng để tiến về bến bờ yên ả. Giai đoạn khó khăn nhất đã dần lùi lại phía sau.",
    advice: "Kiên nhẫn di chuyển từng bước một. Bão giông đang tan dần rồi."
  },
  {
    id: 56,
    name: "Seven of Swords - Thất Kiếm",
    nameEn: "Seven of Swords",
    arcana: "minor",
    suit: "swords",
    symbol: "🦊",
    keywords: "Mưu mẹo bí mật, lén lút trốn tránh, sự thiếu chân thật",
    meaning: "Kẻ lẻn vào doanh trại ôm năm thanh kiếm chuồn đi trong bóng đêm. Có điều gì đó đang bị giấu giếm hoặc cần sự khéo léo để xử lý.",
    advice: "Cẩn trọng quan sát hành vi của những người xung quanh. Đừng quá ngây thơ đặt trọn niềm tin mù quáng."
  },
  {
    id: 57,
    name: "Eight of Swords - Bát Kiếm",
    nameEn: "Eight of Swords",
    arcana: "minor",
    suit: "swords",
    symbol: "🕸️",
    keywords: "Tự trói buộc, cảm giác bất lực ảo, chiếc lồng tâm trí",
    meaning: "Nàng bị quấn quanh bởi những thanh kiếm nhưng dây buộc thực ra rất lỏng. Nàng tự giam mình trong nỗi sợ hãi của chính tâm trí.",
    advice: "Nàng hoàn toàn có thể tự giải thoát cho mình bất cứ lúc nào nàng quyết định bước ra."
  },
  {
    id: 58,
    name: "Nine of Swords - Cửu Kiếm",
    nameEn: "Nine of Swords",
    arcana: "minor",
    suit: "swords",
    symbol: "🌌",
    keywords: "Ác mộng nửa đêm, lo âu thao thức, suy diễn quá mức",
    meaning: "Ngồi ôm mặt bật dậy giữa đêm khuya vì những suy nghĩ tiêu cực bủa vây. Phần lớn những điều nàng đang sợ hãi đều do trí tưởng tượng phóng đại.",
    advice: "Uống một ly nước ấm, hít thở sâu. Khi trời sáng, mọi thứ sẽ không hề tồi tệ như nàng nghĩ đâu."
  },
  {
    id: 59,
    name: "Ten of Swords - Thập Kiếm",
    nameEn: "Ten of Swords",
    arcana: "minor",
    suit: "swords",
    symbol: "🌅",
    keywords: "Chạm đáy nỗi đau, ánh bình minh le lói, không còn gì tệ hơn",
    meaning: "Mười thanh kiếm cắm xuống lưng trên bãi biển tối tăm, nhưng phía chân trời xa, vệt nắng bình minh vàng rực đã bắt đầu hé lộ. Nỗi đau đã chạm đáy và từ đây chỉ có đi lên!",
    advice: "Đừng sợ hãi nữa, điều tồi tệ nhất đã qua rồi. Nàng sắp bước vào chu kỳ hồi sinh rạng rỡ."
  },
  {
    id: 60,
    name: "Page of Swords - Tiểu Đồng Kiếm",
    nameEn: "Page of Swords",
    arcana: "minor",
    suit: "swords",
    symbol: "🔍",
    keywords: "Tò mò sắc sảo, thích hóng chuyện, thăm dò đối phương",
    meaning: "Cậu bé giương kiếm đứng trên ngọn đồi lộng gió, mắt liếc quanh như đang lén stalk trang cá nhân hay dò la tin tức của ai đó.",
    advice: "Dùng sự thông minh để tìm hiểu vấn đề nhưng hãy cẩn thận kẻo suy diễn quá đà."
  },
  {
    id: 61,
    name: "Knight of Swords - Hiệp Sĩ Kiếm",
    nameEn: "Knight of Swords",
    arcana: "minor",
    suit: "swords",
    symbol: "🌪️",
    keywords: "Lao nhanh như gió, thẳng thắn bộc trực, không ngại va chạm",
    meaning: "Chàng hiệp sĩ phi ngựa với tốc độ cuồng phong, gươm vung sáng loáng. Sự thẳng thắn quyết liệt, không vòng vo nhưng đôi khi hơi thiếu khéo léo.",
    advice: "Uốn lưỡi bảy lần trước khi nói. Thẳng thắn là tốt nhưng dịu dàng sẽ giúp lời nói dễ chạm tới tim hơn."
  },
  {
    id: 62,
    name: "Queen of Swords - Nữ Hoàng Kiếm",
    nameEn: "Queen of Swords",
    arcana: "minor",
    suit: "swords",
    symbol: "👑",
    keywords: "Sắc sảo lạnh lùng, ranh giới rõ ràng, lý trí kiên định",
    meaning: "Nữ hoàng ngồi trên ngai đá hoa cương, ánh mắt thấu suốt tâm can kẻ đối diện. Nàng độc lập, tự chủ và không ai có thể dắt mũi nàng được.",
    advice: "Giữ vững sự tỉnh táo và ranh giới tự tôn của mình. Nàng không cần phải hạ mình vì bất cứ ai."
  },
  {
    id: 63,
    name: "King of Swords - Vua Kiếm",
    nameEn: "King of Swords",
    arcana: "minor",
    suit: "swords",
    symbol: "⚖️",
    keywords: "Lãnh đạo trí tuệ, lý trí sắt đá, công lý và sự thật",
    meaning: "Vị vua tượng trưng cho đỉnh cao của trí tuệ, sự phán đoán chuẩn xác và kỷ luật thép. Mọi quyết định đều dựa trên sự thật và logic.",
    advice: "Dùng cái đầu lạnh để giải quyết vấn đề, sau đó dùng trái tim ấm để giữ lại yêu thương."
  },

  // --- 14 PENTACLES (BỘ TIỀN / BỘ ĐỒNG TIỀN) ---
  {
    id: 64,
    name: "Ace of Pentacles - Nhất Tiền",
    nameEn: "Ace of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    symbol: "🪙",
    keywords: "Hạt mầm thịnh vượng, cơ hội thực tế, nền tảng vững chắc",
    meaning: "Bàn tay thần từ đám mây chìa ra đồng tiền vàng rực rỡ trên khu vườn đầy hoa. Một khởi đầu thực tế, an tâm và đầy hứa hẹn về mặt vật chất lẫn tình cảm.",
    advice: "Nắm lấy cơ hội này. Một mối quan hệ có nền móng vững chắc đang chờ nàng chăm sóc."
  },
  {
    id: 65,
    name: "Two of Pentacles - Nhị Tiền",
    nameEn: "Two of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    symbol: "🤹‍♀️",
    keywords: "Tung hứng linh hoạt, cân bằng cuộc sống và tình cảm",
    meaning: "Nàng đang khéo léo tung hứng hai đồng tiền giữa những con sóng dập dềnh. Cân bằng giữa công việc, tiền bạc và thời gian dành cho người ấy.",
    advice: "Linh hoạt uyển chuyển. Đừng quá căng thẳng, hãy biến sự bận rộn thành một điệu nhảy vui vẻ."
  },
  {
    id: 66,
    name: "Three of Pentacles - Tam Tiền",
    nameEn: "Three of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    symbol: "🔨",
    keywords: "Cùng nhau xây đắp, học hỏi phối hợp, sự công nhận tài năng",
    meaning: "Người thợ chạm khắc đang chăm chỉ xây dựng thánh đường dưới sự ngưỡng mộ của các vị linh mục. Hai người đang cùng nhau xây đắp một tương lai thực tế.",
    advice: "Lắng nghe ý kiến của đối phương và cùng nhau bắt tay làm nên những điều ý nghĩa."
  },
  {
    id: 67,
    name: "Four of Pentacles - Tứ Tiền",
    nameEn: "Four of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    symbol: "🔒",
    keywords: "Giữ chặt khư khư, nỗi sợ mất mát, tính sở hữu cao",
    meaning: "Ôm chặt bốn đồng tiền không buông vì sợ ai đó lấy mất. Sự kiểm soát hay ghen tuông bắt nguồn từ cảm giác bất an bên trong.",
    advice: "Nắm chặt quá thì cát sẽ chảy qua kẽ tay. Mở lòng ra một chút, tình yêu cần không gian để thở."
  },
  {
    id: 68,
    name: "Five of Pentacles - Ngũ Tiền",
    nameEn: "Five of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    symbol: "❄️",
    keywords: "Lạc lõng trong giá lạnh, cảm giác thiếu thốn, quên nhìn ô cửa sổ ấm áp",
    meaning: "Hai bóng người bước đi trong bão tuyết lạnh giá mà không nhận ra ngay cạnh họ là ô cửa kính nhà thờ đang tỏa ánh sáng vàng ấm áp.",
    advice: "Sự giúp đỡ luôn ở ngay quanh nàng. Đừng ngại mở lời xin sự che chở khi thấy cô đơn."
  },
  {
    id: 69,
    name: "Six of Pentacles - Lục Tiền",
    nameEn: "Six of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    symbol: "🎁",
    keywords: "Cho và nhận cân bằng, lòng hảo tâm, sự hào phóng ngọt ngào",
    meaning: "Cán cân cho và nhận đang ở trạng thái cân đối hoàn hảo. Nàng cho đi sự dịu dàng và nhận lại sự trân trọng xứng đáng.",
    advice: "Trao đi sự quan tâm chân thành, nàng sẽ nhận lại gấp bội những điều ngọt ngào."
  },
  {
    id: 70,
    name: "Seven of Pentacles - Thất Tiền",
    nameEn: "Seven of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    symbol: "🍇",
    keywords: "Đánh giá thành quả, chờ đợi mùa gặt, sự kiên nhẫn tích lũy",
    meaning: "Người làm vườn chống cằm ngắm nhìn giàn quả mọng đang lớn từng ngày. Tình cảm đã gieo trồng cần thêm thời gian để chín ngọt.",
    advice: "Kiên nhẫn chờ đợi quả ngọt. Đừng nóng vội hái quả khi nó vẫn còn đang đơm hoa."
  },
  {
    id: 71,
    name: "Eight of Pentacles - Bát Tiền",
    nameEn: "Eight of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    symbol: "⚒️",
    keywords: "Chăm chỉ rèn giũa, sự tận tụy, tỉ mỉ từng chi tiết",
    meaning: "Tỉ mỉ gõ từng đồng tiền vàng với tất cả sự tập trung và đam mê. Sự chăm chút nghiêm túc cho bản thân và mối quan hệ.",
    advice: "Từng hành động nhỏ bé nhưng đều đặn mỗi ngày sẽ tạo nên một tình yêu vĩ đại."
  },
  {
    id: 72,
    name: "Nine of Pentacles - Cửu Tiền",
    nameEn: "Nine of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    symbol: "🦚",
    keywords: "Phú bà độc lập, tận hưởng cuộc sống sang chảnh, khí chất vương giả",
    meaning: "Quý cô đứng giữa vườn nho trĩu quả với chú chim ưng trên tay, tận hưởng sự giàu có, tự do và độc lập mà chính nàng gây dựng.",
    advice: "Tận hưởng cuộc sống quý cô độc lập của nàng. Khi nàng là đóa hoa thơm, ong bướm tự khắc tìm về."
  },
  {
    id: 73,
    name: "Ten of Pentacles - Thập Tiền",
    nameEn: "Ten of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    symbol: "🏰",
    keywords: "Gia tộc thịnh vượng, di sản bền vững, hạnh phúc an khang",
    meaning: "Hình ảnh một gia tộc sum vầy dưới cổng vòm lâu đài tráng lệ. Sự sung túc, ổn định lâu dài cả về tình cảm lẫn tài chính.",
    advice: "Hạnh phúc lâu bền được xây dựng từ nền tảng vững chắc và sự đồng lòng của cả hai."
  },
  {
    id: 74,
    name: "Page of Pentacles - Tiểu Đồng Tiền",
    nameEn: "Page of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    symbol: "📖",
    keywords: "Ham học hỏi, thực tế vững vàng, lời hứa đáng tin",
    meaning: "Cậu thanh niên chăm chú ngắm nhìn đồng tiền vàng trên tay, ấp ủ những kế hoạch thực tế và chắc chắn cho tương lai.",
    advice: "Bắt đầu từ những kế hoạch nhỏ nhưng thực tế. Từng bước vững vàng sẽ dẫn đến thành công."
  },
  {
    id: 75,
    name: "Knight of Pentacles - Hiệp Sĩ Tiền",
    nameEn: "Knight of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    symbol: "🚜",
    keywords: "Đáng tin cậy tuyệt đối, kiên nhẫn chăm chỉ, người đàn ông chân thật",
    meaning: "Hiệp sĩ cưỡi chú ngựa đen thong thả bước đi trên cánh đồng lúa mì vàng óng. Chậm mà chắc, tuyệt đối không lăng nhăng hay bội tín.",
    advice: "Trân trọng những người ít nói nhưng luôn hành động bằng sự chăm sóc âm thầm bền bỉ."
  },
  {
    id: 76,
    name: "Queen of Pentacles - Nữ Hoàng Tiền",
    nameEn: "Queen of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    symbol: "🐰",
    keywords: "Người mẹ hiền thục, chu đáo ấm no, biến tổ ấm thành thiên đường",
    meaning: "Nữ hoàng ngồi giữa muôn hoa và muông thú, ôm đồng tiền vàng với tình yêu thương bao la. Người phụ nữ biết chăm sóc và đem lại cảm giác ấm cúng nhất trần đời.",
    advice: "Tự tạo cho mình một không gian sống thật ấm cúng, thơm tho và thoải mái."
  },
  {
    id: 77,
    name: "King of Pentacles - Vua Tiền",
    nameEn: "King of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    symbol: "👑",
    keywords: "Tài phiệt hào phóng, bến đỗ vững như bàn thạch, sự che chở sung túc",
    meaning: "Vị vua ngồi trên ngai vàng khắc hình đầu bò đực uy nghiêm giữa lâu đài nguy nga. Người đàn ông thành đạt, có thể chu cấp và lo lắng cho nàng cả đời bình an.",
    advice: "Tìm kiếm sự an toàn và vững chãi, nàng hoàn toàn xứng đáng với một tình yêu đủ đầy cả vật chất lẫn tinh thần."
  }
];
