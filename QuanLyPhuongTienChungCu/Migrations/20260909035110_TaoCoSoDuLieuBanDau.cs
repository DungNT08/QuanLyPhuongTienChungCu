using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyPhuongTienChungCu.Migrations
{
    /// <inheritdoc />
    public partial class TaoCoSoDuLieuBanDau : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "LoaiPhuongTiens",
                columns: table => new
                {
                    LoaiPhuongTienId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    TenLoai = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MoTa = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoaiPhuongTiens", x => x.LoaiPhuongTienId);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "BangGias",
                columns: table => new
                {
                    BangGiaId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    LoaiPhuongTienId = table.Column<long>(type: "bigint", nullable: false),
                    DonGia = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    HieuLucTu = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    HieuLucDen = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    TrangThai = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BangGias", x => x.BangGiaId);
                    table.ForeignKey(
                        name: "FK_BangGias_LoaiPhuongTiens_LoaiPhuongTienId",
                        column: x => x.LoaiPhuongTienId,
                        principalTable: "LoaiPhuongTiens",
                        principalColumn: "LoaiPhuongTienId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "PhuongTiens",
                columns: table => new
                {
                    PhuongTienId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    BienSo = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LoaiPhuongTienId = table.Column<long>(type: "bigint", nullable: false),
                    TenChuXe = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MaCanHo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TrangThai = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    NgayTao = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhuongTiens", x => x.PhuongTienId);
                    table.ForeignKey(
                        name: "FK_PhuongTiens_LoaiPhuongTiens_LoaiPhuongTienId",
                        column: x => x.LoaiPhuongTienId,
                        principalTable: "LoaiPhuongTiens",
                        principalColumn: "LoaiPhuongTienId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "LuotGuiXes",
                columns: table => new
                {
                    LuotGuiXeId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    BienSo = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LoaiPhuongTienId = table.Column<long>(type: "bigint", nullable: false),
                    ThoiGianVao = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ThoiGianRa = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    SoTien = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    TrangThai = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    NguoiTaoId = table.Column<long>(type: "bigint", nullable: false),
                    PhuongTienId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LuotGuiXes", x => x.LuotGuiXeId);
                    table.ForeignKey(
                        name: "FK_LuotGuiXes_LoaiPhuongTiens_LoaiPhuongTienId",
                        column: x => x.LoaiPhuongTienId,
                        principalTable: "LoaiPhuongTiens",
                        principalColumn: "LoaiPhuongTienId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LuotGuiXes_PhuongTiens_PhuongTienId",
                        column: x => x.PhuongTienId,
                        principalTable: "PhuongTiens",
                        principalColumn: "PhuongTienId");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_BangGias_LoaiPhuongTienId",
                table: "BangGias",
                column: "LoaiPhuongTienId");

            migrationBuilder.CreateIndex(
                name: "IX_LoaiPhuongTiens_TenLoai",
                table: "LoaiPhuongTiens",
                column: "TenLoai",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LuotGuiXes_BienSo_TrangThai",
                table: "LuotGuiXes",
                columns: new[] { "BienSo", "TrangThai" });

            migrationBuilder.CreateIndex(
                name: "IX_LuotGuiXes_LoaiPhuongTienId",
                table: "LuotGuiXes",
                column: "LoaiPhuongTienId");

            migrationBuilder.CreateIndex(
                name: "IX_LuotGuiXes_PhuongTienId",
                table: "LuotGuiXes",
                column: "PhuongTienId");

            migrationBuilder.CreateIndex(
                name: "IX_PhuongTiens_BienSo",
                table: "PhuongTiens",
                column: "BienSo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PhuongTiens_LoaiPhuongTienId",
                table: "PhuongTiens",
                column: "LoaiPhuongTienId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BangGias");

            migrationBuilder.DropTable(
                name: "LuotGuiXes");

            migrationBuilder.DropTable(
                name: "PhuongTiens");

            migrationBuilder.DropTable(
                name: "LoaiPhuongTiens");
        }
    }
}
