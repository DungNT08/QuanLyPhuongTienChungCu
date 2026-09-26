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
    // CONSTANT
    // =========================================================

    private const string PER_TURN = "PER_TURN";
    private const string MONTHLY = "MONTHLY";

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
    // HELPER - CHUẨN HÓA LOẠI TÍNH PHÍ
    // =========================================================

    private string ChuanHoaLoaiTinhPhi(string? loaiTinhPhi)
    {
        if (string.IsNullOrWhiteSpace(loaiTinhPhi))
        {
            return PER_TURN;
        }

        return loaiTinhPhi.Trim().ToUpper();
    }

    // =========================================================
    // HELPER - KIỂM TRA LOẠI TÍNH PHÍ
    // =========================================================

    private bool LoaiTinhPhiHopLe(string loaiTinhPhi)
    {
        return loaiTinhPhi == PER_TURN ||
               loaiTinhPhi == MONTHLY;
    }

    // =========================================================
    // HELPER - TÊN LOẠI TÍNH PHÍ
    // =========================================================

    private string LayTenLoaiTinhPhi(string loaiTinhPhi)
    {
        return loaiTinhPhi switch
        {
            PER_TURN => "Theo lượt",
            MONTHLY => "Theo tháng",
            _ => loaiTinhPhi
        };
    }

    // =========================================================
    // GET: api/BangGia
    // =========================================================

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BangGiaDto>>> GetAll()
    {
        var danhSach = await _context.BangGias
            .AsNoTracking()
            .Include(x => x.LoaiPhuongTien)
            .OrderBy(x => x.LoaiTinhPhi)
            .ThenBy(x => x.LoaiPhuongTienId)
            .ThenBy(x => x.HieuLucTu)
            .ThenBy(x => x.BangGiaId)
            .Select(x => new BangGiaDto
            {
                BangGiaId = x.BangGiaId,

                LoaiPhuongTienId = x.LoaiPhuongTienId,

                TenLoaiPhuongTien =
                    x.LoaiPhuongTien != null
                        ? x.LoaiPhuongTien.TenLoai
                        : null,

                DonGia = x.DonGia,

                LoaiTinhPhi = x.LoaiTinhPhi,

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
            .AsNoTracking()
            .Include(x => x.LoaiPhuongTien)
            .Where(x => x.BangGiaId == id)
            .Select(x => new BangGiaDto
            {
                BangGiaId = x.BangGiaId,

                LoaiPhuongTienId = x.LoaiPhuongTienId,

                TenLoaiPhuongTien =
                    x.LoaiPhuongTien != null
                        ? x.LoaiPhuongTien.TenLoai
                        : null,

                DonGia = x.DonGia,

                LoaiTinhPhi = x.LoaiTinhPhi,

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
    // PER_TURN = Khách
    // MONTHLY  = Cư dân
    //
    // Hai loại tính phí được quản lý độc lập.
    // Ví dụ cùng LoaiPhuongTienId = 1:
    //
    // 7000  PER_TURN
    // 100000 MONTHLY
    //
    // => HOÀN TOÀN HỢP LỆ.
    // =========================================================

    [Authorize(Roles = "Admin,BanQuanLy")]
    [HttpPost]
    public async Task<ActionResult<BangGiaDto>> Create(
        BangGia bangGia)
    {
        // =====================================================
        // 1. KIỂM TRA LOẠI PHƯƠNG TIỆN
        // =====================================================

        var loaiPhuongTien =
            await _context.LoaiPhuongTiens
                .FindAsync(bangGia.LoaiPhuongTienId);

        if (loaiPhuongTien == null)
        {
            return BadRequest(
                "Loai phuong tien khong ton tai."
            );
        }

        // =====================================================
        // 2. KIỂM TRA ĐƠN GIÁ
        // =====================================================

        if (bangGia.DonGia <= 0)
        {
            return BadRequest(
                "Don gia phai lon hon 0."
            );
        }

        // =====================================================
        // 3. CHUẨN HÓA LOẠI TÍNH PHÍ
        // =====================================================

        bangGia.LoaiTinhPhi =
            ChuanHoaLoaiTinhPhi(
                bangGia.LoaiTinhPhi
            );

        if (!LoaiTinhPhiHopLe(bangGia.LoaiTinhPhi))
        {
            return BadRequest(
                "LoaiTinhPhi chi duoc la PER_TURN hoac MONTHLY."
            );
        }

        // =====================================================
        // 4. KIỂM TRA NGÀY
        // =====================================================

        if (bangGia.HieuLucDen.HasValue &&
            bangGia.HieuLucDen.Value <= bangGia.HieuLucTu)
        {
            return BadRequest(
                "Hieu luc den phai lon hon hieu luc tu."
            );
        }

        // =====================================================
        // 5. CHUẨN HÓA TRẠNG THÁI
        // =====================================================

        if (string.IsNullOrWhiteSpace(
                bangGia.TrangThai))
        {
            bangGia.TrangThai = "ACTIVE";
        }

        bangGia.TrangThai =
            bangGia.TrangThai.Trim().ToUpper();

        // =====================================================
        // 6. CHỈ CHO PHÉP ACTIVE / INACTIVE
        // =====================================================

        if (bangGia.TrangThai != "ACTIVE" &&
            bangGia.TrangThai != "INACTIVE")
        {
            return BadRequest(
                "TrangThai chi duoc la ACTIVE hoac INACTIVE."
            );
        }

        // =====================================================
        // 7. XỬ LÝ GIÁ CŨ
        //
        // QUAN TRỌNG:
        // Chỉ xử lý giá cũ cùng:
        //
        // LoaiPhuongTienId
        // + LoaiTinhPhi
        //
        // Ví dụ:
        //
        // Xe máy PER_TURN
        // không ảnh hưởng
        // Xe máy MONTHLY
        // =====================================================

        var homNay = DateTime.Today;

        var cacGiaCuCungLoai = await _context.BangGias
            .Where(x =>
                x.LoaiPhuongTienId ==
                    bangGia.LoaiPhuongTienId
                &&
                x.LoaiTinhPhi ==
                    bangGia.LoaiTinhPhi
                &&
                x.TrangThai == "ACTIVE")
            .ToListAsync();

        foreach (var giaCu in cacGiaCuCungLoai)
        {
            // Không xử lý chính nó
            if (giaCu.BangGiaId ==
                bangGia.BangGiaId)
            {
                continue;
            }

            // Giá mới bắt đầu từ tương lai:
            // giá cũ vẫn tiếp tục ACTIVE
            //
            // Tuy nhiên không nên để HieuLucDen
            // bằng ngày bắt đầu nếu giá mới chưa hoạt động.
            if (bangGia.HieuLucTu.Date > homNay)
            {
                continue;
            }

            // Giá mới bắt đầu hôm nay / quá khứ
            // => đóng giá cũ tại thời điểm giá mới bắt đầu
            if (!giaCu.HieuLucDen.HasValue ||
                giaCu.HieuLucDen.Value >
                bangGia.HieuLucTu)
            {
                giaCu.HieuLucDen =
                    bangGia.HieuLucTu;
            }

            giaCu.TrangThai = "INACTIVE";
        }

        await _context.SaveChangesAsync();

        // =====================================================
        // 8. KIỂM TRA TRÙNG
        //
        // Chỉ kiểm tra:
        //
        // cùng loại phương tiện
        // + cùng loại tính phí
        // + ACTIVE
        //
        // PER_TURN và MONTHLY không đụng nhau.
        // =====================================================

        if (bangGia.TrangThai == "ACTIVE")
        {
            var biTrung =
                await KiemTraTrungBangGiaActive(
                    bangGia.LoaiPhuongTienId,
                    bangGia.LoaiTinhPhi,
                    bangGia.HieuLucTu,
                    bangGia.HieuLucDen,
                    null
                );

            if (biTrung)
            {
                return Conflict(
                    "Da ton tai bang gia ACTIVE cua " +
                    "loai phuong tien va loai tinh phi " +
                    "nay trong khoang thoi gian hieu luc bi trung."
                );
            }
        }

        // =====================================================
        // 9. THÊM BẢNG GIÁ
        // =====================================================

        _context.BangGias.Add(bangGia);

        await _context.SaveChangesAsync();

        // =====================================================
        // 10. GHI AUDIT LOG
        // =====================================================

        var currentUserId = LayUserId();

        await _auditLogService.GhiLog(
            currentUserId,
            "CREATE",
            "BangGia",
            bangGia.BangGiaId,
            $"Tao bang gia " +
            $"{LayTenLoaiTinhPhi(bangGia.LoaiTinhPhi)} " +
            $"cho loai phuong tien " +
            $"{loaiPhuongTien.TenLoai}"
        );

        // =====================================================
        // 11. TRẢ DTO
        // =====================================================

        var ketQua = new BangGiaDto
        {
            BangGiaId =
                bangGia.BangGiaId,

            LoaiPhuongTienId =
                bangGia.LoaiPhuongTienId,

            TenLoaiPhuongTien =
                loaiPhuongTien.TenLoai,

            DonGia =
                bangGia.DonGia,

            LoaiTinhPhi =
                bangGia.LoaiTinhPhi,

            HieuLucTu =
                bangGia.HieuLucTu,

            HieuLucDen =
                bangGia.HieuLucDen,

            TrangThai =
                bangGia.TrangThai
        };

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                id = bangGia.BangGiaId
            },
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
        // =====================================================
        // 1. KIỂM TRA ID
        // =====================================================

        if (id != bangGia.BangGiaId)
        {
            return BadRequest(
                "Id khong khop."
            );
        }

        // =====================================================
        // 2. LẤY BẢNG GIÁ CŨ
        // =====================================================

        var bangGiaCu =
            await _context.BangGias
                .FirstOrDefaultAsync(
                    x => x.BangGiaId == id
                );

        if (bangGiaCu == null)
        {
            return NotFound(
                "Bang gia khong ton tai."
            );
        }

        // =====================================================
        // 3. KIỂM TRA LOẠI PHƯƠNG TIỆN
        // =====================================================

        var loaiPhuongTien =
            await _context.LoaiPhuongTiens
                .FindAsync(
                    bangGia.LoaiPhuongTienId
                );

        if (loaiPhuongTien == null)
        {
            return BadRequest(
                "Loai phuong tien khong ton tai."
            );
        }

        // =====================================================
        // 4. KIỂM TRA ĐƠN GIÁ
        // =====================================================

        if (bangGia.DonGia <= 0)
        {
            return BadRequest(
                "Don gia phai lon hon 0."
            );
        }

        // =====================================================
        // 5. LOẠI TÍNH PHÍ
        //
        // Nếu frontend không gửi thì giữ loại cũ.
        // =====================================================

        if (string.IsNullOrWhiteSpace(
                bangGia.LoaiTinhPhi))
        {
            bangGia.LoaiTinhPhi =
                bangGiaCu.LoaiTinhPhi;
        }

        bangGia.LoaiTinhPhi =
            ChuanHoaLoaiTinhPhi(
                bangGia.LoaiTinhPhi
            );

        if (!LoaiTinhPhiHopLe(
                bangGia.LoaiTinhPhi))
        {
            return BadRequest(
                "LoaiTinhPhi chi duoc la PER_TURN hoac MONTHLY."
            );
        }

        // =====================================================
        // 6. KIỂM TRA NGÀY
        // =====================================================

        if (bangGia.HieuLucDen.HasValue &&
            bangGia.HieuLucDen.Value <=
            bangGia.HieuLucTu)
        {
            return BadRequest(
                "Hieu luc den phai lon hon hieu luc tu."
            );
        }

        // =====================================================
        // 7. TRẠNG THÁI
        // =====================================================

        if (string.IsNullOrWhiteSpace(
                bangGia.TrangThai))
        {
            bangGia.TrangThai =
                bangGiaCu.TrangThai;
        }

        bangGia.TrangThai =
            bangGia.TrangThai.Trim().ToUpper();

        if (bangGia.TrangThai != "ACTIVE" &&
            bangGia.TrangThai != "INACTIVE")
        {
            return BadRequest(
                "TrangThai chi duoc la ACTIVE hoac INACTIVE."
            );
        }

        // =====================================================
        // 8. KIỂM TRA TRÙNG
        // =====================================================

        if (bangGia.TrangThai == "ACTIVE")
        {
            var biTrung =
                await KiemTraTrungBangGiaActive(
                    bangGia.LoaiPhuongTienId,
                    bangGia.LoaiTinhPhi,
                    bangGia.HieuLucTu,
                    bangGia.HieuLucDen,
                    id
                );

            if (biTrung)
            {
                return Conflict(
                    "Da ton tai bang gia ACTIVE cua " +
                    "loai phuong tien va loai tinh phi " +
                    "nay trong khoang thoi gian hieu luc bi trung."
                );
            }
        }

        // =====================================================
        // 9. CẬP NHẬT
        // =====================================================

        bangGiaCu.LoaiPhuongTienId =
            bangGia.LoaiPhuongTienId;

        bangGiaCu.DonGia =
            bangGia.DonGia;

        bangGiaCu.LoaiTinhPhi =
            bangGia.LoaiTinhPhi;

        bangGiaCu.HieuLucTu =
            bangGia.HieuLucTu;

        bangGiaCu.HieuLucDen =
            bangGia.HieuLucDen;

        bangGiaCu.TrangThai =
            bangGia.TrangThai;

        await _context.SaveChangesAsync();

        // =====================================================
        // 10. AUDIT LOG
        // =====================================================

        var currentUserId = LayUserId();

        await _auditLogService.GhiLog(
            currentUserId,
            "UPDATE",
            "BangGia",
            bangGiaCu.BangGiaId,
            $"Cap nhat bang gia " +
            $"{LayTenLoaiTinhPhi(bangGiaCu.LoaiTinhPhi)} " +
            $"cho loai phuong tien " +
            $"{loaiPhuongTien.TenLoai}"
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
        var bangGia =
            await _context.BangGias
                .FirstOrDefaultAsync(
                    x => x.BangGiaId == id
                );

        if (bangGia == null)
        {
            return NotFound(new
            {
                message =
                    "Bảng giá không tồn tại."
            });
        }

        var homNay =
            DateTime.Today;

        // =====================================================
        // Không cho xóa giá đã bắt đầu
        // =====================================================

        if (bangGia.HieuLucTu.Date <= homNay)
        {
            return BadRequest(new
            {
                message =
                    "Không thể xóa bảng giá đã/đang hoạt động. " +
                    "Vui lòng chuyển sang trạng thái " +
                    "'Ngừng hoạt động' thay vì xóa để giữ lịch sử."
            });
        }

        _context.BangGias.Remove(bangGia);

        await _context.SaveChangesAsync();

        // =====================================================
        // AUDIT
        // =====================================================

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
            message =
                "Xóa bảng giá thành công.",

            bangGiaId = id
        });
    }

    // =========================================================
    // GET: api/BangGia/khach
    //
    // Chỉ lấy PER_TURN
    // =========================================================

    [HttpGet("khach")]
    public async Task<ActionResult<IEnumerable<BangGiaDto>>> GetGiaKhach()
    {
        var danhSach =
            await _context.BangGias
                .AsNoTracking()
                .Include(x => x.LoaiPhuongTien)
                .Where(x =>
                    x.LoaiTinhPhi == PER_TURN)
                .OrderBy(x => x.LoaiPhuongTienId)
                .ThenBy(x => x.HieuLucTu)
                .Select(x => new BangGiaDto
                {
                    BangGiaId =
                        x.BangGiaId,

                    LoaiPhuongTienId =
                        x.LoaiPhuongTienId,

                    TenLoaiPhuongTien =
                        x.LoaiPhuongTien != null
                            ? x.LoaiPhuongTien.TenLoai
                            : null,

                    DonGia =
                        x.DonGia,

                    LoaiTinhPhi =
                        x.LoaiTinhPhi,

                    HieuLucTu =
                        x.HieuLucTu,

                    HieuLucDen =
                        x.HieuLucDen,

                    TrangThai =
                        x.TrangThai
                })
                .ToListAsync();

        return Ok(danhSach);
    }

    // =========================================================
    // GET: api/BangGia/cu-dan
    //
    // Chỉ lấy MONTHLY
    // =========================================================

    [HttpGet("cu-dan")]
    public async Task<ActionResult<IEnumerable<BangGiaDto>>> GetGiaCuDan()
    {
        var danhSach =
            await _context.BangGias
                .AsNoTracking()
                .Include(x => x.LoaiPhuongTien)
                .Where(x =>
                    x.LoaiTinhPhi == MONTHLY)
                .OrderBy(x => x.LoaiPhuongTienId)
                .ThenBy(x => x.HieuLucTu)
                .Select(x => new BangGiaDto
                {
                    BangGiaId =
                        x.BangGiaId,

                    LoaiPhuongTienId =
                        x.LoaiPhuongTienId,

                    TenLoaiPhuongTien =
                        x.LoaiPhuongTien != null
                            ? x.LoaiPhuongTien.TenLoai
                            : null,

                    DonGia =
                        x.DonGia,

                    LoaiTinhPhi =
                        x.LoaiTinhPhi,

                    HieuLucTu =
                        x.HieuLucTu,

                    HieuLucDen =
                        x.HieuLucDen,

                    TrangThai =
                        x.TrangThai
                })
                .ToListAsync();

        return Ok(danhSach);
    }

    // =========================================================
    // HÀM KIỂM TRA TRÙNG BẢNG GIÁ ACTIVE
    //
    // QUAN TRỌNG:
    //
    // LoaiPhuongTienId + LoaiTinhPhi
    //
    // Ví dụ:
    //
    // Xe máy + PER_TURN
    // Xe máy + MONTHLY
    //
    // là 2 nhóm độc lập.
    // =========================================================

    private async Task<bool> KiemTraTrungBangGiaActive(
        long loaiPhuongTienId,
        string loaiTinhPhi,
        DateTime hieuLucTu,
        DateTime? hieuLucDen,
        long? boQuaBangGiaId)
    {
        var query =
            _context.BangGias
                .AsNoTracking()
                .Where(x =>
                    x.LoaiPhuongTienId ==
                        loaiPhuongTienId
                    &&
                    x.LoaiTinhPhi ==
                        loaiTinhPhi
                    &&
                    x.TrangThai ==
                        "ACTIVE");

        // =====================================================
        // Bỏ qua bản thân khi UPDATE
        // =====================================================

        if (boQuaBangGiaId.HasValue)
        {
            query = query.Where(
                x =>
                    x.BangGiaId !=
                    boQuaBangGiaId.Value
            );
        }

        var danhSach =
            await query.ToListAsync();

        // =====================================================
        // KIỂM TRA TỪNG KHOẢNG THỜI GIAN
        // =====================================================

        foreach (var bangGia in danhSach)
        {
            // -------------------------------------------------
            // Nếu giá cũ kết thúc trước hoặc đúng ngày giá mới
            // bắt đầu thì KHÔNG trùng.
            // -------------------------------------------------

            if (bangGia.HieuLucDen.HasValue &&
                bangGia.HieuLucDen.Value <=
                hieuLucTu)
            {
                continue;
            }

            bool trung = false;

            // =================================================
            // GIÁ MỚI KHÔNG CÓ NGÀY KẾT THÚC
            // =================================================

            if (!hieuLucDen.HasValue)
            {
                // Giá cũ cũng không có ngày kết thúc
                if (!bangGia.HieuLucDen.HasValue)
                {
                    trung = true;
                }
                // Giá cũ còn hiệu lực sau ngày bắt đầu mới
                else if (
                    hieuLucTu <
                    bangGia.HieuLucDen.Value)
                {
                    trung = true;
                }
            }

            // =================================================
            // GIÁ MỚI CÓ NGÀY KẾT THÚC
            // =================================================

            else
            {
                // Giá cũ không có ngày kết thúc
                if (!bangGia.HieuLucDen.HasValue)
                {
                    if (
                        hieuLucDen.Value >
                        bangGia.HieuLucTu)
                    {
                        trung = true;
                    }
                }
                else
                {
                    // Hai khoảng thời gian giao nhau
                    if (
                        hieuLucTu <
                            bangGia.HieuLucDen.Value
                        &&
                        hieuLucDen.Value >
                            bangGia.HieuLucTu)
                    {
                        trung = true;
                    }
                }
            }

            if (trung)
            {
                return true;
            }
        }

        return false;
    }
}