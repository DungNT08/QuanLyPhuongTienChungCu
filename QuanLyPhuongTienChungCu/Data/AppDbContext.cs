using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Models;

namespace QuanLyPhuongTienChungCu.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<PhuongTien> PhuongTiens => Set<PhuongTien>();

    public DbSet<LoaiPhuongTien> LoaiPhuongTiens => Set<LoaiPhuongTien>();

    public DbSet<LuotGuiXe> LuotGuiXes => Set<LuotGuiXe>();

    public DbSet<BangGia> BangGias => Set<BangGia>();

    public DbSet<ThanhToan> ThanhToans => Set<ThanhToan>();

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Bien so xe khong duoc trung
        modelBuilder.Entity<PhuongTien>()
            .HasIndex(x => x.BienSo)
            .IsUnique();

        modelBuilder.Entity<PhuongTien>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Ten loai phuong tien khong duoc trung
        modelBuilder.Entity<LoaiPhuongTien>()
            .HasIndex(x => x.TenLoai)
            .IsUnique();

        // Quan he PhuongTien - LoaiPhuongTien
        modelBuilder.Entity<PhuongTien>()
            .HasOne(x => x.LoaiPhuongTien)
            .WithMany(x => x.PhuongTiens)
            .HasForeignKey(x => x.LoaiPhuongTienId);

        // Quan he BangGia - LoaiPhuongTien
        modelBuilder.Entity<BangGia>()
            .HasOne(x => x.LoaiPhuongTien)
            .WithMany(x => x.BangGias)
            .HasForeignKey(x => x.LoaiPhuongTienId);

        // Quan he LuotGuiXe - PhuongTien
        modelBuilder.Entity<LuotGuiXe>()
            .HasOne(x => x.PhuongTien)
            .WithMany(x => x.LuotGuiXes)
            .HasForeignKey(x => x.PhuongTienId)
            .OnDelete(DeleteBehavior.Restrict);

        // Quan he LuotGuiXe - LoaiPhuongTien
        modelBuilder.Entity<LuotGuiXe>()
            .HasOne(x => x.LoaiPhuongTien)
            .WithMany()
            .HasForeignKey(x => x.LoaiPhuongTienId)
            .OnDelete(DeleteBehavior.Restrict);

        // Tim luot gui xe dang hoat dong theo bien so
        modelBuilder.Entity<LuotGuiXe>()
            .HasIndex(x => new
            {
                x.BienSo,
                x.TrangThai
            });

        modelBuilder.Entity<ThanhToan>()
            .HasOne(x => x.LuotGuiXe)
            .WithMany()
            .HasForeignKey(x => x.LuotGuiXeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ThanhToan>()
            .HasIndex(x => x.LuotGuiXeId)
            .IsUnique();   
        
        modelBuilder.Entity<User>()
            .HasOne(x => x.Role)
            .WithMany(x => x.Users)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasIndex(x => x.TenDangNhap)
            .IsUnique();

        modelBuilder.Entity<Role>()
            .HasIndex(x => x.TenRole)
            .IsUnique();

        modelBuilder.Entity<AuditLog>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<AuditLog>()
            .HasIndex(x => x.ThoiGian);
    }
}