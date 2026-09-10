using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyPhuongTienChungCu.Migrations
{
    /// <inheritdoc />
    public partial class ThemUserIdVaoPhuongTien : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "UserId",
                table: "PhuongTiens",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PhuongTiens_UserId",
                table: "PhuongTiens",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_PhuongTiens_Users_UserId",
                table: "PhuongTiens",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PhuongTiens_Users_UserId",
                table: "PhuongTiens");

            migrationBuilder.DropIndex(
                name: "IX_PhuongTiens_UserId",
                table: "PhuongTiens");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "PhuongTiens");
        }
    }
}
