namespace QuanLyPhuongTienChungCu.Models;

public class Role
{
    public long RoleId { get; set; }
    public string TenRole { get; set; } = string.Empty;
    public string? MoTa { get; set; }

    public ICollection<User> Users { get; set; }
        = new List<User>();
}