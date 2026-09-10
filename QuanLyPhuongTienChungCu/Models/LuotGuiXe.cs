using System.Text.Json.Serialization;

namespace QuanLyPhuongTienChungCu.Models;

public class LuotGuiXe
{
    public long LuotGuiXeId { get; set; }

    public long PhuongTienId { get; set; }

    public string BienSo { get; set; } = string.Empty;

    public long LoaiPhuongTienId { get; set; }

    public DateTime ThoiGianVao { get; set; }

    public DateTime? ThoiGianRa { get; set; }

    public decimal? SoTien { get; set; }

    public string TrangThai { get; set; } = "ACTIVE";

    public long NguoiTaoId { get; set; }

    [JsonIgnore]
    public PhuongTien? PhuongTien { get; set; }

    [JsonIgnore]
    public LoaiPhuongTien? LoaiPhuongTien { get; set; }
}