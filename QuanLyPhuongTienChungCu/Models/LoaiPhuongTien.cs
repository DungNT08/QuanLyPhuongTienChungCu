namespace QuanLyPhuongTienChungCu.Models;

public class LoaiPhuongTien
{
    public long LoaiPhuongTienId { get; set; }

    public string TenLoai { get; set; } = string.Empty;

    public string? MoTa { get; set; }

    public ICollection<PhuongTien> PhuongTiens { get; set; }
        = new List<PhuongTien>();

    public ICollection<BangGia> BangGias { get; set; }
        = new List<BangGia>();
}