using System.Text.Json.Serialization;

namespace QuanLyPhuongTienChungCu.Models;

public class LuotGuiXe
{
    public long LuotGuiXeId { get; set; }

    // Xe cư dân thì có PhuongTienId.
    // Xe khách thì null.
    public long? PhuongTienId { get; set; }

    // Lưu biển số ngay tại thời điểm gửi xe
    public string BienSo { get; set; } = string.Empty;

    // Xe máy / ô tô / xe điện / xe đạp...
    public long LoaiPhuongTienId { get; set; }

    public DateTime ThoiGianVao { get; set; }

    public DateTime? ThoiGianRa { get; set; }

    public decimal? SoTien { get; set; }

    // ACTIVE / COMPLETED
    public string TrangThai { get; set; } = "ACTIVE";

    public long NguoiTaoId { get; set; }

    [JsonIgnore]
    public PhuongTien? PhuongTien { get; set; }

    [JsonIgnore]
    public LoaiPhuongTien? LoaiPhuongTien { get; set; }
}