namespace QuanLyPhuongTienChungCu.Dtos;

public class ThanhToanDto
{
    public long ThanhToanId { get; set; }
    public long LuotGuiXeId { get; set; }
    public string? BienSo { get; set; }
    public decimal SoTien { get; set; }
    public DateTime ThoiGianThanhToan { get; set; }
    public long NguoiThanhToanId { get; set; }
    public string TrangThai { get; set; } = "PAID";
}