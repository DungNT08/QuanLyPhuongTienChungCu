using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Data;
using QuanLyPhuongTienChungCu.Dtos;
using QuanLyPhuongTienChungCu.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace QuanLyPhuongTienChungCu.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly PasswordService _passwordService;
    private readonly IConfiguration _configuration;

    public AuthController(
        AppDbContext context,
        PasswordService passwordService,
        IConfiguration configuration)
    {
        _context = context;
        _passwordService = passwordService;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(DangNhapDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.TenDangNhap))
        {
            return BadRequest("Ten dang nhap khong duoc de trong.");
        }

        if (string.IsNullOrWhiteSpace(dto.MatKhau))
        {
            return BadRequest("Mat khau khong duoc de trong.");
        }

        var user = await _context.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x =>
                x.TenDangNhap == dto.TenDangNhap);

        if (user == null)
        {
            return Unauthorized(
                "Ten dang nhap hoac mat khau khong dung."
            );
        }

        if (user.TrangThai != "ACTIVE")
        {
            return Unauthorized("Tai khoan dang bi khoa.");
        }

        var matKhauDung = _passwordService.VerifyPassword(
            dto.MatKhau,
            user.MatKhau
        );

        if (!matKhauDung)
        {
            return Unauthorized(
                "Ten dang nhap hoac mat khau khong dung."
            );
        }

        if (user.Role == null)
        {
            return BadRequest("Tai khoan chua duoc gan Role.");
        }

        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.UserId.ToString()
            ),

            new Claim(
                ClaimTypes.Name,
                user.TenDangNhap
            ),

            new Claim(
                ClaimTypes.Role,
                user.Role.TenRole
            )
        };

        var jwtKey = _configuration["Jwt:Key"];

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            return StatusCode(
                500,
                "Chua cau hinh Jwt:Key."
            );
        }

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)
        );

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(2),
            signingCredentials: credentials
        );

        var jwt = new JwtSecurityTokenHandler()
            .WriteToken(token);

        return Ok(new
        {
            token = jwt,
            userId = user.UserId,
            hoTen = user.HoTen,
            tenDangNhap = user.TenDangNhap,
            email = user.Email,
            roleId = user.RoleId,
            tenRole = user.Role.TenRole
        });
    }
}