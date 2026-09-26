namespace QuanLyPhuongTienChungCu.Models;

public class BangGia
{
    public long BangGiaId { get; set; }

    public long LoaiPhuongTienId { get; set; }

    public decimal DonGia { get; set; }

    // PER_TURN = Khách
    // MONTHLY = Cư dân
    public string LoaiTinhPhi { get; set; } = "PER_TURN";

    public DateTime HieuLucTu { get; set; }

    public DateTime? HieuLucDen { get; set; }

    public string TrangThai { get; set; } = "ACTIVE";

    public LoaiPhuongTien? LoaiPhuongTien { get; set; }
}