using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Data;
using QuanLyPhuongTienChungCu.Models;
using Microsoft.AspNetCore.Authorization;
using QuanLyPhuongTienChungCu.Services;

namespace QuanLyPhuongTienChungCu.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PhuongTienController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuditLogService _auditLogService;

    public PhuongTienController(
        AppDbContext context,
        AuditLogService auditLogService)
    {
        _context = context;
        _auditLogService = auditLogService;
    }

    // GET: api/PhuongTien
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PhuongTien>>> GetAll()
    {
        var query = _context.PhuongTiens
            .Include(x => x.LoaiPhuongTien)
            .AsQueryable();

        var role = User.FindFirst(
            System.Security.Claims.ClaimTypes.Role
        )?.Value;

        if (role == "CuDan")
        {
            var userIdClaim = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            query = query.Where(x => x.UserId == userId);
        }

        return await query
            .OrderBy(x => x.PhuongTienId)
            .ToListAsync();
    }


    // GET: api/PhuongTien/1
    [HttpGet("{id}")]
    public async Task<ActionResult<PhuongTien>> GetById(long id)
    {
        var phuongTien = await _context.PhuongTiens
            .Include(x => x.LoaiPhuongTien)
            .FirstOrDefaultAsync(x => x.PhuongTienId == id);

        if (phuongTien == null)
        {
            return NotFound();
        }

        var role = User.FindFirst(
            System.Security.Claims.ClaimTypes.Role
        )?.Value;

        if (role == "CuDan")
        {
            var userIdClaim = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            if (phuongTien.UserId != userId)
            {
                return Forbid();
            }
        }

        return phuongTien;
    }

    // POST: api/PhuongTien
    [HttpPost]
    public async Task<ActionResult<PhuongTien>> Create(PhuongTien phuongTien)
    {
        var loaiPhuongTien = await _context.LoaiPhuongTiens
            .FindAsync(phuongTien.LoaiPhuongTienId);

        if (loaiPhuongTien == null)
        {
            return BadRequest("Loai phuong tien khong ton tai.");
        }

        var bienSoDaTonTai = await _context.PhuongTiens
            .AnyAsync(x => x.BienSo == phuongTien.BienSo);

        if (bienSoDaTonTai)
        {
            return Conflict("Bien so da ton tai.");
        }

        var role = User.FindFirst(
            System.Security.Claims.ClaimTypes.Role
        )?.Value;

        if (role == "CuDan")
        {
            var userIdClaim = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            phuongTien.UserId = userId;
        }

        _context.PhuongTiens.Add(phuongTien);
        await _context.SaveChangesAsync();

        await _auditLogService.GhiLog(
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value is string userIdString
                ? long.Parse(userIdString)
                : null,
            "CREATE",
            "PhuongTien",
            phuongTien.PhuongTienId,
            $"Tao phuong tien {phuongTien.BienSo}"
        );

        return CreatedAtAction(
            nameof(GetById),
            new { id = phuongTien.PhuongTienId },
            phuongTien
        );
    }

    // PUT: api/PhuongTien/1
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        long id,
        PhuongTien phuongTien)
    {
        if (id != phuongTien.PhuongTienId)
        {
            return BadRequest("Id khong khop.");
        }

        var phuongTienCu = await _context.PhuongTiens
            .FindAsync(id);

        if (phuongTienCu == null)
        {
            return NotFound();
        }

        var role = User.FindFirst(
            System.Security.Claims.ClaimTypes.Role
        )?.Value;

        if (role == "CuDan")
        {
            var userIdClaim = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            if (phuongTienCu.UserId != userId)
            {
                return Forbid();
            }
        }

        var loaiPhuongTien = await _context.LoaiPhuongTiens
            .FindAsync(phuongTien.LoaiPhuongTienId);

        if (loaiPhuongTien == null)
        {
            return BadRequest("Loai phuong tien khong ton tai.");
        }

        var bienSoDaTonTai = await _context.PhuongTiens
            .AnyAsync(x =>
                x.BienSo == phuongTien.BienSo &&
                x.PhuongTienId != id);

        if (bienSoDaTonTai)
        {
            return Conflict("Bien so da ton tai.");
        }

        phuongTienCu.BienSo = phuongTien.BienSo;
        phuongTienCu.LoaiPhuongTienId = phuongTien.LoaiPhuongTienId;
        phuongTienCu.TenChuXe = phuongTien.TenChuXe;
        phuongTienCu.MaCanHo = phuongTien.MaCanHo;
        phuongTienCu.TrangThai = phuongTien.TrangThai;

        await _context.SaveChangesAsync();

        return NoContent();
    }
    
    // DELETE: api/PhuongTien/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var phuongTien = await _context.PhuongTiens
            .FindAsync(id);

        if (phuongTien == null)
        {
            return NotFound();
        }

        var role = User.FindFirst(
            System.Security.Claims.ClaimTypes.Role
        )?.Value;

        if (role == "CuDan")
        {
            var userIdClaim = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            if (phuongTien.UserId != userId)
            {
                return Forbid();
            }
        }

        _context.PhuongTiens.Remove(phuongTien);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("{id}/history")]
    public async Task<ActionResult<IEnumerable<LuotGuiXe>>> GetHistory(long id)
    {
        var phuongTien = await _context.PhuongTiens
            .FindAsync(id);

        if (phuongTien == null)
        {
            return NotFound("Phuong tien khong ton tai.");
        }

        var role = User.FindFirst(
            System.Security.Claims.ClaimTypes.Role
        )?.Value;

        if (role == "CuDan")
        {
            var userIdClaim = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            if (phuongTien.UserId != userId)
            {
                return Forbid();
            }
        }

        var lichSu = await _context.LuotGuiXes
            .Where(x => x.PhuongTienId == id)
            .OrderByDescending(x => x.ThoiGianVao)
            .ToListAsync();

        return Ok(lichSu);
    }
}