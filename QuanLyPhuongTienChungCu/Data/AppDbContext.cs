using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Models;

namespace QuanLyPhuongTienChungCu.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(
        DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // =====================================================
    // DB SET
    // =====================================================

    public DbSet<PhuongTien> PhuongTiens =>
        Set<PhuongTien>();

    public DbSet<CanHo> CanHos =>
        Set<CanHo>();

    public DbSet<LoaiPhuongTien> LoaiPhuongTiens =>
        Set<LoaiPhuongTien>();

    public DbSet<LuotGuiXe> LuotGuiXes =>
        Set<LuotGuiXe>();

    public DbSet<BangGia> BangGias =>
        Set<BangGia>();

    public DbSet<ThanhToan> ThanhToans =>
        Set<ThanhToan>();

    public DbSet<User> Users =>
        Set<User>();

    public DbSet<Role> Roles =>
        Set<Role>();

    public DbSet<AuditLog> AuditLogs =>
        Set<AuditLog>();

    // =====================================================
    // MODEL CONFIGURATION
    // =====================================================

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // =====================================================
        // PHUONG TIEN
        // =====================================================

        modelBuilder.Entity<PhuongTien>()
            .HasIndex(x => x.BienSo)
            .IsUnique();

        modelBuilder.Entity<PhuongTien>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // =====================================================
        // LOAI PHUONG TIEN
        // =====================================================

        modelBuilder.Entity<LoaiPhuongTien>()
            .HasIndex(x => x.TenLoai)
            .IsUnique();

        modelBuilder.Entity<PhuongTien>()
            .HasOne(x => x.LoaiPhuongTien)
            .WithMany(x => x.PhuongTiens)
            .HasForeignKey(x => x.LoaiPhuongTienId);

        // =====================================================
        // BANG GIA
        // =====================================================

        modelBuilder.Entity<BangGia>()
            .HasOne(x => x.LoaiPhuongTien)
            .WithMany(x => x.BangGias)
            .HasForeignKey(x => x.LoaiPhuongTienId);

        // =====================================================
        // LUOT GUI XE
        // =====================================================

        modelBuilder.Entity<LuotGuiXe>()
            .HasOne(x => x.PhuongTien)
            .WithMany(x => x.LuotGuiXes)
            .HasForeignKey(x => x.PhuongTienId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LuotGuiXe>()
            .HasOne(x => x.LoaiPhuongTien)
            .WithMany()
            .HasForeignKey(x => x.LoaiPhuongTienId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LuotGuiXe>()
            .HasIndex(x => new
            {
                x.BienSo,
                x.TrangThai
            });

        // =====================================================
        // THANH TOAN
        // =====================================================

        modelBuilder.Entity<ThanhToan>()
            .HasOne(x => x.LuotGuiXe)
            .WithMany()
            .HasForeignKey(x => x.LuotGuiXeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ThanhToan>()
            .HasIndex(x => x.LuotGuiXeId)
            .IsUnique();

        // =====================================================
        // USER
        // =====================================================

        modelBuilder.Entity<User>()
            .HasIndex(x => x.TenDangNhap)
            .IsUnique();

        // =====================================================
        // USER - ROLE
        // =====================================================

        modelBuilder.Entity<User>()
            .HasOne(x => x.Role)
            .WithMany(x => x.Users)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        // =====================================================
        // ROLE
        // =====================================================

        modelBuilder.Entity<Role>()
            .HasIndex(x => x.TenRole)
            .IsUnique();

        // =====================================================
        // AUDIT LOG
        // =====================================================

        modelBuilder.Entity<AuditLog>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<AuditLog>()
            .HasIndex(x => x.ThoiGian);
    }
}