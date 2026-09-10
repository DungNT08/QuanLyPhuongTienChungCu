using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhuongTienChungCu.Data;
using QuanLyPhuongTienChungCu.Models;
using Microsoft.AspNetCore.Authorization;

namespace QuanLyPhuongTienChungCu.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class RoleController : ControllerBase
{
    private readonly AppDbContext _context;

    public RoleController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Role>>> GetAll()
    {
        return await _context.Roles
            .OrderBy(x => x.RoleId)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Role>> GetById(long id)
    {
        var role = await _context.Roles
            .FindAsync(id);

        if (role == null)
        {
            return NotFound();
        }

        return role;
    }

    [HttpPost]
    public async Task<ActionResult<Role>> Create(Role role)
    {
        if (string.IsNullOrWhiteSpace(role.TenRole))
        {
            return BadRequest("Ten role khong duoc de trong.");
        }

        var daTonTai = await _context.Roles
            .AnyAsync(x => x.TenRole == role.TenRole);

        if (daTonTai)
        {
            return Conflict("Ten role da ton tai.");
        }

        _context.Roles.Add(role);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = role.RoleId },
            role
        );
    }
}