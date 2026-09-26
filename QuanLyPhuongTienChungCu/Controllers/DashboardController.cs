using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Data;

namespace QuanLyPhuongTienChungCu.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Dashboard
    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        // Tổng phương tiện
        var tongPhuongTien = await _context.PhuongTiens.CountAsync();

        // Phân loại phương tiện
        var xeKhach = await _context.PhuongTiens
            .CountAsync();

        // Nếu bảng PhuongTien của bạn có LoaiPhuongTien
        // thì có thể lọc cụ thể tại đây.

        return Ok(new
        {
            tongPhuongTien,
            xeKhach,
            luotGui = 0,
            doanhThu = 0,

            tyLePhuongTien = new
            {
                oto = 0,
                xeMay = 0,
                xeDap = 0,
                khac = 0
            },

            luotGui7Ngay = new List<object>(),

            danhSachBang = new List<object>(),

            danhSachHoatDong = new List<object>()
        });
    }
}