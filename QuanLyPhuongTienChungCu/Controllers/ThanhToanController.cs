using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Data;
using QuanLyPhuongTienChungCu.Dtos;
using QuanLyPhuongTienChungCu.Models;
using QuanLyPhuongTienChungCu.Services;
using Microsoft.AspNetCore.Authorization;

namespace QuanLyPhuongTienChungCu.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ThanhToanController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuditLogService _auditLogService;

    public ThanhToanController(
        AppDbContext context,
        AuditLogService auditLogService)
    {
        _context = context;
        _auditLogService = auditLogService;
    }

    [HttpPost]
    public async Task<ActionResult<ThanhToanDto>> Create(
        ThanhToan thanhToan)
    {
        var luotGuiXe = await _context.LuotGuiXes
            .FirstOrDefaultAsync(x =>
                x.LuotGuiXeId == thanhToan.LuotGuiXeId);

        if (luotGuiXe == null)
        {
            return BadRequest("Luot gui xe khong ton tai.");
        }

        if (luotGuiXe.TrangThai != "COMPLETED")
        {
            return BadRequest(
                "Luot gui xe chua hoan thanh, khong the thanh toan."
            );
        }

        if (!luotGuiXe.SoTien.HasValue)
        {
            return BadRequest(
                "Luot gui xe chua co so tien can thanh toan."
            );
        }

        var daThanhToan = await _context.ThanhToans
            .AnyAsync(x =>
                x.LuotGuiXeId == thanhToan.LuotGuiXeId);

        if (daThanhToan)
        {
            return Conflict(
                "Luot gui xe nay da duoc thanh toan."
            );
        }

        if (thanhToan.SoTien != luotGuiXe.SoTien.Value)
        {
            return BadRequest(
                "So tien thanh toan khong khop."
            );
        }

        var userIdClaim = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier
        )?.Value;

        if (!long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        thanhToan.NguoiThanhToanId = userId;
        thanhToan.ThoiGianThanhToan = DateTime.Now;
        thanhToan.TrangThai = "PAID";

        _context.ThanhToans.Add(thanhToan);
        await _context.SaveChangesAsync();

        // Ghi AuditLog sau khi thanh toan thanh cong
        await _auditLogService.GhiLog(
            userId,
            "CREATE",
            "ThanhToan",
            thanhToan.ThanhToanId,
           $"Thanh toan luot gui xe {luotGuiXe.LuotGuiXeId}, bien so {luotGuiXe.BienSo}, so tien {thanhToan.SoTien:0}"
        );

        var ketQua = new ThanhToanDto
        {
            ThanhToanId = thanhToan.ThanhToanId,
            LuotGuiXeId = thanhToan.LuotGuiXeId,
            BienSo = luotGuiXe.BienSo,
            SoTien = thanhToan.SoTien,
            ThoiGianThanhToan = thanhToan.ThoiGianThanhToan,
            NguoiThanhToanId = thanhToan.NguoiThanhToanId,
            TrangThai = thanhToan.TrangThai
        };

        return Ok(ketQua);
    }


    [HttpGet]
    public async Task<ActionResult<IEnumerable<ThanhToanDto>>> GetAll()
    {
        var danhSach = await _context.ThanhToans
            .Include(x => x.LuotGuiXe)
            .OrderByDescending(x => x.ThoiGianThanhToan)
            .Select(x => new ThanhToanDto
            {
                ThanhToanId = x.ThanhToanId,
                LuotGuiXeId = x.LuotGuiXeId,
                BienSo = x.LuotGuiXe!.BienSo,
                SoTien = x.SoTien,
                ThoiGianThanhToan = x.ThoiGianThanhToan,
                NguoiThanhToanId = x.NguoiThanhToanId,
                TrangThai = x.TrangThai
            })
            .ToListAsync();

        return Ok(danhSach);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ThanhToanDto>> GetById(long id)
    {
        var thanhToan = await _context.ThanhToans
            .Include(x => x.LuotGuiXe)
            .Where(x => x.ThanhToanId == id)
            .Select(x => new ThanhToanDto
            {
                ThanhToanId = x.ThanhToanId,
                LuotGuiXeId = x.LuotGuiXeId,
                BienSo = x.LuotGuiXe!.BienSo,
                SoTien = x.SoTien,
                ThoiGianThanhToan = x.ThoiGianThanhToan,
                NguoiThanhToanId = x.NguoiThanhToanId,
                TrangThai = x.TrangThai
            })
            .FirstOrDefaultAsync();

        if (thanhToan == null)
        {
            return NotFound("Thanh toan khong ton tai.");
        }

        return Ok(thanhToan);
    }
}