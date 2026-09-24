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
        return User.FindFirst(ClaimTypes.Role)?.Value;
    }

    private long? LayUserId()
    {
        var userIdClaim = User.FindFirst(
            ClaimTypes.NameIdentifier
        )?.Value;

        if (long.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }

        return null;
    }

    // =====================================================
    // GET ALL
    // GET: api/PhuongTien
    // =====================================================

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAll()
    {
        var role = LayRole();

        var query = _context.PhuongTiens
            .Include(x => x.LoaiPhuongTien)
            .AsQueryable();

        // -------------------------------------------------
        // CƯ DÂN CHỈ XEM PHƯƠNG TIỆN CỦA MÌNH
        // -------------------------------------------------

        if (role == "CuDan")
        {
            var userId = LayUserId();

            if (userId == null)
            {
                return Unauthorized();
            }

            query = query.Where(x => x.UserId == userId);
        }

        // -------------------------------------------------
        // DANH SÁCH
        // -------------------------------------------------

        var danhSach = await query
            .OrderBy(x => x.PhuongTienId)
            .Select(x => new
            {
                phuongTienId = x.PhuongTienId,

                bienSo = x.BienSo,

                loaiPhuongTienId = x.LoaiPhuongTienId,

                loaiXe = x.LoaiPhuongTien != null
                    ? x.LoaiPhuongTien.TenLoai
                    : "",

                userId = x.UserId,

                tenChuXe = x.TenChuXe,

                maCanHo = x.MaCanHo,

                trangThai = x.TrangThai,

                ngayTao = x.NgayTao
            })
            .ToListAsync();

        return Ok(danhSach);
    }

    // =====================================================
    // GET BY ID
    // GET: api/PhuongTien/1
    // =====================================================

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetById(long id)
    {
        var phuongTien = await _context.PhuongTiens
            .Include(x => x.LoaiPhuongTien)
            .FirstOrDefaultAsync(
                x => x.PhuongTienId == id
            );

        if (phuongTien == null)
        {
            return NotFound(
                "Phuong tien khong ton tai."
            );
        }

        var role = LayRole();

        // -------------------------------------------------
        // CƯ DÂN CHỈ ĐƯỢC XEM XE CỦA MÌNH
        // -------------------------------------------------

        if (role == "CuDan")
        {
            var userId = LayUserId();

            if (userId == null)
            {
                return Unauthorized();
            }

            if (phuongTien.UserId != userId)
            {
                return Forbid();
            }
        }

        return Ok(new
        {
            phuongTienId = phuongTien.PhuongTienId,

            bienSo = phuongTien.BienSo,

            loaiPhuongTienId =
                phuongTien.LoaiPhuongTienId,

            loaiXe =
                phuongTien.LoaiPhuongTien?.TenLoai,

            userId = phuongTien.UserId,

            tenChuXe = phuongTien.TenChuXe,

            maCanHo = phuongTien.MaCanHo,

            trangThai = phuongTien.TrangThai,

            ngayTao = phuongTien.NgayTao
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
        var danhSach = await _context.CanHos
            .OrderBy(x => x.MaCanHo)
            .Select(x => new
            {
                maCanHo = x.MaCanHo,

                userId = x.UserId,

                hoTen = x.User != null
                    ? x.User.HoTen
                    : ""
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
        PhuongTien phuongTien)
    {
        // -------------------------------------------------
        // KIỂM TRA LOẠI PHƯƠNG TIỆN
        // -------------------------------------------------

        var loaiPhuongTien =
            await _context.LoaiPhuongTiens
                .FindAsync(
                    phuongTien.LoaiPhuongTienId
                );

        if (loaiPhuongTien == null)
        {
            return BadRequest(
                "Loai phuong tien khong ton tai."
            );
        }

        // -------------------------------------------------
        // KIỂM TRA BIỂN SỐ
        // -------------------------------------------------

        var bienSoDaTonTai =
            await _context.PhuongTiens
                .AnyAsync(x =>
                    x.BienSo == phuongTien.BienSo
                );

        if (bienSoDaTonTai)
        {
            return Conflict(
                "Bien so da ton tai."
            );
        }

        var role = LayRole();

        // =================================================
        // ADMIN
        // Chọn căn hộ -> tự tìm UserId + HoTen
        // =================================================

        if (role == "Admin")
        {
            if (string.IsNullOrWhiteSpace(
                phuongTien.MaCanHo))
            {
                return BadRequest(
                    "Vui long chon can ho."
                );
            }

            var canHo = await _context.CanHos
                .Include(x => x.User)
                .FirstOrDefaultAsync(
                    x => x.MaCanHo ==
                         phuongTien.MaCanHo
                );

            if (canHo == null)
            {
                return BadRequest(
                    "Can ho khong ton tai."
                );
            }

            phuongTien.UserId =
                canHo.UserId;

            phuongTien.TenChuXe =
                canHo.User?.HoTen ?? "";
        }

        // =================================================
        // CƯ DÂN
        // Không cho frontend tự truyền UserId
        // =================================================

        if (role == "CuDan")
        {
            var userId = LayUserId();

            if (userId == null)
            {
                return Unauthorized();
            }

            phuongTien.UserId = userId.Value;

            var user = await _context.Users
                .FindAsync(userId.Value);

            if (user != null)
            {
                phuongTien.TenChuXe =
                    user.HoTen;
            }
        }

        // -------------------------------------------------
        // LƯU
        // -------------------------------------------------

        _context.PhuongTiens.Add(phuongTien);

        await _context.SaveChangesAsync();

        // -------------------------------------------------
        // AUDIT LOG
        // -------------------------------------------------

        var currentUserId = LayUserId();

        await _auditLogService.GhiLog(
            currentUserId,
            "CREATE",
            "PhuongTien",
            phuongTien.PhuongTienId,
            $"Tao phuong tien {phuongTien.BienSo}"
        );

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                id = phuongTien.PhuongTienId
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

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        long id,
        PhuongTien phuongTien)
    {
        // -------------------------------------------------
        // KIỂM TRA ID
        // -------------------------------------------------

        if (id != phuongTien.PhuongTienId)
        {
            return BadRequest(
                "Id khong khop."
            );
        }

        // -------------------------------------------------
        // TÌM PHƯƠNG TIỆN CŨ
        // -------------------------------------------------

        var phuongTienCu =
            await _context.PhuongTiens
                .FirstOrDefaultAsync(
                    x => x.PhuongTienId == id
                );

        if (phuongTienCu == null)
        {
            return NotFound(
                "Phuong tien khong ton tai."
            );
        }

        var role = LayRole();

        // =================================================
        // CƯ DÂN CHỈ SỬA XE CỦA MÌNH
        // =================================================

        if (role == "CuDan")
        {
            var userId = LayUserId();

            if (userId == null)
            {
                return Unauthorized();
            }

            if (phuongTienCu.UserId != userId)
            {
                return Forbid();
            }
        }

        // -------------------------------------------------
        // KIỂM TRA LOẠI PHƯƠNG TIỆN
        // -------------------------------------------------

        var loaiPhuongTien =
            await _context.LoaiPhuongTiens
                .FindAsync(
                    phuongTien.LoaiPhuongTienId
                );

        if (loaiPhuongTien == null)
        {
            return BadRequest(
                "Loai phuong tien khong ton tai."
            );
        }

        // -------------------------------------------------
        // KIỂM TRA BIỂN SỐ TRÙNG
        // -------------------------------------------------

        var bienSoDaTonTai =
            await _context.PhuongTiens
                .AnyAsync(x =>
                    x.BienSo ==
                    phuongTien.BienSo
                    &&
                    x.PhuongTienId != id
                );

        if (bienSoDaTonTai)
        {
            return Conflict(
                "Bien so da ton tai."
            );
        }

        // =================================================
        // CẬP NHẬT CƠ BẢN
        // =================================================

        phuongTienCu.BienSo =
            phuongTien.BienSo;

        phuongTienCu.LoaiPhuongTienId =
            phuongTien.LoaiPhuongTienId;

        phuongTienCu.TrangThai =
            phuongTien.TrangThai;

        // =================================================
        // ADMIN ĐỔI CĂN HỘ
        // =================================================

        if (role == "Admin")
        {
            if (string.IsNullOrWhiteSpace(
                phuongTien.MaCanHo))
            {
                return BadRequest(
                    "Vui long chon can ho."
                );
            }

            var canHo = await _context.CanHos
                .Include(x => x.User)
                .FirstOrDefaultAsync(
                    x => x.MaCanHo ==
                         phuongTien.MaCanHo
                );

            if (canHo == null)
            {
                return BadRequest(
                    "Can ho khong ton tai."
                );
            }

            // CẬP NHẬT CĂN HỘ
            phuongTienCu.MaCanHo =
                canHo.MaCanHo;

            // CẬP NHẬT USER ID
            phuongTienCu.UserId =
                canHo.UserId;

            // CẬP NHẬT TÊN CƯ DÂN
            phuongTienCu.TenChuXe =
                canHo.User?.HoTen ?? "";
        }

        // =================================================
        // CƯ DÂN
        // Không cho tự đổi UserId
        // =================================================

        if (role == "CuDan")
        {
            var userId = LayUserId();

            if (userId == null)
            {
                return Unauthorized();
            }

            // Giữ nguyên căn hộ hiện tại.
            // Không lấy MaCanHo từ frontend để tránh
            // cư dân tự đổi sang căn hộ khác.
            phuongTienCu.UserId =
                userId.Value;

            var user =
                await _context.Users
                    .FindAsync(userId.Value);

            if (user != null)
            {
                phuongTienCu.TenChuXe =
                    user.HoTen;
            }
        }

        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        await _context.SaveChangesAsync();

        // -------------------------------------------------
        // AUDIT
        // -------------------------------------------------

        var currentUserId = LayUserId();

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
//
// Quy tắc:
// - Chưa từng có lượt gửi xe:
//      => Xóa vật lý.
//
// - Đã có lượt gửi xe:
//      => KHÔNG xóa vật lý.
//      => Chuyển TrangThai = "INACTIVE"
//         để giữ lại lịch sử.
// =====================================================

[HttpDelete("{id}")]
public async Task<IActionResult> Delete(long id)
{
    // -------------------------------------------------
    // TÌM PHƯƠNG TIỆN
    // -------------------------------------------------

    var phuongTien = await _context.PhuongTiens
        .FirstOrDefaultAsync(x => x.PhuongTienId == id);

    if (phuongTien == null)
    {
        return NotFound(new
        {
            message = "Phương tiện không tồn tại."
        });
    }

    // -------------------------------------------------
    // KIỂM TRA ROLE
    // -------------------------------------------------

    var role = LayRole();

    // -------------------------------------------------
    // CƯ DÂN CHỈ ĐƯỢC XÓA XE CỦA MÌNH
    // -------------------------------------------------

    if (role == "CuDan")
    {
        var userId = LayUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message = "Không xác định được người dùng."
            });
        }

        if (phuongTien.UserId != userId.Value)
        {
            return Forbid();
        }
    }

    // -------------------------------------------------
    // KIỂM TRA LỊCH SỬ GỬI XE
    // -------------------------------------------------

    var daCoLuotGuiXe = await _context.LuotGuiXes
        .AsNoTracking()
        .AnyAsync(x => x.PhuongTienId == id);

    // -------------------------------------------------
    // ĐÃ CÓ LỊCH SỬ
    //
    // KHÔNG ĐƯỢC Remove()
    //
    // Vì FK:
    // LuotGuiXes.PhuongTienId
    // -> PhuongTiens.PhuongTienId
    // ON DELETE RESTRICT
    // -------------------------------------------------

    if (daCoLuotGuiXe)
    {
        var bienSo = phuongTien.BienSo;

        // Chỉ chuyển trạng thái
        phuongTien.TrangThai = "INACTIVE";

        await _context.SaveChangesAsync();

        // Audit
        var currentUserId = LayUserId();

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

            trangThai = "INACTIVE",

            phuongTienId = phuongTien.PhuongTienId
        });
    }

    // -------------------------------------------------
    // CHƯA CÓ LỊCH SỬ
    //
    // Lúc này mới được Remove()
    // -------------------------------------------------

    var bienSoXoa = phuongTien.BienSo;

    _context.PhuongTiens.Remove(phuongTien);

    await _context.SaveChangesAsync();

    // -------------------------------------------------
    // AUDIT
    // -------------------------------------------------

    var currentUserIdDelete = LayUserId();

    await _auditLogService.GhiLog(
        currentUserIdDelete,
        "DELETE",
        "PhuongTien",
        id,
        $"Xoa phuong tien {bienSoXoa}"
    );

    return Ok(new
    {
        message = "Xóa phương tiện thành công.",
        phuongTienId = id
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
            await _context.LoaiPhuongTiens
                .OrderBy(
                    x => x.LoaiPhuongTienId
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

    [HttpGet("{id}/history")]
    public async Task<ActionResult<IEnumerable<LuotGuiXe>>>
        GetHistory(long id)
    {
        // -------------------------------------------------
        // KIỂM TRA PHƯƠNG TIỆN
        // -------------------------------------------------

        var phuongTien =
            await _context.PhuongTiens
                .FindAsync(id);

        if (phuongTien == null)
        {
            return NotFound(
                "Phuong tien khong ton tai."
            );
        }

        var role = LayRole();

        // =================================================
        // CƯ DÂN CHỈ XEM LỊCH SỬ XE CỦA MÌNH
        // =================================================

        if (role == "CuDan")
        {
            var userId = LayUserId();

            if (userId == null)
            {
                return Unauthorized();
            }

            if (phuongTien.UserId != userId)
            {
                return Forbid();
            }
        }

        // -------------------------------------------------
        // LẤY LỊCH SỬ
        // -------------------------------------------------

        var lichSu =
            await _context.LuotGuiXes
                .Where(
                    x => x.PhuongTienId == id
                )
                .OrderByDescending(
                    x => x.ThoiGianVao
                )
                .ToListAsync();

        return Ok(lichSu);
    }
}