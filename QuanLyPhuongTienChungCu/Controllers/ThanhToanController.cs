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

    // =========================================================
    // HELPER
    // =========================================================

    private long? LayUserIdHienTai()
    {
        var claim = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier
        )?.Value;

        return long.TryParse(claim, out var id) ? id : null;
    }

    // =========================================================
    // TẠO THANH TOÁN
    // POST: api/ThanhToan
    // =========================================================

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

    // =========================================================
    // LẤY TẤT CẢ THANH TOÁN (ADMIN / KẾ TOÁN)
    // GET: api/ThanhToan
    // =========================================================

    [HttpGet]
    [Authorize(Roles = "Admin,KeToan")]
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

    // =========================================================
    // LẤY THANH TOÁN THEO ID
    // GET: api/ThanhToan/5
    // =========================================================

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

    // =========================================================
    // HÓA ĐƠN CỦA CƯ DÂN
    // GET: api/ThanhToan/cua-toi/{userId}
    // - Admin/KeToan: xem bất kỳ ai
    // - Cư dân: chỉ xem chính mình
    // =========================================================

    [HttpGet("cua-toi/{userId:long}")]
    public async Task<IActionResult> GetHoaDonCuaToi(long userId)
    {
        var userIdHienTai = LayUserIdHienTai();
        var laAdmin = User.IsInRole("Admin") || User.IsInRole("KeToan");

        // ✅ Chỉ Admin/KeToan HOẶC chính chủ mới xem được
        if (!laAdmin && userIdHienTai != userId)
        {
            return Forbid();
        }

        // Lấy các lượt gửi xe thuộc phương tiện của cư dân này
        var danhSach = await _context.LuotGuiXes
            .AsNoTracking()
            .Include(l => l.PhuongTien)
                .ThenInclude(p => p!.LoaiPhuongTien)
            .Where(l =>
                l.PhuongTien != null &&
                l.PhuongTien.UserId == userId)
            .OrderByDescending(l => l.ThoiGianVao)
            .Select(l => new
            {
                id = l.LuotGuiXeId,

                maHoaDon = "HD" + l.LuotGuiXeId.ToString("D6"),

                ngayTao = l.ThoiGianRa != null
                    ? l.ThoiGianRa.Value.ToString("dd/MM/yyyy HH:mm")
                    : l.ThoiGianVao.ToString("dd/MM/yyyy HH:mm"),

                loaiXe = l.PhuongTien != null &&
                         l.PhuongTien.LoaiPhuongTien != null
                            ? l.PhuongTien.LoaiPhuongTien.TenLoai
                            : "—",

                bienSo = l.BienSo,

                soTien = l.SoTien ?? 0,

                trangThai = _context.ThanhToans
                    .Any(t => t.LuotGuiXeId == l.LuotGuiXeId)
                        ? "Đã thanh toán"
                        : (l.ThoiGianRa != null
                            ? "Chờ thanh toán"
                            : "Đang gửi"),

                thoiGianGui =
                    l.ThoiGianVao.ToString("dd/MM/yyyy HH:mm") +
                    " - " +
                    (l.ThoiGianRa != null
                        ? l.ThoiGianRa.Value.ToString("dd/MM/yyyy HH:mm")
                        : "N/A"),

                chiTietPhi = new[]
                {
                    new
                    {
                        loaiPhi = "Phí gửi xe",
                        donGia = (l.SoTien ?? 0).ToString("N0") + "đ",
                        thoiGian =
                            l.ThoiGianVao.ToString("dd/MM HH:mm") +
                            " - " +
                            (l.ThoiGianRa != null
                                ? l.ThoiGianRa.Value.ToString("dd/MM HH:mm")
                                : "N/A"),
                        thanhTien = l.SoTien ?? 0
                    }
                }
            })
            .ToListAsync();

        return Ok(danhSach);
    }
}