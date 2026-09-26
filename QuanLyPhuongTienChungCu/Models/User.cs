using System.Text.Json.Serialization;

namespace QuanLyPhuongTienChungCu.Models;

public class User
{
    public long UserId { get; set; }

    public string HoTen { get; set; } = string.Empty;

    public string TenDangNhap { get; set; } = string.Empty;

    public string MatKhau { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    // =====================================================
    // THÔNG TIN CÁ NHÂN
    // =====================================================

    // Số điện thoại
    public string? SoDienThoai { get; set; }

    // Căn cước công dân
    public string? CCCD { get; set; }

    // =====================================================
    // ROLE
    // =====================================================

    // Khóa ngoại đến bảng Roles
    public long RoleId { get; set; }

    // Navigation property
    [JsonIgnore]
    public Role? Role { get; set; }

    // =====================================================
    // TRẠNG THÁI
    // =====================================================

    public string TrangThai { get; set; } = "ACTIVE";

    public DateTime NgayTao { get; set; } = DateTime.Now;
}
