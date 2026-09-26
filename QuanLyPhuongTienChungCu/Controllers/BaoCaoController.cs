using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Data;

namespace QuanLyPhuongTienChungCu.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,BanQuanLy,KeToan")]
public class BaoCaoController : ControllerBase
{
    private readonly AppDbContext _context;

    public BaoCaoController(AppDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // TỔNG QUAN
    // =====================================================

    [HttpGet("tong-quan")]
    public async Task<IActionResult> TongQuan(
        DateTime? tuNgay,
        DateTime? denNgay,
        string? loaiXe)
    {
        // -------------------------------------------------
        // PHƯƠNG TIỆN
        // -------------------------------------------------

        var phuongTienQuery = _context.PhuongTiens
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(loaiXe) &&
            !loaiXe.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            // Nếu frontend gửi mã loại xe như OTO/XEMAY...
            // thì lọc theo tên loại phương tiện.
            phuongTienQuery = phuongTienQuery.Where(x =>
                x.LoaiPhuongTien != null &&
                x.LoaiPhuongTien.TenLoai == loaiXe);
        }

        var tongPhuongTien =
            await phuongTienQuery.CountAsync();

        // -------------------------------------------------
        // LƯỢT GỬI
        // -------------------------------------------------

        var luotGuiQuery = _context.LuotGuiXes
            .AsNoTracking()
            .AsQueryable();

        if (tuNgay.HasValue)
        {
            var ngayBatDau = tuNgay.Value.Date;

            luotGuiQuery = luotGuiQuery.Where(x =>
                x.ThoiGianVao >= ngayBatDau);
        }

        if (denNgay.HasValue)
        {
            var ngayKetThuc =
                denNgay.Value.Date.AddDays(1);

            luotGuiQuery = luotGuiQuery.Where(x =>
                x.ThoiGianVao < ngayKetThuc);
        }

        if (!string.IsNullOrWhiteSpace(loaiXe) &&
            !loaiXe.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            luotGuiQuery = luotGuiQuery.Where(x =>
                x.LoaiPhuongTien != null &&
                x.LoaiPhuongTien.TenLoai == loaiXe);
        }

        var luotGui =
            await luotGuiQuery.CountAsync();

        // -------------------------------------------------
        // DOANH THU
        // -------------------------------------------------

        var thanhToanQuery = _context.ThanhToans
            .AsNoTracking()
            .Where(x => x.TrangThai == "PAID")
            .AsQueryable();

        if (tuNgay.HasValue)
        {
            var ngayBatDau = tuNgay.Value.Date;

            thanhToanQuery = thanhToanQuery.Where(x =>
                x.ThoiGianThanhToan >= ngayBatDau);
        }

        if (denNgay.HasValue)
        {
            var ngayKetThuc =
                denNgay.Value.Date.AddDays(1);

            thanhToanQuery = thanhToanQuery.Where(x =>
                x.ThoiGianThanhToan < ngayKetThuc);
        }

        if (!string.IsNullOrWhiteSpace(loaiXe) &&
            !loaiXe.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            thanhToanQuery = thanhToanQuery.Where(x =>
                x.LuotGuiXe != null &&
                x.LuotGuiXe.LoaiPhuongTien != null &&
                x.LuotGuiXe.LoaiPhuongTien.TenLoai == loaiXe);
        }

        var doanhThu =
            await thanhToanQuery
                .SumAsync(x => (decimal?)x.SoTien) ?? 0;

        // -------------------------------------------------
        // XE CƯ DÂN / XE KHÁCH
        // -------------------------------------------------
        //
        // Phương tiện cư dân:
        //     PhuongTienId != null
        //
        // Xe khách:
        //     PhuongTienId == null
        //
        // Ở đây thống kê theo lượt gửi trong khoảng thời gian.
        // -------------------------------------------------

        var xeCuDan =
            await luotGuiQuery
                .CountAsync(x => x.PhuongTienId.HasValue);

        var xeKhach =
            await luotGuiQuery
                .CountAsync(x => !x.PhuongTienId.HasValue);

        return Ok(new
        {
            tongPhuongTien,
            xeCuDan,
            xeKhach,
            luotGui,
            doanhThu
        });
    }


    // =====================================================
    // DOANH THU THEO NGÀY
    // =====================================================

    [HttpGet("doanh-thu")]
    public async Task<IActionResult> DoanhThu(
        DateTime? tuNgay,
        DateTime? denNgay,
        string? loaiXe)
    {
        var query = _context.ThanhToans
            .AsNoTracking()
            .Where(x => x.TrangThai == "PAID")
            .AsQueryable();

        // -------------------------------------------------
        // TỪ NGÀY
        // -------------------------------------------------

        if (tuNgay.HasValue)
        {
            var ngayBatDau = tuNgay.Value.Date;

            query = query.Where(x =>
                x.ThoiGianThanhToan >= ngayBatDau);
        }

        // -------------------------------------------------
        // ĐẾN NGÀY
        // -------------------------------------------------

        if (denNgay.HasValue)
        {
            var ngayKetThuc =
                denNgay.Value.Date.AddDays(1);

            query = query.Where(x =>
                x.ThoiGianThanhToan < ngayKetThuc);
        }

        // -------------------------------------------------
        // LOẠI XE
        // -------------------------------------------------

        if (!string.IsNullOrWhiteSpace(loaiXe) &&
            !loaiXe.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(x =>
                x.LuotGuiXe != null &&
                x.LuotGuiXe.LoaiPhuongTien != null &&
                x.LuotGuiXe.LoaiPhuongTien.TenLoai == loaiXe);
        }

        // -------------------------------------------------
        // TỔNG DOANH THU
        // -------------------------------------------------

        var tongDoanhThu =
            await query
                .SumAsync(x => (decimal?)x.SoTien) ?? 0;

        var soGiaoDich =
            await query.CountAsync();

        // -------------------------------------------------
        // DOANH THU THEO NGÀY
        // -------------------------------------------------

        var grouped =
            await query
                .GroupBy(x => x.ThoiGianThanhToan.Date)
                .Select(g => new
                {
                    ngay = g.Key,
                    giaTri = g.Sum(x => x.SoTien)
                })
                .OrderBy(x => x.ngay)
                .ToListAsync();

        return Ok(new
        {
            tuNgay,
            denNgay,
            loaiXe,
            soGiaoDich,
            tongDoanhThu,
            data = grouped
        });
    }


    // =====================================================
    // LƯỢT GỬI XE
    // =====================================================

    [HttpGet("luot-gui")]
    public async Task<IActionResult> LuotGui(
        DateTime? tuNgay,
        DateTime? denNgay,
        string? loaiXe)
    {
        var query = _context.LuotGuiXes
            .AsNoTracking()
            .Include(x => x.LoaiPhuongTien)
            .AsQueryable();

        // -------------------------------------------------
        // TỪ NGÀY
        // -------------------------------------------------

        if (tuNgay.HasValue)
        {
            var ngayBatDau = tuNgay.Value.Date;

            query = query.Where(x =>
                x.ThoiGianVao >= ngayBatDau);
        }

        // -------------------------------------------------
        // ĐẾN NGÀY
        // -------------------------------------------------

        if (denNgay.HasValue)
        {
            var ngayKetThuc =
                denNgay.Value.Date.AddDays(1);

            query = query.Where(x =>
                x.ThoiGianVao < ngayKetThuc);
        }

        // -------------------------------------------------
        // LOẠI XE
        // -------------------------------------------------

        if (!string.IsNullOrWhiteSpace(loaiXe) &&
            !loaiXe.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(x =>
                x.LoaiPhuongTien != null &&
                x.LoaiPhuongTien.TenLoai == loaiXe);
        }

        // -------------------------------------------------
        // TỔNG
        // -------------------------------------------------

        var tongLuotGui =
            await query.CountAsync();

        var dangGui =
            await query.CountAsync(x =>
                x.TrangThai == "ACTIVE");

        var daRa =
            await query.CountAsync(x =>
                x.TrangThai == "COMPLETED");

        // -------------------------------------------------
        // THỐNG KÊ THEO NGÀY + LOẠI XE + ĐỐI TƯỢNG
        // -------------------------------------------------

        var grouped =
            await query
                .GroupBy(x => new
                {
                    Ngay = x.ThoiGianVao.Date,
                    LoaiXe = x.LoaiPhuongTien != null
                        ? x.LoaiPhuongTien.TenLoai
                        : "Không xác định",
                    DoiTuong = x.PhuongTienId.HasValue
                        ? "Cư dân"
                        : "Khách"
                })
                .Select(g => new
                {
                    ngay = g.Key.Ngay,

                    loaiXe = g.Key.LoaiXe,

                    doiTuong = g.Key.DoiTuong,

                    soLuot = g.Count(),

                    doanhThu =
                        g.Sum(x => x.SoTien ?? 0)
                })
                .OrderBy(x => x.ngay)
                .ThenBy(x => x.loaiXe)
                .ThenBy(x => x.doiTuong)
                .ToListAsync();

        return Ok(new
        {
            tuNgay,
            denNgay,
            loaiXe,
            tongLuotGui,
            dangGui,
            daRa,
            data = grouped
        });
    }
}