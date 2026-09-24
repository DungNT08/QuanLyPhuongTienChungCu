namespace QuanLyPhuongTienChungCu.Dtos;

public class UserDto
{
    public long UserId { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public string TenDangNhap { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public long RoleId { get; set; }
    public string? TenRole { get; set; }
    public string TrangThai { get; set; } = "ACTIVE";
    public DateTime NgayTao { get; set; }

    // ============ 2 PROPERTY MỚI THÊM ============
    public string? SoDienThoai { get; set; }
    public string? CCCD { get; set; }
    // =============================================
}
