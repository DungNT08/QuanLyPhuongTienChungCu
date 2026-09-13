import React, { useState } from "react";
import "./Checkin-out.css";

function CheckinOut() {
  const [bienSoCheckin, setBienSoCheckin] = useState("");
  const [loaiXeCheckin, setLoaiXeCheckin] = useState("Ô tô");
  const [khachHangCheckin, setKhachHangCheckin] = useState("");
  const [thoiGianVao, setThoiGianVao] = useState("2025-05-07T09:30");

  const [bienSoCheckout, setBienSoCheckout] = useState("");
  const [thoiGianRa, setThoiGianRa] = useState("2025-05-07T09:30");
  const [thoiGianGui, setThoiGianGui] = useState("2h 15p");
  const [phiGuiXe, setPhiGuiXe] = useState("30.000đ");

  const xuLyCheckin = (e) => {
    e.preventDefault();

    alert(
      `Đã ghi nhận Check-in xe ${bienSoCheckin || "chưa nhập biển số"}`
    );
  };

  const xuLyCheckout = (e) => {
    e.preventDefault();

    alert(
      `Đã ghi nhận Check-out xe ${bienSoCheckout || "chưa nhập biển số"}`
    );
  };

  return (
    <div className="noi-dung-checkinout">

      {/* =========================
          TIÊU ĐỀ
      ========================= */}

      <div className="tieu-de-checkinout">
        <div>
          <h1>Check-in / Check-out</h1>

          <p>
            Ghi nhận xe vào và xe ra khỏi bãi đỗ xe
          </p>
        </div>
      </div>

      {/* =========================
          2 KHỐI CHECK-IN / CHECK-OUT
      ========================= */}

      <div className="luoi-checkinout">

        {/* =========================
            CHECK-IN
        ========================= */}

        <div className="the-checkinout the-checkin">

          <div className="tieu-de-the-checkin">
            <div className="icon-tieu-de checkin-icon">
              🚙
            </div>

            <div>
              <h2>Check-in</h2>

              <span>
                Ghi nhận xe vào bãi
              </span>
            </div>
          </div>

          <form
            className="form-checkinout"
            onSubmit={xuLyCheckin}
          >

            {/* BIỂN SỐ */}
            <div className="truong-form">
              <label>
                Biển số xe <span>*</span>
              </label>

              <input
                type="text"
                placeholder="Nhập biển số xe"
                value={bienSoCheckin}
                onChange={(e) =>
                  setBienSoCheckin(e.target.value)
                }
              />
            </div>

            {/* LOẠI XE */}
            <div className="truong-form">
              <label>
                Loại xe
              </label>

              <select
                value={loaiXeCheckin}
                onChange={(e) =>
                  setLoaiXeCheckin(e.target.value)
                }
              >
                <option value="Ô tô">
                  Ô tô
                </option>

                <option value="Xe máy">
                  Xe máy
                </option>

                <option value="Xe đạp">
                  Xe đạp
                </option>

                <option value="Khác">
                  Khác
                </option>
              </select>
            </div>

            {/* KHÁCH HÀNG */}
            <div className="truong-form">
              <label>
                Khách hàng (nếu có)
              </label>

              <input
                type="text"
                placeholder="Nhập tên khách"
                value={khachHangCheckin}
                onChange={(e) =>
                  setKhachHangCheckin(e.target.value)
                }
              />
            </div>

            {/* THỜI GIAN VÀO */}
            <div className="truong-form">
              <label>
                Thời gian vào
              </label>

              <div className="o-thoi-gian">
                <input
                  type="datetime-local"
                  value={thoiGianVao}
                  onChange={(e) =>
                    setThoiGianVao(e.target.value)
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="nut-checkin"
            >
              ✓ Ghi nhận Check-in
            </button>

          </form>
        </div>

        {/* =========================
            CHECK-OUT
        ========================= */}

        <div className="the-checkinout the-checkout">

          <div className="tieu-de-the-checkin">
            <div className="icon-tieu-de checkout-icon">
              🚗
            </div>

            <div>
              <h2>Check-out</h2>

              <span>
                Ghi nhận xe ra khỏi bãi
              </span>
            </div>
          </div>

          <form
            className="form-checkinout"
            onSubmit={xuLyCheckout}
          >

            {/* BIỂN SỐ */}
            <div className="truong-form">
              <label>
                Biển số xe <span>*</span>
              </label>

              <input
                type="text"
                placeholder="Nhập biển số xe"
                value={bienSoCheckout}
                onChange={(e) =>
                  setBienSoCheckout(e.target.value)
                }
              />
            </div>

            {/* THỜI GIAN RA */}
            <div className="truong-form">
              <label>
                Thời gian ra
              </label>

              <div className="o-thoi-gian">
                <input
                  type="datetime-local"
                  value={thoiGianRa}
                  onChange={(e) =>
                    setThoiGianRa(e.target.value)
                  }
                />
              </div>
            </div>

            {/* THỜI GIAN GỬI */}
            <div className="truong-form">
              <label>
                Thời gian gửi (tạm tính)
              </label>

              <input
                type="text"
                value={thoiGianGui}
                onChange={(e) =>
                  setThoiGianGui(e.target.value)
                }
                className="o-chi-hien-thi"
              />
            </div>

            {/* PHÍ */}
            <div className="truong-form">
              <label>
                Phí gửi xe
              </label>

              <input
                type="text"
                value={phiGuiXe}
                onChange={(e) =>
                  setPhiGuiXe(e.target.value)
                }
                className="o-chi-hien-thi"
              />
            </div>

            <button
              type="submit"
              className="nut-checkout"
            >
              ✓ Ghi nhận Check-out
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}

export default CheckinOut;