using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Data;
using QuanLyPhuongTienChungCu.Dtos;
using QuanLyPhuongTienChungCu.Models;
using Microsoft.AspNetCore.Authorization;
using QuanLyPhuongTienChungCu.Services;

namespace QuanLyPhuongTienChungCu.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ParkingController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuditLogService _auditLogService;

    public ParkingController(
        AppDbContext context,
        AuditLogService auditLogService)
    {
        _context = context;
        _auditLogService = auditLogService;
    }

    [Authorize(Roles = "Admin,BanQuanLy,BaoVe")]
    [HttpPost("check-in")]
    public async Task<ActionResult<LuotGuiXe>> CheckIn(CheckInDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.BienSo))
        {
            return BadRequest("Bien so khong duoc de trong.");
        }

        var bienSo = dto.BienSo.Trim();

        var phuongTien = await _context.PhuongTiens
            .FirstOrDefaultAsync(x => x.BienSo == bienSo);

        if (phuongTien == null)
        {
            return BadRequest("Phuong tien khong ton tai.");
        }

        var dangGui = await _context.LuotGuiXes
            .AnyAsync(x =>
                x.PhuongTienId == phuongTien.PhuongTienId &&
                x.TrangThai == "ACTIVE");

        if (dangGui)
        {
            return Conflict("Phuong tien dang co mot luot gui xe ACTIVE.");
        }

        var userIdClaim = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier
        )?.Value;

        if (!long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var luotGuiXe = new LuotGuiXe
        {
            PhuongTienId = phuongTien.PhuongTienId,
            BienSo = phuongTien.BienSo,
            LoaiPhuongTienId = phuongTien.LoaiPhuongTienId,
            ThoiGianVao = DateTime.Now,
            TrangThai = "ACTIVE",
            NguoiTaoId = userId
        };

        _context.LuotGuiXes.Add(luotGuiXe);

        await _context.SaveChangesAsync();

        await _auditLogService.GhiLog(
            userId,
            "CREATE",
            "LuotGuiXe",
            luotGuiXe.LuotGuiXeId,
            $"Check-in phuong tien {luotGuiXe.BienSo}"
        );

        return Ok(luotGuiXe);
    }
    
    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<LuotGuiXe>>> GetActive()
    {
        var query = _context.LuotGuiXes
            .Include(x => x.PhuongTien)
            .Where(x => x.TrangThai == "ACTIVE")
            .AsQueryable();

        var role = User.FindFirst(
            System.Security.Claims.ClaimTypes.Role
        )?.Value;

        if (role == "CuDan")
        {
            var userIdClaim = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            query = query.Where(x =>
                x.PhuongTien != null &&
                x.PhuongTien.UserId == userId);
        }

        var danhSach = await query
            .OrderByDescending(x => x.ThoiGianVao)
            .ToListAsync();

        return Ok(danhSach);
    }

    [Authorize(Roles = "Admin,BanQuanLy,BaoVe")]
    [HttpPost("check-out")]
    public async Task<ActionResult<LuotGuiXe>> CheckOut(CheckOutDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.BienSo))
        {
            return BadRequest("Bien so khong duoc de trong.");
        }

        var bienSo = dto.BienSo.Trim();

        var luotGuiXe = await _context.LuotGuiXes
            .FirstOrDefaultAsync(x =>
                x.BienSo == bienSo &&
                x.TrangThai == "ACTIVE");

        if (luotGuiXe == null)
        {
            return BadRequest("Khong tim thay luot gui xe ACTIVE.");
        }

        var thoiGianRa = DateTime.Now;

        var bangGia = await _context.BangGias
            .Where(x =>
                x.LoaiPhuongTienId == luotGuiXe.LoaiPhuongTienId &&
                x.TrangThai == "ACTIVE" &&
                x.HieuLucTu <= thoiGianRa &&
                (x.HieuLucDen == null || x.HieuLucDen > thoiGianRa))
            .OrderByDescending(x => x.HieuLucTu)
            .FirstOrDefaultAsync();

        if (bangGia == null)
        {
            return BadRequest("Khong tim thay bang gia phu hop.");
        }

        var soGio = Math.Ceiling(
            (thoiGianRa - luotGuiXe.ThoiGianVao).TotalHours
        );

        if (soGio < 1)
        {
            soGio = 1;
        }

        var userIdClaim = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier
        )?.Value;

        if (!long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        luotGuiXe.ThoiGianRa = thoiGianRa;
        luotGuiXe.SoTien = (decimal)soGio * bangGia.DonGia;
        luotGuiXe.TrangThai = "COMPLETED";
        luotGuiXe.NguoiTaoId = userId;

        await _context.SaveChangesAsync();

        await _auditLogService.GhiLog(
            userId,
            "UPDATE",
            "LuotGuiXe",
            luotGuiXe.LuotGuiXeId,
            $"Check-out phuong tien {luotGuiXe.BienSo}, so tien {luotGuiXe.SoTien:0}"
        );

        return Ok(luotGuiXe);
    }

    [HttpGet("history")]
    public async Task<ActionResult<IEnumerable<LuotGuiXe>>> GetHistory()
    {
        var query = _context.LuotGuiXes
            .Include(x => x.PhuongTien)
            .AsQueryable();

        var role = User.FindFirst(
            System.Security.Claims.ClaimTypes.Role
        )?.Value;

        if (role == "CuDan")
        {
            var userIdClaim = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            query = query.Where(x =>
                x.PhuongTien != null &&
                x.PhuongTien.UserId == userId);
        }

        var danhSach = await query
            .OrderByDescending(x => x.ThoiGianVao)
            .ToListAsync();

        return Ok(danhSach);
    }
}