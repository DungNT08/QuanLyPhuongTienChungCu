using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Data;
using QuanLyPhuongTienChungCu.Dtos;
using QuanLyPhuongTienChungCu.Models;

namespace QuanLyPhuongTienChungCu.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BangGiaController : ControllerBase
{
    private readonly AppDbContext _context;

    public BangGiaController(AppDbContext context)
    {
        _context = context;
    }

    // =========================================================
    // GET: api/BangGia
    // Xem danh sach bang gia
    // Tat ca tai khoan da dang nhap deu duoc xem
    // =========================================================
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BangGiaDto>>> GetAll()
    {
        var danhSach = await _context.BangGias
            .Include(x => x.LoaiPhuongTien)
            .OrderBy(x => x.BangGiaId)
            .Select(x => new BangGiaDto
            {
                BangGiaId = x.BangGiaId,
                LoaiPhuongTienId = x.LoaiPhuongTienId,
                TenLoaiPhuongTien = x.LoaiPhuongTien!.TenLoai,
                DonGia = x.DonGia,
                HieuLucTu = x.HieuLucTu,
                HieuLucDen = x.HieuLucDen,
                TrangThai = x.TrangThai
            })
            .ToListAsync();

        return Ok(danhSach);
    }

    // =========================================================
    // GET: api/BangGia/{id}
    // Xem chi tiet mot bang gia
    // =========================================================
    [HttpGet("{id}")]
    public async Task<ActionResult<BangGiaDto>> GetById(long id)
    {
        var bangGia = await _context.BangGias
            .Include(x => x.LoaiPhuongTien)
            .Where(x => x.BangGiaId == id)
            .Select(x => new BangGiaDto
            {
                BangGiaId = x.BangGiaId,
                LoaiPhuongTienId = x.LoaiPhuongTienId,
                TenLoaiPhuongTien = x.LoaiPhuongTien!.TenLoai,
                DonGia = x.DonGia,
                HieuLucTu = x.HieuLucTu,
                HieuLucDen = x.HieuLucDen,
                TrangThai = x.TrangThai
            })
            .FirstOrDefaultAsync();

        if (bangGia == null)
        {
            return NotFound("Bang gia khong ton tai.");
        }

        return Ok(bangGia);
    }

    // =========================================================
    // POST: api/BangGia
    // Tao bang gia moi
    // Chi Admin va BanQuanLy duoc thuc hien
    // =========================================================
    [Authorize(Roles = "Admin,BanQuanLy")]
    [HttpPost]
    public async Task<ActionResult<BangGiaDto>> Create(BangGia bangGia)
    {
        // -----------------------------------------------------
        // Kiem tra loai phuong tien
        // -----------------------------------------------------
        var loaiPhuongTien = await _context.LoaiPhuongTiens
            .FindAsync(bangGia.LoaiPhuongTienId);

        if (loaiPhuongTien == null)
        {
            return BadRequest(
                "Loai phuong tien khong ton tai."
            );
        }

        // -----------------------------------------------------
        // Kiem tra don gia
        // -----------------------------------------------------
        if (bangGia.DonGia < 0)
        {
            return BadRequest(
                "Don gia khong duoc am."
            );
        }

        // -----------------------------------------------------
        // Kiem tra thoi gian hieu luc
        // -----------------------------------------------------
        if (bangGia.HieuLucDen.HasValue &&
            bangGia.HieuLucDen.Value <= bangGia.HieuLucTu)
        {
            return BadRequest(
                "Hieu luc den phai lon hon hieu luc tu."
            );
        }

        // -----------------------------------------------------
        // Mac dinh ACTIVE neu khong truyen trang thai
        // -----------------------------------------------------
        if (string.IsNullOrWhiteSpace(bangGia.TrangThai))
        {
            bangGia.TrangThai = "ACTIVE";
        }

        // Chuan hoa trang thai
        bangGia.TrangThai =
            bangGia.TrangThai.Trim().ToUpper();

        // -----------------------------------------------------
        // Chi kiem tra trung khoang thoi gian neu ACTIVE
        // -----------------------------------------------------
        if (bangGia.TrangThai == "ACTIVE")
        {
            var biTrung = await KiemTraTrungBangGiaActive(
                bangGia.LoaiPhuongTienId,
                bangGia.HieuLucTu,
                bangGia.HieuLucDen,
                null
            );

            if (biTrung)
            {
                return Conflict(
                    "Da ton tai bang gia ACTIVE cua loai phuong tien " +
                    "nay trong khoang thoi gian hieu luc bi trung."
                );
            }
        }

        // -----------------------------------------------------
        // Them bang gia
        // -----------------------------------------------------
        _context.BangGias.Add(bangGia);

        await _context.SaveChangesAsync();

        // -----------------------------------------------------
        // Tao DTO tra ve
        // -----------------------------------------------------
        var ketQua = new BangGiaDto
        {
            BangGiaId = bangGia.BangGiaId,
            LoaiPhuongTienId = bangGia.LoaiPhuongTienId,
            TenLoaiPhuongTien = loaiPhuongTien.TenLoai,
            DonGia = bangGia.DonGia,
            HieuLucTu = bangGia.HieuLucTu,
            HieuLucDen = bangGia.HieuLucDen,
            TrangThai = bangGia.TrangThai
        };

        return CreatedAtAction(
            nameof(GetById),
            new { id = bangGia.BangGiaId },
            ketQua
        );
    }

    // =========================================================
    // PUT: api/BangGia/{id}
    // Cap nhat bang gia
    // Chi Admin va BanQuanLy duoc thuc hien
    // =========================================================
    [Authorize(Roles = "Admin,BanQuanLy")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        long id,
        BangGia bangGia)
    {
        // -----------------------------------------------------
        // Kiem tra ID
        // -----------------------------------------------------
        if (id != bangGia.BangGiaId)
        {
            return BadRequest(
                "Id khong khop."
            );
        }

        // -----------------------------------------------------
        // Tim bang gia cu
        // -----------------------------------------------------
        var bangGiaCu = await _context.BangGias
            .FindAsync(id);

        if (bangGiaCu == null)
        {
            return NotFound(
                "Bang gia khong ton tai."
            );
        }

        // -----------------------------------------------------
        // Kiem tra loai phuong tien
        // -----------------------------------------------------
        var loaiPhuongTien = await _context.LoaiPhuongTiens
            .FindAsync(bangGia.LoaiPhuongTienId);

        if (loaiPhuongTien == null)
        {
            return BadRequest(
                "Loai phuong tien khong ton tai."
            );
        }

        // -----------------------------------------------------
        // Kiem tra don gia
        // -----------------------------------------------------
        if (bangGia.DonGia < 0)
        {
            return BadRequest(
                "Don gia khong duoc am."
            );
        }

        // -----------------------------------------------------
        // Kiem tra thoi gian hieu luc
        // -----------------------------------------------------
        if (bangGia.HieuLucDen.HasValue &&
            bangGia.HieuLucDen.Value <= bangGia.HieuLucTu)
        {
            return BadRequest(
                "Hieu luc den phai lon hon hieu luc tu."
            );
        }

        // -----------------------------------------------------
        // Neu trang thai rong thi giu trang thai hien tai
        // -----------------------------------------------------
        if (string.IsNullOrWhiteSpace(bangGia.TrangThai))
        {
            bangGia.TrangThai = bangGiaCu.TrangThai;
        }

        // Chuan hoa trang thai
        bangGia.TrangThai =
            bangGia.TrangThai.Trim().ToUpper();

        // -----------------------------------------------------
        // Kiem tra trung bang gia ACTIVE
        //
        // Truyen id hien tai vao de khong tu kiem tra chinh no
        // -----------------------------------------------------
        if (bangGia.TrangThai == "ACTIVE")
        {
            var biTrung = await KiemTraTrungBangGiaActive(
                bangGia.LoaiPhuongTienId,
                bangGia.HieuLucTu,
                bangGia.HieuLucDen,
                id
            );

            if (biTrung)
            {
                return Conflict(
                    "Da ton tai bang gia ACTIVE cua loai phuong tien " +
                    "nay trong khoang thoi gian hieu luc bi trung."
                );
            }
        }

        // -----------------------------------------------------
        // Cap nhat du lieu
        // -----------------------------------------------------
        bangGiaCu.LoaiPhuongTienId =
            bangGia.LoaiPhuongTienId;

        bangGiaCu.DonGia =
            bangGia.DonGia;

        bangGiaCu.HieuLucTu =
            bangGia.HieuLucTu;

        bangGiaCu.HieuLucDen =
            bangGia.HieuLucDen;

        bangGiaCu.TrangThai =
            bangGia.TrangThai;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // =========================================================
    // DELETE: api/BangGia/{id}
    // Xoa bang gia
    // Chi Admin va BanQuanLy duoc thuc hien
    // =========================================================
    [Authorize(Roles = "Admin,BanQuanLy")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var bangGia = await _context.BangGias
            .FindAsync(id);

        if (bangGia == null)
        {
            return NotFound(
                "Bang gia khong ton tai."
            );
        }

        // -----------------------------------------------------
        // Khong cho xoa bang gia ACTIVE
        // -----------------------------------------------------
        if (bangGia.TrangThai == "ACTIVE")
        {
            return BadRequest(
                "Khong the xoa bang gia dang ACTIVE. " +
                "Hay chuyen sang INACTIVE truoc."
            );
        }

        _context.BangGias.Remove(bangGia);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // =========================================================
    // HAM KIEM TRA TRUNG BANG GIA ACTIVE
    //
    // Hai khoang thoi gian bi xem la trung neu:
    //
    // Khoang A: HieuLucTuA -> HieuLucDenA
    // Khoang B: HieuLucTuB -> HieuLucDenB
    //
    // co phan giao nhau.
    //
    // Neu HieuLucDen = null:
    // => Bang gia co hieu luc vo thoi han.
    // =========================================================
    private async Task<bool> KiemTraTrungBangGiaActive(
        long loaiPhuongTienId,
        DateTime hieuLucTu,
        DateTime? hieuLucDen,
        long? boQuaBangGiaId)
    {
        var query = _context.BangGias
            .AsNoTracking()
            .Where(x =>
                x.LoaiPhuongTienId == loaiPhuongTienId &&
                x.TrangThai == "ACTIVE");

        // Khi Update, bo qua chinh bang gia dang sua
        if (boQuaBangGiaId.HasValue)
        {
            query = query.Where(
                x => x.BangGiaId != boQuaBangGiaId.Value
            );
        }

        var danhSach = await query.ToListAsync();

        foreach (var bangGia in danhSach)
        {
            // -------------------------------------------------
            // Truong hop bang gia hien tai khong co HieuLucDen
            // => hieu luc vo thoi han
            // -------------------------------------------------
            if (!hieuLucDen.HasValue &&
                bangGia.HieuLucDen.HasValue)
            {
                if (hieuLucTu < bangGia.HieuLucDen.Value)
                {
                    return true;
                }
            }

            // -------------------------------------------------
            // Ca hai deu khong co HieuLucDen
            // => deu vo thoi han va chac chan trung
            // -------------------------------------------------
            else if (!hieuLucDen.HasValue &&
                     !bangGia.HieuLucDen.HasValue)
            {
                return true;
            }

            // -------------------------------------------------
            // Bang gia moi co HieuLucDen
            // Bang gia cu khong co HieuLucDen
            // -------------------------------------------------
            else if (hieuLucDen.HasValue &&
                     !bangGia.HieuLucDen.HasValue)
            {
                if (hieuLucDen.Value > bangGia.HieuLucTu)
                {
                    return true;
                }
            }

            // -------------------------------------------------
            // Ca hai deu co HieuLucDen
            // -------------------------------------------------
            else if (hieuLucDen.HasValue &&
                     bangGia.HieuLucDen.HasValue)
            {
                if (hieuLucTu < bangGia.HieuLucDen.Value &&
                    hieuLucDen.Value > bangGia.HieuLucTu)
                {
                    return true;
                }
            }
        }

        return false;
    }
}
