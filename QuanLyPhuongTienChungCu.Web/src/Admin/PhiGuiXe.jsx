import React, { useState } from "react";
import "./PhiGuiXe.css";

function PhiGuiXe() {
  const [bienSo, setBienSo] = useState("");
  const [loaiPhi, setLoaiPhi] = useState("");
  const [thoiGianGui, setThoiGianGui] = useState("");

  return (
    <div className="phi-gui-xe-page">

      {/* =========================
          HEADER
      ========================= */}
      <header className="header-phi-gui-xe">

        <div className="logo-phi-gui-xe">
          <div className="logo-icon-phi-gui-xe">
            🏢
          </div>

          <div>
            <div className="ten-he-thong-phi-gui-xe">
              Hệ thống quản lý phương tiện chung cư
            </div>
          </div>
        </div>

        <div className="thanh-tim-phi-gui-xe">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Tìm kiếm biển số, tên cư dân..."
          />
        </div>

        <div className="khu-vuc-admin-phi-gui-xe">

          <button
            type="button"
            className="nut-thong-bao-phi-gui-xe"
          >
            🔔
            <span className="so-thong-bao">
              0
            </span>
          </button>

          <div className="anh-admin-phi-gui-xe">
            👤
          </div>

          <div className="thong-tin-admin-phi-gui-xe">
            <strong>Admin</strong>
            <span>⌄</span>
          </div>

        </div>

      </header>


      {/* =========================
          NỘI DUNG
      ========================= */}
      <main className="noi-dung-phi-gui-xe">

        <div className="tieu-de-phi-gui-xe">
          <h1>Tính phí gửi xe</h1>
        </div>


        {/* =========================
            KHU VỰC TRÊN
        ========================= */}
        <div className="khu-vuc-tinh-phi">

          {/* =========================
              FORM TÍNH PHÍ
          ========================= */}
          <section className="card-thong-tin-phi">

            <div className="card-tieu-de-phi">
              <h2>Thông tin tính phí</h2>
            </div>

            <div className="noi-dung-form-phi">

              {/* LOẠI PHÍ */}
              <div className="o-form-phi">
                <label>
                  Loại phí <span>*</span>
                </label>

                <select
                  value={loaiPhi}
                  onChange={(e) =>
                    setLoaiPhi(e.target.value)
                  }
                >
                  <option value="">
                    Chọn loại phí
                  </option>
                </select>
              </div>


              {/* BIỂN SỐ */}
              <div className="o-form-phi">
                <label>
                  Biển số xe <span>*</span>
                </label>

                <input
                  type="text"
                  placeholder="Nhập biển số xe"
                  value={bienSo}
                  onChange={(e) =>
                    setBienSo(e.target.value)
                  }
                />
              </div>


              {/* THỜI GIAN GỬI */}
              <div className="o-form-phi">
                <label>
                  Thời gian gửi <span>*</span>
                </label>

                <input
                  type="datetime-local"
                  value={thoiGianGui}
                  onChange={(e) =>
                    setThoiGianGui(e.target.value)
                  }
                />
              </div>


              {/* NÚT TÍNH PHÍ */}
              <button
                type="button"
                className="nut-tinh-phi"
              >
                <span>▣</span>
                Tính phí
              </button>

            </div>

          </section>


          {/* =========================
              KẾT QUẢ
          ========================= */}
          <section className="card-ket-qua-phi">

            <div className="tieu-de-ket-qua">
              <span>✕</span>
              <h2>Kết quả tính phí</h2>
            </div>


            <div className="dong-ket-qua">
              <span>Thời gian gửi</span>
              <strong>—</strong>
            </div>

            <div className="dong-ket-qua">
              <span>Đơn giá</span>
              <strong>—</strong>
            </div>


            <div className="duong-ke-phi"></div>


            <div className="dong-tong-phi">
              <span>Tổng phí</span>
              <strong>—</strong>
            </div>


            <button
              type="button"
              className="nut-luu-giao-dich"
            >
              ✓ Lưu giao dịch
            </button>

          </section>

        </div>


        {/* =========================
            BẢNG GIÁ
        ========================= */}
        <section className="card-bang-gia-phi">

          <div className="tieu-de-bang-gia-phi">
            Bảng giá tham khảo
          </div>

          <table className="bang-gia-phi">

            <thead>
              <tr>
                <th>Loại phương tiện</th>
                <th>Đơn giá (giờ)</th>
                <th>Đơn giá (ngày)</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  colSpan="3"
                  className="o-trong-bang-gia-phi"
                >
                  Chưa có dữ liệu
                </td>
              </tr>
            </tbody>

          </table>

        </section>

      </main>

    </div>
  );
}

export default PhiGuiXe;