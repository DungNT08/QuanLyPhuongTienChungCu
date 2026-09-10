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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var danhSach = await _context.Users
            .Include(x => x.Role)
            .OrderBy(x => x.UserId)
            .Select(x => new UserDto
            {
                UserId = x.UserId,
                HoTen = x.HoTen,
                TenDangNhap = x.TenDangNhap,
                Email = x.Email,
                RoleId = x.RoleId,
                TenRole = x.Role!.TenRole,
                TrangThai = x.TrangThai,
                NgayTao = x.NgayTao
            })
            .ToListAsync();

        return Ok(danhSach);
    }

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
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value is string userIdString
                ? long.Parse(userIdString)
                : null,
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

        var role = await _context.Roles
            .FindAsync(user.RoleId);

        if (role == null)
        {
            return BadRequest("Role khong ton tai.");
        }

        userHienTai.HoTen = user.HoTen.Trim();
        userHienTai.Email = user.Email.Trim();
        userHienTai.RoleId = user.RoleId;
        userHienTai.TrangThai = user.TrangThai;

        await _context.SaveChangesAsync();

        await _auditLogService.GhiLog(
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value is string userIdString
                ? long.Parse(userIdString)
                : null,
            "UPDATE",
            "User",
            userHienTai.UserId,
            $"Cap nhat tai khoan {userHienTai.TenDangNhap}"
        );

        return NoContent();
    }


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
}