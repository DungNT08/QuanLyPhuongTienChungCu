namespace QuanLyPhuongTienChungCu.Dtos;

public class BangGiaDto
{
    public long BangGiaId { get; set; }

    public long LoaiPhuongTienId { get; set; }

    public string? TenLoaiPhuongTien { get; set; }

    public decimal DonGia { get; set; }

    public DateTime HieuLucTu { get; set; }

    public DateTime? HieuLucDen { get; set; }

    public string TrangThai { get; set; } = "ACTIVE";
}