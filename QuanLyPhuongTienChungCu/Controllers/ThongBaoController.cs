using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Data;
using QuanLyPhuongTienChungCu.Models;

namespace QuanLyPhuongTienChungCu.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ThongBaoController : ControllerBase
{
    private readonly AppDbContext _context;

    public ThongBaoController(AppDbContext context)
    {
        _context = context;
    }

    private long? LayUserIdHienTai()
    {
        var claim = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier
        )?.Value;

        return long.TryParse(claim, out var id) ? id : null;
    }

    // =========================================================
    // GET TẤT CẢ (ADMIN / BAN QUẢN LÝ)
    // GET: api/ThongBao
    // =========================================================

    [HttpGet]
    [Authorize(Roles = "Admin,BanQuanLy")]
    public async Task<IActionResult> GetAll()
    {
        var danhSach = await _context.ThongBaos
            .AsNoTracking()
            .Where(x => x.TrangThai != "DELETED")
            .OrderByDescending(x => x.NgayGui)
            .Select(x => new
            {
                thongBaoId = x.ThongBaoId,
                tieuDe = x.TieuDe,
                noiDung = x.NoiDung,
                doiTuong = x.DoiTuong,
                ngayGui = x.NgayGui.ToString("dd/MM/yyyy HH:mm"),
                nguoiGuiId = x.NguoiGuiId,
                trangThai = x.TrangThai
            })
            .ToListAsync();

        return Ok(danhSach);
    }

    // =========================================================
    // GET THÔNG BÁO CỦA CƯ DÂN
    // GET: api/ThongBao/cua-toi/{userId}
    // - Admin/BanQuanLy: xem bất kỳ ai
    // - Cư dân / nhân viên: chỉ xem của chính mình
    // ✅ Kèm trạng thái "daDoc" của user hiện tại
    // =========================================================

    [HttpGet("cua-toi/{userId:long}")]
    public async Task<IActionResult> GetChoCuDan(long userId)
    {
        var userIdHienTai = LayUserIdHienTai();
        var laAdmin = User.IsInRole("Admin") || User.IsInRole("BanQuanLy");

        // ✅ Chỉ Admin/BanQuanLy HOẶC chính chủ mới xem được
        if (!laAdmin && userIdHienTai != userId)
        {
            return Forbid();
        }

        // Lấy role của user
        var roleId = await _context.Users
            .Where(u => u.UserId == userId)
            .Select(u => u.RoleId)
            .FirstOrDefaultAsync();

        if (roleId == 0)
        {
            return NotFound(new { message = "User khong ton tai." });
        }

        // Cư dân (role 4) thấy: TatCa + CuDan
        // Nhân viên (1,2,3,5) thấy: TatCa + NhanVien
        var laCuDan = roleId == 4;

        var danhSach = await _context.ThongBaos
            .AsNoTracking()
            .Where(x =>
                x.TrangThai != "DELETED" &&
                (x.DoiTuong == "TatCa" ||
                 (laCuDan && x.DoiTuong == "CuDan") ||
                 (!laCuDan && x.DoiTuong == "NhanVien")))
            .OrderByDescending(x => x.NgayGui)
            .Select(x => new
            {
                thongBaoId = x.ThongBaoId,
                tieuDe = x.TieuDe,
                noiDung = x.NoiDung,
                doiTuong = x.DoiTuong,
                ngayGui = x.NgayGui.ToString("dd/MM/yyyy HH:mm"),
                trangThai = x.TrangThai,

                // ✅ Trạng thái đã đọc của user đang gọi
                daDoc = _context.ThongBaoDaDocs
                    .Any(d => d.ThongBaoId == x.ThongBaoId
                           && d.UserId == userId)
            })
            .ToListAsync();

        return Ok(danhSach);
    }

    // =========================================================
    // ĐÁNH DẤU ĐÃ ĐỌC
    // POST: api/ThongBao/{id}/da-doc
    // =========================================================

    [HttpPost("{id}/da-doc")]
    public async Task<IActionResult> DanhDauDaDoc(long id)
    {
        var userId = LayUserIdHienTai();
        if (userId == null)
        {
            return Unauthorized(new { message = "Khong xac dinh nguoi dung." });
        }

        // Nếu đã đánh dấu rồi → trả về OK luôn
        var daTonTai = await _context.ThongBaoDaDocs
            .AnyAsync(x => x.ThongBaoId == id && x.UserId == userId.Value);

        if (daTonTai)
        {
            return Ok(new { message = "Da danh dau doc truoc do." });
        }

        // Kiểm tra thông báo có tồn tại
        var tb = await _context.ThongBaos
            .FirstOrDefaultAsync(x => x.ThongBaoId == id);

        if (tb == null)
        {
            return NotFound(new { message = "Thong bao khong ton tai." });
        }

        var banGhi = new ThongBaoDaDoc
        {
            ThongBaoId = id,
            UserId = userId.Value,
            DaDocLuc = DateTime.Now
        };

        _context.ThongBaoDaDocs.Add(banGhi);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Da danh dau doc thanh cong." });
    }

    // =========================================================
    // TẠO THÔNG BÁO MỚI (ADMIN)
    // POST: api/ThongBao
    // =========================================================

    [HttpPost]
    [Authorize(Roles = "Admin,BanQuanLy")]
    public async Task<IActionResult> Create([FromBody] ThongBao thongBao)
    {
        if (string.IsNullOrWhiteSpace(thongBao.TieuDe))
        {
            return BadRequest(new { message = "Tieu de khong duoc de trong." });
        }

        if (string.IsNullOrWhiteSpace(thongBao.NoiDung))
        {
            return BadRequest(new { message = "Noi dung khong duoc de trong." });
        }

        var userId = LayUserIdHienTai();
        if (userId == null)
        {
            return Unauthorized(new { message = "Khong xac dinh nguoi dung." });
        }

        thongBao.TieuDe = thongBao.TieuDe.Trim();
        thongBao.NoiDung = thongBao.NoiDung.Trim();
        thongBao.NgayGui = DateTime.Now;
        thongBao.NguoiGuiId = userId.Value;
        thongBao.TrangThai = "ACTIVE";

        _context.ThongBaos.Add(thongBao);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Gui thong bao thanh cong.",
            thongBaoId = thongBao.ThongBaoId
        });
    }

    // =========================================================
    // XÓA MỀM (ADMIN)
    // DELETE: api/ThongBao/5
    // =========================================================

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,BanQuanLy")]
    public async Task<IActionResult> Delete(long id)
    {
        var tb = await _context.ThongBaos
            .FirstOrDefaultAsync(x => x.ThongBaoId == id);

        if (tb == null)
        {
            return NotFound(new { message = "Thong bao khong ton tai." });
        }

        tb.TrangThai = "DELETED";
        await _context.SaveChangesAsync();

        return Ok(new { message = "Xoa thong bao thanh cong." });
    }
}