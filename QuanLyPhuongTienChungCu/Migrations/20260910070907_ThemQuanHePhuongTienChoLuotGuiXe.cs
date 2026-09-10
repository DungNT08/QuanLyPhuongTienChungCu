using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyPhuongTienChungCu.Migrations
{
    /// <inheritdoc />
    public partial class ThemQuanHePhuongTienChoLuotGuiXe : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LuotGuiXes_LoaiPhuongTiens_LoaiPhuongTienId",
                table: "LuotGuiXes");

            migrationBuilder.DropForeignKey(
                name: "FK_LuotGuiXes_PhuongTiens_PhuongTienId",
                table: "LuotGuiXes");

            migrationBuilder.AlterColumn<long>(
                name: "PhuongTienId",
                table: "LuotGuiXes",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_LuotGuiXes_LoaiPhuongTiens_LoaiPhuongTienId",
                table: "LuotGuiXes",
                column: "LoaiPhuongTienId",
                principalTable: "LoaiPhuongTiens",
                principalColumn: "LoaiPhuongTienId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LuotGuiXes_PhuongTiens_PhuongTienId",
                table: "LuotGuiXes",
                column: "PhuongTienId",
                principalTable: "PhuongTiens",
                principalColumn: "PhuongTienId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LuotGuiXes_LoaiPhuongTiens_LoaiPhuongTienId",
                table: "LuotGuiXes");

            migrationBuilder.DropForeignKey(
                name: "FK_LuotGuiXes_PhuongTiens_PhuongTienId",
                table: "LuotGuiXes");

            migrationBuilder.AlterColumn<long>(
                name: "PhuongTienId",
                table: "LuotGuiXes",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddForeignKey(
                name: "FK_LuotGuiXes_LoaiPhuongTiens_LoaiPhuongTienId",
                table: "LuotGuiXes",
                column: "LoaiPhuongTienId",
                principalTable: "LoaiPhuongTiens",
                principalColumn: "LoaiPhuongTienId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LuotGuiXes_PhuongTiens_PhuongTienId",
                table: "LuotGuiXes",
                column: "PhuongTienId",
                principalTable: "PhuongTiens",
                principalColumn: "PhuongTienId");
        }
    }
}
