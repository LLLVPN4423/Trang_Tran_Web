using TrangTranHair.Application.DTOs;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Common;

public static class ShippingCalculator
{
    public static decimal GetFee(ShippingZone zone) =>
        zone switch
        {
            ShippingZone.SocTrangCity => 20_000m,
            ShippingZone.SocTrangProvince => 35_000m,
            ShippingZone.MekongNearby => 45_000m,
            ShippingZone.Nationwide => 55_000m,
            _ => 55_000m,
        };

    public static string GetLabel(ShippingZone zone) =>
        zone switch
        {
            ShippingZone.SocTrangCity => "Sóc Trăng nội thành",
            ShippingZone.SocTrangProvince => "Sóc Trăng huyện / lân cận",
            ShippingZone.MekongNearby => "Cần Thơ · An Giang · Bạc Liêu…",
            ShippingZone.Nationwide => "TP lớn / tỉnh xa",
            _ => zone.ToString(),
        };

    public static IReadOnlyList<ShippingZoneOption> ListZones() =>
        Enum.GetValues<ShippingZone>()
            .Select(z => new ShippingZoneOption(z, GetLabel(z), GetFee(z)))
            .ToList();
}
