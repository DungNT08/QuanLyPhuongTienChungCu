import React, { useState } from "react";
import "./XeKhach.css";

function XeKhach() {
  const [tuKhoa, setTuKhoa] = useState("");
  const [tuNgay, setTuNgay] = useState("2025-05-01");
  const [denNgay, setDenNgay] = useState("2025-05-07");

  return (
    <div className="noi-dung-xe-khach">

      {/* =========================
          TIÊU ĐỀ + NÚT THÊM
      ========================= */}

      <div className="tieu-de-trang">
        <h1>Xe khách</h1>

        <button
          className="nut-them-moi"
          type="button"
        >
          + Ghi nhận xe khách
        </button>
      </div>

      {/* =========================
          BỘ LỌC
      ========================= */}

      <div className="bo-loc">

        <div className="o-tim-kiem-nho">
          <span className="icon-tim">
            🔍
          </span>

          <input
            type="text"
            placeholder="Tìm theo biển số, tên khách hàng..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
          />
        </div>

        <div className="o-loc-ngay">

          <span className="icon-lich">
            📅
          </span>

          <input
            type="date"
            value={tuNgay}
            onChange={(e) => setTuNgay(e.target.value)}
          />

          <span className="gach-ngang">
            -
          </span>

          <input
            type="date"
            value={denNgay}
            onChange={(e) => setDenNgay(e.target.value)}
          />

        </div>

      </div>

      {/* =========================
          BẢNG XE KHÁCH
      ========================= */}

      <div className="o-dashboard">

        <div className="vung-bang">

          <table className="bang-xe-khach">

            <thead>
              <tr>
                <th>STT</th>
                <th>Biển số xe</th>
                <th>Loại xe</th>
                <th>Khách hàng</th>
                <th>Thời gian vào</th>
                <th>Thời gian ra</th>
                <th>Thời gian gửi</th>
                <th>Phí</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  colSpan="9"
                  className="o-trong-bang"
                >
                  Chưa có dữ liệu
                </td>
              </tr>
            </tbody>

          </table>

        </div>

        {/* =========================
            CHÂN BẢNG
        ========================= */}

        <div className="chan-bang">

          <span>
            Hiển thị 0 - 0 trong 0 lượt xe
          </span>

          <div className="phan-trang">

            <button type="button">
              ‹
            </button>

            <button
              type="button"
              className="trang-dang-chon"
            >
              1
            </button>

            <button type="button">
              ›
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default XeKhach;