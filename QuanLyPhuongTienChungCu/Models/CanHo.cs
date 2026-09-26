using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuanLyPhuongTienChungCu.Models;

[Table("CanHo")]
public class CanHo
{
    [Key]
    public long CanHoId { get; set; }

    [Required]
    [MaxLength(50)]
    public string MaCanHo { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Toa { get; set; } = string.Empty;

    public int Tang { get; set; }

    public int SoPhong { get; set; }

    [MaxLength(50)]
    public string TrangThai { get; set; } = "Trống";

    // Có thể null nếu căn hộ chưa có chủ hộ
    public long? UserId { get; set; }

    // Quan hệ với User
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }
}