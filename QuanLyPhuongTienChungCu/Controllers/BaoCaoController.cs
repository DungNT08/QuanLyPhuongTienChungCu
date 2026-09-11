using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Data;

namespace QuanLyPhuongTienChungCu.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,BanQuanLy,KeToan")]
public class BaoCaoController : ControllerBase
{
    private readonly AppDbContext _context;

    public BaoCaoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("tong-quan")]
    public async Task<IActionResult> TongQuan()
    {
        var tongPhuongTien = await _context.PhuongTiens.CountAsync();

        var xeDangGui = await _context.LuotGuiXes
            .CountAsync(x => x.TrangThai == "ACTIVE");

        var tongLuotGui = await _context.LuotGuiXes.CountAsync();

        var tongDoanhThu = await _context.ThanhToans
            .Where(x => x.TrangThai == "PAID")
            .SumAsync(x => (decimal?)x.SoTien) ?? 0;

        return Ok(new
        {
            tongPhuongTien,
            xeDangGui,
            tongLuotGui,
            tongDoanhThu
        });
    }

    [HttpGet("doanh-thu")]
    public async Task<IActionResult> DoanhThu(
        DateTime? tuNgay,
        DateTime? denNgay)
    {
        var query = _context.ThanhToans
            .Where(x => x.TrangThai == "PAID")
            .AsQueryable();

        if (tuNgay.HasValue)
        {
            query = query.Where(x =>
                x.ThoiGianThanhToan >= tuNgay.Value);
        }

        if (denNgay.HasValue)
        {
            var ngayKetThuc = denNgay.Value.Date.AddDays(1);

            query = query.Where(x =>
                x.ThoiGianThanhToan < ngayKetThuc);
        }

        var tongDoanhThu = await query
            .SumAsync(x => (decimal?)x.SoTien) ?? 0;

        var soGiaoDich = await query.CountAsync();

        return Ok(new
        {
            tuNgay,
            denNgay,
            soGiaoDich,
            tongDoanhThu
        });
    }

    [HttpGet("luot-gui")]
    public async Task<IActionResult> LuotGui(
        DateTime? tuNgay,
        DateTime? denNgay)
    {
        var query = _context.LuotGuiXes.AsQueryable();

        if (tuNgay.HasValue)
        {
            query = query.Where(x =>
                x.ThoiGianVao >= tuNgay.Value);
        }

        if (denNgay.HasValue)
        {
            var ngayKetThuc = denNgay.Value.Date.AddDays(1);

            query = query.Where(x =>
                x.ThoiGianVao < ngayKetThuc);
        }

        var tongLuotGui = await query.CountAsync();

        var dangGui = await query
            .CountAsync(x => x.TrangThai == "ACTIVE");

        var daRa = await query
            .CountAsync(x => x.TrangThai == "COMPLETED");

        return Ok(new
        {
            tuNgay,
            denNgay,
            tongLuotGui,
            dangGui,
            daRa
        });
    }
}