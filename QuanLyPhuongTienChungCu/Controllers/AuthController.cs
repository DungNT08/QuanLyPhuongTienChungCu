
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

    // =====================================================
    // LOGIN
    // POST: api/Auth/login
    // =====================================================

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        DangNhapDto dto)
    {
        // -------------------------------------------------
        // VALIDATE INPUT
        // -------------------------------------------------

        if (string.IsNullOrWhiteSpace(dto.TenDangNhap))
        {
            return BadRequest(new
            {
                message =
                    "Tên đăng nhập không được để trống."
            });
        }

        if (string.IsNullOrWhiteSpace(dto.MatKhau))
        {
            return BadRequest(new
            {
                message =
                    "Mật khẩu không được để trống."
            });
        }

        // -------------------------------------------------
        // TÌM USER + ROLE
        // -------------------------------------------------

        var tenDangNhap =
            dto.TenDangNhap.Trim();

        var user =
            await _context.Users
                .Include(x => x.Role)
                .FirstOrDefaultAsync(x =>
                    x.TenDangNhap == tenDangNhap);

        if (user == null)
        {
            return Unauthorized(new
            {
                message =
                    "Tên đăng nhập hoặc mật khẩu không đúng."
            });
        }

        // -------------------------------------------------
        // KIỂM TRA TRẠNG THÁI
        // -------------------------------------------------

        if (user.TrangThai != "ACTIVE")
        {
            return Unauthorized(new
            {
                message =
                    "Tài khoản đang bị khóa hoặc không hoạt động."
            });
        }

        // -------------------------------------------------
        // KIỂM TRA MẬT KHẨU
        // -------------------------------------------------

        var matKhauDung =
            _passwordService.VerifyPassword(
                dto.MatKhau,
                user.MatKhau
            );

        if (!matKhauDung)
        {
            return Unauthorized(new
            {
                message =
                    "Tên đăng nhập hoặc mật khẩu không đúng."
            });
        }

        // -------------------------------------------------
        // KIỂM TRA ROLE
        // -------------------------------------------------

        if (user.Role == null)
        {
            return BadRequest(new
            {
                message =
                    "Tài khoản chưa được gán vai trò."
            });
        }

        var vaiTro =
            user.Role.TenRole?.Trim();

        if (string.IsNullOrWhiteSpace(vaiTro))
        {
            return BadRequest(new
            {
                message =
                    "Vai trò của tài khoản không hợp lệ."
            });
        }

        // -------------------------------------------------
        // JWT CONFIG
        // -------------------------------------------------

        var jwtKey =
            _configuration["Jwt:Key"];

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "Chưa cấu hình Jwt:Key."
                }
            );
        }

        var issuer =
            _configuration["Jwt:Issuer"];

        var audience =
            _configuration["Jwt:Audience"];

        // -------------------------------------------------
        // SIGNING KEY
        // -------------------------------------------------

        var securityKey =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            );

        var credentials =
            new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256
            );

        // -------------------------------------------------
        // JWT CLAIMS
        // -------------------------------------------------

        var claims =
            new List<Claim>
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
                    vaiTro
                )
            };

        // -------------------------------------------------
        // TẠO TOKEN
        // -------------------------------------------------

        var token =
            new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials
            );

        var tokenHandler =
            new JwtSecurityTokenHandler();

        var jwt =
            tokenHandler.WriteToken(token);

        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return Ok(new
        {
            token = jwt,

            userId =
                user.UserId,

            hoTen =
                user.HoTen,

            tenDangNhap =
                user.TenDangNhap,

            email =
                user.Email,

            roleId =
                user.RoleId,

            vaiTro =
                vaiTro
        });
    }
}

