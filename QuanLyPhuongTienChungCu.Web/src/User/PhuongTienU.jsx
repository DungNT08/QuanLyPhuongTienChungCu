import React, { useEffect, useState } from "react";
import "./PhuongTienU.css";
import { apiFetch } from "../api/api";

function PhuongTienU() {
  // =========================================================
  // STATE
  // =========================================================

  const [danhSachXe, setDanhSachXe] = useState([]);

  const [loading, setLoading] = useState(true);

  const [loi, setLoi] = useState("");

  const [hienForm, setHienForm] = useState(false);

  const [dangSua, setDangSua] = useState(false);

  const [idDangSua, setIdDangSua] = useState(null);

  const [dangLuu, setDangLuu] = useState(false);

  // =========================================================
  // TÌM KIẾM
  // =========================================================

  const [tuKhoa, setTuKhoa] = useState("");

  const [formData, setFormData] = useState({
    bienSo: "",
    loaiPhuongTienId: "1",
    trangThai: "PENDING",
  });

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData({
      bienSo: "",
      loaiPhuongTienId: "1",
      trangThai: "PENDING",
    });

    setDangSua(false);
    setIdDangSua(null);
  };

  // =========================================================
  // LẤY DANH SÁCH PHƯƠNG TIỆN
  // =========================================================

  const layDanhSachPhuongTien = async () => {
    try {
      setLoading(true);
      setLoi("");

      const data = await apiFetch("/PhuongTien");

      console.log("Danh sách phương tiện:", data);

      const danhSach = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setDanhSachXe(danhSach);
    } catch (error) {
      console.error(
        "Lỗi lấy danh sách phương tiện:",
        error
      );

      setDanhSachXe([]);

      setLoi(
        error?.message ||
          "Không thể tải danh sách phương tiện từ hệ thống."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CHẠY KHI MỞ TRANG
  // =========================================================

  useEffect(() => {
    layDanhSachPhuongTien();
  }, []);

  // =========================================================
  // LẤY ID
  // =========================================================

  const layId = (xe) => {
    return (
      xe?.phuongTienId ??
      xe?.PhuongTienId ??
      xe?.id ??
      xe?.ID ??
      null
    );
  };

  // =========================================================
  // LẤY BIỂN SỐ
  // =========================================================

  const layBienSo = (xe) => {
    return (
      xe?.bienSo ??
      xe?.BienSo ??
      "Chưa có"
    );
  };

  // =========================================================
  // LẤY LOẠI XE
  // =========================================================

  const layLoaiXe = (xe) => {
    const tenLoai =
      xe?.loaiXe ??
      xe?.LoaiXe;

    if (tenLoai) {
      return tenLoai;
    }

    const loaiId =
      xe?.loaiPhuongTienId ??
      xe?.LoaiPhuongTienId;

    if (Number(loaiId) === 1) {
      return "Xe máy";
    }

    if (Number(loaiId) === 3) {
      return "Ô tô";
    }

    if (Number(loaiId) === 4) {
      return "Xe đạp";
    }

    return "Chưa xác định";
  };

  // =========================================================
  // LẤY CHỦ XE
  // =========================================================

  const layChuXe = (xe) => {
    return (
      xe?.tenChuXe ??
      xe?.TenChuXe ??
      "Cư dân"
    );
  };

  // =========================================================
  // LẤY CĂN HỘ
  // =========================================================

  const layCanHo = (xe) => {
    return (
      xe?.maCanHo ??
      xe?.MaCanHo ??
      "Chưa cập nhật"
    );
  };

  // =========================================================
  // LẤY TRẠNG THÁI
  // =========================================================

  const layTrangThai = (xe) => {
    const value =
      xe?.trangThai ??
      xe?.TrangThai ??
      "";

    if (
      value === "ACTIVE" ||
      value === "DANG_HOAT_DONG"
    ) {
      return "Đang hoạt động";
    }

    if (
      value === "INACTIVE" ||
      value === "TAM_NGUNG"
    ) {
      return "Tạm ngưng";
    }

    if (
      value === "PENDING" ||
      value === "CHO_DUYET"
    ) {
      return "Chờ duyệt";
    }

    if (value) {
      return value;
    }

    return "Đang hoạt động";
  };

  // =========================================================
  // CLASS TRẠNG THÁI
  // =========================================================

  const layClassTrangThai = (xe) => {
    const value = String(
      xe?.trangThai ??
        xe?.TrangThai ??
        ""
    ).toUpperCase();

    if (
      value === "ACTIVE" ||
      value === "DANG_HOAT_DONG"
    ) {
      return "trang-thai active";
    }

    if (
      value === "PENDING" ||
      value === "CHO_DUYET"
    ) {
      return "trang-thai pending";
    }

    return "trang-thai inactive";
  };

  // =========================================================
  // LẤY NGÀY TẠO
  // =========================================================

  const layNgayThem = (xe) => {
    const ngay =
      xe?.ngayTao ??
      xe?.NgayTao ??
      xe?.ngayThem ??
      xe?.NgayThem;

    if (!ngay) {
      return "Chưa có";
    }

    const date = new Date(ngay);

    if (Number.isNaN(date.getTime())) {
      return String(ngay);
    }

    return date.toLocaleDateString(
      "vi-VN"
    );
  };

  // =========================================================
  // ICON LOẠI XE
  // =========================================================

  const layIconLoaiXe = (xe) => {
    const loai =
      layLoaiXe(xe).toLowerCase();

    if (
      loai.includes("ô tô") ||
      loai.includes("oto")
    ) {
      return "🚘";
    }

    if (loai.includes("đạp")) {
      return "🚲";
    }

    return "🏍️";
  };

  // =========================================================
  // TÌM KIẾM DANH SÁCH
  // =========================================================

  const danhSachLoc = danhSachXe.filter(
    (xe) => {
      const tuKhoaLower =
        tuKhoa
          .trim()
          .toLowerCase();

      if (!tuKhoaLower) {
        return true;
      }

      const bienSo =
        layBienSo(xe)
          .toLowerCase();

      const loaiXe =
        layLoaiXe(xe)
          .toLowerCase();

      const chuXe =
        layChuXe(xe)
          .toLowerCase();

      const canHo =
        layCanHo(xe)
          .toLowerCase();

      const trangThai =
        layTrangThai(xe)
          .toLowerCase();

      return (
        bienSo.includes(
          tuKhoaLower
        ) ||
        loaiXe.includes(
          tuKhoaLower
        ) ||
        chuXe.includes(
          tuKhoaLower
        ) ||
        canHo.includes(
          tuKhoaLower
        ) ||
        trangThai.includes(
          tuKhoaLower
        )
      );
    }
  );

  // =========================================================
  // MỞ FORM THÊM
  // =========================================================

  const themPhuongTien = () => {
    resetForm();
    setHienForm(true);
  };

  // =========================================================
  // MỞ FORM SỬA
  // =========================================================

  const suaPhuongTien = (xe) => {
    const id = layId(xe);

    if (!id) {
      alert(
        "Không xác định được mã phương tiện."
      );
      return;
    }

    const bienSo = layBienSo(xe);

    const loaiPhuongTienId =
      xe?.loaiPhuongTienId ??
      xe?.LoaiPhuongTienId ??
      1;

    const trangThai =
      xe?.trangThai ??
      xe?.TrangThai ??
      "ACTIVE";

    setDangSua(true);

    setIdDangSua(id);

    setFormData({
      bienSo:
        bienSo === "Chưa có"
          ? ""
          : bienSo,

      loaiPhuongTienId:
        String(
          loaiPhuongTienId
        ),

      trangThai:
        trangThai,
    });

    setHienForm(true);
  };

  // =========================================================
  // ĐÓNG FORM
  // =========================================================

  const dongForm = () => {
    if (dangLuu) {
      return;
    }

    setHienForm(false);

    resetForm();
  };

  // =========================================================
  // THAY ĐỔI FORM
  // =========================================================

  const thayDoiThongTin = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((cu) => ({
      ...cu,
      [name]: value,
    }));
  };

  // =========================================================
  // LƯU THÊM / SỬA
  // =========================================================

  const luuPhuongTien = async (e) => {
    e.preventDefault();

    if (dangLuu) {
      return;
    }

    if (!formData.bienSo.trim()) {
      alert(
        "Vui lòng nhập biển số xe."
      );
      return;
    }

    if (!formData.loaiPhuongTienId) {
      alert(
        "Vui lòng chọn loại phương tiện."
      );
      return;
    }

    try {
      setDangLuu(true);

      // ===================================================
      // THÊM
      // ===================================================

      if (!dangSua) {
        const duLieuGui = {
          bienSo:
            formData.bienSo
              .trim()
              .toUpperCase(),

          loaiPhuongTienId:
            Number(
              formData.loaiPhuongTienId
            ),

          // LUÔN CHỜ ADMIN DUYỆT
          trangThai: "PENDING",
        };

        console.log(
          "Dữ liệu thêm:",
          duLieuGui
        );

        await apiFetch(
          "/PhuongTien",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                duLieuGui
              ),
          }
        );

        alert(
          "Đăng ký phương tiện thành công!\n\n" +
          "Phương tiện đang chờ quản trị viên duyệt.\n" +
          "Sau khi được duyệt, phương tiện sẽ hiển thị trong danh sách của bạn."
        );
      }

      // ===================================================
      // SỬA
      // ===================================================

      else {
        const duLieuGui = {
          phuongTienId:
            Number(
              idDangSua
            ),

          bienSo:
            formData.bienSo
              .trim()
              .toUpperCase(),

          loaiPhuongTienId:
            Number(
              formData.loaiPhuongTienId
            ),

          trangThai:
            formData.trangThai,
        };

        console.log(
          "Dữ liệu sửa:",
          duLieuGui
        );

        await apiFetch(
          `/PhuongTien/${idDangSua}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                duLieuGui
              ),
          }
        );

        alert(
          "Cập nhật phương tiện thành công."
        );
      }

      setHienForm(false);

      resetForm();

      await layDanhSachPhuongTien();
    } catch (error) {
      console.error(
        "Lỗi lưu phương tiện:",
        error
      );

      const message =
        error?.message || "";

      if (
        message.includes("401")
      ) {
        alert(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (
        message.includes("403")
      ) {
        alert(
          "Bạn không có quyền thực hiện thao tác này."
        );
      } else if (
        message.includes("409")
      ) {
        alert(
          "Biển số xe này đã tồn tại."
        );
      } else {
        alert(
          message ||
            "Không thể lưu phương tiện."
        );
      }
    } finally {
      setDangLuu(false);
    }
  };

  // =========================================================
  // XÓA
  // =========================================================

  const xoaPhuongTien = async (xe) => {
    const id = layId(xe);

    const bienSo = layBienSo(xe);

    if (!id) {
      alert(
        "Không xác định được mã phương tiện."
      );
      return;
    }

    const xacNhan =
      window.confirm(
        `Bạn có chắc muốn xóa ${bienSo} không?`
      );

    if (!xacNhan) {
      return;
    }

    try {
      const result =
        await apiFetch(
          `/PhuongTien/${id}`,
          {
            method: "DELETE",
          }
        );

      console.log(
        "Kết quả xóa:",
        result
      );

      if (
        result?.trangThai ===
        "INACTIVE"
      ) {
        alert(
          "Phương tiện đã có lịch sử gửi xe nên được chuyển sang trạng thái tạm ngưng."
        );
      } else {
        alert(
          "Xóa phương tiện thành công."
        );
      }

      await layDanhSachPhuongTien();
    } catch (error) {
      console.error(
        "Lỗi xóa phương tiện:",
        error
      );

      const message =
        error?.message || "";

      if (
        message.includes("401")
      ) {
        alert(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (
        message.includes("403")
      ) {
        alert(
          "Bạn không có quyền xóa phương tiện này."
        );
      } else {
        alert(
          message ||
            "Không thể xóa phương tiện."
        );
      }
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="phuong-tien-container">

        <div className="phuong-tien-header">

          <div className="phuong-tien-title">

            <h1>
              Phương tiện của tôi
            </h1>

            <p>
              Quản lý các phương tiện đã đăng ký
            </p>

          </div>

        </div>

        <div className="loading-box">

          <div className="loading-spinner"></div>

          <span>
            Đang tải danh sách phương tiện...
          </span>

        </div>

      </div>
    );
  }

  // =========================================================
  // GIAO DIỆN
  // =========================================================

  return (
    <div className="phuong-tien-container">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="phuong-tien-header">

        <div className="phuong-tien-title">

          <h1>
            Phương tiện của tôi
          </h1>

          <p>
            Quản lý các phương tiện đã đăng ký
          </p>

        </div>

        <button
          type="button"
          className="btn-them-phuong-tien"
          onClick={
            themPhuongTien
          }
        >
          <span>+</span>

          Thêm phương tiện
        </button>

      </div>

      {/* ===================================================
          LỖI
      =================================================== */}

      {loi && (
        <div className="thong-bao-loi">

          <span>
            {loi}
          </span>

          <button
            type="button"
            onClick={
              layDanhSachPhuongTien
            }
          >
            Thử lại
          </button>

        </div>
      )}

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="bang-phuong-tien">

        <div className="bang-header">

          <div className="bang-header-left">

            <h3>
              Danh sách phương tiện
            </h3>

            <span>
              {tuKhoa.trim()
                ? `${danhSachLoc.length}/${danhSachXe.length} phương tiện`
                : `${danhSachXe.length} phương tiện`}
            </span>

          </div>

          {/* =================================================
              TÌM KIẾM
          ================================================= */}

          <div className="tim-kiem-phuong-tien">

            <span className="tim-kiem-icon">
              🔍
            </span>

            <input
              type="text"
              value={tuKhoa}
              onChange={(e) =>
                setTuKhoa(
                  e.target.value
                )
              }
              placeholder="Tìm biển số, loại xe, chủ xe, căn hộ..."
            />

            {tuKhoa && (
              <button
                type="button"
                className="xoa-tim-kiem"
                onClick={() =>
                  setTuKhoa("")
                }
                title="Xóa tìm kiếm"
              >
                ×
              </button>
            )}

          </div>

        </div>

        {danhSachXe.length === 0 ? (

          <div className="khong-co-phuong-tien">

            <div className="khong-co-icon">
              🚗
            </div>

            <h3>
              Chưa có phương tiện
            </h3>

            <p>
              Bạn chưa đăng ký phương tiện nào.
            </p>

            <button
              type="button"
              className="btn-them-phuong-tien"
              onClick={
                themPhuongTien
              }
            >
              <span>+</span>

              Thêm phương tiện
            </button>

          </div>

        ) : danhSachLoc.length === 0 ? (

          <div className="khong-co-phuong-tien">

            <div className="khong-co-icon">
              🔍
            </div>

            <h3>
              Không tìm thấy phương tiện
            </h3>

            <p>
              Không có phương tiện nào phù hợp với từ khóa "{tuKhoa}".
            </p>

            <button
              type="button"
              className="btn-them-phuong-tien"
              onClick={() =>
                setTuKhoa("")
              }
            >
              Xóa tìm kiếm
            </button>

          </div>

        ) : (

          <div className="table-scroll">

            <table className="phuong-tien-table">

              <thead>

                <tr>

                  <th className="cot-stt">
                    STT
                  </th>

                  <th>
                    Biển số
                  </th>

                  <th>
                    Loại xe
                  </th>

                  <th>
                    Chủ xe
                  </th>

                  <th>
                    Căn hộ
                  </th>

                  <th>
                    Ngày thêm
                  </th>

                  <th>
                    Trạng thái
                  </th>

                  <th className="cot-thao-tac">
                    Thao tác
                  </th>

                </tr>

              </thead>

              <tbody>

                {danhSachLoc.map(
                  (xe, index) => {

                    const id =
                      layId(xe);

                    return (

                      <tr key={id}>

                        {/* STT */}

                        <td className="cot-stt">
                          {index + 1}
                        </td>

                        {/* BIỂN SỐ */}

                        <td>

                          <div className="bien-so-cell">

                            <span className="icon-xe-nho">
                              {layIconLoaiXe(
                                xe
                              )}
                            </span>

                            <strong>
                              {layBienSo(
                                xe
                              )}
                            </strong>

                          </div>

                        </td>

                        {/* LOẠI */}

                        <td>
                          {layLoaiXe(
                            xe
                          )}
                        </td>

                        {/* CHỦ XE */}

                        <td>

                          <span className="chu-xe">
                            {layChuXe(
                              xe
                            )}
                          </span>

                        </td>

                        {/* CĂN HỘ */}

                        <td>

                          <span className="badge-can-ho">
                            {layCanHo(
                              xe
                            )}
                          </span>

                        </td>

                        {/* NGÀY */}

                        <td>
                          {layNgayThem(
                            xe
                          )}
                        </td>

                        {/* TRẠNG THÁI */}

                        <td>

                          <span
                            className={
                              layClassTrangThai(
                                xe
                              )
                            }
                          >
                            {layTrangThai(
                              xe
                            )}
                          </span>

                        </td>

                        {/* THAO TÁC */}

                        <td className="cot-thao-tac">

                          <div className="thao-tac">

                            <button
                              type="button"
                              className="btn-sua"
                              onClick={() =>
                                suaPhuongTien(
                                  xe
                                )
                              }
                              title="Sửa phương tiện"
                            >
                              ✎
                            </button>

                            <button
                              type="button"
                              className="btn-xoa"
                              onClick={() =>
                                xoaPhuongTien(
                                  xe
                                )
                              }
                              title="Xóa phương tiện"
                            >
                              🗑
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ===================================================
          FORM THÊM / SỬA
      =================================================== */}

      {hienForm && (

        <div
          className="lop-phu"
          onClick={
            dongForm
          }
        >

          <div
            className="form-phuong-tien"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="form-header">

              <div>

                <h2>

                  {dangSua
                    ? "Sửa phương tiện"
                    : "Thêm phương tiện"}

                </h2>

                <p>
                  {dangSua
                    ? "Cập nhật thông tin phương tiện"
                    : "Nhập thông tin phương tiện"}
                </p>

              </div>

              <button
                type="button"
                className="btn-dong-form"
                onClick={
                  dongForm
                }
                disabled={
                  dangLuu
                }
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                luuPhuongTien
              }
            >

              {/* BIỂN SỐ */}

              <div className="form-group">

                <label>
                  Biển số xe
                </label>

                <input
                  type="text"
                  name="bienSo"
                  value={
                    formData.bienSo
                  }
                  onChange={
                    thayDoiThongTin
                  }
                  placeholder="Ví dụ: 30A-12345"
                  required
                  disabled={
                    dangLuu
                  }
                />

              </div>

              {/* LOẠI XE */}

              <div className="form-group">

                <label>
                  Loại phương tiện
                </label>

                <select
                  name="loaiPhuongTienId"
                  value={
                    formData.loaiPhuongTienId
                  }
                  onChange={
                    thayDoiThongTin
                  }
                  disabled={
                    dangLuu
                  }
                >

                  <option value="1">
                    Xe máy
                  </option>

                  <option value="3">
                    Ô tô
                  </option>

                  <option value="4">
                    Xe đạp
                  </option>

                </select>

              </div>

              {/* =================================================
                  TRẠNG THÁI
                  CHỈ HIỆN KHI ĐANG SỬA
              ================================================= */}

              {dangSua && (

                <div className="form-group">

                  <label>
                    Trạng thái
                  </label>

                  <select
                    name="trangThai"
                    value={
                      formData.trangThai
                    }
                    onChange={
                      thayDoiThongTin
                    }
                    disabled={
                      dangLuu
                    }
                  >

                    <option value="ACTIVE">
                      Đang hoạt động
                    </option>

                    <option value="INACTIVE">
                      Tạm ngưng
                    </option>

                    <option value="PENDING">
                      Chờ duyệt
                    </option>

                  </select>

                </div>

              )}

              {/* =================================================
                  THÔNG BÁO KHI THÊM MỚI
              ================================================= */}

              {!dangSua && (

                <div className="thong-bao-cho-duyet">

                  <span className="icon-thong-bao-cho-duyet">
                    ⏳
                  </span>

                  <span>
                    Phương tiện mới sẽ được gửi đến quản trị viên để chờ duyệt.
                  </span>

                </div>

              )}

              {/* BUTTON */}

              <div className="form-actions">

                <button
                  type="button"
                  className="btn-huy"
                  onClick={
                    dongForm
                  }
                  disabled={
                    dangLuu
                  }
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="btn-luu"
                  disabled={
                    dangLuu
                  }
                >

                  {dangLuu
                    ? "Đang lưu..."
                    : dangSua
                    ? "Lưu thay đổi"
                    : "Gửi đăng ký"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default PhuongTienU;
