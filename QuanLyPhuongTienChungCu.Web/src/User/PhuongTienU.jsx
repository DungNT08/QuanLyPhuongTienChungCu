import React, { useEffect, useState } from "react";
import "./PhuongTienU.css";
import { apiFetch } from "../api/api";

function PhuongTienU() {
  // =========================
  // STATE
  // =========================

  const [danhSachXe, setDanhSachXe] = useState([]);

  const [loading, setLoading] = useState(true);

  const [loi, setLoi] = useState("");

  const [hienForm, setHienForm] = useState(false);

  const [dangSua, setDangSua] = useState(false);

  const [idDangSua, setIdDangSua] = useState(null);

  const [formData, setFormData] = useState({
    bienSo: "",
    loaiXe: "Xe máy",
    hangXe: "",
    trangThai: "Đang hoạt động",
    anh: null,
    anhPreview: null,
  });


  // =========================================================
  // LẤY DANH SÁCH PHƯƠNG TIỆN TỪ BACKEND
  // =========================================================

  const layDanhSachPhuongTien = async () => {
    try {
      setLoading(true);
      setLoi("");

      const data = await apiFetch("/PhuongTien");

      // Backend có thể trả về mảng trực tiếp
      // hoặc { data: [...] }
      const danhSach = Array.isArray(data)
        ? data
        : data.data ?? [];

      setDanhSachXe(danhSach);

    } catch (error) {
      console.error(
        "Lỗi lấy danh sách phương tiện:",
        error
      );

      setDanhSachXe([]);

      setLoi(
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
  // MỞ FORM THÊM
  // =========================================================

  const themPhuongTien = () => {
    setDangSua(false);

    setIdDangSua(null);

    setFormData({
      bienSo: "",
      loaiXe: "Xe máy",
      hangXe: "",
      trangThai: "Đang hoạt động",
      anh: null,
      anhPreview: null,
    });

    setHienForm(true);
  };


  // =========================================================
  // MỞ FORM SỬA
  // =========================================================

  const suaPhuongTien = (xe) => {
    const id =
      xe.id ??
      xe.ID ??
      xe.phuongTienId ??
      xe.PhuongTienID;

    const bienSo =
      xe.bienSo ??
      xe.BienSo ??
      "";

    const loaiXe =
      xe.loaiXe ??
      xe.LoaiXe ??
      "";

    const hangXe =
      xe.hangXe ??
      xe.HangXe ??
      "";

    const trangThai =
      xe.trangThai ??
      xe.TrangThai ??
      "Đang hoạt động";

    const anh =
      xe.anh ??
      xe.Anh ??
      xe.hinhAnh ??
      xe.HinhAnh ??
      null;

    setDangSua(true);

    setIdDangSua(id);

    setFormData({
      bienSo,
      loaiXe,
      hangXe,
      trangThai,
      anh,
      anhPreview: anh,
    });

    setHienForm(true);
  };


  // =========================================================
  // ĐÓNG FORM
  // =========================================================

  const dongForm = () => {
    setHienForm(false);

    setDangSua(false);

    setIdDangSua(null);

    setFormData({
      bienSo: "",
      loaiXe: "Xe máy",
      hangXe: "",
      trangThai: "Đang hoạt động",
      anh: null,
      anhPreview: null,
    });
  };


  // =========================================================
  // NHẬP FORM
  // =========================================================

  const thayDoiThongTin = (e) => {
    const { name, value } = e.target;

    setFormData((cu) => ({
      ...cu,
      [name]: value,
    }));
  };


  // =========================================================
  // CHỌN ẢNH
  // =========================================================

  const chonAnh = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Kiểm tra file ảnh
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh.");

      return;
    }

    // Giới hạn 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh không được lớn hơn 5MB.");

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setFormData((cu) => ({
        ...cu,

        // File thật để gửi backend
        anh: file,

        // Ảnh xem trước
        anhPreview: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };


  // =========================================================
  // XÓA ẢNH ĐANG CHỌN
  // =========================================================

  const xoaAnh = () => {
    setFormData((cu) => ({
      ...cu,

      anh: null,

      anhPreview: null,
    }));
  };


  // =========================================================
  // LƯU THÊM / SỬA
  // =========================================================

  const luuPhuongTien = async (e) => {
    e.preventDefault();

    // =========================
    // KIỂM TRA
    // =========================

    if (!formData.bienSo.trim()) {
      alert("Vui lòng nhập biển số xe.");

      return;
    }

    if (!formData.loaiXe.trim()) {
      alert("Vui lòng chọn loại xe.");

      return;
    }

    if (!formData.hangXe.trim()) {
      alert("Vui lòng nhập hãng xe.");

      return;
    }


    try {
      // =====================================================
      // DÙNG FORMDATA ĐỂ CÓ THỂ GỬI ẢNH
      // =====================================================

      const dataGui = new FormData();

      dataGui.append(
        "BienSo",
        formData.bienSo.trim()
      );

      dataGui.append(
        "LoaiXe",
        formData.loaiXe
      );

      dataGui.append(
        "HangXe",
        formData.hangXe.trim()
      );

      dataGui.append(
        "TrangThai",
        formData.trangThai
      );


      // Nếu người dùng chọn ảnh mới
      if (formData.anh instanceof File) {
        dataGui.append(
          "HinhAnh",
          formData.anh
        );
      }


      // =====================================================
      // THÊM
      // =====================================================

      if (!dangSua) {
        const response = await fetch(
          "/api/phuongtien",
          {
            method: "POST",
            body: dataGui,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Thêm thất bại: ${response.status}`
          );
        }

        alert(
          "Thêm phương tiện thành công."
        );
      }


      // =====================================================
      // SỬA
      // =====================================================

      else {
        const response = await fetch(
          `/api/phuongtien/${idDangSua}`,
          {
            method: "PUT",
            body: dataGui,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Cập nhật thất bại: ${response.status}`
          );
        }

        alert(
          "Cập nhật phương tiện thành công."
        );
      }


      // =====================================================
      // TẢI LẠI DỮ LIỆU TỪ DATABASE
      // =====================================================

      await layDanhSachPhuongTien();

      dongForm();

    } catch (error) {
      console.error(
        "Lỗi lưu phương tiện:",
        error
      );

      alert(
        "Không thể lưu phương tiện. Vui lòng kiểm tra backend."
      );
    }
  };


  // =========================================================
  // XÓA PHƯƠNG TIỆN
  // =========================================================

  const xoaPhuongTien = async (xe) => {
    const id =
      xe.id ??
      xe.ID ??
      xe.phuongTienId ??
      xe.PhuongTienID;

    const bienSo =
      xe.bienSo ??
      xe.BienSo ??
      "phương tiện này";

    const xacNhan = window.confirm(
      `Bạn có chắc muốn xóa ${bienSo} không?`
    );

    if (!xacNhan) {
      return;
    }


    try {
      const response = await fetch(
        `/api/phuongtien/${id}`,
        {
          method: "DELETE",
        }
      );


      if (!response.ok) {
        throw new Error(
          `Xóa thất bại: ${response.status}`
        );
      }


      alert(
        "Xóa phương tiện thành công."
      );


      // Lấy lại dữ liệu thật từ database
      await layDanhSachPhuongTien();

    } catch (error) {
      console.error(
        "Lỗi xóa phương tiện:",
        error
      );

      alert(
        "Không thể xóa phương tiện."
      );
    }
  };


  // =========================================================
  // LẤY GIÁ TRỊ FIELD
  // =========================================================

  const layId = (xe) => {
    return (
      xe.id ??
      xe.ID ??
      xe.phuongTienId ??
      xe.PhuongTienID
    );
  };


  const layBienSo = (xe) => {
    return (
      xe.bienSo ??
      xe.BienSo ??
      "Chưa có biển số"
    );
  };


  const layLoaiXe = (xe) => {
    return (
      xe.loaiXe ??
      xe.LoaiXe ??
      "Chưa xác định"
    );
  };


  const layHangXe = (xe) => {
    return (
      xe.hangXe ??
      xe.HangXe ??
      ""
    );
  };


  const layTrangThai = (xe) => {
    return (
      xe.trangThai ??
      xe.TrangThai ??
      "Đang hoạt động"
    );
  };


  const layNguoiDangKy = (xe) => {
    return (
      xe.nguoiDangKy ??
      xe.NguoiDangKy ??
      "Cư dân"
    );
  };


  const layNgayThem = (xe) => {
    return (
      xe.ngayThem ??
      xe.NgayThem ??
      xe.ngayDangKy ??
      xe.NgayDangKy ??
      "Chưa có"
    );
  };


  const layAnh = (xe) => {
    return (
      xe.anh ??
      xe.Anh ??
      xe.hinhAnh ??
      xe.HinhAnh ??
      null
    );
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

          </div>

        </div>

        <div className="khong-co-phuong-tien">

          <p>
            Đang tải danh sách phương tiện...
          </p>

        </div>

      </div>
    );
  }


  // =========================================================
  // GIAO DIỆN
  // =========================================================

  return (
    <div className="phuong-tien-container">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="phuong-tien-header">

        <div className="phuong-tien-title">

          <h1>
            Phương tiện của tôi
          </h1>


        </div>


        <button
          className="btn-them-phuong-tien"
          onClick={themPhuongTien}
        >

          <span>
            +
          </span>

          Thêm tiện ích

        </button>

      </div>


      {/* =====================================================
          LỖI
      ===================================================== */}

      {loi && (

        <div className="thong-bao-loi">

          {loi}

          <button
            onClick={layDanhSachPhuongTien}
          >
            Thử lại
          </button>

        </div>

      )}


      {/* =====================================================
          DANH SÁCH PHƯƠNG TIỆN
      ===================================================== */}

      <div className="danh-sach-phuong-tien">

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
              className="btn-them-phuong-tien"
              onClick={themPhuongTien}
            >

              <span>
                +
              </span>

              Thêm phương tiện

            </button>

          </div>

        ) : (

          danhSachXe.map((xe) => {

            const id = layId(xe);

            const bienSo = layBienSo(xe);

            const loaiXe = layLoaiXe(xe);

            const hangXe = layHangXe(xe);

            const trangThai = layTrangThai(xe);

            const nguoiDangKy =
              layNguoiDangKy(xe);

            const ngayThem =
              layNgayThem(xe);

            const anh = layAnh(xe);


            return (

              <div
                className="phuong-tien-card"
                key={id}
              >

                {/* =========================
                    ẢNH XE
                ========================= */}

                <div className="phuong-tien-icon">

                  {anh ? (

                    <img
                      src={anh}
                      alt="Phương tiện"
                    />

                  ) : (

                    <span>

                      {loaiXe
                        .toLowerCase()
                        .includes("máy")
                        ? "🏍️"
                        : "🚘"}

                    </span>

                  )}

                </div>


                {/* =========================
                    THÔNG TIN
                ========================= */}

                <div className="phuong-tien-info">

                  <div className="dong-dau">

                    <h2>
                      {bienSo}
                    </h2>

                    <span className="trang-thai">
                      {trangThai}
                    </span>

                  </div>


                  <p className="loai-xe">

                    {loaiXe}

                    {hangXe && (
                      <>
                        <span className="dau-cham">
                          •
                        </span>

                        {hangXe}
                      </>
                    )}

                  </p>


                  <p className="thong-tin-dang-ky">

                    Đăng ký bởi:

                    <strong>
                      {" "}
                      {nguoiDangKy}
                    </strong>

                  </p>


                  <p className="thong-tin-dang-ky">

                    Ngày thêm:

                    {" "}

                    {ngayThem}

                  </p>

                </div>


                {/* =========================
                    CHỨC NĂNG
                ========================= */}

                <div className="phuong-tien-actions">

                  <button
                    className="btn-sua"
                    onClick={() =>
                      suaPhuongTien(xe)
                    }
                  >

                    <span>
                      ✎
                    </span>

                    Sửa

                  </button>


                  <button
                    className="btn-xoa"
                    onClick={() =>
                      xoaPhuongTien(xe)
                    }
                  >

                    <span>
                      ×
                    </span>

                    Xóa

                  </button>

                </div>

              </div>

            );
          })

        )}

      </div>


      {/* =====================================================
          FORM THÊM / SỬA
      ===================================================== */}

      {hienForm && (

        <div
          className="lop-phu"
          onClick={dongForm}
        >

          <div
            className="form-phuong-tien"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* =========================
                HEADER FORM
            ========================= */}

            <div className="form-header">

              <div>

                <h2>

                  {dangSua
                    ? "Sửa phương tiện"
                    : "Thêm phương tiện"}

                </h2>

                <p>
                  Nhập thông tin phương tiện
                </p>

              </div>


              <button
                type="button"
                className="btn-dong-form"
                onClick={dongForm}
              >
                ×
              </button>

            </div>


            {/* =========================
                FORM
            ========================= */}

            <form
              onSubmit={luuPhuongTien}
            >

              {/* BIỂN SỐ */}

              <div className="form-group">

                <label>
                  Biển số xe
                </label>

                <input
                  type="text"
                  name="bienSo"
                  value={formData.bienSo}
                  onChange={thayDoiThongTin}
                  placeholder="Ví dụ: 30A-123.45"
                  required
                />

              </div>


              {/* LOẠI XE */}

              <div className="form-group">

                <label>
                  Loại phương tiện
                </label>

                <select
                  name="loaiXe"
                  value={formData.loaiXe}
                  onChange={thayDoiThongTin}
                >

                  <option value="Xe máy">
                    Xe máy
                  </option>

                  <option value="Ô tô">
                    Ô tô
                  </option>

                </select>

              </div>


              {/* HÃNG XE */}

              <div className="form-group">

                <label>
                  Hãng xe
                </label>

                <input
                  type="text"
                  name="hangXe"
                  value={formData.hangXe}
                  onChange={thayDoiThongTin}
                  placeholder="Ví dụ: Honda Wave"
                  required
                />

              </div>


              {/* TRẠNG THÁI */}

              <div className="form-group">

                <label>
                  Trạng thái
                </label>

                <select
                  name="trangThai"
                  value={formData.trangThai}
                  onChange={thayDoiThongTin}
                >

                  <option value="Đang hoạt động">
                    Đang hoạt động
                  </option>

                  <option value="Tạm ngưng">
                    Tạm ngưng
                  </option>

                </select>

              </div>


              {/* =========================
                  ẢNH
              ========================= */}

              <div className="form-group">

                <label>
                  Ảnh phương tiện
                </label>


                {formData.anhPreview ? (

                  <div className="anh-preview">

                    <img
                      src={formData.anhPreview}
                      alt="Xem trước phương tiện"
                    />

                    <button
                      type="button"
                      className="btn-xoa-anh"
                      onClick={xoaAnh}
                    >
                      ×
                    </button>

                  </div>

                ) : (

                  <label className="upload-label">

                    <div className="upload-icon">
                      📷
                    </div>

                    <span>
                      Chọn ảnh phương tiện
                    </span>

                    <small>
                      PNG, JPG, JPEG - tối đa 5MB
                    </small>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={chonAnh}
                    />

                  </label>

                )}

              </div>


              {/* =========================
                  BUTTON
              ========================= */}

              <div className="form-actions">

                <button
                  type="button"
                  className="btn-huy"
                  onClick={dongForm}
                >
                  Hủy
                </button>


                <button
                  type="submit"
                  className="btn-luu"
                >

                  {dangSua
                    ? "Lưu thay đổi"
                    : "Thêm phương tiện"}

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