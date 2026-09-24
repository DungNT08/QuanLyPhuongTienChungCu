using System.Text.Json.Serialization;

namespace QuanLyPhuongTienChungCu.Models;

public class User
{
    public long UserId { get; set; }

    public string HoTen { get; set; } = string.Empty;

    public string TenDangNhap { get; set; } = string.Empty;

    public string MatKhau { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public long RoleId { get; set; }

    public string TrangThai { get; set; } = "ACTIVE";

    public DateTime NgayTao { get; set; } = DateTime.Now;

    // ============ 3 PROPERTY MỚI THÊM ============
    public string? SoDienThoai { get; set; }

    public string? CCCD { get; set; }

    public string? VaiTro { get; set; }
    // =============================================

    [JsonIgnore]
    public Role? Role { get; set; }
}
