using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Data;
using QuanLyPhuongTienChungCu.Models;
using QuanLyPhuongTienChungCu.Services;
using System.Security.Claims;

namespace QuanLyPhuongTienChungCu.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PhuongTienController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuditLogService _auditLogService;

    public PhuongTienController(
        AppDbContext context,
        AuditLogService auditLogService)
    {
        _context = context;
        _auditLogService = auditLogService;
    }

    // =====================================================
    // HELPER
    // =====================================================

    private string? LayRole()
    {
        var role =
            User.FindFirst(ClaimTypes.Role)?.Value;

        if (!string.IsNullOrWhiteSpace(role))
        {
            return role;
        }

        role =
            User.FindFirst("role")?.Value;

        return role;
    }

    private long? LayUserId()
    {
        var userIdClaim =
            User.FindFirst(
                ClaimTypes.NameIdentifier
            )?.Value;

        if (
            long.TryParse(
                userIdClaim,
                out var userId
            )
        )
        {
            return userId;
        }

        // Trường hợp JWT dùng sub
        userIdClaim =
            User.FindFirst("sub")?.Value;

        if (
            long.TryParse(
                userIdClaim,
                out var userIdSub
            )
        )
        {
            return userIdSub;
        }

        // Trường hợp JWT dùng userId
        userIdClaim =
            User.FindFirst("userId")?.Value;

        if (
            long.TryParse(
                userIdClaim,
                out var userIdCustom
            )
        )
        {
            return userIdCustom;
        }

        return null;
    }

    private bool LaCuDan()
    {
        return string.Equals(
            LayRole(),
            "CuDan",
            StringComparison.OrdinalIgnoreCase
        );
    }

    private bool LaAdmin()
    {
        return string.Equals(
            LayRole(),
            "Admin",
            StringComparison.OrdinalIgnoreCase
        );
    }

    // =====================================================
    // GET ALL
    // GET: api/PhuongTien
    // =====================================================

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAll()
    {
        var query =
            _context.PhuongTiens
                .Include(
                    x => x.LoaiPhuongTien
                )
                .AsQueryable();

        // =================================================
        // CƯ DÂN
        // Chỉ hiển thị xe đã được duyệt
        // =================================================

        if (LaCuDan())
        {
            var userId =
                LayUserId();

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Không xác định được người dùng."
                });
            }

            query =
                query.Where(
                    x =>
                        x.UserId ==
                        userId.Value
                        &&
                        x.TrangThai ==
                        "ACTIVE"
                );
        }

        // =================================================
        // LẤY DANH SÁCH
        // =================================================

        var danhSach =
            await query
                .OrderBy(
                    x =>
                        x.PhuongTienId
                )
                .Select(x => new
                {
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

                    userId =
                        x.UserId,

                    // LẤY TÊN CHỦ XE MỚI NHẤT TỪ USERS
                    tenChuXe =
                        _context.Users
                            .Where(
                                u =>
                                    u.UserId ==
                                    x.UserId
                            )
                            .Select(
                                u =>
                                    u.HoTen
                            )
                            .FirstOrDefault()
                            ?? x.TenChuXe
                            ?? "Cư dân",

                    maCanHo =
                        x.MaCanHo,

                    trangThai =
                        x.TrangThai,

                    ngayTao =
                        x.NgayTao
                })
                .ToListAsync();

        return Ok(danhSach);
    }

    // =====================================================
    // GET BY ID
    // GET: api/PhuongTien/2
    // =====================================================

    [HttpGet("{id:long}")]
    public async Task<ActionResult<object>> GetById(
        long id
    )
    {
        var phuongTien =
            await _context.PhuongTiens
                .Include(
                    x =>
                        x.LoaiPhuongTien
                )
                .FirstOrDefaultAsync(
                    x =>
                        x.PhuongTienId ==
                        id
                );

        if (phuongTien == null)
        {
            return NotFound(new
            {
                message =
                    "Phương tiện không tồn tại."
            });
        }

        // =================================================
        // CƯ DÂN
        // Chỉ xem xe của mình + đã duyệt
        // =================================================

        if (LaCuDan())
        {
            var userId =
                LayUserId();

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Không xác định được người dùng."
                });
            }

            if (
                phuongTien.UserId !=
                userId.Value
            )
            {
                return Forbid();
            }

            if (
                phuongTien.TrangThai !=
                "ACTIVE"
            )
            {
                return NotFound(new
                {
                    message =
                        "Phương tiện chưa được duyệt."
                });
            }
        }

        // =================================================
        // LẤY TÊN CHỦ XE MỚI NHẤT TỪ USERS
        // =================================================

        var tenChuXe =
            await _context.Users
                .Where(
                    u =>
                        u.UserId ==
                        phuongTien.UserId
                )
                .Select(
                    u =>
                        u.HoTen
                )
                .FirstOrDefaultAsync();

        return Ok(new
        {
            phuongTienId =
                phuongTien.PhuongTienId,

            bienSo =
                phuongTien.BienSo,

            loaiPhuongTienId =
                phuongTien.LoaiPhuongTienId,

            loaiXe =
                phuongTien.LoaiPhuongTien != null
                    ? phuongTien.LoaiPhuongTien.TenLoai
                    : "",

            userId =
                phuongTien.UserId,

            tenChuXe =
                tenChuXe
                ?? phuongTien.TenChuXe
                ?? "Cư dân",

            maCanHo =
                phuongTien.MaCanHo,

            trangThai =
                phuongTien.TrangThai,

            ngayTao =
                phuongTien.NgayTao
        });
    }

    // =====================================================
    // GET DANH SÁCH CĂN HỘ
    // GET: api/PhuongTien/can-ho
    // =====================================================

    [HttpGet("can-ho")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<object>>> GetCanHo()
    {
        var danhSach =
            await _context
                .CanHos
                .OrderBy(
                    x =>
                        x.MaCanHo
                )
                .Select(x => new
                {
                    canHoId =
                        x.CanHoId,

                    maCanHo =
                        x.MaCanHo,

                    trangThai =
                        x.TrangThai,

                    // CanHo.UserId
                    userId =
                        x.UserId,

                    // Lấy tên user theo CanHo.UserId
                    hoTen =
                        _context.Users
                            .Where(
                                u =>
                                    u.UserId ==
                                    x.UserId
                            )
                            .Select(
                                u =>
                                    u.HoTen
                            )
                            .FirstOrDefault()
                            ?? ""
                })
                .ToListAsync();

        return Ok(danhSach);
    }

    // =====================================================
    // POST
    // POST: api/PhuongTien
    // =====================================================

    [HttpPost]
    public async Task<ActionResult<object>> Create(
        PhuongTien phuongTien
    )
    {
        // =================================================
        // ROLE
        // =================================================

        var role =
            LayRole();

        if (
            role != "Admin" &&
            role != "CuDan"
        )
        {
            return Forbid();
        }

        // =================================================
        // KIỂM TRA LOẠI PHƯƠNG TIỆN
        // =================================================

        var loaiPhuongTien =
            await _context
                .LoaiPhuongTiens
                .FindAsync(
                    phuongTien.LoaiPhuongTienId
                );

        if (loaiPhuongTien == null)
        {
            return BadRequest(new
            {
                message =
                    "Loại phương tiện không tồn tại."
            });
        }

        // =================================================
        // KIỂM TRA BIỂN SỐ
        // =================================================

        if (
            string.IsNullOrWhiteSpace(
                phuongTien.BienSo
            )
        )
        {
            return BadRequest(new
            {
                message =
                    "Vui lòng nhập biển số xe."
            });
        }

        phuongTien.BienSo =
            phuongTien.BienSo
                .Trim()
                .ToUpper();

        // =================================================
        // KIỂM TRA TRÙNG BIỂN SỐ
        // =================================================

        var bienSoDaTonTai =
            await _context
                .PhuongTiens
                .AnyAsync(
                    x =>
                        x.BienSo ==
                        phuongTien.BienSo
                        &&
                        (
                            x.TrangThai ==
                                "ACTIVE"
                            ||
                            x.TrangThai ==
                                "PENDING"
                        )
                );

        if (bienSoDaTonTai)
        {
            return Conflict(new
            {
                message =
                    "Biển số xe đã tồn tại hoặc đang chờ duyệt."
            });
        }

        // =================================================
        // ADMIN THÊM XE
        //
        // Admin chọn căn hộ
        // → CanHo.UserId
        // → User.UserId
        // → lấy cư dân
        // → ACTIVE
        // =================================================

        if (LaAdmin())
        {
            if (
                string.IsNullOrWhiteSpace(
                    phuongTien.MaCanHo
                )
            )
            {
                return BadRequest(new
                {
                    message =
                        "Vui lòng chọn căn hộ."
                });
            }

            var canHo =
                await _context
                    .CanHos
                    .FirstOrDefaultAsync(
                        x =>
                            x.MaCanHo ==
                            phuongTien.MaCanHo
                    );

            if (canHo == null)
            {
                return BadRequest(new
                {
                    message =
                        "Căn hộ không tồn tại."
                });
            }

            // =================================================
            // CĂN HỘ CHƯA CÓ USER
            // =================================================

            if (canHo.UserId == null)
            {
                return BadRequest(new
                {
                    message =
                        "Căn hộ này chưa có cư dân."
                });
            }

            // =================================================
            // TÌM CƯ DÂN THEO CanHo.UserId
            // =================================================

            var user =
                await _context
                    .Users
                    .FirstOrDefaultAsync(
                        u =>
                            u.UserId ==
                            canHo.UserId.Value
                            &&
                            u.RoleId ==
                            4
                    );

            if (user == null)
            {
                return BadRequest(new
                {
                    message =
                        "Căn hộ này chưa có cư dân."
                });
            }

            phuongTien.UserId =
                user.UserId;

            phuongTien.TenChuXe =
                user.HoTen;

            phuongTien.MaCanHo =
                canHo.MaCanHo;

            // Admin thêm → hoạt động luôn
            phuongTien.TrangThai =
                "ACTIVE";
        }

        // =================================================
        // CƯ DÂN THÊM XE
        //
        // User đăng nhập
        // → tìm CanHo.UserId
        // → lấy MaCanHo
        // → PENDING
        // =================================================

        if (LaCuDan())
        {
            var userId =
                LayUserId();

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Không xác định được người dùng từ token."
                });
            }

            var user =
                await _context
                    .Users
                    .FirstOrDefaultAsync(
                        x =>
                            x.UserId ==
                            userId.Value
                    );

            if (user == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Tài khoản không tồn tại."
                });
            }

            // =================================================
            // GÁN USER
            // =================================================

            phuongTien.UserId =
                user.UserId;

            phuongTien.TenChuXe =
                user.HoTen;

            // =================================================
            // TÌM CĂN HỘ THEO CanHo.UserId
            // =================================================

            var canHo =
                await _context
                    .CanHos
                    .FirstOrDefaultAsync(
                        x =>
                            x.UserId ==
                            user.UserId
                    );

            if (canHo == null)
            {
                return BadRequest(new
                {
                    message =
                        "Tài khoản của bạn chưa được gán căn hộ."
                });
            }

            phuongTien.MaCanHo =
                canHo.MaCanHo;

            // =================================================
            // CƯ DÂN THÊM → CHỜ DUYỆT
            // =================================================

            phuongTien.TrangThai =
                "PENDING";
        }

        // =================================================
        // NGÀY TẠO
        // =================================================

        if (
            phuongTien.NgayTao ==
            default
        )
        {
            phuongTien.NgayTao =
                DateTime.UtcNow;
        }

        // =================================================
        // LƯU DATABASE
        // =================================================

        _context
            .PhuongTiens
            .Add(phuongTien);

        await _context
            .SaveChangesAsync();

        // =================================================
        // AUDIT LOG
        // =================================================

        var currentUserId =
            LayUserId();

        await _auditLogService.GhiLog(
            currentUserId,
            "CREATE",
            "PhuongTien",
            phuongTien.PhuongTienId,
            $"Tao phuong tien {phuongTien.BienSo} - Trang thai: {phuongTien.TrangThai}"
        );

        // =================================================
        // TRẢ KẾT QUẢ
        // =================================================

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                id =
                    phuongTien.PhuongTienId
            },
            new
            {
                phuongTienId =
                    phuongTien.PhuongTienId,

                bienSo =
                    phuongTien.BienSo,

                loaiPhuongTienId =
                    phuongTien.LoaiPhuongTienId,

                userId =
                    phuongTien.UserId,

                tenChuXe =
                    phuongTien.TenChuXe,

                maCanHo =
                    phuongTien.MaCanHo,

                trangThai =
                    phuongTien.TrangThai,

                ngayTao =
                    phuongTien.NgayTao
            }
        );
    }

    // =====================================================
    // PUT
    // PUT: api/PhuongTien/2
    // =====================================================

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(
        long id,
        PhuongTien phuongTien
    )
    {
        // =================================================
        // TÌM XE CŨ
        // =================================================

        var phuongTienCu =
            await _context
                .PhuongTiens
                .FirstOrDefaultAsync(
                    x =>
                        x.PhuongTienId ==
                        id
                );

        if (phuongTienCu == null)
        {
            return NotFound(new
            {
                message =
                    "Phương tiện không tồn tại."
            });
        }

        // =================================================
        // ROLE
        // =================================================

        var role =
            LayRole();

        if (
            role != "Admin" &&
            role != "CuDan"
        )
        {
            return Forbid();
        }

        // =================================================
        // CƯ DÂN CHỈ SỬA XE CỦA MÌNH
        // =================================================

        if (LaCuDan())
        {
            var userId =
                LayUserId();

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Không xác định được người dùng."
                });
            }

            if (
                phuongTienCu.UserId !=
                userId.Value
            )
            {
                return Forbid();
            }
        }

        // =================================================
        // KIỂM TRA LOẠI XE
        // =================================================

        var loaiPhuongTien =
            await _context
                .LoaiPhuongTiens
                .FindAsync(
                    phuongTien.LoaiPhuongTienId
                );

        if (loaiPhuongTien == null)
        {
            return BadRequest(new
            {
                message =
                    "Loại phương tiện không tồn tại."
            });
        }

        // =================================================
        // KIỂM TRA BIỂN SỐ
        // =================================================

        if (
            string.IsNullOrWhiteSpace(
                phuongTien.BienSo
            )
        )
        {
            return BadRequest(new
            {
                message =
                    "Vui lòng nhập biển số xe."
            });
        }

        phuongTien.BienSo =
            phuongTien.BienSo
                .Trim()
                .ToUpper();

        // =================================================
        // KIỂM TRA TRÙNG BIỂN SỐ
        // =================================================

        var bienSoDaTonTai =
            await _context
                .PhuongTiens
                .AnyAsync(
                    x =>
                        x.BienSo ==
                        phuongTien.BienSo
                        &&
                        x.PhuongTienId !=
                        id
                        &&
                        (
                            x.TrangThai ==
                                "ACTIVE"
                            ||
                            x.TrangThai ==
                                "PENDING"
                        )
                );

        if (bienSoDaTonTai)
        {
            return Conflict(new
            {
                message =
                    "Biển số xe đã tồn tại."
            });
        }

        // =================================================
        // CẬP NHẬT BIỂN SỐ
        // =================================================

        phuongTienCu.BienSo =
            phuongTien.BienSo;

        // =================================================
        // CẬP NHẬT LOẠI XE
        // =================================================

        phuongTienCu.LoaiPhuongTienId =
            phuongTien.LoaiPhuongTienId;

        // =================================================
        // ADMIN
        // Có thể đổi căn hộ + trạng thái
        // =================================================

        if (LaAdmin())
        {
            if (
                string.IsNullOrWhiteSpace(
                    phuongTien.MaCanHo
                )
            )
            {
                return BadRequest(new
                {
                    message =
                        "Vui lòng chọn căn hộ."
                });
            }

            var canHo =
                await _context
                    .CanHos
                    .FirstOrDefaultAsync(
                        x =>
                            x.MaCanHo ==
                            phuongTien.MaCanHo
                    );

            if (canHo == null)
            {
                return BadRequest(new
                {
                    message =
                        "Căn hộ không tồn tại."
                });
            }

            // =================================================
            // CĂN HỘ CHƯA CÓ USER
            // =================================================

            if (canHo.UserId == null)
            {
                return BadRequest(new
                {
                    message =
                        "Căn hộ này chưa có cư dân."
                });
            }

            // =================================================
            // TÌM USER THEO CanHo.UserId
            // =================================================

            var user =
                await _context
                    .Users
                    .FirstOrDefaultAsync(
                        u =>
                            u.UserId ==
                            canHo.UserId.Value
                            &&
                            u.RoleId ==
                            4
                    );

            if (user == null)
            {
                return BadRequest(new
                {
                    message =
                        "Căn hộ này chưa có cư dân."
                });
            }

            phuongTienCu.MaCanHo =
                canHo.MaCanHo;

            phuongTienCu.UserId =
                user.UserId;

            phuongTienCu.TenChuXe =
                user.HoTen;

            // Admin có thể đổi trạng thái
            if (
                !string.IsNullOrWhiteSpace(
                    phuongTien.TrangThai
                )
            )
            {
                phuongTienCu.TrangThai =
                    phuongTien.TrangThai;
            }
        }

        // =================================================
        // CƯ DÂN
        // Không đổi UserId
        // Không đổi căn hộ
        // Không đổi trạng thái
        // =================================================

        if (LaCuDan())
        {
            var userId =
                LayUserId();

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Không xác định được người dùng."
                });
            }

            var user =
                await _context
                    .Users
                    .FirstOrDefaultAsync(
                        x =>
                            x.UserId ==
                            userId.Value
                    );

            if (user == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Tài khoản không tồn tại."
                });
            }

            phuongTienCu.UserId =
                user.UserId;

            phuongTienCu.TenChuXe =
                user.HoTen;

            // =================================================
            // TÌM CĂN HỘ THEO CanHo.UserId
            // =================================================

            var canHo =
                await _context
                    .CanHos
                    .FirstOrDefaultAsync(
                        x =>
                            x.UserId ==
                            user.UserId
                    );

            if (canHo != null)
            {
                phuongTienCu.MaCanHo =
                    canHo.MaCanHo;
            }

            // Không sửa TrangThai
        }

        // =================================================
        // SAVE
        // =================================================

        await _context
            .SaveChangesAsync();

        // =================================================
        // AUDIT
        // =================================================

        var currentUserId =
            LayUserId();

        await _auditLogService.GhiLog(
            currentUserId,
            "UPDATE",
            "PhuongTien",
            phuongTienCu.PhuongTienId,
            $"Cap nhat phuong tien {phuongTienCu.BienSo}"
        );

        return NoContent();
    }

    // =====================================================
    // DELETE
    // DELETE: api/PhuongTien/{id}
    // =====================================================

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(
        long id
    )
    {
        // =================================================
        // TÌM XE
        // =================================================

        var phuongTien =
            await _context
                .PhuongTiens
                .FirstOrDefaultAsync(
                    x =>
                        x.PhuongTienId ==
                        id
                );

        if (phuongTien == null)
        {
            return NotFound(new
            {
                message =
                    "Phương tiện không tồn tại."
            });
        }

        // =================================================
        // CƯ DÂN CHỈ XÓA XE CỦA MÌNH
        // =================================================

        if (LaCuDan())
        {
            var userId =
                LayUserId();

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Không xác định được người dùng."
                });
            }

            if (
                phuongTien.UserId !=
                userId.Value
            )
            {
                return Forbid();
            }
        }

        // =================================================
        // KIỂM TRA LỊCH SỬ
        // =================================================

        var daCoLuotGuiXe =
            await _context
                .LuotGuiXes
                .AsNoTracking()
                .AnyAsync(
                    x =>
                        x.PhuongTienId ==
                        id
                );

        // =================================================
        // ĐÃ CÓ LỊCH SỬ
        // → INACTIVE
        // =================================================

        if (daCoLuotGuiXe)
        {
            var bienSo =
                phuongTien.BienSo;

            phuongTien.TrangThai =
                "INACTIVE";

            await _context
                .SaveChangesAsync();

            var currentUserId =
                LayUserId();

            await _auditLogService.GhiLog(
                currentUserId,
                "UPDATE",
                "PhuongTien",
                phuongTien.PhuongTienId,
                $"Chuyen phuong tien {bienSo} sang INACTIVE do da co lich su gui xe"
            );

            return Ok(new
            {
                message =
                    "Phương tiện đã có lịch sử gửi xe nên không thể xóa. Đã chuyển sang trạng thái ngừng hoạt động.",

                trangThai =
                    "INACTIVE",

                phuongTienId =
                    phuongTien.PhuongTienId
            });
        }

        // =================================================
        // CHƯA CÓ LỊCH SỬ
        // → XÓA THẬT
        // =================================================

        var bienSoXoa =
            phuongTien.BienSo;

        _context
            .PhuongTiens
            .Remove(
                phuongTien
            );

        await _context
            .SaveChangesAsync();

        // =================================================
        // AUDIT
        // =================================================

        var currentUserIdDelete =
            LayUserId();

        await _auditLogService.GhiLog(
            currentUserIdDelete,
            "DELETE",
            "PhuongTien",
            id,
            $"Xoa phuong tien {bienSoXoa}"
        );

        return Ok(new
        {
            message =
                "Xóa phương tiện thành công.",

            phuongTienId =
                id
        });
    }

    // =====================================================
    // DUYỆT PHƯƠNG TIỆN
    // PUT: api/PhuongTien/{id}/duyet
    // =====================================================

    [HttpPut("{id:long}/duyet")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DuyetPhuongTien(
        long id
    )
    {
        var phuongTien =
            await _context
                .PhuongTiens
                .FirstOrDefaultAsync(
                    x =>
                        x.PhuongTienId ==
                        id
                );

        if (phuongTien == null)
        {
            return NotFound(new
            {
                message =
                    "Phương tiện không tồn tại."
            });
        }

        if (
            phuongTien.TrangThai !=
            "PENDING"
        )
        {
            return BadRequest(new
            {
                message =
                    "Phương tiện này không ở trạng thái chờ duyệt."
            });
        }

        phuongTien.TrangThai =
            "ACTIVE";

        await _context
            .SaveChangesAsync();

        // =================================================
        // AUDIT
        // =================================================

        var currentUserId =
            LayUserId();

        await _auditLogService.GhiLog(
            currentUserId,
            "UPDATE",
            "PhuongTien",
            phuongTien.PhuongTienId,
            $"Duyet phuong tien {phuongTien.BienSo}"
        );

        return Ok(new
        {
            message =
                "Duyệt phương tiện thành công.",

            phuongTienId =
                phuongTien.PhuongTienId,

            trangThai =
                "ACTIVE"
        });
    }

    // =====================================================
    // TỪ CHỐI PHƯƠNG TIỆN
    // PUT: api/PhuongTien/{id}/tu-choi
    // =====================================================

    [HttpPut("{id:long}/tu-choi")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> TuChoiPhuongTien(
        long id
    )
    {
        var phuongTien =
            await _context
                .PhuongTiens
                .FirstOrDefaultAsync(
                    x =>
                        x.PhuongTienId ==
                        id
                );

        if (phuongTien == null)
        {
            return NotFound(new
            {
                message =
                    "Phương tiện không tồn tại."
            });
        }

        if (
            phuongTien.TrangThai !=
            "PENDING"
        )
        {
            return BadRequest(new
            {
                message =
                    "Phương tiện này không ở trạng thái chờ duyệt."
            });
        }

        phuongTien.TrangThai =
            "INACTIVE";

        await _context
            .SaveChangesAsync();

        // =================================================
        // AUDIT
        // =================================================

        var currentUserId =
            LayUserId();

        await _auditLogService.GhiLog(
            currentUserId,
            "UPDATE",
            "PhuongTien",
            phuongTien.PhuongTienId,
            $"Tu choi phuong tien {phuongTien.BienSo}"
        );

        return Ok(new
        {
            message =
                "Đã từ chối phương tiện.",

            phuongTienId =
                phuongTien.PhuongTienId,

            trangThai =
                "INACTIVE"
        });
    }

    // =====================================================
    // GET DANH SÁCH LOẠI PHƯƠNG TIỆN
    // GET: api/PhuongTien/loai-phuong-tien
    // =====================================================

    [HttpGet("loai-phuong-tien")]
    public async Task<IActionResult> GetLoaiPhuongTien()
    {
        var danhSach =
            await _context
                .LoaiPhuongTiens
                .OrderBy(
                    x =>
                        x.LoaiPhuongTienId
                )
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

    // =====================================================
    // HISTORY
    // GET: api/PhuongTien/2/history
    // =====================================================

    [HttpGet("{id:long}/history")]
    public async Task<
        ActionResult<IEnumerable<LuotGuiXe>>
    > GetHistory(
        long id
    )
    {
        var phuongTien =
            await _context
                .PhuongTiens
                .FirstOrDefaultAsync(
                    x =>
                        x.PhuongTienId ==
                        id
                );

        if (phuongTien == null)
        {
            return NotFound(new
            {
                message =
                    "Phương tiện không tồn tại."
            });
        }

        // =================================================
        // CƯ DÂN
        // Chỉ xem lịch sử xe của mình
        // =================================================

        if (LaCuDan())
        {
            var userId =
                LayUserId();

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Không xác định được người dùng."
                });
            }

            if (
                phuongTien.UserId !=
                userId.Value
            )
            {
                return Forbid();
            }

            if (
                phuongTien.TrangThai !=
                "ACTIVE"
            )
            {
                return NotFound(new
                {
                    message =
                        "Phương tiện chưa được duyệt."
                });
            }
        }

        // =================================================
        // LẤY LỊCH SỬ
        // =================================================

        var lichSu =
            await _context
                .LuotGuiXes
                .Where(
                    x =>
                        x.PhuongTienId ==
                        id
                )
                .OrderByDescending(
                    x =>
                        x.ThoiGianVao
                )
                .ToListAsync();

        return Ok(lichSu);
    }
}
