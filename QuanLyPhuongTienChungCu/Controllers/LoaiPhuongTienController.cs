using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Data;
using QuanLyPhuongTienChungCu.Models;

namespace QuanLyPhuongTienChungCu.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoaiPhuongTienController : ControllerBase
{
    private readonly AppDbContext _context;

    public LoaiPhuongTienController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/LoaiPhuongTien
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var danhSach = await _context.LoaiPhuongTiens
            .OrderBy(x => x.LoaiPhuongTienId)
            .ToListAsync();

        return Ok(danhSach);
    }

    // GET: api/LoaiPhuongTien/1
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var loai = await _context.LoaiPhuongTiens
            .FirstOrDefaultAsync(x => x.LoaiPhuongTienId == id);

        if (loai == null)
        {
            return NotFound("Khong tim thay loai phuong tien.");
        }

        return Ok(loai);
    }

    // POST: api/LoaiPhuongTien
    [HttpPost]
    [Authorize(Roles = "Admin,BanQuanLy")]
    public async Task<IActionResult> Create(LoaiPhuongTien model)
    {
        if (string.IsNullOrWhiteSpace(model.TenLoai))
        {
            return BadRequest("Ten loai phuong tien khong duoc de trong.");
        }

        var tenLoai = model.TenLoai.Trim();

        var daTonTai = await _context.LoaiPhuongTiens
            .AnyAsync(x => x.TenLoai == tenLoai);

        if (daTonTai)
        {
            return Conflict("Ten loai phuong tien da ton tai.");
        }

        model.TenLoai = tenLoai;
        model.LoaiPhuongTienId = 0;

        _context.LoaiPhuongTiens.Add(model);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = model.LoaiPhuongTienId },
            model
        );
    }

    // PUT: api/LoaiPhuongTien/1
    [HttpPut("{id:long}")]
    [Authorize(Roles = "Admin,BanQuanLy")]
    public async Task<IActionResult> Update(
        long id,
        LoaiPhuongTien model)
    {
        if (id != model.LoaiPhuongTienId)
        {
            return BadRequest("Id khong khop.");
        }

        if (string.IsNullOrWhiteSpace(model.TenLoai))
        {
            return BadRequest("Ten loai phuong tien khong duoc de trong.");
        }

        var loai = await _context.LoaiPhuongTiens
            .FirstOrDefaultAsync(
                x => x.LoaiPhuongTienId == id);

        if (loai == null)
        {
            return NotFound("Khong tim thay loai phuong tien.");
        }

        var tenLoai = model.TenLoai.Trim();

        var daTonTai = await _context.LoaiPhuongTiens
            .AnyAsync(x =>
                x.LoaiPhuongTienId != id &&
                x.TenLoai == tenLoai);

        if (daTonTai)
        {
            return Conflict("Ten loai phuong tien da ton tai.");
        }

        loai.TenLoai = tenLoai;
        loai.MoTa = model.MoTa;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/LoaiPhuongTien/1
    [HttpDelete("{id:long}")]
    [Authorize(Roles = "Admin,BanQuanLy")]
    public async Task<IActionResult> Delete(long id)
    {
        var loai = await _context.LoaiPhuongTiens
            .FirstOrDefaultAsync(
                x => x.LoaiPhuongTienId == id);

        if (loai == null)
        {
            return NotFound("Khong tim thay loai phuong tien.");
        }

        var dangDuocSuDung = await _context.PhuongTiens
            .AnyAsync(x => x.LoaiPhuongTienId == id);

        if (dangDuocSuDung)
        {
            return Conflict(
                "Khong the xoa loai phuong tien dang duoc su dung."
            );
        }

        var dangCoBangGia = await _context.BangGias
            .AnyAsync(x => x.LoaiPhuongTienId == id);

        if (dangCoBangGia)
        {
            return Conflict(
                "Khong the xoa loai phuong tien dang co bang gia."
            );
        }

        _context.LoaiPhuongTiens.Remove(loai);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}