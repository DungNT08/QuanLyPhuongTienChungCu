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
public class BangGiaController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuditLogService _auditLogService;

    public BangGiaController(
        AppDbContext context,
        AuditLogService auditLogService)
    {
        _context = context;
        _auditLogService = auditLogService;
    }

    // =========================================================
    // HELPER
    // =========================================================

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

    // =========================================================
    // GET: api/BangGia
    // =========================================================

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BangGiaDto>>> GetAll()
    {
        var danhSach = await _context.BangGias
            .Include(x => x.LoaiPhuongTien)
            .OrderBy(x => x.BangGiaId)
            .Select(x => new BangGiaDto
            {
                BangGiaId = x.BangGiaId,
                LoaiPhuongTienId = x.LoaiPhuongTienId,
                TenLoaiPhuongTien = x.LoaiPhuongTien!.TenLoai,
                DonGia = x.DonGia,
                HieuLucTu = x.HieuLucTu,
                HieuLucDen = x.HieuLucDen,
                TrangThai = x.TrangThai
            })
            .ToListAsync();

        return Ok(danhSach);
    }

    // =========================================================
    // GET: api/BangGia/{id}
    // =========================================================

    [HttpGet("{id}")]
    public async Task<ActionResult<BangGiaDto>> GetById(long id)
    {
        var bangGia = await _context.BangGias
            .Include(x => x.LoaiPhuongTien)
            .Where(x => x.BangGiaId == id)
            .Select(x => new BangGiaDto
            {
                BangGiaId = x.BangGiaId,
                LoaiPhuongTienId = x.LoaiPhuongTienId,
                TenLoaiPhuongTien = x.LoaiPhuongTien!.TenLoai,
                DonGia = x.DonGia,
                HieuLucTu = x.HieuLucTu,
                HieuLucDen = x.HieuLucDen,
                TrangThai = x.TrangThai
            })
            .FirstOrDefaultAsync();

        if (bangGia == null)
        {
            return NotFound("Bang gia khong ton tai.");
        }

        return Ok(bangGia);
    }

    // =========================================================
    // POST: api/BangGia
    //
    // LOGIC:
    // 1. Nếu HieuLucTu <= hôm nay (bắt đầu ngay):
    //    - Đóng giá cũ (cập nhật HieuLucDen, chuyển INACTIVE)
    //    - Kiểm tra trùng
    // 2. Nếu HieuLucTu > hôm nay (tương lai):
    //    - KHÔNG đóng giá cũ (giữ ACTIVE)
    //    - KHÔNG kiểm tra trùng (vì giá cũ vẫn đang chạy)
    //    - Giá mới sẽ ở trạng thái "Chưa hoạt động"
    // 3. Thêm giá mới
    // =========================================================

       // =========================================================
    // POST: api/BangGia
    // =========================================================

    [Authorize(Roles = "Admin,BanQuanLy")]
    [HttpPost]
    public async Task<ActionResult<BangGiaDto>> Create(BangGia bangGia)
    {
        var loaiPhuongTien = await _context.LoaiPhuongTiens
            .FindAsync(bangGia.LoaiPhuongTienId);

        if (loaiPhuongTien == null)
        {
            return BadRequest("Loai phuong tien khong ton tai.");
        }

        if (bangGia.DonGia < 0)
        {
            return BadRequest("Don gia khong duoc am.");
        }

        if (bangGia.HieuLucDen.HasValue &&
            bangGia.HieuLucDen.Value <= bangGia.HieuLucTu)
        {
            return BadRequest(
                "Hieu luc den phai lon hon hieu luc tu."
            );
        }

        if (string.IsNullOrWhiteSpace(bangGia.TrangThai))
        {
            bangGia.TrangThai = "ACTIVE";
        }

        bangGia.TrangThai = bangGia.TrangThai.Trim().ToUpper();

        // =========================================================
        // BƯỚC 1: CẬP NHẬT NGÀY KẾT THÚC CHO GIÁ CŨ
        // - Luôn cập nhật HieuLucDen của giá cũ = HieuLucTu của giá mới
        // - Chỉ chuyển INACTIVE nếu giá mới bắt đầu từ HÔM NAY trở về trước
        // - Nếu giá mới ở TƯƠNG LAI: giữ giá cũ ACTIVE
        // =========================================================
        var homNay = DateTime.Today;

        var cacGiaCuCungLoai = await _context.BangGias
            .Where(x =>
                x.LoaiPhuongTienId == bangGia.LoaiPhuongTienId &&
                x.TrangThai == "ACTIVE")
            .ToListAsync();

        foreach (var giaCu in cacGiaCuCungLoai)
        {
            // Luôn cập nhật ngày kết thúc cho giá cũ
            giaCu.HieuLucDen = bangGia.HieuLucTu;

            // Chỉ chuyển INACTIVE nếu giá mới bắt đầu từ hôm nay trở về trước
            if (bangGia.HieuLucTu.Date <= homNay)
            {
                giaCu.TrangThai = "INACTIVE";
            }
        }

        await _context.SaveChangesAsync();

        // =========================================================
        // BƯỚC 2: KIỂM TRA TRÙNG
        // =========================================================
        if (bangGia.TrangThai == "ACTIVE")
        {
            var biTrung = await KiemTraTrungBangGiaActive(
                bangGia.LoaiPhuongTienId,
                bangGia.HieuLucTu,
                bangGia.HieuLucDen,
                null
            );

            if (biTrung)
            {
                return Conflict(
                    "Da ton tai bang gia ACTIVE cua loai phuong tien " +
                    "nay trong khoang thoi gian hieu luc bi trung."
                );
            }
        }

        // =========================================================
        // BƯỚC 3: THÊM GIÁ MỚI
        // =========================================================
        _context.BangGias.Add(bangGia);

        await _context.SaveChangesAsync();

        var currentUserId = LayUserId();

        await _auditLogService.GhiLog(
            currentUserId,
            "CREATE",
            "BangGia",
            bangGia.BangGiaId,
            $"Tao bang gia cho loai phuong tien {loaiPhuongTien.TenLoai}"
        );

        var ketQua = new BangGiaDto
        {
            BangGiaId = bangGia.BangGiaId,
            LoaiPhuongTienId = bangGia.LoaiPhuongTienId,
            TenLoaiPhuongTien = loaiPhuongTien.TenLoai,
            DonGia = bangGia.DonGia,
            HieuLucTu = bangGia.HieuLucTu,
            HieuLucDen = bangGia.HieuLucDen,
            TrangThai = bangGia.TrangThai
        };

        return CreatedAtAction(
            nameof(GetById),
            new { id = bangGia.BangGiaId },
            ketQua
        );
    }
    // =========================================================
    // PUT: api/BangGia/{id}
    // =========================================================

    [Authorize(Roles = "Admin,BanQuanLy")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        long id,
        BangGia bangGia)
    {
        if (id != bangGia.BangGiaId)
        {
            return BadRequest("Id khong khop.");
        }

        var bangGiaCu = await _context.BangGias
            .FindAsync(id);

        if (bangGiaCu == null)
        {
            return NotFound("Bang gia khong ton tai.");
        }

        var loaiPhuongTien = await _context.LoaiPhuongTiens
            .FindAsync(bangGia.LoaiPhuongTienId);

        if (loaiPhuongTien == null)
        {
            return BadRequest("Loai phuong tien khong ton tai.");
        }

        if (bangGia.DonGia < 0)
        {
            return BadRequest("Don gia khong duoc am.");
        }

        if (bangGia.HieuLucDen.HasValue &&
            bangGia.HieuLucDen.Value <= bangGia.HieuLucTu)
        {
            return BadRequest(
                "Hieu luc den phai lon hon hieu luc tu."
            );
        }

        if (string.IsNullOrWhiteSpace(bangGia.TrangThai))
        {
            bangGia.TrangThai = bangGiaCu.TrangThai;
        }

        bangGia.TrangThai =
            bangGia.TrangThai.Trim().ToUpper();

        if (bangGia.TrangThai == "ACTIVE")
        {
            var biTrung = await KiemTraTrungBangGiaActive(
                bangGia.LoaiPhuongTienId,
                bangGia.HieuLucTu,
                bangGia.HieuLucDen,
                id
            );

            if (biTrung)
            {
                return Conflict(
                    "Da ton tai bang gia ACTIVE cua loai phuong tien " +
                    "nay trong khoang thoi gian hieu luc bi trung."
                );
            }
        }

        bangGiaCu.LoaiPhuongTienId =
            bangGia.LoaiPhuongTienId;

        bangGiaCu.DonGia =
            bangGia.DonGia;

        bangGiaCu.HieuLucTu =
            bangGia.HieuLucTu;

        bangGiaCu.HieuLucDen =
            bangGia.HieuLucDen;

        bangGiaCu.TrangThai =
            bangGia.TrangThai;

        await _context.SaveChangesAsync();

        var currentUserId = LayUserId();

        await _auditLogService.GhiLog(
            currentUserId,
            "UPDATE",
            "BangGia",
            bangGiaCu.BangGiaId,
            $"Cap nhat bang gia cho loai phuong tien {loaiPhuongTien.TenLoai}"
        );

        return NoContent();
    }

    // =========================================================
    // DELETE: api/BangGia/{id}
    // =========================================================

    [Authorize(Roles = "Admin,BanQuanLy")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var bangGia = await _context.BangGias
            .FirstOrDefaultAsync(x => x.BangGiaId == id);

        if (bangGia == null)
        {
            return NotFound(new
            {
                message = "Bảng giá không tồn tại."
            });
        }

        var homNay = DateTime.Today;

        if (bangGia.HieuLucTu.Date <= homNay)
        {
            return BadRequest(new
            {
                message = "Không thể xóa bảng giá đã/đang hoạt động. " +
                          "Vui lòng chuyển sang trạng thái 'Ngừng hoạt động' " +
                          "thay vì xóa để giữ lịch sử."
            });
        }

        _context.BangGias.Remove(bangGia);

        await _context.SaveChangesAsync();

        var currentUserId = LayUserId();

        await _auditLogService.GhiLog(
            currentUserId,
            "DELETE",
            "BangGia",
            id,
            $"Xoa bang gia {id}"
        );

        return Ok(new
        {
            message = "Xóa bảng giá thành công.",
            bangGiaId = id
        });
    }

    // =========================================================
    // HAM KIEM TRA TRUNG BANG GIA ACTIVE
    // =========================================================

    private async Task<bool> KiemTraTrungBangGiaActive(
        long loaiPhuongTienId,
        DateTime hieuLucTu,
        DateTime? hieuLucDen,
        long? boQuaBangGiaId)
    {
        var query = _context.BangGias
            .AsNoTracking()
            .Where(x =>
                x.LoaiPhuongTienId == loaiPhuongTienId &&
                x.TrangThai == "ACTIVE");

        if (boQuaBangGiaId.HasValue)
        {
            query = query.Where(x => x.BangGiaId != boQuaBangGiaId.Value);
        }

        var danhSach = await query.ToListAsync();

        foreach (var bangGia in danhSach)
        {
            if (bangGia.HieuLucDen.HasValue &&
                bangGia.HieuLucDen.Value <= hieuLucTu)
            {
                continue;
            }

            bool trung = false;

            if (!hieuLucDen.HasValue)
            {
                if (!bangGia.HieuLucDen.HasValue) trung = true;
                else if (hieuLucTu < bangGia.HieuLucDen.Value) trung = true;
            }
            else
            {
                if (!bangGia.HieuLucDen.HasValue)
                {
                    if (hieuLucDen.Value > bangGia.HieuLucTu) trung = true;
                }
                else
                {
                    if (hieuLucTu < bangGia.HieuLucDen.Value &&
                        hieuLucDen.Value > bangGia.HieuLucTu) trung = true;
                }
            }

            if (trung) return true;
        }

        return false;
    }
}
