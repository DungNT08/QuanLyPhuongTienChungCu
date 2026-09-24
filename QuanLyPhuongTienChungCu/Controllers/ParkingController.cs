using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Data;
using QuanLyPhuongTienChungCu.Dtos;
using QuanLyPhuongTienChungCu.Models;
using QuanLyPhuongTienChungCu.Services;
using System.Security.Claims;

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

    // =====================================================
    // HELPER
    // =====================================================

    private long? LayUserId()
    {
        var claim = User.FindFirst(
            ClaimTypes.NameIdentifier
        )?.Value;

        if (long.TryParse(claim, out var userId))
        {
            return userId;
        }

        return null;
    }

    private string? LayRole()
    {
        return User.FindFirst(
            ClaimTypes.Role
        )?.Value;
    }

    // =====================================================
    // XE CƯ DÂN - CHECK IN
    // ADMIN / BẢO VỆ
    //
    // POST: /api/Parking/check-in
    // =====================================================

    [Authorize(Roles = "Admin,BaoVe")]
    [HttpPost("check-in")]
    public async Task<ActionResult<LuotGuiXe>> CheckIn(
        CheckInDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.BienSo))
        {
            return BadRequest(new
            {
                message =
                    "Biển số không được để trống."
            });
        }

        var bienSo = dto.BienSo.Trim();

        var phuongTien =
            await _context.PhuongTiens
                .FirstOrDefaultAsync(x =>
                    x.BienSo == bienSo);

        if (phuongTien == null)
        {
            return BadRequest(new
            {
                message =
                    "Phương tiện cư dân không tồn tại."
            });
        }

        if (phuongTien.TrangThai == "INACTIVE")
        {
            return BadRequest(new
            {
                message =
                    "Phương tiện đã ngừng hoạt động."
            });
        }

        var dangGui =
            await _context.LuotGuiXes
                .AnyAsync(x =>
                    x.PhuongTienId ==
                        phuongTien.PhuongTienId
                    &&
                    x.TrangThai == "ACTIVE");

        if (dangGui)
        {
            return Conflict(new
            {
                message =
                    "Phương tiện đang có một lượt gửi xe ACTIVE."
            });
        }

        var userId = LayUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message =
                    "Không xác định được người dùng."
            });
        }

        var luotGuiXe = new LuotGuiXe
        {
            PhuongTienId =
                phuongTien.PhuongTienId,

            BienSo =
                phuongTien.BienSo,

            LoaiPhuongTienId =
                phuongTien.LoaiPhuongTienId,

            ThoiGianVao =
                DateTime.Now,

            ThoiGianRa = null,

            SoTien = null,

            TrangThai =
                "ACTIVE",

            NguoiTaoId =
                userId.Value
        };

        _context.LuotGuiXes.Add(luotGuiXe);

        await _context.SaveChangesAsync();

        await _auditLogService.GhiLog(
            userId,
            "CREATE",
            "LuotGuiXe",
            luotGuiXe.LuotGuiXeId,
            $"Check-in xe cu dan {luotGuiXe.BienSo}"
        );

        return Ok(luotGuiXe);
    }

    // =====================================================
    // XE KHÁCH - CHECK IN
    //
    // POST: /api/Parking/guest-check-in
    // =====================================================

    [Authorize(Roles = "Admin,BaoVe")]
    [HttpPost("guest-check-in")]
    public async Task<ActionResult<object>> GuestCheckIn(
        GuestCheckInDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.BienSo))
        {
            return BadRequest(new
            {
                message =
                    "Biển số không được để trống."
            });
        }

        var bienSo = dto.BienSo.Trim();

        var loaiXe =
            await _context.LoaiPhuongTiens
                .FirstOrDefaultAsync(x =>
                    x.LoaiPhuongTienId ==
                    dto.LoaiPhuongTienId);

        if (loaiXe == null)
        {
            return BadRequest(new
            {
                message =
                    "Loại phương tiện không tồn tại."
            });
        }

        var trungXeCuDan =
            await _context.PhuongTiens
                .AnyAsync(x =>
                    x.BienSo == bienSo);

        if (trungXeCuDan)
        {
            return Conflict(new
            {
                message =
                    $"Biển số {bienSo} đã thuộc phương tiện cư dân. " +
                    "Không thể ghi nhận là xe khách."
            });
        }

        var xeKhachDangGui =
            await _context.LuotGuiXes
                .AnyAsync(x =>
                    x.PhuongTienId == null
                    &&
                    x.BienSo == bienSo
                    &&
                    x.TrangThai == "ACTIVE");

        if (xeKhachDangGui)
        {
            return Conflict(new
            {
                message =
                    $"Xe khách {bienSo} đang gửi trong chung cư."
            });
        }

        var userId = LayUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message =
                    "Không xác định được người dùng."
            });
        }

        var luotGuiXe = new LuotGuiXe
        {
            PhuongTienId = null,

            BienSo = bienSo,

            LoaiPhuongTienId =
                dto.LoaiPhuongTienId,

            ThoiGianVao =
                DateTime.Now,

            ThoiGianRa = null,

            SoTien = null,

            TrangThai =
                "ACTIVE",

            NguoiTaoId =
                userId.Value
        };

        _context.LuotGuiXes.Add(luotGuiXe);

        await _context.SaveChangesAsync();

        await _auditLogService.GhiLog(
            userId,
            "CREATE",
            "LuotGuiXe",
            luotGuiXe.LuotGuiXeId,
            $"Check-in xe khach {luotGuiXe.BienSo}"
        );

        return Ok(new
        {
            luotGuiXeId =
                luotGuiXe.LuotGuiXeId,

            phuongTienId =
                (long?)null,

            bienSo =
                luotGuiXe.BienSo,

            loaiPhuongTienId =
                luotGuiXe.LoaiPhuongTienId,

            loaiXe =
                loaiXe.TenLoai,

            thoiGianVao =
                luotGuiXe.ThoiGianVao,

            thoiGianRa =
                (DateTime?)null,

            soTien =
                (decimal?)null,

            trangThai =
                luotGuiXe.TrangThai,

            cuDan =
                (string?)null,

            canHo =
                (string?)null,

            laXeKhach = true
        });
    }

    // =====================================================
    // ACTIVE
    //
    // GET: /api/Parking/active
    //
    // Trả về:
    // - Biển số
    // - Loại xe
    // - Cư dân
    // - Căn hộ
    // - Thời gian vào
    // - Trạng thái
    // =====================================================

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<object>>>
        GetActive()
    {
        var query =
            _context.LuotGuiXes
                .AsNoTracking()
                .Include(x => x.PhuongTien)
                .Include(x => x.LoaiPhuongTien)
                .Where(x =>
                    x.TrangThai == "ACTIVE")
                .AsQueryable();

        // =================================================
        // NẾU LÀ CƯ DÂN
        // Chỉ xem xe của chính mình
        // =================================================

        var role = LayRole();

        if (role == "CuDan")
        {
            var userId = LayUserId();

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Không xác định được người dùng."
                });
            }

            query = query.Where(x =>
                x.PhuongTien != null &&
                x.PhuongTien.UserId == userId);
        }

        // =================================================
        // LẤY DỮ LIỆU
        // =================================================

        var danhSach =
            await query
                .OrderByDescending(x =>
                    x.ThoiGianVao)
                .Select(x => new
                {
                    // ==============================
                    // ID
                    // ==============================

                    luotGuiXeId =
                        x.LuotGuiXeId,

                    phuongTienId =
                        x.PhuongTienId,

                    // ==============================
                    // BIỂN SỐ
                    // ==============================

                    bienSo =
                        x.BienSo,

                    // ==============================
                    // LOẠI PHƯƠNG TIỆN
                    // ==============================

                    loaiPhuongTienId =
                        x.LoaiPhuongTienId,

                    loaiXe =
                        x.LoaiPhuongTien != null
                            ? x.LoaiPhuongTien.TenLoai
                            : "",

                    // ==============================
                    // CƯ DÂN
                    // ==============================

                    cuDan =
                        x.PhuongTien != null
                            ? _context.Users
                                .Where(u =>
                                    u.UserId ==
                                    x.PhuongTien.UserId)
                                .Select(u =>
                                    u.HoTen)
                                .FirstOrDefault()
                            : null,

                    // ==============================
                    // CĂN HỘ
                    // ==============================

                    canHo =
                        x.PhuongTien != null
                            ? _context.CanHos
                                .Where(c =>
                                    c.UserId ==
                                    x.PhuongTien.UserId)
                                .Select(c =>
                                    c.MaCanHo)
                                .FirstOrDefault()
                            : null,

                    // ==============================
                    // THỜI GIAN
                    // ==============================

                    thoiGianVao =
                        x.ThoiGianVao,

                    thoiGianRa =
                        x.ThoiGianRa,

                    // ==============================
                    // TIỀN
                    // ==============================

                    soTien =
                        x.SoTien,

                    // ==============================
                    // TRẠNG THÁI
                    // ==============================

                    trangThai =
                        x.TrangThai,

                    // ==============================
                    // XE KHÁCH
                    // ==============================

                    laXeKhach =
                        x.PhuongTienId == null
                })
                .ToListAsync();

        return Ok(danhSach);
    }

    // =====================================================
    // XE KHÁCH - DANH SÁCH
    //
    // GET: /api/Parking/guest
    // =====================================================

    [Authorize(Roles = "Admin,BaoVe")]
    [HttpGet("guest")]
    public async Task<ActionResult<IEnumerable<object>>>
        GetGuest()
    {
        var danhSach =
            await _context.LuotGuiXes
                .AsNoTracking()
                .Include(x => x.LoaiPhuongTien)
                .Where(x =>
                    x.PhuongTienId == null)
                .OrderByDescending(x =>
                    x.ThoiGianVao)
                .Select(x => new
                {
                    luotGuiXeId =
                        x.LuotGuiXeId,

                    phuongTienId =
                        x.PhuongTienId,

                    bienSo =
                        x.BienSo,

                    loaiPhuongTienId =
                        x.LoaiPhuongTienId,

                    loaiXe =
                        x.LoaiPhuongTien != null
                            ? x.LoaiPhuongTien.TenLoai
                            : "",

                    thoiGianVao =
                        x.ThoiGianVao,

                    thoiGianRa =
                        x.ThoiGianRa,

                    soTien =
                        x.SoTien,

                    trangThai =
                        x.TrangThai,

                    cuDan =
                        (string?)null,

                    canHo =
                        (string?)null,

                    laXeKhach = true
                })
                .ToListAsync();

        return Ok(danhSach);
    }

    // =====================================================
    // CHECK OUT
    //
    // POST: /api/Parking/check-out
    // =====================================================

    [Authorize(Roles = "Admin,BaoVe")]
    [HttpPost("check-out")]
    public async Task<ActionResult<object>> CheckOut(
        CheckOutDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.BienSo))
        {
            return BadRequest(new
            {
                message =
                    "Biển số không được để trống."
            });
        }

        var bienSo = dto.BienSo.Trim();

        var luotGuiXe =
            await _context.LuotGuiXes
                .Include(x => x.LoaiPhuongTien)
                .FirstOrDefaultAsync(x =>
                    x.BienSo == bienSo
                    &&
                    x.TrangThai == "ACTIVE");

        if (luotGuiXe == null)
        {
            return BadRequest(new
            {
                message =
                    "Không tìm thấy lượt gửi xe ACTIVE."
            });
        }

        var thoiGianRa =
            DateTime.Now;

        var bangGia =
            await _context.BangGias
                .Where(x =>
                    x.LoaiPhuongTienId ==
                        luotGuiXe.LoaiPhuongTienId
                    &&
                    x.TrangThai == "ACTIVE"
                    &&
                    x.HieuLucTu <= thoiGianRa
                    &&
                    (
                        x.HieuLucDen == null
                        ||
                        x.HieuLucDen > thoiGianRa
                    ))
                .OrderByDescending(x =>
                    x.HieuLucTu)
                .FirstOrDefaultAsync();

        if (bangGia == null)
        {
            return BadRequest(new
            {
                message =
                    "Không tìm thấy bảng giá phù hợp."
            });
        }

        var soGio =
            Math.Ceiling(
                (
                    thoiGianRa -
                    luotGuiXe.ThoiGianVao
                ).TotalHours
            );

        if (soGio < 1)
        {
            soGio = 1;
        }

        var userId = LayUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message =
                    "Không xác định được người dùng."
            });
        }

        luotGuiXe.ThoiGianRa =
            thoiGianRa;

        luotGuiXe.SoTien =
            (decimal)soGio *
            bangGia.DonGia;

        luotGuiXe.TrangThai =
            "COMPLETED";

        await _context.SaveChangesAsync();

        await _auditLogService.GhiLog(
            userId,
            "UPDATE",
            "LuotGuiXe",
            luotGuiXe.LuotGuiXeId,
            $"Check-out {luotGuiXe.BienSo}, so tien {luotGuiXe.SoTien:0}"
        );

        return Ok(new
        {
            luotGuiXeId =
                luotGuiXe.LuotGuiXeId,

            phuongTienId =
                luotGuiXe.PhuongTienId,

            bienSo =
                luotGuiXe.BienSo,

            loaiXe =
                luotGuiXe.LoaiPhuongTien != null
                    ? luotGuiXe.LoaiPhuongTien.TenLoai
                    : "",

            thoiGianVao =
                luotGuiXe.ThoiGianVao,

            thoiGianRa =
                luotGuiXe.ThoiGianRa,

            soTien =
                luotGuiXe.SoTien,

            trangThai =
                luotGuiXe.TrangThai,

            laXeKhach =
                luotGuiXe.PhuongTienId == null
        });
    }

    // =====================================================
    // HISTORY
    //
    // GET: /api/Parking/history
    // =====================================================

    [HttpGet("history")]
    public async Task<ActionResult<IEnumerable<object>>>
        GetHistory()
    {
        var query =
            _context.LuotGuiXes
                .AsNoTracking()
                .Include(x => x.PhuongTien)
                .Include(x => x.LoaiPhuongTien)
                .AsQueryable();

        var role = LayRole();

        if (role == "CuDan")
        {
            var userId = LayUserId();

            if (userId == null)
            {
                return Unauthorized();
            }

            query = query.Where(x =>
                x.PhuongTien != null &&
                x.PhuongTien.UserId == userId);
        }

        var danhSach =
            await query
                .OrderByDescending(x =>
                    x.ThoiGianVao)
                .Select(x => new
                {
                    luotGuiXeId =
                        x.LuotGuiXeId,

                    phuongTienId =
                        x.PhuongTienId,

                    bienSo =
                        x.BienSo,

                    loaiPhuongTienId =
                        x.LoaiPhuongTienId,

                    loaiXe =
                        x.LoaiPhuongTien != null
                            ? x.LoaiPhuongTien.TenLoai
                            : "",

                    thoiGianVao =
                        x.ThoiGianVao,

                    thoiGianRa =
                        x.ThoiGianRa,

                    soTien =
                        x.SoTien,

                    trangThai =
                        x.TrangThai,

                    laXeKhach =
                        x.PhuongTienId == null
                })
                .ToListAsync();

        return Ok(danhSach);
    }

    // =====================================================
    // LOẠI PHƯƠNG TIỆN
    //
    // GET: /api/Parking/loai-phuong-tien
    // =====================================================

    [HttpGet("loai-phuong-tien")]
    public async Task<ActionResult<IEnumerable<object>>>
        GetLoaiPhuongTien()
    {
        var danhSach =
            await _context.LoaiPhuongTiens
                .AsNoTracking()
                .OrderBy(x =>
                    x.LoaiPhuongTienId)
                .Select(x => new
                {
                    id =
                        x.LoaiPhuongTienId,

                    tenLoai =
                        x.TenLoai,

                    moTa =
                        x.MoTa
                })
                .ToListAsync();

        return Ok(danhSach);
    }
}