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

    public long? UserId { get; set; }

    // Quan hệ với User
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }
}