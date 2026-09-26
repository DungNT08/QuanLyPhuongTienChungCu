using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Data;
using QuanLyPhuongTienChungCu.Models;

namespace QuanLyPhuongTienChungCu.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CanHoController : ControllerBase
{
    private readonly AppDbContext _context;

    public CanHoController(AppDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // GET: api/CanHo
    // LẤY DANH SÁCH CĂN HỘ
    // =====================================================
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var danhSach = await _context.CanHos
            .Include(c => c.User)
            .Select(c => new
            {
                c.CanHoId,
                c.MaCanHo,
                c.Toa,
                c.Tang,
                c.SoPhong,
                c.TrangThai,
                c.UserId,

                ChuHo = c.User != null
                    ? c.User.HoTen
                    : null
            })
            .OrderBy(c => c.MaCanHo)
            .ToListAsync();

        return Ok(danhSach);
    }

    // =====================================================
    // GET: api/CanHo/1
    // LẤY 1 CĂN HỘ
    // =====================================================
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var canHo = await _context.CanHos
            .Include(c => c.User)
            .Where(c => c.CanHoId == id)
            .Select(c => new
            {
                c.CanHoId,
                c.MaCanHo,
                c.Toa,
                c.Tang,
                c.SoPhong,
                c.TrangThai,
                c.UserId,

                ChuHo = c.User != null
                    ? c.User.HoTen
                    : null
            })
            .FirstOrDefaultAsync();

        if (canHo == null)
        {
            return NotFound(new
            {
                message = "Không tìm thấy căn hộ."
            });
        }

        return Ok(canHo);
    }

    // =====================================================
    // POST: api/CanHo
    // THÊM CĂN HỘ
    // =====================================================
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CanHoRequest request)
    {
        // Kiểm tra mã căn hộ
        if (string.IsNullOrWhiteSpace(request.MaCanHo))
        {
            return BadRequest(new
            {
                message = "Mã căn hộ không được để trống."
            });
        }

        // Kiểm tra trùng mã căn hộ
        var daTonTai = await _context.CanHos
            .AnyAsync(c => c.MaCanHo == request.MaCanHo);

        if (daTonTai)
        {
            return BadRequest(new
            {
                message = "Mã căn hộ đã tồn tại."
            });
        }

        // Kiểm tra UserId nếu có
        if (request.UserId.HasValue)
        {
            var userTonTai = await _context.Users
                .AnyAsync(u => u.UserId == request.UserId.Value);

            if (!userTonTai)
            {
                return BadRequest(new
                {
                    message = "UserId không tồn tại."
                });
            }
        }

        var canHo = new CanHo
        {
            MaCanHo = request.MaCanHo.Trim(),
            Toa = request.Toa?.Trim(),
            Tang = request.Tang,
            SoPhong = request.SoPhong,
            TrangThai = string.IsNullOrWhiteSpace(request.TrangThai)
                ? "Trống"
                : request.TrangThai.Trim(),
            UserId = request.UserId
        };

        _context.CanHos.Add(canHo);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = canHo.CanHoId },
            new
            {
                message = "Thêm căn hộ thành công.",
                canHo.CanHoId,
                canHo.MaCanHo,
                canHo.Toa,
                canHo.Tang,
                canHo.SoPhong,
                canHo.TrangThai,
                canHo.UserId
            }
        );
    }

    // =====================================================
    // PUT: api/CanHo/1
    // CẬP NHẬT CĂN HỘ
    // =====================================================
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(
        long id,
        [FromBody] CanHoRequest request)
    {
        var canHo = await _context.CanHos
            .FirstOrDefaultAsync(c => c.CanHoId == id);

        if (canHo == null)
        {
            return NotFound(new
            {
                message = "Không tìm thấy căn hộ."
            });
        }

        if (string.IsNullOrWhiteSpace(request.MaCanHo))
        {
            return BadRequest(new
            {
                message = "Mã căn hộ không được để trống."
            });
        }

        // Kiểm tra trùng mã với căn hộ khác
        var trungMa = await _context.CanHos
            .AnyAsync(c =>
                c.MaCanHo == request.MaCanHo &&
                c.CanHoId != id
            );

        if (trungMa)
        {
            return BadRequest(new
            {
                message = "Mã căn hộ đã được sử dụng."
            });
        }

        // Kiểm tra UserId
        if (request.UserId.HasValue)
        {
            var userTonTai = await _context.Users
                .AnyAsync(u => u.UserId == request.UserId.Value);

            if (!userTonTai)
            {
                return BadRequest(new
                {
                    message = "UserId không tồn tại."
                });
            }
        }

        canHo.MaCanHo = request.MaCanHo.Trim();
        canHo.Toa = request.Toa?.Trim();
        canHo.Tang = request.Tang;
        canHo.SoPhong = request.SoPhong;

        canHo.TrangThai =
            string.IsNullOrWhiteSpace(request.TrangThai)
                ? "Trống"
                : request.TrangThai.Trim();

        canHo.UserId = request.UserId;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Cập nhật căn hộ thành công.",
            canHo.CanHoId,
            canHo.MaCanHo,
            canHo.Toa,
            canHo.Tang,
            canHo.SoPhong,
            canHo.TrangThai,
            canHo.UserId
        });
    }

    // =====================================================
    // DELETE: api/CanHo/1
    // XÓA CĂN HỘ
    // =====================================================
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        var canHo = await _context.CanHos
            .FirstOrDefaultAsync(c => c.CanHoId == id);

        if (canHo == null)
        {
            return NotFound(new
            {
                message = "Không tìm thấy căn hộ."
            });
        }

        _context.CanHos.Remove(canHo);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Xóa căn hộ thành công."
        });
    }
}


// =====================================================
// DTO REQUEST
// =====================================================

public class CanHoRequest
{
    public string MaCanHo { get; set; } = string.Empty;

    public string? Toa { get; set; }

    public int? Tang { get; set; }

    public int? SoPhong { get; set; }

    public string TrangThai { get; set; } = "Trống";

    public long? UserId { get; set; }
}