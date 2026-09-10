namespace QuanLyPhuongTienChungCu.Models;

public class BangGia
{
    public long BangGiaId { get; set; }

    public long LoaiPhuongTienId { get; set; }

    public decimal DonGia { get; set; }

    public DateTime HieuLucTu { get; set; }

    public DateTime? HieuLucDen { get; set; }

    public string TrangThai { get; set; } = "ACTIVE";

    public LoaiPhuongTien? LoaiPhuongTien { get; set; }
}