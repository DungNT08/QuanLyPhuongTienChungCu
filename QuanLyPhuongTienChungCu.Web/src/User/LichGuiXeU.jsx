import React, { useState } from "react";
import "./LichGuiXeU.css";

function LichGuiXeU() {
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");
  const [dangTim, setDangTim] = useState(false);

  // Dữ liệu ban đầu để giao diện hiển thị
  // Sau này có API thì thay bằng dữ liệu từ API
  const [lichGuiXe, setLichGuiXe] = useState([]);

  const timKiem = () => {
    setDangTim(true);

    setTimeout(() => {
      setDangTim(false);
    }, 500);
  };

  const xoaLoc = () => {
    setTuNgay("");
    setDenNgay("");
    setLichGuiXe([]);
  };

  const xemChiTiet = (item) => {
    alert(
      `Biển số: ${item.bienSo}\n` +
      `Loại xe: ${item.loaiXe}\n` +
      `Cư dân / Khách: ${item.cuDan}\n` +
      `Thời gian vào: ${item.thoiGianVao}\n` +
      `Thời gian ra: ${item.thoiGianRa}`
    );
  };

  return (
    <div className="lich-gui-xe-page">

      {/* =========================
          TIÊU ĐỀ
      ========================= */}
      <div className="lich-gui-xe-header">
        <h1>Lịch gửi xe</h1>

        <p>
          Theo dõi lịch gửi và nhận xe của bạn
        </p>
      </div>


      {/* =========================
          BỘ LỌC
      ========================= */}
      <div className="bo-loc-lich-gui">

        {/* TỪ NGÀY */}
        <div className="o-loc">
          <label>Từ ngày</label>

          <div className="input-ngay">
            <input
              type="date"
              value={tuNgay}
              onChange={(e) => setTuNgay(e.target.value)}
            />
          </div>
        </div>


        {/* ĐẾN NGÀY */}
        <div className="o-loc">
          <label>Đến ngày</label>

          <div className="input-ngay">
            <input
              type="date"
              value={denNgay}
              onChange={(e) => setDenNgay(e.target.value)}
            />
          </div>
        </div>


        {/* TÌM KIẾM */}
        <button
          className="btn-tim-kiem"
          onClick={timKiem}
          disabled={dangTim}
        >
          {dangTim ? "Đang tìm..." : "Tìm kiếm"}
        </button>


        {/* XÓA LỌC */}
        <button
          className="btn-xoa-loc"
          onClick={xoaLoc}
        >
          Xóa lọc
        </button>

      </div>


      {/* =========================
          BẢNG
      ========================= */}
      <div className="bang-lich-gui">

        <div className="bang-scroll">

          <table>

            <thead>
              <tr>
                <th>STT</th>
                <th>Biển số xe</th>
                <th>Loại xe</th>
                <th>Cư dân / Khách</th>
                <th>Thời gian vào</th>
                <th>Thời gian ra</th>
                <th>Thời gian gửi</th>
                <th>Trạng thái</th>
                <th>Chi tiết</th>
              </tr>
            </thead>


            <tbody>

              {lichGuiXe.length > 0 ? (

                lichGuiXe.map((item, index) => (

                  <tr key={item.id || index}>

                    <td>
                      {index + 1}
                    </td>

                    <td className="bien-so">
                      {item.bienSo}
                    </td>

                    <td>
                      {item.loaiXe}
                    </td>

                    <td>
                      {item.cuDan}
                    </td>

                    <td>
                      {item.thoiGianVao}
                    </td>

                    <td>
                      {item.thoiGianRa || "--"}
                    </td>

                    <td>
                      {item.thoiGianGui || "--"}
                    </td>

                    <td>

                      {item.trangThai === "Đang gửi" ? (

                        <span className="trang-thai-dang-gui">
                          Đang gửi
                        </span>

                      ) : (

                        <span className="trang-thai-da-thanh-toan">
                          Đã thanh toán
                        </span>

                      )}

                    </td>

                    <td>

                      <button
                        className="btn-xem"
                        onClick={() => xemChiTiet(item)}
                      >
                        Xem
                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="9"
                    className="khong-co-du-lieu"
                  >

                    <div className="icon-khong-co">
                      🚗
                    </div>

                    <p>
                      Chưa có lịch sử gửi xe
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* =========================
            FOOTER
        ========================= */}
        <div className="bang-footer">

          <span>
            Hiển thị 0 - 0 trong 0 lượt gửi
          </span>


          <div className="phan-trang">

            <button disabled>
              ‹
            </button>

            <span className="trang-hien-tai">
              1
            </span>

            <button disabled>
              ›
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default LichGuiXeU;