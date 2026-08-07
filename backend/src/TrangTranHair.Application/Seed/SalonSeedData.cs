using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Seed;

public static class SalonSeedData
{
    private static Dictionary<string, decimal> SizePrices(params (HairSize size, decimal price)[] tiers) =>
        tiers.ToDictionary(t => t.size.ToString(), t => t.price);

    public static List<Service> GetServices() =>
    [
        // ── CẮT TÓC ──
        new()
        {
            Id = "svc-cut-master",
            Name = "Cắt tóc — Mr. Trang Trần",
            Description = "Master stylist, tư vấn kiểu phù hợp khuôn mặt.",
            Category = ServiceCategory.Cut,
            StylistLevel = StylistLevel.MasterTrangTran,
            BasePrice = 300_000,
            DurationMinutes = 52
        },
        new()
        {
            Id = "svc-cut-senior",
            Name = "Cắt tóc — Senior Stylist",
            Category = ServiceCategory.Cut,
            StylistLevel = StylistLevel.Senior,
            BasePrice = 250_000,
            DurationMinutes = 52
        },
        new()
        {
            Id = "svc-cut-junior",
            Name = "Cắt tóc — Junior Stylist",
            Category = ServiceCategory.Cut,
            StylistLevel = StylistLevel.Junior,
            BasePrice = 200_000,
            DurationMinutes = 45
        },
        new()
        {
            Id = "svc-cut-bang",
            Name = "Cắt Mái",
            Category = ServiceCategory.Cut,
            StylistLevel = StylistLevel.BangTrim,
            BasePrice = 50_000,
            DurationMinutes = 30
        },

        // ── GỘI & TẠO KIỂU ──
        new()
        {
            Id = "svc-wash-relax",
            Name = "Gội Thư Giãn 45'",
            Description = "Dầu gội dưỡng + sấy + vuốt dưỡng. Giá tham khảo 120K — 150K.",
            Category = ServiceCategory.Styling,
            BasePrice = 120_000,
            DurationMinutes = 45
        },
        new()
        {
            Id = "svc-styling",
            Name = "Tạo Kiểu",
            Description = "Sấy chải / uốn / ép. Giá tham khảo 50K — 100K.",
            Category = ServiceCategory.Styling,
            BasePrice = 50_000,
            DurationMinutes = 37
        },

        // ── UỐN ──
        new()
        {
            Id = "svc-perm-ngon",
            Name = "Uốn c/ Ngọn",
            Description = "Công nghệ uốn ẩm, hạn chế hư tổn. Tóc dày/dài tính UpSize.",
            Category = ServiceCategory.Perm,
            PriceBySize = SizePrices(
                (HairSize.S, 700_000), (HairSize.M, 900_000),
                (HairSize.L, 1_100_000), (HairSize.XL, 1_300_000)),
            DurationMinutes = 240
        },
        new()
        {
            Id = "svc-perm-hippie",
            Name = "Uốn lơi / Hippie",
            Category = ServiceCategory.Perm,
            PriceBySize = SizePrices(
                (HairSize.S, 700_000), (HairSize.M, 1_000_000),
                (HairSize.L, 1_300_000), (HairSize.XL, 1_600_000)),
            DurationMinutes = 240
        },
        new()
        {
            Id = "svc-perm-cold",
            Name = "Uốn lạnh",
            Category = ServiceCategory.Perm,
            PriceBySize = SizePrices(
                (HairSize.S, 700_000), (HairSize.M, 900_000),
                (HairSize.L, 1_100_000), (HairSize.XL, 1_300_000)),
            DurationMinutes = 240
        },
        new()
        {
            Id = "svc-perm-root-volume",
            Name = "Uốn / Xã Phồng Chân",
            Category = ServiceCategory.Perm,
            BasePrice = 350_000,
            DurationMinutes = 90
        },
        new()
        {
            Id = "svc-perm-bang",
            Name = "Uốn / Duỗi Mái",
            Description = "Giá tham khảo 100K — 250K.",
            Category = ServiceCategory.Perm,
            BasePrice = 175_000,
            DurationMinutes = 105
        },

        // ── DUỖI ──
        new()
        {
            Id = "svc-straight-full",
            Name = "Duỗi Thẳng",
            Description = "Tuỳ tình trạng tóc stylist chọn công nghệ phù hợp.",
            Category = ServiceCategory.Straightening,
            PriceBySize = SizePrices(
                (HairSize.S, 800_000), (HairSize.M, 1_000_000),
                (HairSize.L, 1_200_000), (HairSize.XL, 1_400_000)),
            DurationMinutes = 240
        },
        new()
        {
            Id = "svc-straight-ends",
            Name = "Duỗi Chân",
            Category = ServiceCategory.Straightening,
            PriceBySize = SizePrices((HairSize.M, 500_000), (HairSize.L, 800_000)),
            DurationMinutes = 120
        },

        // ── NHUỘM / TẨY ──
        new()
        {
            Id = "svc-dye",
            Name = "Nhuộm",
            Description = "Sản phẩm: Silky, Goldwell, Joico, Guytang, Moroccanoil... Vegan/Free Amoniac cộng thêm 200K — 600K.",
            Category = ServiceCategory.Dye,
            PriceBySize = SizePrices(
                (HairSize.S, 800_000), (HairSize.M, 1_000_000),
                (HairSize.L, 1_200_000), (HairSize.XL, 1_400_000)),
            DurationMinutes = 120
        },
        new()
        {
            Id = "svc-tone-up",
            Name = "Nâng Tone",
            Category = ServiceCategory.Dye,
            PriceBySize = SizePrices(
                (HairSize.S, 450_000), (HairSize.M, 500_000),
                (HairSize.L, 550_000), (HairSize.XL, 600_000)),
            DurationMinutes = 240
        },
        new()
        {
            Id = "svc-bleach-once",
            Name = "Tẩy 1 lần",
            Category = ServiceCategory.Bleach,
            PriceBySize = SizePrices(
                (HairSize.S, 800_000), (HairSize.M, 1_000_000),
                (HairSize.L, 1_200_000), (HairSize.XL, 1_400_000)),
            DurationMinutes = 300
        },
        new()
        {
            Id = "svc-color-remove",
            Name = "Bóc Màu",
            Description = "Dành cho tóc nhuộm đen/nâu đen/đỏ muốn đổi màu. Tuỳ tình trạng tóc.",
            Category = ServiceCategory.Bleach,
            PriceBySize = SizePrices(
                (HairSize.S, 1_000_000), (HairSize.M, 1_200_000),
                (HairSize.L, 1_400_000), (HairSize.XL, 1_600_000)),
            DurationMinutes = 300
        },
        new()
        {
            Id = "svc-bleach-roots-l8",
            Name = "Tẩy Nối Chân Level 8 — 8.5",
            Description = "Quy trình phức tạp, nhiều bước. Giá tham khảo 800K — 1.000K. Liên hệ tư vấn.",
            Category = ServiceCategory.Bleach,
            BasePrice = 900_000,
            DurationMinutes = 420
        },
        new()
        {
            Id = "svc-bleach-roots-l9",
            Name = "Tẩy Nối Chân Level 9 — 10",
            Description = "Giá tham khảo 1.300K — 1.500K. Thời gian 6 — 10 tiếng.",
            Category = ServiceCategory.Bleach,
            BasePrice = 1_400_000,
            DurationMinutes = 480
        },
        new()
        {
            Id = "svc-root-touchup",
            Name = "Dặm Chân",
            Description = "Chân tóc dưới 7 cm. Giá 500K — 600K.",
            Category = ServiceCategory.Dye,
            BasePrice = 550_000,
            DurationMinutes = 120
        },

        // ── NHUỘM SÁNG TẠO ──
        new()
        {
            Id = "svc-highlight-full",
            Name = "High Light Full",
            Description = "Tẩy + toner highlight full head. Chưa bao gồm nhuộm nền.",
            Category = ServiceCategory.Highlight,
            PriceBySize = SizePrices(
                (HairSize.S, 1_200_000), (HairSize.M, 1_400_000),
                (HairSize.L, 1_600_000), (HairSize.XL, 1_800_000)),
            DurationMinutes = 360
        },
        new()
        {
            Id = "svc-balayage",
            Name = "Balayage",
            Description = "Kỹ thuật tẩy nhuộm cầu kì. M-L: 4.000K — 5.000K · XL: 5.000K — 6.000K. Thời gian 6 — 10 tiếng.",
            Category = ServiceCategory.Balayage,
            PriceBySize = SizePrices(
                (HairSize.S, 4_000_000), (HairSize.M, 4_500_000),
                (HairSize.L, 5_000_000), (HairSize.XL, 5_500_000)),
            DurationMinutes = 480
        },

        // ── PHỤC HỒI ──
        new()
        {
            Id = "svc-olaplex",
            Name = "Olaplex No 1 — 2",
            Description = "Sữa chữa liên kết hữu cơ bị hỏng trong quá trình tẩy nhuộm.",
            Category = ServiceCategory.Recovery,
            PriceBySize = SizePrices(
                (HairSize.S, 500_000), (HairSize.M, 700_000),
                (HairSize.L, 800_000), (HairSize.XL, 900_000)),
            DurationMinutes = 90
        },
        new()
        {
            Id = "svc-kpak",
            Name = "Treatment 4 Bước K-Pak",
            Description = "Tái tạo cấu trúc tóc, tạo độ ẩm cho tóc khô hư tổn.",
            Category = ServiceCategory.Recovery,
            PriceBySize = SizePrices(
                (HairSize.S, 700_000), (HairSize.M, 900_000),
                (HairSize.L, 1_100_000), (HairSize.XL, 1_300_000)),
            DurationMinutes = 150
        },
        new()
        {
            Id = "svc-keratin",
            Name = "Keratin Treatment",
            Description = "Bao bọc sợi tóc, cải thiện hư tổn nặng.",
            Category = ServiceCategory.Recovery,
            PriceBySize = SizePrices(
                (HairSize.S, 1_200_000), (HairSize.M, 1_500_000),
                (HairSize.L, 1_600_000), (HairSize.XL, 1_800_000)),
            DurationMinutes = 180
        },
        new()
        {
            Id = "svc-collagen",
            Name = "Hấp Dưỡng Collagen",
            Description = "Bổ sung độ ẩm, mềm mượt cho tóc.",
            Category = ServiceCategory.Recovery,
            PriceBySize = SizePrices(
                (HairSize.S, 300_000), (HairSize.M, 350_000),
                (HairSize.L, 400_000), (HairSize.XL, 500_000)),
            DurationMinutes = 60
        }
    ];

    public static List<Product> GetProducts() =>
    [
        new()
        {
            Id = "prd-mo-oil-100",
            Name = "Moroccanoil Treatment — 100ml",
            Description = "Dầu dưỡng argan iconic, phục hồi & bóng mượt.",
            Brand = "Moroccanoil",
            Price = 890_000,
            Stock = 30
        },
        new()
        {
            Id = "prd-mo-oil-25",
            Name = "Moroccanoil Treatment — 25ml",
            Description = "Size du lịch, dưỡng tóc khô & xơ rối.",
            Brand = "Moroccanoil",
            Price = 350_000,
            Stock = 50
        },
        new()
        {
            Id = "prd-mo-shampoo-250",
            Name = "Moroccanoil Moisture Repair Shampoo — 250ml",
            Description = "Dầu gội phục hồi độ ẩm cho tóc khô.",
            Brand = "Moroccanoil",
            Price = 620_000,
            Stock = 40
        },
        new()
        {
            Id = "prd-mo-conditioner-250",
            Name = "Moroccanoil Moisture Repair Conditioner — 250ml",
            Description = "Dầu xả dưỡng ẩm sâu, mềm mượt tức thì.",
            Brand = "Moroccanoil",
            Price = 620_000,
            Stock = 40
        },
        new()
        {
            Id = "prd-mo-mask-250",
            Name = "Moroccanoil Intense Hydrating Mask — 250ml",
            Description = "Mặt nạ dưỡng tóc chuyên sâu.",
            Brand = "Moroccanoil",
            Price = 780_000,
            Stock = 25
        },
        new()
        {
            Id = "prd-mo-spray-125",
            Name = "Moroccanoil Heat Protectant Spray — 125ml",
            Description = "Xịt bảo vệ nhiệt trước khi tạo kiểu.",
            Brand = "Moroccanoil",
            Price = 520_000,
            Stock = 35
        }
    ];

    public static List<Promotion> GetPromotions() =>
    [
        new()
        {
            Id = "promo-welcome10",
            Code = "WELCOME10",
            Name = "Chào mừng khách mới",
            Description = "Giảm 10% cho đơn đầu tiên.",
            Type = PromotionType.Percentage,
            Value = 10,
            MinOrderAmount = 200_000,
            MaxUses = 500,
            IsActive = true,
            ExpiresAt = DateTime.UtcNow.AddYears(1),
        },
        new()
        {
            Id = "promo-salon50k",
            Code = "SALON50K",
            Name = "Ưu đãi salon",
            Description = "Giảm 50.000đ cho đơn từ 500K.",
            Type = PromotionType.FixedAmount,
            Value = 50_000,
            MinOrderAmount = 500_000,
            MaxUses = 200,
            IsActive = true,
            ExpiresAt = DateTime.UtcNow.AddMonths(6),
        },
    ];
}
