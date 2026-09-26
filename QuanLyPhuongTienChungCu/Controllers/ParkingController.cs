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
    // CHECK-IN XE CƯ DÂN
    // POST: /api/Parking/check-in
    // =====================================================

    [Authorize(Roles = "Admin,BaoVe")]
    [HttpPost("check-in")]
    public async Task<ActionResult<object>> CheckIn(
        CheckInDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.BienSo))
        {
            return BadRequest(new
            {
                message = "Biển số không được để trống."
            });
        }

        var bienSo = dto.BienSo.Trim();

        // -------------------------------------------------
        // TÌM PHƯƠNG TIỆN CƯ DÂN
        // -------------------------------------------------

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

        // -------------------------------------------------
        // KIỂM TRA ĐANG GỬI
        // -------------------------------------------------

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

        // -------------------------------------------------
        // USER JWT
        // -------------------------------------------------

        var userId = LayUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message =
                    "Không xác định được người dùng từ JWT."
            });
        }

        // -------------------------------------------------
        // TẠO LƯỢT GỬI
        // -------------------------------------------------

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

            ThoiGianRa =
                null,

            SoTien =
                null,

            TrangThai =
                "ACTIVE",

            NguoiTaoId =
                userId.Value,

            NguoiGhiVaoId =
                userId.Value,

            NguoiGhiRaId =
                null
        };

        _context.LuotGuiXes.Add(luotGuiXe);

        await _context.SaveChangesAsync();

        // -------------------------------------------------
        // AUDIT
        // -------------------------------------------------

        await _auditLogService.GhiLog(
            userId,
            "CREATE",
            "LuotGuiXe",
            luotGuiXe.LuotGuiXeId,
            $"Check-in xe cu dan {luotGuiXe.BienSo}"
        );

        // -------------------------------------------------
        // NGƯỜI GHI VÀO
        // -------------------------------------------------

        var nguoiGhiVao =
            await _context.Users
                .Where(x =>
                    x.UserId == userId.Value)
                .Select(x =>
                    x.HoTen)
                .FirstOrDefaultAsync();

        // -------------------------------------------------
        // LOẠI XE
        // -------------------------------------------------

        var loaiXe =
            await _context.LoaiPhuongTiens
                .Where(x =>
                    x.LoaiPhuongTienId ==
                    luotGuiXe.LoaiPhuongTienId)
                .Select(x =>
                    x.TenLoai)
                .FirstOrDefaultAsync();

        return Ok(new
        {
            luotGuiXeId =
                luotGuiXe.LuotGuiXeId,

            phuongTienId =
                luotGuiXe.PhuongTienId,

            bienSo =
                luotGuiXe.BienSo,

            loaiPhuongTienId =
                luotGuiXe.LoaiPhuongTienId,

            loaiXe =
                loaiXe,

            thoiGianVao =
                luotGuiXe.ThoiGianVao,

            thoiGianRa =
                luotGuiXe.ThoiGianRa,

            soTien =
                luotGuiXe.SoTien,

            trangThai =
                luotGuiXe.TrangThai,

            nguoiGhiVao =
                nguoiGhiVao,

            nguoiGhiRa =
                (string?)null,

            laXeKhach =
                false
        });
    }

    // =====================================================
    // CHECK-IN XE KHÁCH
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

        // -------------------------------------------------
        // LOẠI XE
        // -------------------------------------------------

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

        // -------------------------------------------------
        // KHÔNG TRÙNG XE CƯ DÂN
        // -------------------------------------------------

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

        // -------------------------------------------------
        // XE KHÁCH ĐANG GỬI
        // -------------------------------------------------

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

        // -------------------------------------------------
        // USER JWT
        // -------------------------------------------------

        var userId = LayUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message =
                    "Không xác định được người dùng từ JWT."
            });
        }

        // -------------------------------------------------
        // TẠO LƯỢT XE KHÁCH
        // -------------------------------------------------

        var luotGuiXe = new LuotGuiXe
        {
            PhuongTienId =
                null,

            BienSo =
                bienSo,

            LoaiPhuongTienId =
                dto.LoaiPhuongTienId,

            ThoiGianVao =
                DateTime.Now,

            ThoiGianRa =
                null,

            SoTien =
                null,

            TrangThai =
                "ACTIVE",

            NguoiTaoId =
                userId.Value,

            NguoiGhiVaoId =
                userId.Value,

            NguoiGhiRaId =
                null
        };

        _context.LuotGuiXes.Add(luotGuiXe);

        await _context.SaveChangesAsync();

        // -------------------------------------------------
        // AUDIT
        // -------------------------------------------------

        await _auditLogService.GhiLog(
            userId,
            "CREATE",
            "LuotGuiXe",
            luotGuiXe.LuotGuiXeId,
            $"Check-in xe khach {luotGuiXe.BienSo}"
        );

        // -------------------------------------------------
        // NGƯỜI GHI VÀO
        // -------------------------------------------------

        var nguoiGhiVao =
            await _context.Users
                .Where(x =>
                    x.UserId == userId.Value)
                .Select(x =>
                    x.HoTen)
                .FirstOrDefaultAsync();

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

            nguoiGhiVao =
                nguoiGhiVao,

            nguoiGhiRa =
                (string?)null,

            cuDan =
                (string?)null,

            canHo =
                (string?)null,

            laXeKhach =
                true
        });
    }

    // =====================================================
    // ACTIVE - CHỈ XE CƯ DÂN
    // GET: /api/Parking/active
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
                    x.TrangThai == "ACTIVE"
                    &&
                    x.PhuongTienId != null)
                .AsQueryable();

        var role = LayRole();

        // -------------------------------------------------
        // CƯ DÂN CHỈ XEM XE CỦA MÌNH
        // -------------------------------------------------

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

        // -------------------------------------------------
        // QUERY
        // -------------------------------------------------

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

                    // CƯ DÂN
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

                    // THỜI GIAN
                    thoiGianVao =
                        x.ThoiGianVao,

                    thoiGianRa =
                        x.ThoiGianRa,

                    // TIỀN
                    soTien =
                        x.SoTien,

                    // TRẠNG THÁI
                    trangThai =
                        x.TrangThai,

                    // NGƯỜI GHI VÀO
                    nguoiGhiVao =
                        x.NguoiGhiVaoId != null
                            ? _context.Users
                                .Where(u =>
                                    u.UserId ==
                                    x.NguoiGhiVaoId.Value)
                                .Select(u =>
                                    u.HoTen)
                                .FirstOrDefault()
                            : null,

                    // NGƯỜI GHI RA
                    nguoiGhiRa =
                        x.NguoiGhiRaId != null
                            ? _context.Users
                                .Where(u =>
                                    u.UserId ==
                                    x.NguoiGhiRaId.Value)
                                .Select(u =>
                                    u.HoTen)
                                .FirstOrDefault()
                            : null,

                    // VÌ ACTIVE CHỈ CÓ XE CƯ DÂN
                    laXeKhach =
                        false
                })
                .ToListAsync();

        return Ok(danhSach);
    }

    // =====================================================
    // XE KHÁCH
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

                    // NGƯỜI GHI VÀO
                    nguoiGhiVao =
                        x.NguoiGhiVaoId != null
                            ? _context.Users
                                .Where(u =>
                                    u.UserId ==
                                    x.NguoiGhiVaoId.Value)
                                .Select(u =>
                                    u.HoTen)
                                .FirstOrDefault()
                            : null,

                    // NGƯỜI GHI RA
                    nguoiGhiRa =
                        x.NguoiGhiRaId != null
                            ? _context.Users
                                .Where(u =>
                                    u.UserId ==
                                    x.NguoiGhiRaId.Value)
                                .Select(u =>
                                    u.HoTen)
                                .FirstOrDefault()
                            : null,

                    cuDan =
                        (string?)null,

                    canHo =
                        (string?)null,

                    laXeKhach =
                        true
                })
                .ToListAsync();

        return Ok(danhSach);
    }

    // =====================================================
    // CHECK-OUT
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

        // -------------------------------------------------
        // TÌM LƯỢT ACTIVE
        // -------------------------------------------------

        var luotGuiXe =
            await _context.LuotGuiXes
                .Include(x =>
                    x.LoaiPhuongTien)
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

        // -------------------------------------------------
        // USER JWT
        // -------------------------------------------------

        var userId = LayUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message =
                    "Không xác định được người dùng từ JWT."
            });
        }

        // -------------------------------------------------
        // THỜI GIAN RA
        // -------------------------------------------------

        var thoiGianRa =
            DateTime.Now;

        // -------------------------------------------------
        // BẢNG GIÁ
        // -------------------------------------------------

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

        // -------------------------------------------------
        // TÍNH SỐ GIỜ
        // -------------------------------------------------

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

        // -------------------------------------------------
        // UPDATE
        // -------------------------------------------------

        luotGuiXe.ThoiGianRa =
            thoiGianRa;

        luotGuiXe.SoTien =
            (decimal)soGio *
            bangGia.DonGia;

        luotGuiXe.TrangThai =
            "COMPLETED";

        // NGƯỜI GHI XE RA
        luotGuiXe.NguoiGhiRaId =
            userId.Value;

        await _context.SaveChangesAsync();

        // -------------------------------------------------
        // AUDIT
        // -------------------------------------------------

        await _auditLogService.GhiLog(
            userId,
            "UPDATE",
            "LuotGuiXe",
            luotGuiXe.LuotGuiXeId,
            $"Check-out {luotGuiXe.BienSo}, so tien {luotGuiXe.SoTien:0}"
        );

        // -------------------------------------------------
        // NGƯỜI GHI VÀO
        // -------------------------------------------------

        var nguoiGhiVao =
            luotGuiXe.NguoiGhiVaoId != null
                ? await _context.Users
                    .Where(x =>
                        x.UserId ==
                        luotGuiXe.NguoiGhiVaoId.Value)
                    .Select(x =>
                        x.HoTen)
                    .FirstOrDefaultAsync()
                : null;

        // -------------------------------------------------
        // NGƯỜI GHI RA
        // -------------------------------------------------

        var nguoiGhiRa =
            await _context.Users
                .Where(x =>
                    x.UserId ==
                    userId.Value)
                .Select(x =>
                    x.HoTen)
                .FirstOrDefaultAsync();

        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return Ok(new
        {
            luotGuiXeId =
                luotGuiXe.LuotGuiXeId,

            phuongTienId =
                luotGuiXe.PhuongTienId,

            bienSo =
                luotGuiXe.BienSo,

            loaiPhuongTienId =
                luotGuiXe.LoaiPhuongTienId,

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

            nguoiGhiVao =
                nguoiGhiVao,

            nguoiGhiRa =
                nguoiGhiRa,

            laXeKhach =
                luotGuiXe.PhuongTienId == null
        });
    }

    // =====================================================
    // HISTORY
    //
    // GET: /api/Parking/history?tuNgay=...&denNgay=...
    //
    // ADMIN / BẢO VỆ:
    //   - XE CƯ DÂN
    //   - XE KHÁCH
    //
    // CƯ DÂN:
    //   - CHỈ XE CỦA MÌNH
    // =====================================================

    [Authorize(Roles = "Admin,BaoVe,CuDan")]
    [HttpGet("history")]
    public async Task<ActionResult<IEnumerable<object>>>
        GetHistory(
            [FromQuery] DateTime? tuNgay,
            [FromQuery] DateTime? denNgay)
    {
        // -------------------------------------------------
        // QUERY GỐC
        // KHÔNG LỌC PhuongTienId
        //
        // => ADMIN / BAO VE XEM CẢ 2 LOẠI XE
        // -------------------------------------------------

        var query =
            _context.LuotGuiXes
                .AsNoTracking()
                .Include(x => x.PhuongTien)
                .Include(x => x.LoaiPhuongTien)
                .AsQueryable();

        // -------------------------------------------------
        // NẾU LÀ CƯ DÂN
        // CHỈ XEM LỊCH SỬ XE CỦA MÌNH
        // -------------------------------------------------

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

        // -------------------------------------------------
        // FILTER THEO NGÀY
        // -------------------------------------------------

        if (tuNgay.HasValue)
        {
            query = query.Where(x =>
                x.ThoiGianVao >= tuNgay.Value);
        }

        if (denNgay.HasValue)
        {
            // Cộng thêm 1 ngày để bao gồm cả ngày kết thúc
            var denNgayFull =
                denNgay.Value.AddDays(1);

            query = query.Where(x =>
                x.ThoiGianVao <= denNgayFull);
        }

        // -------------------------------------------------
        // LẤY DATA TỪ SQL
        // -------------------------------------------------

        var danhSach =
            await query
                .OrderByDescending(x =>
                    x.ThoiGianVao)
                .Select(x => new
                {
                    // =================================================
                    // ID
                    // =================================================

                    luotGuiXeId =
                        x.LuotGuiXeId,

                    phuongTienId =
                        x.PhuongTienId,

                    // =================================================
                    // BIỂN SỐ
                    // =================================================

                    bienSo =
                        x.BienSo,

                    // =================================================
                    // LOẠI XE
                    // =================================================

                    loaiPhuongTienId =
                        x.LoaiPhuongTienId,

                    loaiXe =
                        x.LoaiPhuongTien != null
                            ? x.LoaiPhuongTien.TenLoai
                            : "",

                    // =================================================
                    // CƯ DÂN
                    // =================================================

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

                    // =================================================
                    // CĂN HỘ
                    // =================================================

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

                    // =================================================
                    // THỜI GIAN VÀO
                    // =================================================

                    thoiGianVao =
                        x.ThoiGianVao,

                    // =================================================
                    // NGƯỜI GHI VÀO
                    // =================================================

                    nguoiGhiVao =
                        x.NguoiGhiVaoId != null
                            ? _context.Users
                                .Where(u =>
                                    u.UserId ==
                                    x.NguoiGhiVaoId.Value)
                                .Select(u =>
                                    u.HoTen)
                                .FirstOrDefault()
                            : null,

                    // =================================================
                    // THỜI GIAN RA
                    // =================================================

                    thoiGianRa =
                        x.ThoiGianRa,

                    // =================================================
                    // NGƯỜI GHI RA
                    // =================================================

                    nguoiGhiRa =
                        x.NguoiGhiRaId != null
                            ? _context.Users
                                .Where(u =>
                                    u.UserId ==
                                    x.NguoiGhiRaId.Value)
                                .Select(u =>
                                    u.HoTen)
                                .FirstOrDefault()
                            : null,

                    // =================================================
                    // TIỀN
                    // =================================================

                    soTien =
                        x.SoTien,

                    // =================================================
                    // TRẠNG THÁI GỐC SQL
                    // =================================================

                    trangThaiGoc =
                        x.TrangThai,

                    // =================================================
                    // TRẠNG THÁI CHO FRONTEND
                    // =================================================

                    trangThai =
                        x.TrangThai == "ACTIVE"
                            ? "Đang gửi"
                            : x.PhuongTienId == null
                                ? "Đã thanh toán"
                                : "Đã ra",

                    // =================================================
                    // XE KHÁCH
                    // =================================================

                    laXeKhach =
                        x.PhuongTienId == null
                })
                .ToListAsync();

        return Ok(danhSach);
    }

    // =====================================================
    // LOẠI PHƯƠNG TIỆN
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