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
[Authorize(Roles = "Admin")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly PasswordService _passwordService;
    private readonly AuditLogService _auditLogService;

    public UserController(
        AppDbContext context,
        PasswordService passwordService,
        AuditLogService auditLogService)
    {
        _context = context;
        _passwordService = passwordService;
        _auditLogService = auditLogService;
    }

    // =========================================================
    // HELPER: Role nhân viên
    // 1=Admin, 2=BanQuanLy, 3=BaoVe, 5=KeToan
    // 4 = CuDan -> KHÔNG phải nhân viên
    // =========================================================
    private static bool LaNhanVien(long roleId)
    {
        return roleId == 1
            || roleId == 2
            || roleId == 3
            || roleId == 5;
    }

    // =========================================================
    // HELPER: Lấy UserId từ token
    // =========================================================
    private long? LayUserIdHienTai()
    {
        var claim = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier
        )?.Value;

        return long.TryParse(claim, out var id) ? id : null;
    }

    // =========================================================
    // GET: api/User/roles
    // Trả về danh sách Role từ SQL cho dropdown
    // PHẢI ĐẶT TRƯỚC [HttpGet("{id}")]
    // =========================================================
    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _context.Roles
            .OrderBy(x => x.RoleId)
            .Select(x => new
            {
                roleId = x.RoleId,
                tenRole = x.TenRole
            })
            .ToListAsync();

        return Ok(roles);
    }

    // =========================================================
    // GET: api/User
    // CHỈ TRẢ VỀ NHÂN VIÊN, KHÔNG BAO GỒM DELETED
    // =========================================================
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var danhSach = await _context.Users
            .Include(x => x.Role)
            .Where(x =>
                (x.RoleId == 1 ||
                 x.RoleId == 2 ||
                 x.RoleId == 3 ||
                 x.RoleId == 5) &&
                x.TrangThai != "DELETED"
            )
            .OrderBy(x => x.UserId)
            .Select(x => new UserDto
            {
                UserId = x.UserId,
                HoTen = x.HoTen,
                TenDangNhap = x.TenDangNhap,
                Email = x.Email,
                SoDienThoai = x.SoDienThoai,
                CCCD = x.CCCD,
                RoleId = x.RoleId,
                TenRole = x.Role!.TenRole,
                TrangThai = x.TrangThai,
                NgayTao = x.NgayTao
            })
            .ToListAsync();

        return Ok(danhSach);
    }

    // =========================================================
    // GET: api/User/cu-dan
    // CƯ DÂN + CĂN HỘ + SỐ XE
    // KHÔNG BAO GỒM DELETED
    // PHẢI ĐẶT TRƯỚC [HttpGet("{id}")]
    // =========================================================
    [HttpGet("cu-dan")]
    public async Task<IActionResult> GetCuDan()
    {
        var danhSach = await _context.Users
            .Include(x => x.Role)
            .Where(x =>
                x.RoleId == 4 &&
                x.TrangThai != "DELETED"
            )
            .OrderBy(x => x.UserId)
            .Select(x => new
            {
                userId = x.UserId,
                hoTen = x.HoTen,
                tenDangNhap = x.TenDangNhap,
                email = x.Email,
                soDienThoai = x.SoDienThoai,
                cccd = x.CCCD,
                roleId = x.RoleId,
                tenRole = x.Role != null ? x.Role.TenRole : "",
                trangThai = x.TrangThai,
                ngayTao = x.NgayTao,

                // Căn hộ đầu tiên (nếu có)
                maCanHo = _context.CanHos
                    .Where(c => c.UserId == x.UserId)
                    .Select(c => c.MaCanHo)
                    .FirstOrDefault(),

                // Đếm số xe
                soXe = _context.PhuongTiens
                    .Count(p => p.UserId == x.UserId)
            })
            .ToListAsync();

        return Ok(danhSach);
    }

    // =========================================================
    // GET: api/User/{id}
    // =========================================================
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(long id)
    {
        var user = await _context.Users
            .Include(x => x.Role)
            .Where(x => x.UserId == id)
            .Select(x => new UserDto
            {
                UserId = x.UserId,
                HoTen = x.HoTen,
                TenDangNhap = x.TenDangNhap,
                Email = x.Email,
                SoDienThoai = x.SoDienThoai,
                CCCD = x.CCCD,
                RoleId = x.RoleId,
                TenRole = x.Role!.TenRole,
                TrangThai = x.TrangThai,
                NgayTao = x.NgayTao
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound("User khong ton tai.");
        }

        return Ok(user);
    }

    // =========================================================
    // POST: api/User
    // =========================================================
    [HttpPost]
    public async Task<ActionResult<UserDto>> Create(User user)
    {
        if (string.IsNullOrWhiteSpace(user.HoTen))
        {
            return BadRequest("Ho ten khong duoc de trong.");
        }

        if (string.IsNullOrWhiteSpace(user.TenDangNhap))
        {
            return BadRequest("Ten dang nhap khong duoc de trong.");
        }

        if (string.IsNullOrWhiteSpace(user.MatKhau))
        {
            return BadRequest("Mat khau khong duoc de trong.");
        }

        if (string.IsNullOrWhiteSpace(user.Email))
        {
            return BadRequest("Email khong duoc de trong.");
        }

        if (user.RoleId < 1 || user.RoleId > 5)
        {
            return BadRequest("RoleId khong hop le.");
        }

        var role = await _context.Roles
            .FindAsync(user.RoleId);

        if (role == null)
        {
            return BadRequest("Role khong ton tai.");
        }

        var tenDangNhapDaTonTai = await _context.Users
            .AnyAsync(x => x.TenDangNhap == user.TenDangNhap);

        if (tenDangNhapDaTonTai)
        {
            return Conflict("Ten dang nhap da ton tai.");
        }

        user.MatKhau = _passwordService.HashPassword(user.MatKhau);
        user.NgayTao = DateTime.Now;
        user.TrangThai = "ACTIVE";

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        await _auditLogService.GhiLog(
            LayUserIdHienTai(),
            "CREATE",
            "User",
            user.UserId,
            $"Tao tai khoan {user.TenDangNhap}"
        );

        var ketQua = new UserDto
        {
            UserId = user.UserId,
            HoTen = user.HoTen,
            TenDangNhap = user.TenDangNhap,
            Email = user.Email,
            SoDienThoai = user.SoDienThoai,
            CCCD = user.CCCD,
            RoleId = user.RoleId,
            TenRole = role.TenRole,
            TrangThai = user.TrangThai,
            NgayTao = user.NgayTao
        };

        return CreatedAtAction(
            nameof(GetById),
            new { id = user.UserId },
            ketQua
        );
    }

    // =========================================================
    // PUT: api/User/{id}
    // =========================================================
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        long id,
        User user)
    {
        if (string.IsNullOrWhiteSpace(user.HoTen))
        {
            return BadRequest("Ho ten khong duoc de trong.");
        }

        if (string.IsNullOrWhiteSpace(user.Email))
        {
            return BadRequest("Email khong duoc de trong.");
        }

        var userHienTai = await _context.Users
            .FirstOrDefaultAsync(x => x.UserId == id);

        if (userHienTai == null)
        {
            return NotFound("User khong ton tai.");
        }

        if (user.RoleId < 1 || user.RoleId > 5)
        {
            return BadRequest("RoleId khong hop le.");
        }

        var role = await _context.Roles
            .FindAsync(user.RoleId);

        if (role == null)
        {
            return BadRequest("Role khong ton tai.");
        }

        userHienTai.HoTen = user.HoTen.Trim();
        userHienTai.Email = user.Email.Trim();
        userHienTai.SoDienThoai = user.SoDienThoai;
        userHienTai.CCCD = user.CCCD;
        userHienTai.RoleId = user.RoleId;
        userHienTai.TrangThai = user.TrangThai;

        await _context.SaveChangesAsync();

        await _auditLogService.GhiLog(
            LayUserIdHienTai(),
            "UPDATE",
            "User",
            userHienTai.UserId,
            $"Cap nhat tai khoan {userHienTai.TenDangNhap}"
        );

        return NoContent();
    }

    // =========================================================
    // PUT: api/User/{id}/doi-mat-khau
    // =========================================================
    [HttpPut("{id}/doi-mat-khau")]
    public async Task<IActionResult> DoiMatKhau(
        long id,
        DoiMatKhauDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.MatKhauMoi))
        {
            return BadRequest("Mat khau moi khong duoc de trong.");
        }

        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound("User khong ton tai.");
        }

        user.MatKhau = _passwordService.HashPassword(dto.MatKhauMoi);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Doi mat khau thanh cong."
        });
    }

    // =========================================================
    // DELETE: api/User/{id}
    // XÓA MỀM — Chỉ đổi TrangThai = "DELETED"
    // =========================================================
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.UserId == id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User khong ton tai."
            });
        }

        var userIdHienTai = LayUserIdHienTai();

        if (userIdHienTai.HasValue && userIdHienTai.Value == id)
        {
            return BadRequest(new
            {
                message = "Khong the xoa chinh minh."
            });
        }

        if (user.TrangThai == "DELETED")
        {
            return Ok(new
            {
                message = "User da bi xoa truoc do.",
                userId = id
            });
        }

        user.TrangThai = "DELETED";

        await _context.SaveChangesAsync();

        await _auditLogService.GhiLog(
            userIdHienTai,
            "DELETE",
            "User",
            id,
            $"Xoa mem tai khoan {user.TenDangNhap}"
        );

        return Ok(new
        {
            message = "Xoa user thanh cong.",
            userId = id
        });
    }
}
