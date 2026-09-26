import React, { useEffect, useMemo, useState } from "react";
import "./QLyCanHo.css";

// =====================================================
// API
// =====================================================

const API_CAN_HO = "http://localhost:5022/api/CanHo";
const API_USER = "http://localhost:5022/api/User/cu-dan";

// =====================================================
// COMPONENT
// =====================================================

function QLyCanHo() {
  // =====================================================
  // STATE
  // =====================================================

  const [danhSachCanHo, setDanhSachCanHo] = useState([]);
  const [danhSachUser, setDanhSachUser] = useState([]);

  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);

  const [tuKhoa, setTuKhoa] = useState("");
  const [trangThaiLoc, setTrangThaiLoc] =
    useState("Tất cả");

  const [hienModal, setHienModal] = useState(false);
  const [dangSua, setDangSua] = useState(null);

  const [form, setForm] = useState({
    maCanHo: "",
    toa: "",
    tang: "",
    soPhong: "",
    userId: "",
    trangThai: "Trống",
  });

  // =====================================================
  // TOKEN
  // =====================================================

  const layToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // HEADER
  // =====================================================

  const headersJson = () => {
    const token = layToken();

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  // =====================================================
  // CHUẨN HÓA CĂN HỘ
  // =====================================================

  const chuanHoaCanHo = (item) => {
    return {
      canHoId:
        item.canHoId ??
        item.CanHoId,

      maCanHo:
        item.maCanHo ??
        item.MaCanHo ??
        "",

      toa:
        item.toa ??
        item.Toa ??
        "",

      tang:
        item.tang ??
        item.Tang ??
        0,

      soPhong:
        item.soPhong ??
        item.SoPhong ??
        0,

      trangThai:
        item.trangThai ??
        item.TrangThai ??
        "Trống",

      userId:
        item.userId ??
        item.UserId ??
        null,

      chuHo:
        item.chuHo ??
        item.ChuHo ??
        item.user?.hoTen ??
        item.user?.HoTen ??
        item.User?.hoTen ??
        item.User?.HoTen ??
        "",
    };
  };

  // =====================================================
  // CHUẨN HÓA USER
  // =====================================================

  const chuanHoaUser = (item) => {
    return {
      userId:
        item.userId ??
        item.UserId,

      hoTen:
        item.hoTen ??
        item.HoTen ??
        "",

      tenDangNhap:
        item.tenDangNhap ??
        item.TenDangNhap ??
        "",
    };
  };

  // =====================================================
  // LẤY DANH SÁCH CĂN HỘ
  // =====================================================

  const layDanhSachCanHo = async () => {
    try {
      setDangTai(true);

      const response = await fetch(
        API_CAN_HO,
        {
          method: "GET",
          headers: headersJson(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Lỗi HTTP: ${response.status}`
        );
      }

      const data = await response.json();

      // API có thể trả:
      // []
      // hoặc { data: [] }

      const danhSach = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      const danhSachChuanHoa =
        danhSach.map(chuanHoaCanHo);

      setDanhSachCanHo(
        danhSachChuanHoa
      );
    } catch (error) {
      console.error(
        "Lỗi lấy danh sách căn hộ:",
        error
      );

      alert(
        "Không thể tải danh sách căn hộ. Kiểm tra backend/API."
      );
    } finally {
      setDangTai(false);
    }
  };

  // =====================================================
  // LẤY DANH SÁCH USER
  // =====================================================

  const layDanhSachUser = async () => {
    try {
      const response = await fetch(
        API_USER,
        {
          method: "GET",
          headers: headersJson(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Lỗi HTTP: ${response.status}`
        );
      }

      const data =
        await response.json();

      const danhSach = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setDanhSachUser(
        danhSach.map(chuanHoaUser)
      );
    } catch (error) {
      console.error(
        "Lỗi lấy danh sách user:",
        error
      );

      // Không chặn trang căn hộ
      setDanhSachUser([]);
    }
  };

  // =====================================================
  // LOAD KHI MỞ TRANG
  // =====================================================

  useEffect(() => {
    layDanhSachCanHo();
    layDanhSachUser();
  }, []);

  // =====================================================
  // LỌC
  // =====================================================

  const danhSachHienThi = useMemo(() => {
    const tuKhoaLower =
      tuKhoa
        .toLowerCase()
        .trim();

    return danhSachCanHo.filter(
      (canHo) => {
        const maCanHo =
          String(
            canHo.maCanHo || ""
          ).toLowerCase();

        const chuHo =
          String(
            canHo.chuHo || ""
          ).toLowerCase();

        const phuHopTuKhoa =
          !tuKhoaLower ||
          maCanHo.includes(
            tuKhoaLower
          ) ||
          chuHo.includes(
            tuKhoaLower
          );

        const phuHopTrangThai =
          trangThaiLoc ===
            "Tất cả" ||
          canHo.trangThai ===
            trangThaiLoc;

        return (
          phuHopTuKhoa &&
          phuHopTrangThai
        );
      }
    );
  }, [
    danhSachCanHo,
    tuKhoa,
    trangThaiLoc,
  ]);

  // =====================================================
  // THỐNG KÊ
  // =====================================================

  const tongCanHo =
    danhSachCanHo.length;

  const canHoDangSuDung =
    danhSachCanHo.filter(
      (item) =>
        item.trangThai ===
        "Đang sử dụng"
    ).length;

  const canHoTrong =
    danhSachCanHo.filter(
      (item) =>
        item.trangThai ===
        "Trống"
    ).length;

  const tongCoChuHo =
    danhSachCanHo.filter(
      (item) =>
        item.userId != null
    ).length;

  // =====================================================
  // FORM THÊM
  // =====================================================

  const moThemCanHo = () => {
    setDangSua(null);

    setForm({
      maCanHo: "",
      toa: "",
      tang: "",
      soPhong: "",
      userId: "",
      trangThai: "Trống",
    });

    setHienModal(true);
  };

  // =====================================================
  // FORM SỬA
  // =====================================================

  const moSuaCanHo = (canHo) => {
    setDangSua(canHo);

    setForm({
      maCanHo:
        canHo.maCanHo || "",

      toa:
        canHo.toa || "",

      tang:
        canHo.tang ?? "",

      soPhong:
        canHo.soPhong ?? "",

      userId:
        canHo.userId != null
          ? String(canHo.userId)
          : "",

      trangThai:
        canHo.trangThai ||
        "Trống",
    });

    setHienModal(true);
  };

  // =====================================================
  // ĐÓNG MODAL
  // =====================================================

  const dongModal = () => {
    if (dangLuu) return;

    setHienModal(false);
    setDangSua(null);
  };

  // =====================================================
  // THAY ĐỔI FORM
  // =====================================================

  const thayDoiForm = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const xuLySubmit = async (e) => {
    e.preventDefault();

    // -------------------------------------------------
    // VALIDATE
    // -------------------------------------------------

    if (!form.maCanHo.trim()) {
      alert(
        "Vui lòng nhập mã căn hộ."
      );
      return;
    }

    if (!form.toa.trim()) {
      alert(
        "Vui lòng nhập tòa."
      );
      return;
    }

    if (
      form.tang === "" ||
      form.tang === null
    ) {
      alert(
        "Vui lòng nhập tầng."
      );
      return;
    }

    if (
      form.soPhong === "" ||
      form.soPhong === null
    ) {
      alert(
        "Vui lòng nhập số phòng."
      );
      return;
    }

    // -------------------------------------------------
    // DATA GỬI API
    // -------------------------------------------------

    const duLieuGui = {
      maCanHo:
        form.maCanHo.trim(),

      toa:
        form.toa.trim(),

      tang:
        Number(form.tang),

      soPhong:
        Number(form.soPhong),

      trangThai:
        form.trangThai,

      userId:
        form.userId === ""
          ? null
          : Number(form.userId),
    };

    console.log(
      "Dữ liệu gửi API:",
      duLieuGui
    );

    try {
      setDangLuu(true);

      let response;

      // =================================================
      // UPDATE
      // =================================================

      if (dangSua) {
        response =
          await fetch(
            `${API_CAN_HO}/${dangSua.canHoId}`,
            {
              method: "PUT",
              headers:
                headersJson(),
              body:
                JSON.stringify(
                  duLieuGui
                ),
            }
          );
      }

      // =================================================
      // CREATE
      // =================================================

      else {
        response =
          await fetch(
            API_CAN_HO,
            {
              method: "POST",
              headers:
                headersJson(),
              body:
                JSON.stringify(
                  duLieuGui
                ),
            }
          );
      }

      // =================================================
      // ĐỌC RESPONSE
      // =================================================

      let data = null;

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        contentType &&
        contentType.includes(
          "application/json"
        )
      ) {
        data =
          await response.json();
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.title ||
            `Lỗi HTTP: ${response.status}`
        );
      }

      // =================================================
      // THÔNG BÁO
      // =================================================

      alert(
        dangSua
          ? "Cập nhật căn hộ thành công."
          : "Thêm căn hộ thành công."
      );

      // =================================================
      // ĐÓNG MODAL
      // =================================================

      setHienModal(false);
      setDangSua(null);

      // =================================================
      // LOAD LẠI DATABASE
      // =================================================

      await layDanhSachCanHo();
    } catch (error) {
      console.error(
        "Lỗi lưu căn hộ:",
        error
      );

      alert(
        error.message ||
          "Không thể lưu căn hộ."
      );
    } finally {
      setDangLuu(false);
    }
  };

  // =====================================================
  // XÓA
  // =====================================================

  const xoaCanHo = async (canHo) => {
    if (!canHo) return;

    const xacNhan =
      window.confirm(
        `Bạn có chắc muốn xóa căn hộ ${canHo.maCanHo}?`
      );

    if (!xacNhan) return;

    try {
      const response =
        await fetch(
          `${API_CAN_HO}/${canHo.canHoId}`,
          {
            method: "DELETE",
            headers:
              headersJson(),
          }
        );

      let data = null;

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        contentType &&
        contentType.includes(
          "application/json"
        )
      ) {
        data =
          await response.json();
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.title ||
            `Lỗi HTTP: ${response.status}`
        );
      }

      alert(
        "Xóa căn hộ thành công."
      );

      await layDanhSachCanHo();
    } catch (error) {
      console.error(
        "Lỗi xóa căn hộ:",
        error
      );

      alert(
        error.message ||
          "Không thể xóa căn hộ."
      );
    }
  };

  // =====================================================
  // TÌM USER
  // =====================================================

  const layTenUser = (userId) => {
    if (
      userId === null ||
      userId === undefined
    ) {
      return "";
    }

    const user =
      danhSachUser.find(
        (item) =>
          String(item.userId) ===
          String(userId)
      );

    if (!user) {
      return "";
    }

    return (
      user.hoTen ||
      user.tenDangNhap ||
      ""
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="quan-ly-can-ho">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="can-ho-header">

        <div>
          <h1>
            Quản lý căn hộ
          </h1>

          <p>
            Quản lý thông tin các căn hộ
            trong chung cư
          </p>
        </div>

        <button
          className="btn-them-can-ho"
          onClick={
            moThemCanHo
          }
        >
          + Thêm căn hộ
        </button>

      </div>

      {/* =================================================
          THỐNG KÊ
      ================================================= */}

      <div className="can-ho-thong-ke">

        <div className="can-ho-card">

          <div className="can-ho-card-icon">
            🏢
          </div>

          <div>
            <span>
              Tổng căn hộ
            </span>

            <strong>
              {tongCanHo}
            </strong>
          </div>

        </div>

        <div className="can-ho-card">

          <div className="can-ho-card-icon">
            👨‍👩‍👧
          </div>

          <div>
            <span>
              Đang sử dụng
            </span>

            <strong>
              {canHoDangSuDung}
            </strong>
          </div>

        </div>

        <div className="can-ho-card">

          <div className="can-ho-card-icon">
            🔑
          </div>

          <div>
            <span>
              Căn hộ trống
            </span>

            <strong>
              {canHoTrong}
            </strong>
          </div>

        </div>

        <div className="can-ho-card">

          <div className="can-ho-card-icon">
            👥
          </div>

          <div>
            <span>
              Có chủ hộ
            </span>

            <strong>
              {tongCoChuHo}
            </strong>
          </div>

        </div>

      </div>

      {/* =================================================
          BỘ LỌC
      ================================================= */}

      <div className="can-ho-bo-loc">

        <div className="can-ho-search">

          <span>🔍</span>

          <input
            type="text"
            placeholder="Tìm mã căn hộ, chủ hộ..."
            value={tuKhoa}
            onChange={(e) =>
              setTuKhoa(
                e.target.value
              )
            }
          />

        </div>

        <select
          value={trangThaiLoc}
          onChange={(e) =>
            setTrangThaiLoc(
              e.target.value
            )
          }
        >

          <option value="Tất cả">
            Tất cả trạng thái
          </option>

          <option value="Đang sử dụng">
            Đang sử dụng
          </option>

          <option value="Trống">
            Trống
          </option>

        </select>

      </div>

      {/* =================================================
          BẢNG
      ================================================= */}

      <div className="can-ho-table-wrapper">

        <table className="can-ho-table">

          <thead>

            <tr>

              <th>STT</th>

              <th>
                Mã căn hộ
              </th>

              <th>
                Tòa
              </th>

              <th>
                Tầng
              </th>

              <th>
                Số phòng
              </th>

              <th>
                Chủ hộ
              </th>

              <th>
                Trạng thái
              </th>

              <th>
                Thao tác
              </th>

            </tr>

          </thead>

          <tbody>

            {dangTai ? (

              <tr>

                <td
                  colSpan="8"
                  className="can-ho-empty"
                >
                  Đang tải dữ liệu...
                </td>

              </tr>

            ) : danhSachHienThi.length ===
              0 ? (

              <tr>

                <td
                  colSpan="8"
                  className="can-ho-empty"
                >
                  Không tìm thấy căn hộ phù hợp
                </td>

              </tr>

            ) : (

              danhSachHienThi.map(
                (canHo, index) => {

                  const tenChuHo =
                    canHo.chuHo ||
                    layTenUser(
                      canHo.userId
                    );

                  return (
                    <tr
                      key={
                        canHo.canHoId
                      }
                    >

                      {/* STT */}

                      <td>
                        {index + 1}
                      </td>

                      {/* MÃ */}

                      <td>

                        <strong className="ma-can-ho">
                          {
                            canHo.maCanHo
                          }
                        </strong>

                      </td>

                      {/* TÒA */}

                      <td>
                        Tòa{" "}
                        {
                          canHo.toa
                        }
                      </td>

                      {/* TẦNG */}

                      <td>
                        {
                          canHo.tang
                        }
                      </td>

                      {/* SỐ PHÒNG */}

                      <td>
                        {
                          canHo.soPhong
                        }
                      </td>

                      {/* CHỦ HỘ */}

                      <td>

                        {tenChuHo ? (

                          tenChuHo

                        ) : (

                          <span className="chua-co-chu">
                            Chưa có chủ hộ
                          </span>

                        )}

                      </td>

                      {/* TRẠNG THÁI */}

                      <td>

                        <span
                          className={
                            canHo.trangThai ===
                            "Đang sử dụng"
                              ? "badge-dang-su-dung"
                              : "badge-trong"
                          }
                        >
                          {
                            canHo.trangThai
                          }
                        </span>

                      </td>

                      {/* THAO TÁC */}

                      <td>

                        <div className="can-ho-actions">

                          <button
                            type="button"
                            className="btn-sua"
                            onClick={() =>
                              moSuaCanHo(
                                canHo
                              )
                            }
                            title="Sửa căn hộ"
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            className="btn-xoa"
                            onClick={() =>
                              xoaCanHo(
                                canHo
                              )
                            }
                            title="Xóa căn hộ"
                          >
                            🗑️
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                }
              )

            )}

          </tbody>

        </table>

      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {hienModal && (

        <div
          className="can-ho-modal-overlay"
          onClick={
            dongModal
          }
        >

          <div
            className="can-ho-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="can-ho-modal-header">

              <div>

                <h2>

                  {dangSua
                    ? "Cập nhật căn hộ"
                    : "Thêm căn hộ"}

                </h2>

                <p>
                  Nhập thông tin căn hộ
                </p>

              </div>

              <button
                type="button"
                className="btn-dong-modal"
                onClick={
                  dongModal
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
                xuLySubmit
              }
            >

              <div className="form-grid">

                {/* MÃ CĂN HỘ */}

                <div className="form-group">

                  <label>
                    Mã căn hộ *
                  </label>

                  <input
                    type="text"
                    value={
                      form.maCanHo
                    }
                    onChange={(e) =>
                      thayDoiForm(
                        "maCanHo",
                        e.target.value
                      )
                    }
                    placeholder="VD: A101"
                    disabled={
                      dangLuu
                    }
                  />

                </div>

                {/* TÒA */}

                <div className="form-group">

                  <label>
                    Tòa *
                  </label>

                  <input
                    type="text"
                    value={
                      form.toa
                    }
                    onChange={(e) =>
                      thayDoiForm(
                        "toa",
                        e.target.value
                      )
                    }
                    placeholder="VD: A"
                    disabled={
                      dangLuu
                    }
                  />

                </div>

                {/* TẦNG */}

                <div className="form-group">

                  <label>
                    Tầng *
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.tang
                    }
                    onChange={(e) =>
                      thayDoiForm(
                        "tang",
                        e.target.value
                      )
                    }
                    disabled={
                      dangLuu
                    }
                  />

                </div>

                {/* SỐ PHÒNG */}

                <div className="form-group">

                  <label>
                    Số phòng *
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      form.soPhong
                    }
                    onChange={(e) =>
                      thayDoiForm(
                        "soPhong",
                        e.target.value
                      )
                    }
                    disabled={
                      dangLuu
                    }
                  />

                </div>

                {/* CHỦ HỘ */}

                <div className="form-group form-full">

                  <label>
                    Chủ hộ
                  </label>

                  <select
                    value={
                      form.userId
                    }
                    onChange={(e) =>
                      thayDoiForm(
                        "userId",
                        e.target.value
                      )
                    }
                    disabled={
                      dangLuu
                    }
                  >

                    <option value="">
                      -- Chưa có chủ hộ --
                    </option>

                    {danhSachUser.map(
                      (user) => (

                        <option
                          key={
                            user.userId
                          }
                          value={
                            user.userId
                          }
                        >
                          {user.hoTen ||
                            user.tenDangNhap ||
                            `User ${user.userId}`}
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* TRẠNG THÁI */}

                <div className="form-group">

                  <label>
                    Trạng thái
                  </label>

                  <select
                    value={
                      form.trangThai
                    }
                    onChange={(e) =>
                      thayDoiForm(
                        "trangThai",
                        e.target.value
                      )
                    }
                    disabled={
                      dangLuu
                    }
                  >

                    <option value="Trống">
                      Trống
                    </option>

                    <option value="Đang sử dụng">
                      Đang sử dụng
                    </option>

                  </select>

                </div>

              </div>

              {/* FOOTER */}

              <div className="can-ho-modal-footer">

                <button
                  type="button"
                  className="btn-huy"
                  onClick={
                    dongModal
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
                    : "Thêm căn hộ"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default QLyCanHo;