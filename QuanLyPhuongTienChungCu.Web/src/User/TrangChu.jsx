import React from "react";
import { useNavigate } from "react-router-dom";
import "./TrangChu.css";

function TrangChu() {
  const navigate = useNavigate();

  // =========================
  // ĐI ĐẾN TRANG PHƯƠNG TIỆN
  // =========================
  const xemPhuongTien = () => {
    navigate("/phuong-tien-cua-toi");
  };

  return (
    <div className="noi-dung-trang-chu">

      {/* ===== LỜI CHÀO ===== */}
      <div className="khoi-chao">
        <div className="loi-chao">
          <h1>Xin chào!</h1>

          <p>
            Chào mừng bạn đến với hệ thống quản lý phương tiện chung cư.
          </p>
        </div>

        <div className="hinh-minh-hoa">
          🏢🚗
        </div>
      </div>


      {/* ===== 3 THẺ THỐNG KÊ ===== */}
      <div className="hang-thong-ke">

        {/* PHƯƠNG TIỆN */}
        <div
          className="the-thong-ke xanh-duong"
          onClick={xemPhuongTien}
          style={{ cursor: "pointer" }}
        >
          <div className="the-icon">
            🚗
          </div>

          <div className="the-noi-dung">
            <p className="the-tieu-de">
              Phương tiện của tôi
            </p>

            <h2 className="the-gia-tri">
              --
            </h2>

            <p className="the-mo-ta">
              xe đang đăng ký
            </p>
          </div>
        </div>


        {/* LƯỢT GỬI XE */}
        <div className="the-thong-ke xanh-la">
          <div className="the-icon">
            🎫
          </div>

          <div className="the-noi-dung">
            <p className="the-tieu-de">
              Lượt gửi xe trong tháng
            </p>

            <h2 className="the-gia-tri">
              --
            </h2>

            <p className="the-mo-ta">
              lượt gửi
            </p>
          </div>
        </div>


        {/* CHI PHÍ */}
        <div className="the-thong-ke tim">
          <div className="the-icon">
            💳
          </div>

          <div className="the-noi-dung">
            <p className="the-tieu-de">
              Tổng chi phí tháng này
            </p>

            <h2 className="the-gia-tri">
              --
            </h2>

            <p className="the-mo-ta">
              đã thanh toán
            </p>
          </div>
        </div>

      </div>


      {/* ===== HÀNG DƯỚI ===== */}
      <div className="hang-duoi">

        {/* ===== BẢNG LỊCH SỬ ===== */}
        <div className="bang-lich-su">

          <div className="tieu-de-bang">
            <h3>
              Lịch sử gửi xe gần đây
            </h3>

            <a href="/lich-su-gui-xe">
              Xem tất cả →
            </a>
          </div>


          <table>

            <thead>
              <tr>
                <th>Ngày giờ</th>
                <th>Biển số xe</th>
                <th>Loại xe</th>
                <th>Vị trí gửi</th>
                <th>Thời gian gửi</th>
                <th>Trạng thái</th>
              </tr>
            </thead>


            <tbody>

              {/* Dữ liệu sẽ được đổ vào từ API */}
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    color: "#93aebd"
                  }}
                >
                  Chưa có dữ liệu
                </td>
              </tr>

            </tbody>

          </table>

        </div>


        {/* ===== QUẢNG CÁO ===== */}
        <div className="khoi-quang-cao">

          <div className="qc-icon">
            🚗
          </div>

          <h3>
            Quản lý phương tiện của bạn
          </h3>

          <p>
            Nhanh chóng, tiện lợi, an toàn
          </p>


          {/* NÚT XEM PHƯƠNG TIỆN */}
          <button
            className="nut-xem-phuong-tien"
            onClick={xemPhuongTien}
          >
            Xem phương tiện
          </button>

        </div>

      </div>

    </div>
  );
}

export default TrangChu;