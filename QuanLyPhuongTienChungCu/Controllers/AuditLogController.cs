using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Data;

namespace QuanLyPhuongTienChungCu.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AuditLogController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuditLogController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var danhSach = await _context.AuditLogs
            .Include(x => x.User)
            .OrderByDescending(x => x.ThoiGian)
            .Select(x => new
            {
                x.AuditLogId,
                x.UserId,
                tenNguoiDung = x.User != null
                    ? x.User.HoTen
                    : null,
                x.HanhDong,
                x.DoiTuong,
                x.DoiTuongId,
                x.MoTa,
                x.ThoiGian
            })
            .ToListAsync();

        return Ok(danhSach);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(long id)
    {
        var log = await _context.AuditLogs
            .Include(x => x.User)
            .Where(x => x.AuditLogId == id)
            .Select(x => new
            {
                x.AuditLogId,
                x.UserId,
                tenNguoiDung = x.User != null
                    ? x.User.HoTen
                    : null,
                x.HanhDong,
                x.DoiTuong,
                x.DoiTuongId,
                x.MoTa,
                x.ThoiGian
            })
            .FirstOrDefaultAsync();

        if (log == null)
        {
            return NotFound("AuditLog khong ton tai.");
        }

        return Ok(log);
    }
}