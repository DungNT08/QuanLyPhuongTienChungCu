namespace QuanLyPhuongTienChungCu.Models;

public class ThongBao
{
    public long ThongBaoId { get; set; }

    public string TieuDe { get; set; } = string.Empty;

    public string NoiDung { get; set; } = string.Empty;

    // "TatCa" | "CuDan" | "NhanVien"
    public string DoiTuong { get; set; } = "TatCa";

    public DateTime NgayGui { get; set; } = DateTime.Now;

    public long NguoiGuiId { get; set; }

    public string TrangThai { get; set; } = "ACTIVE";
}