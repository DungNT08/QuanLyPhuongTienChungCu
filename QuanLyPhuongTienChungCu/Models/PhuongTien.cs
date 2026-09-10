using System.Text.Json.Serialization;

namespace QuanLyPhuongTienChungCu.Models;

public class PhuongTien
{
    public long PhuongTienId { get; set; }

    public string BienSo { get; set; } = string.Empty;

    public long LoaiPhuongTienId { get; set; }
    public long? UserId { get; set; }
    public string? TenChuXe { get; set; }

    public string? MaCanHo { get; set; }

    public string TrangThai { get; set; } = "ACTIVE";

    public DateTime NgayTao { get; set; } = DateTime.Now;

    [JsonIgnore]
    public User? User { get; set; }

    [JsonIgnore]
    public LoaiPhuongTien? LoaiPhuongTien { get; set; }

    [JsonIgnore]
    public ICollection<LuotGuiXe> LuotGuiXes { get; set; }
        = new List<LuotGuiXe>();
}