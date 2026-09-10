namespace QuanLyPhuongTienChungCu.Models;

public class AuditLog
{
    public long AuditLogId { get; set; }

    public long? UserId { get; set; }

    public string HanhDong { get; set; } = string.Empty;

    public string? DoiTuong { get; set; }

    public long? DoiTuongId { get; set; }

    public string? MoTa { get; set; }

    public DateTime ThoiGian { get; set; } = DateTime.Now;

    public User? User { get; set; }
}