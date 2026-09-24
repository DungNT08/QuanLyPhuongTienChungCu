
import React, { useEffect, useState } from "react";
import "./LuotGui.css";

/*
=========================================================
BACKEND API
=========================================================

Backend:
http://localhost:5022

Các API:

GET
/api/Parking/active

POST
/api/Parking/check-in

POST
/api/Parking/check-out

JWT:
localStorage.getItem("token")

Request phải gửi:

Authorization: Bearer <token>
=========================================================
*/

const API_BASE = "http://localhost:5022";


function LuotGui() {
  const [modalMo, setModalMo] = useState(false);

  const [bienSo, setBienSo] = useState("");
  const [xeDangGui, setXeDangGui] = useState([]);
  const [tuKhoa, setTuKhoa] = useState("");

  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);

  const [loi, setLoi] = useState("");
  const [thongBao, setThongBao] = useState("");


  /* =========================================================
     LẤY JWT TOKEN
  ========================================================= */

  const layToken = () => {
    return localStorage.getItem("token") || "";
  };


  /* =========================================================
     TẠO HEADERS CHO API
  ========================================================= */

  const taoHeaders = (coBody = false) => {
    const token = layToken();

    const headers = {
      Accept: "application/json",
    };

    if (coBody) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  };


  /* =========================================================
     XỬ LÝ 401
  ========================================================= */

  const xuLyUnauthorized = () => {
    localStorage.removeItem("token");

    /*
      Không xóa user ngay để tránh làm mất thông tin
      nếu người dùng cần kiểm tra.
    */

    return new Error(
      "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
    );
  };


  /* =========================================================
     ĐỌC RESPONSE AN TOÀN
  ========================================================= */

  const docJsonAnToan = async (response) => {
    const contentType =
      response.headers.get("content-type") || "";

    const text = await response.text();

    if (!text) {
      return null;
    }

    if (
      !contentType
        .toLowerCase()
        .includes("application/json")
    ) {
      console.error(
        "API không trả JSON:",
        text.substring(0, 500)
      );

      return null;
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      console.error(
        "Không parse được JSON:",
        text.substring(0, 500)
      );

      return null;
    }
  };


  /* =========================================================
     LẤY MESSAGE TỪ API
  ========================================================= */

  const layMessage = (
    data,
    messageMacDinh
  ) => {
    if (!data) {
      return messageMacDinh;
    }

    if (typeof data === "string") {
      return data;
    }

    return (
      data.message ??
      data.Message ??
      data.error ??
      data.Error ??
      data.title ??
      data.Title ??
      messageMacDinh
    );
  };


  /* =========================================================
     LẤY DANH SÁCH TỪ API
  ========================================================= */

  const layDanhSach = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.Data)) {
      return data.Data;
    }

    if (Array.isArray(data?.items)) {
      return data.items;
    }

    if (Array.isArray(data?.Items)) {
      return data.Items;
    }

    if (Array.isArray(data?.result)) {
      return data.result;
    }

    if (Array.isArray(data?.Result)) {
      return data.Result;
    }

    return [];
  };


  /* =========================================================
     LOAD XE ĐANG GỬI

     GET /api/Parking/active
  ========================================================= */

  const taiXeDangGui = async () => {
    try {
      setDangTai(true);
      setLoi("");

      const token = layToken();

      if (!token) {
        throw new Error(
          "Bạn chưa đăng nhập. Vui lòng đăng nhập lại."
        );
      }


      const url =
        `${API_BASE}/api/Parking/active`;


      console.log(
        "GET:",
        url
      );


      const response = await fetch(
        url,
        {
          method: "GET",

          headers: taoHeaders(),
        }
      );


      const data =
        await docJsonAnToan(response);


      console.log(
        "GET /api/Parking/active:",
        response.status,
        data
      );


      if (response.status === 401) {
        throw xuLyUnauthorized();
      }


      if (!response.ok) {
        throw new Error(
          layMessage(
            data,
            `Không thể tải danh sách xe đang gửi. HTTP ${response.status}`
          )
        );
      }


      const danhSach =
        layDanhSach(data);


      setXeDangGui(
        danhSach
      );


    } catch (error) {
      console.error(
        "Lỗi tải xe đang gửi:",
        error
      );


      setLoi(
        error.message ||
        "Không thể tải danh sách xe đang gửi."
      );


      setXeDangGui([]);


    } finally {
      setDangTai(false);
    }
  };


  /* =========================================================
     LOAD LẦN ĐẦU
  ========================================================= */

  useEffect(() => {
    taiXeDangGui();
  }, []);


  /* =========================================================
     MỞ MODAL
  ========================================================= */

  const moModalGhiNhan = () => {
    setBienSo("");
    setLoi("");
    setThongBao("");

    setModalMo(true);
  };


  /* =========================================================
     ĐÓNG MODAL
  ========================================================= */

  const dongModal = () => {
    if (dangLuu) {
      return;
    }

    setModalMo(false);

    setBienSo("");
    setLoi("");
    setThongBao("");
  };


  /* =========================================================
     CHUẨN HÓA BIỂN SỐ
  ========================================================= */

  const chuanHoaBienSo = (value) => {
    return value
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
  };


  /* =========================================================
     GHI NHẬN XE VÀO

     POST /api/Parking/check-in

     Body:

     {
       "bienSo": "51B12345"
     }
  ========================================================= */

  const ghiNhanXeVao = async (e) => {
    e.preventDefault();


    const bienSoChuanHoa =
      chuanHoaBienSo(bienSo);


    if (!bienSoChuanHoa) {
      setLoi(
        "Vui lòng nhập biển số xe."
      );

      return;
    }


    try {
      setDangLuu(true);

      setLoi("");
      setThongBao("");


      const token =
        layToken();


      if (!token) {
        throw new Error(
          "Bạn chưa đăng nhập. Vui lòng đăng nhập lại."
        );
      }


      const url =
        `${API_BASE}/api/Parking/check-in`;


      console.log(
        "POST:",
        url,
        {
          bienSo: bienSoChuanHoa,
        }
      );


      const response =
        await fetch(
          url,
          {
            method: "POST",

            headers:
              taoHeaders(true),

            body:
              JSON.stringify({
                bienSo:
                  bienSoChuanHoa,
              }),
          }
        );


      const data =
        await docJsonAnToan(
          response
        );


      console.log(
        "POST /api/Parking/check-in:",
        response.status,
        data
      );


      /* ===============================
         401
      =============================== */

      if (
        response.status === 401
      ) {
        throw xuLyUnauthorized();
      }


      /* ===============================
         ERROR
      =============================== */

      if (!response.ok) {
        throw new Error(
          layMessage(
            data,
            `Không thể ghi nhận xe vào. HTTP ${response.status}`
          )
        );
      }


      /* ===============================
         SUCCESS
      =============================== */

      setThongBao(
        layMessage(
          data,
          "Đã ghi nhận xe vào bãi."
        )
      );


      setBienSo("");


      /*
        Load lại danh sách ACTIVE
        từ database.
      */

      await taiXeDangGui();


      /*
        Đóng modal sau 700ms.
      */

      setTimeout(
        () => {
          setModalMo(false);
          setThongBao("");
        },
        700
      );


    } catch (error) {
      console.error(
        "Lỗi check-in:",
        error
      );


      setLoi(
        error.message ||
        "Không thể ghi nhận xe vào."
      );


    } finally {
      setDangLuu(false);
    }
  };


  /* =========================================================
     XE RA BÃI

     POST /api/Parking/check-out

     Body:

     {
       "bienSo": "51B12345"
     }
  ========================================================= */

  const xuLyXeRa = async (xe) => {
    const bienSo =
      chuanHoaBienSo(
        layBienSo(xe)
      );


    if (
      !bienSo ||
      bienSo === "--"
    ) {
      setLoi(
        "Không xác định được biển số của xe."
      );

      return;
    }


    const xacNhan =
      window.confirm(
        `Xác nhận xe ${bienSo} ra khỏi bãi?`
      );


    if (!xacNhan) {
      return;
    }


    try {
      setLoi("");
      setThongBao("");


      const token =
        layToken();


      if (!token) {
        throw new Error(
          "Bạn chưa đăng nhập. Vui lòng đăng nhập lại."
        );
      }


      const url =
        `${API_BASE}/api/Parking/check-out`;


      console.log(
        "POST:",
        url,
        {
          bienSo,
        }
      );


      const response =
        await fetch(
          url,
          {
            method: "POST",

            headers:
              taoHeaders(true),

            body:
              JSON.stringify({
                bienSo,
              }),
          }
        );


      const data =
        await docJsonAnToan(
          response
        );


      console.log(
        "POST /api/Parking/check-out:",
        response.status,
        data
      );


      /* ===============================
         401
      =============================== */

      if (
        response.status === 401
      ) {
        throw xuLyUnauthorized();
      }


      /* ===============================
         ERROR
      =============================== */

      if (!response.ok) {
        throw new Error(
          layMessage(
            data,
            `Không thể cập nhật xe ra. HTTP ${response.status}`
          )
        );
      }


      /* ===============================
         SUCCESS
      =============================== */

      setThongBao(
        layMessage(
          data,
          `Xe ${bienSo} đã ra khỏi bãi.`
        )
      );


      /*
        Load lại danh sách ACTIVE.
      */

      await taiXeDangGui();


      setTimeout(
        () => {
          setThongBao("");
        },
        1500
      );


    } catch (error) {
      console.error(
        "Lỗi check-out:",
        error
      );


      setLoi(
        error.message ||
        "Không thể cập nhật xe ra."
      );
    }
  };


  /* =========================================================
     LẤY ID
     Chỉ dùng cho React key.
  ========================================================= */

  const layId = (
    xe,
    index
  ) => {
    return (
      xe?.id ??
      xe?.Id ??
      xe?.parkingSessionId ??
      xe?.ParkingSessionId ??
      xe?.luotGuiId ??
      xe?.LuotGuiId ??
      `${layBienSo(xe)}-${index}`
    );
  };


  /* =========================================================
     LẤY BIỂN SỐ
  ========================================================= */

  const layBienSo = (xe) => {
    return (
      xe?.bienSo ??
      xe?.BienSo ??
      xe?.licensePlate ??
      xe?.LicensePlate ??
      xe?.license_plate ??
      xe?.License_Plate ??
      xe?.phuongTien?.bienSo ??
      xe?.PhuongTien?.BienSo ??
      "--"
    );
  };


  /* =========================================================
     LẤY LOẠI XE
  ========================================================= */

  const layLoaiXe = (xe) => {
    return (
      xe?.loaiXe ??
      xe?.LoaiXe ??
      xe?.vehicleType ??
      xe?.VehicleType ??
      xe?.vehicle_type ??
      xe?.loaiPhuongTien ??
      xe?.LoaiPhuongTien ??
      xe?.loaiPhuongTien?.tenLoai ??
      xe?.loaiPhuongTien?.TenLoai ??
      xe?.LoaiPhuongTien?.tenLoai ??
      xe?.LoaiPhuongTien?.TenLoai ??
      xe?.phuongTien?.loaiPhuongTien?.tenLoai ??
      xe?.PhuongTien?.LoaiPhuongTien?.TenLoai ??
      "--"
    );
  };


  /* =========================================================
     LẤY TÊN CƯ DÂN
  ========================================================= */

  const layCuDan = (xe) => {
    return (
      xe?.cuDan ??
      xe?.CuDan ??
      xe?.residentName ??
      xe?.ResidentName ??
      xe?.hoTen ??
      xe?.HoTen ??
      xe?.resident?.name ??
      xe?.resident?.Name ??
      xe?.resident?.hoTen ??
      xe?.resident?.HoTen ??
      xe?.cuDan?.hoTen ??
      xe?.CuDan?.HoTen ??
      xe?.vehicle?.resident?.name ??
      xe?.phuongTien?.cuDan?.hoTen ??
      xe?.PhuongTien?.CuDan?.HoTen ??
      "--"
    );
  };


  /* =========================================================
     LẤY CĂN HỘ
  ========================================================= */

  const layCanHo = (xe) => {
    return (
      xe?.canHo ??
      xe?.CanHo ??
      xe?.apartmentNumber ??
      xe?.ApartmentNumber ??
      xe?.soCan ??
      xe?.SoCan ??
      xe?.apartment?.number ??
      xe?.apartment?.Number ??
      xe?.apartment?.soCan ??
      xe?.apartment?.SoCan ??
      xe?.canHo?.soCan ??
      xe?.CanHo?.SoCan ??
      xe?.vehicle?.apartment?.number ??
      xe?.phuongTien?.canHo?.soCan ??
      xe?.PhuongTien?.CanHo?.SoCan ??
      "--"
    );
  };


  /* =========================================================
     LẤY THỜI GIAN VÀO
  ========================================================= */

  const layThoiGianVao = (xe) => {
    const value =
      xe?.thoiGianVao ??
      xe?.ThoiGianVao ??
      xe?.entryTime ??
      xe?.EntryTime ??
      xe?.entry_time ??
      xe?.Entry_Time ??
      xe?.checkInTime ??
      xe?.CheckInTime ??
      xe?.check_in_time ??
      xe?.createdAt ??
      xe?.CreatedAt ??
      xe?.created_at;


    if (!value) {
      return "--";
    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value);
    }


    return date.toLocaleString(
      "vi-VN",
      {
        hour: "2-digit",
        minute: "2-digit",

        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  const chuanHoaTimKiem = (value) => {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};


const xeDangGuiLoc = xeDangGui.filter((xe) => {
  const tuKhoaTim = chuanHoaTimKiem(tuKhoa);

  if (!tuKhoaTim) {
    return true;
  }

  const bienSo = chuanHoaTimKiem(layBienSo(xe));
  const loaiXe = chuanHoaTimKiem(layLoaiXe(xe));
  const cuDan = chuanHoaTimKiem(layCuDan(xe));
  const canHo = chuanHoaTimKiem(layCanHo(xe));

  return (
    bienSo.includes(tuKhoaTim) ||
    loaiXe.includes(tuKhoaTim) ||
    cuDan.includes(tuKhoaTim) ||
    canHo.includes(tuKhoaTim)
  );
});

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="lg-wrapper">

      <div className="lg-body">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="lg-title-bar">

          <div>

            <h2>
              Lượt gửi xe
            </h2>

            <p className="lg-subtitle">
              Quản lý các xe cư dân đang gửi trong bãi.
            </p>

          </div>


          <button
            type="button"
            className="lg-btn-add"
            onClick={
              moModalGhiNhan
            }
          >

            <span>
              +
            </span>

            Ghi nhận xe vào

          </button>

        </div>


        {/* ===================================================
            ERROR PAGE
        =================================================== */}

        {loi &&
          !modalMo && (
            <div className="lg-alert-error">
              {loi}
            </div>
          )}


        {/* ===================================================
            SUCCESS PAGE
        =================================================== */}

        {thongBao &&
          !modalMo && (
            <div className="lg-alert-success lg-page-success">
              ✓ {thongBao}
            </div>
          )}


        {/* ===================================================
            TABLE BOX
        =================================================== */}

        <div className="lg-table-box">

          {/* =================================================
              TOOLBAR
          ================================================= */}

<div className="lg-table-toolbar">

  <div className="lg-toolbar-title">

    <span className="lg-toolbar-dot"></span>

    Đang gửi

  </div>


  <div className="lg-toolbar-search">

    <span className="lg-search-icon">
      🔍
    </span>

    <input
      type="text"
      value={tuKhoa}
      onChange={(e) => setTuKhoa(e.target.value)}
      placeholder="Tìm biển số, cư dân, căn hộ..."
      aria-label="Tìm kiếm xe đang gửi"
    />

    {tuKhoa && (
      <button
        type="button"
        className="lg-search-clear"
        onClick={() => setTuKhoa("")}
        aria-label="Xóa tìm kiếm"
      >
        ×
      </button>
    )}

  </div>


  <span className="lg-total">

    {dangTai
      ? "Đang tải..."
      : tuKhoa
        ? `${xeDangGuiLoc.length}/${xeDangGui.length} xe`
        : `${xeDangGui.length} xe đang gửi`}

  </span>

</div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="lg-table-scroll">

            <table className="lg-table">

              <thead>

                <tr>

                  <th className="lg-col-stt">
                    STT
                  </th>

                  <th>
                    Biển số xe
                  </th>

                  <th>
                    Loại xe
                  </th>

                  <th>
                    Cư dân
                  </th>

                  <th>
                    Căn hộ
                  </th>

                  <th>
                    Thời gian vào
                  </th>

                  <th>
                    Trạng thái
                  </th>

                  <th className="lg-col-action">
                    Thao tác
                  </th>

                </tr>

              </thead>


              <tbody>

                {/* ===============================
                    LOADING
                =============================== */}

                {dangTai && (
                  <tr>

                    <td
                      colSpan="8"
                      className="lg-empty"
                    >

                      <div className="lg-loading">

                        <span className="lg-spinner"></span>

                      </div>

                      <div>
                        Đang tải danh sách xe...
                      </div>

                    </td>

                  </tr>
                )}


                {/* ===============================
                    EMPTY
                =============================== */}

                {!dangTai &&
                  xeDangGuiLoc.length === 0 && (
                    <tr>
                      <td colSpan="8" className="lg-empty">
                        <div className="lg-empty-icon">
                          {tuKhoa ? "🔍" : "🚗"}
                        </div>

                        <div>
                          {tuKhoa
                            ? "Không tìm thấy xe phù hợp"
                            : "Chưa có xe đang gửi"}
                        </div>

                        <small>
                          {tuKhoa
                            ? `Không có xe nào phù hợp với "${tuKhoa}".`
                            : "Xe cư dân sẽ xuất hiện khi được ghi nhận vào bãi."}
                        </small>
                      </td>
                    </tr>
                  )}


                {/* ===============================
                    DATA
                =============================== */}

                {!dangTai &&
                  xeDangGuiLoc.length > 0 &&
                  xeDangGuiLoc.map(
                    (xe, index) => (
                      <tr
                        key={
                          layId(
                            xe,
                            index
                          )
                        }
                      >

                        {/* STT */}

                        <td className="lg-stt">
                          {index + 1}
                        </td>


                        {/* BIỂN SỐ */}

                        <td>

                          <span className="lg-license">
                            {layBienSo(xe)}
                          </span>

                        </td>


                        {/* LOẠI XE */}

                        <td>

                          <span className="lg-type">
                            {layLoaiXe(xe)}
                          </span>

                        </td>


                        {/* CƯ DÂN */}

                        <td>

                          <span className="lg-resident">
                            {layCuDan(xe)}
                          </span>

                        </td>


                        {/* CĂN HỘ */}

                        <td>

                          <span className="lg-apartment">
                            {layCanHo(xe)}
                          </span>

                        </td>


                        {/* THỜI GIAN */}

                        <td>

                          <span className="lg-entry-time">
                            {layThoiGianVao(xe)}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span className="lg-status lg-status-active">

                            <span className="lg-status-dot"></span>

                            Đang gửi

                          </span>

                        </td>


                        {/* ACTION */}

                        <td className="lg-col-action">

                          <button
                            type="button"
                            className="lg-btn-out"
                            onClick={() =>
                              xuLyXeRa(xe)
                            }
                          >
                            Xe ra
                          </button>

                        </td>

                      </tr>
                    )
                  )}

              </tbody>

            </table>

          </div>


          {/* =================================================
              PAGINATION
          ================================================= */}

          <div className="lg-pagination">

            <span>

            Hiển thị{" "}

            <strong>
              {xeDangGuiLoc.length > 0
                ? `1 - ${xeDangGuiLoc.length}`
                : "0 - 0"}
            </strong>{" "}

            trong{" "}

            <strong>
              {xeDangGuiLoc.length}
            </strong>{" "}

            xe

            </span>


            <div className="lg-pagination-buttons">

              <button
                type="button"
                disabled
              >
                ‹
              </button>


              <button
                type="button"
                className="lg-page-active"
              >
                1
              </button>


              <button
                type="button"
                disabled
              >
                ›
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          MODAL GHI NHẬN XE VÀO
      ===================================================== */}

      {modalMo && (
        <div
          className="lg-modal-overlay"

          onMouseDown={(e) => {

            if (
              e.target ===
                e.currentTarget &&
              !dangLuu
            ) {
              dongModal();
            }

          }}
        >

          <div className="lg-modal">

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="lg-modal-header">

              <div>

                <h3>
                  Ghi nhận xe vào
                </h3>

                <p>
                  Nhập biển số xe cư dân để ghi nhận vào bãi.
                </p>

              </div>


              <button
                type="button"
                className="lg-close"
                onClick={dongModal}
                disabled={dangLuu}
                aria-label="Đóng"
              >
                ×
              </button>

            </div>


            {/* =================================================
                MODAL FORM
            ================================================= */}

            <form
              onSubmit={ghiNhanXeVao}
              className="lg-modal-body"
            >

              <div className="lg-form-group">

                <label htmlFor="bien-so">

                  Biển số xe

                  <span>
                    *
                  </span>

                </label>


                <input
                  id="bien-so"
                  type="text"
                  value={bienSo}

                  onChange={(e) => {

                    setBienSo(
                      e.target.value
                    );

                    setLoi("");
                    setThongBao("");

                  }}

                  placeholder="Ví dụ: 51B-12345"

                  autoFocus

                  autoComplete="off"

                  disabled={dangLuu}

                  required
                />

              </div>


              {/* =================================================
                  SUCCESS
              ================================================= */}

              {thongBao && (
                <div className="lg-alert-success">
                  ✓ {thongBao}
                </div>
              )}


              {/* =================================================
                  ERROR
              ================================================= */}

              {loi && (
                <div className="lg-alert-error">
                  {loi}
                </div>
              )}


              {/* =================================================
                  NOTE
              ================================================= */}

              <div className="lg-modal-note">

                <span className="lg-note-icon">
                  💡
                </span>

                <span>
                  Hệ thống sẽ tự tìm phương tiện cư dân
                  theo biển số để lấy thông tin loại xe,
                  cư dân và căn hộ.
                </span>

              </div>


              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="lg-modal-footer">

                <button
                  type="button"
                  className="lg-btn-cancel"
                  onClick={dongModal}
                  disabled={dangLuu}
                >
                  Hủy
                </button>


                <button
                  type="submit"
                  className="lg-btn-save"
                  disabled={dangLuu}
                >

                  {dangLuu ? (
                    <>
                      <span className="lg-button-spinner"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    "Ghi nhận xe vào"
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}


export default LuotGui;
