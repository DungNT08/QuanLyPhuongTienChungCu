using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Data;
using QuanLyPhuongTienChungCu.Dtos;
using QuanLyPhuongTienChungCu.Models;
using QuanLyPhuongTienChungCu.Services;

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
    // HELPER
    // =========================================================

    private static bool LaNhanVien(long roleId)
    {
        return roleId == 1
            || roleId == 2
            || roleId == 3
            || roleId == 5;
    }

    private long? LayUserIdHienTai()
    {
        var claim = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier
        )?.Value;

        return long.TryParse(claim, out var id)
            ? id
            : null;
    }

    // =========================================================
    // GET ROLES
    // GET: api/User/roles
    // =========================================================

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _context.Roles
            .AsNoTracking()
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
    // GET ALL NHÂN VIÊN
    // GET: api/User
    // =========================================================

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var danhSach = await _context.Users
            .AsNoTracking()
            .Include(x => x.Role)
            .Where(x =>
                x.RoleId == 1 ||
                x.RoleId == 2 ||
                x.RoleId == 3 ||
                x.RoleId == 5
            )
            .Where(x =>
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

                TenRole = x.Role != null
                    ? x.Role.TenRole
                    : "",

                TrangThai = x.TrangThai,

                NgayTao = x.NgayTao
            })
            .ToListAsync();

        return Ok(danhSach);
    }

    // =========================================================
    // GET CƯ DÂN
    // GET: api/User/cu-dan
    // =========================================================

    [HttpGet("cu-dan")]
    public async Task<IActionResult> GetCuDan()
    {
        var danhSach = await _context.Users
            .AsNoTracking()
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

                tenRole = x.Role != null
                    ? x.Role.TenRole
                    : "",

                trangThai = x.TrangThai,

                ngayTao = x.NgayTao,

                maCanHo = _context.CanHos
                    .Where(c =>
                        c.UserId == x.UserId)
                    .Select(c =>
                        c.MaCanHo)
                    .FirstOrDefault(),

                soXe = _context.PhuongTiens
                    .Count(p =>
                        p.UserId == x.UserId)
            })
            .ToListAsync();

        return Ok(danhSach);
    }

    // =========================================================
    // GET BY ID
    // GET: api/User/1
    // =========================================================

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(
        long id)
    {
        var user = await _context.Users
            .AsNoTracking()
            .Include(x => x.Role)
            .Where(x =>
                x.UserId == id &&
                x.TrangThai != "DELETED")
            .Select(x => new UserDto
            {
                UserId = x.UserId,

                HoTen = x.HoTen,

                TenDangNhap = x.TenDangNhap,

                Email = x.Email,

                SoDienThoai = x.SoDienThoai,

                CCCD = x.CCCD,

                RoleId = x.RoleId,

                TenRole = x.Role != null
                    ? x.Role.TenRole
                    : "",

                TrangThai = x.TrangThai,

                NgayTao = x.NgayTao
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(
                "User khong ton tai."
            );
        }

        return Ok(user);
    }

    // =========================================================
    // CREATE
    // POST: api/User
    // =========================================================

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create(
        User user)
    {
        if (string.IsNullOrWhiteSpace(user.HoTen))
        {
            return BadRequest(
                "Ho ten khong duoc de trong."
            );
        }

        if (string.IsNullOrWhiteSpace(
            user.TenDangNhap))
        {
            return BadRequest(
                "Ten dang nhap khong duoc de trong."
            );
        }

        if (string.IsNullOrWhiteSpace(
            user.MatKhau))
        {
            return BadRequest(
                "Mat khau khong duoc de trong."
            );
        }

        if (string.IsNullOrWhiteSpace(
            user.Email))
        {
            return BadRequest(
                "Email khong duoc de trong."
            );
        }

        if (!LaNhanVien(user.RoleId) &&
            user.RoleId != 4)
        {
            return BadRequest(
                "RoleId khong hop le."
            );
        }

        var role = await _context.Roles
            .FirstOrDefaultAsync(x =>
                x.RoleId == user.RoleId);

        if (role == null)
        {
            return BadRequest(
                "Role khong ton tai."
            );
        }

        var tenDangNhapDaTonTai =
            await _context.Users
                .AnyAsync(x =>
                    x.TenDangNhap ==
                    user.TenDangNhap);

        if (tenDangNhapDaTonTai)
        {
            return Conflict(
                "Ten dang nhap da ton tai."
            );
        }

        user.HoTen =
            user.HoTen.Trim();

        user.TenDangNhap =
            user.TenDangNhap.Trim();

        user.Email =
            user.Email.Trim();

        user.MatKhau =
            _passwordService.HashPassword(
                user.MatKhau
            );

        user.NgayTao =
            DateTime.Now;

        user.TrangThai =
            "ACTIVE";

        user.Role = null;

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
            UserId =
                user.UserId,

            HoTen =
                user.HoTen,

            TenDangNhap =
                user.TenDangNhap,

            Email =
                user.Email,

            SoDienThoai =
                user.SoDienThoai,

            CCCD =
                user.CCCD,

            RoleId =
                user.RoleId,

            TenRole =
                role.TenRole,

            TrangThai =
                user.TrangThai,

            NgayTao =
                user.NgayTao
        };

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                id = user.UserId
            },
            ketQua
        );
    }

    // =========================================================
    // UPDATE
    // PUT: api/User/1
    // =========================================================

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        long id,
        User user)
    {
        if (string.IsNullOrWhiteSpace(
            user.HoTen))
        {
            return BadRequest(
                "Ho ten khong duoc de trong."
            );
        }

        if (string.IsNullOrWhiteSpace(
            user.Email))
        {
            return BadRequest(
                "Email khong duoc de trong."
            );
        }

        var userHienTai =
            await _context.Users
                .FirstOrDefaultAsync(x =>
                    x.UserId == id);

        if (userHienTai == null)
        {
            return NotFound(
                "User khong ton tai."
            );
        }

        if (userHienTai.TrangThai ==
            "DELETED")
        {
            return BadRequest(
                "User da bi xoa."
            );
        }

        if (user.RoleId < 1 ||
            user.RoleId > 5)
        {
            return BadRequest(
                "RoleId khong hop le."
            );
        }

        var role =
            await _context.Roles
                .FirstOrDefaultAsync(x =>
                    x.RoleId == user.RoleId);

        if (role == null)
        {
            return BadRequest(
                "Role khong ton tai."
            );
        }

        userHienTai.HoTen =
            user.HoTen.Trim();

        userHienTai.Email =
            user.Email.Trim();

        userHienTai.SoDienThoai =
            user.SoDienThoai;

        userHienTai.CCCD =
            user.CCCD;

        userHienTai.RoleId =
            user.RoleId;

        userHienTai.TrangThai =
            user.TrangThai;

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
    // ĐỔI MẬT KHẨU
    // PUT: api/User/1/doi-mat-khau
    // =========================================================

    [HttpPut("{id}/doi-mat-khau")]
    public async Task<IActionResult> DoiMatKhau(
        long id,
        DoiMatKhauDto dto)
    {
        if (string.IsNullOrWhiteSpace(
            dto.MatKhauMoi))
        {
            return BadRequest(
                "Mat khau moi khong duoc de trong."
            );
        }

        var user =
            await _context.Users
                .FirstOrDefaultAsync(x =>
                    x.UserId == id);

        if (user == null)
        {
            return NotFound(
                "User khong ton tai."
            );
        }

        user.MatKhau =
            _passwordService.HashPassword(
                dto.MatKhauMoi
            );

        await _context.SaveChangesAsync();

        await _auditLogService.GhiLog(
            LayUserIdHienTai(),
            "UPDATE",
            "User",
            user.UserId,
            $"Doi mat khau tai khoan {user.TenDangNhap}"
        );

        return Ok(new
        {
            message =
                "Doi mat khau thanh cong."
        });
    }

    // =========================================================
    // DELETE
    // DELETE: api/User/1
    // XÓA MỀM
    // =========================================================

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(
        long id)
    {
        var user =
            await _context.Users
                .FirstOrDefaultAsync(x =>
                    x.UserId == id);

        if (user == null)
        {
            return NotFound(new
            {
                message =
                    "User khong ton tai."
            });
        }

        var userIdHienTai =
            LayUserIdHienTai();

        if (userIdHienTai.HasValue &&
            userIdHienTai.Value == id)
        {
            return BadRequest(new
            {
                message =
                    "Khong the xoa chinh minh."
            });
        }

        if (user.TrangThai ==
            "DELETED")
        {
            return Ok(new
            {
                message =
                    "User da bi xoa truoc do.",

                userId = id
            });
        }

        user.TrangThai =
            "DELETED";

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
            message =
                "Xoa user thanh cong.",

            userId = id
        });
    }
}