namespace QuanLyPhuongTienChungCu.Models;

public class ThongBaoDaDoc
{
    public long Id { get; set; }
    public long ThongBaoId { get; set; }
    public long UserId { get; set; }
    public DateTime DaDocLuc { get; set; } = DateTime.Now;
}