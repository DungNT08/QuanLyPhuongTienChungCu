using QuanLyPhuongTienChungCu.Data;
using QuanLyPhuongTienChungCu.Models;

namespace QuanLyPhuongTienChungCu.Services;

public class AuditLogService
{
    private readonly AppDbContext _context;

    public AuditLogService(AppDbContext context)
    {
        _context = context;
    }

    public async Task GhiLog(
        long? userId,
        string hanhDong,
        string doiTuong,
        long? doiTuongId,
        string? moTa = null)
    {
        var log = new AuditLog
        {
            UserId = userId,
            HanhDong = hanhDong,
            DoiTuong = doiTuong,
            DoiTuongId = doiTuongId,
            MoTa = moTa,
            ThoiGian = DateTime.Now
        };

        _context.AuditLogs.Add(log);

        await _context.SaveChangesAsync();
    }
}