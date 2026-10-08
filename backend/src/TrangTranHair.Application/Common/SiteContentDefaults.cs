using TrangTranHair.Application.DTOs;

namespace TrangTranHair.Application.Common;

public static class SiteContentDefaults
{
    public static SiteContentResponse Create() =>
        new(
            new HeroContentDto(
                "/images/hero/Hero.jpg",
                "Hair Salon · Editorial",
                "Trang Tran",
                "Where hair becomes art"),
            new ArtistContentDto(
                "/images/about/The Artist.jpg",
                "/images/about/The Artist 1.jpg",
                "The Artist",
                "Nghệ thuật trên từng",
                " sợi tóc",
                "Mr. Trang Trần — Master Stylist với hơn một thập kỷ kinh nghiệm trong nghệ thuật tạo kiểu editorial. Mỗi tác phẩm là sự kết hợp giữa kỹ thuật thuần túy và cảm hứng thời trang, biến mái tóc thành canvas sống động.",
                [
                    "Every strand tells a story.",
                    "Editorial precision.",
                    "Timeless elegance.",
                    "Crafted with intention.",
                    "Your canvas, reimagined.",
                ]),
            new LookbookSectionDto(
                "Salon Tour",
                "Lookbook",
                [
                    new(1, "Không gian salon", "/images/salon-tour/Salon Tour.jpg", "tall", 0.15),
                    new(2, "Studio styling", "/images/salon-tour/Salon Tour1.jpg", "wide", 0.08),
                    new(3, "Góc làm việc", "/images/salon-tour/Salon Tour2.jpg", "square", 0.22),
                    new(4, "Salon interior", "/images/salon-tour/Salon Tour3.jpg", "wide", 0.12),
                    new(5, "Chi tiết nội thất", "/images/salon-tour/Salon Tour4.jpg", "tall", 0.18),
                    new(6, "Khu vực gội", "/images/salon-tour/Salon Tour5.jpg", "square", 0.1),
                    new(7, "Không gian chờ", "/images/salon-tour/Salon Tour6.jpg", "square", 0.14),
                    new(8, "Gương & ánh sáng", "/images/salon-tour/Salon Tour7.jpg", "tall", 0.11),
                    new(9, "Team Trang Tran", "/images/salon-tour/Salon Tour8.jpg", "wide", 0.09),
                    new(10, "Salon tour", "/images/salon-tour/Salon Tour9.jpg", "square", 0.16),
                    new(11, "Trải nghiệm salon", "/images/salon-tour/Salon Tour10.jpg", "wide", 0.13),
                ]),
            new ContactContentDto(
                "0986 586 058",
                "0986586058",
                "18–19 LK2, KDC Tuấn Lan, Hùng Vương, TP. Sóc Trăng",
                "Tóc dày và dài sẽ được tính UpSize (S → M → L → XL)"),
            [
                new SocialLinkDto("Facebook", "https://www.facebook.com/TrangTranHair/"),
                new SocialLinkDto("Instagram", "https://www.instagram.com/trang_tran_hair"),
                new SocialLinkDto("Threads", "https://www.threads.com/@trang_tran_hair"),
                new SocialLinkDto("TikTok", "https://www.tiktok.com/@trangtranhair"),
                new SocialLinkDto("Portfolio", "https://trang-tran-portfolio.vercel.app/"),
            ]);
}
