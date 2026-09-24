
using System.Text.Json.Serialization;

namespace QuanLyPhuongTienChungCu.Models;

public class LuotGuiXe
{
    public long LuotGuiXeId { get; set; }

    // =====================================================
    // PHƯƠNG TIỆN
    // =====================================================

    // Xe cư dân: có PhuongTienId
    // Xe khách: null
    public long? PhuongTienId { get; set; }

    // Lưu lại biển số tại thời điểm gửi xe
    public string BienSo { get; set; } = string.Empty;

    // Xe máy / ô tô / xe điện / xe đạp...
    public long LoaiPhuongTienId { get; set; }

    // =====================================================
    // THỜI GIAN
    // =====================================================

    public DateTime ThoiGianVao { get; set; }

    public DateTime? ThoiGianRa { get; set; }

    // =====================================================
    // THANH TOÁN
    // =====================================================

    public decimal? SoTien { get; set; }

    // ACTIVE / COMPLETED
    public string TrangThai { get; set; } = "ACTIVE";

    // =====================================================
    // NGƯỜI TẠO
    // =====================================================

    // Người tạo record
    public long NguoiTaoId { get; set; }

    // =====================================================
    // NGƯỜI GHI NHẬN CHECK-IN / CHECK-OUT
    // =====================================================

    // User đăng nhập thực hiện check-in
    public long? NguoiGhiVaoId { get; set; }

    // User đăng nhập thực hiện check-out
    public long? NguoiGhiRaId { get; set; }

    // =====================================================
    // NAVIGATION
    // =====================================================

    [JsonIgnore]
    public PhuongTien? PhuongTien { get; set; }

    [JsonIgnore]
    public LoaiPhuongTien? LoaiPhuongTien { get; set; }
}

