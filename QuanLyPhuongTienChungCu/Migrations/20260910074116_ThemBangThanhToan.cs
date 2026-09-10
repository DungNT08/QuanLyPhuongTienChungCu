using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyPhuongTienChungCu.Migrations
{
    /// <inheritdoc />
    public partial class ThemBangThanhToan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ThanhToans",
                columns: table => new
                {
                    ThanhToanId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    LuotGuiXeId = table.Column<long>(type: "bigint", nullable: false),
                    SoTien = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    ThoiGianThanhToan = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    NguoiThanhToanId = table.Column<long>(type: "bigint", nullable: false),
                    TrangThai = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThanhToans", x => x.ThanhToanId);
                    table.ForeignKey(
                        name: "FK_ThanhToans_LuotGuiXes_LuotGuiXeId",
                        column: x => x.LuotGuiXeId,
                        principalTable: "LuotGuiXes",
                        principalColumn: "LuotGuiXeId",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ThanhToans_LuotGuiXeId",
                table: "ThanhToans",
                column: "LuotGuiXeId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ThanhToans");
        }
    }
}
