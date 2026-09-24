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
    // Xem danh sach bang gia
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

        bangGia.TrangThai =
            bangGia.TrangThai.Trim().ToUpper();

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
    //
    // QUY TẮC:
    // - "Chưa hoạt động" (HieuLucTu > Hôm nay) => CHO PHÉP XÓA
    // - "Đang hoạt động" hoặc "Ngừng hoạt động" => CHẶN XÓA
    //
    // Lý do:
    // - Chưa hoạt động: chưa ảnh hưởng nghiệp vụ, có thể xóa an toàn.
    // - Đang hoạt động: đang được dùng để tính phí.
    // - Ngừng hoạt động: đã từng được dùng, cần giữ lịch sử.
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

        // Kiểm tra: Chỉ cho phép xóa khi bảng giá "Chưa hoạt động"
        // Tức là ngày bắt đầu (HieuLucTu) > ngày hôm nay
        var homNay = DateTime.Today;

        if (bangGia.HieuLucTu.Date <= homNay)
        {
            // Đã/đang hoạt động => CHẶN XÓA
            return BadRequest(new
            {
                message = "Không thể xóa bảng giá đã/đang hoạt động. " +
                          "Vui lòng chuyển sang trạng thái 'Ngừng hoạt động' " +
                          "thay vì xóa để giữ lịch sử."
            });
        }

        // Chưa hoạt động => CHO PHÉP XÓA
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
            query = query.Where(
                x => x.BangGiaId != boQuaBangGiaId.Value
            );
        }

        var danhSach = await query.ToListAsync();

        foreach (var bangGia in danhSach)
        {
            if (!hieuLucDen.HasValue &&
                bangGia.HieuLucDen.HasValue)
            {
                if (hieuLucTu < bangGia.HieuLucDen.Value)
                {
                    return true;
                }
            }
            else if (!hieuLucDen.HasValue &&
                     !bangGia.HieuLucDen.HasValue)
            {
                return true;
            }
            else if (hieuLucDen.HasValue &&
                     !bangGia.HieuLucDen.HasValue)
            {
                if (hieuLucDen.Value > bangGia.HieuLucTu)
                {
                    return true;
                }
            }
            else if (hieuLucDen.HasValue &&
                     bangGia.HieuLucDen.HasValue)
            {
                if (hieuLucTu < bangGia.HieuLucDen.Value &&
                    hieuLucDen.Value > bangGia.HieuLucTu)
                {
                    return true;
                }
            }
        }

        return false;
    }
}
