import React, { useEffect, useState } from "react";
import "./LichGuiXeU.css";

const API_URL = "http://localhost:5022/api";

function LichGuiXeU() {
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");
  const [dangTim, setDangTim] = useState(false);
  const [lichGuiXe, setLichGuiXe] = useState([]);
  const [loi, setLoi] = useState("");

  // ============================================
  // GỌI API
  // ============================================
  const taiLichSu = async () => {
    try {
      setDangTim(true);
      setLoi("");

      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (tuNgay) params.append("tuNgay", tuNgay);
      if (denNgay) params.append("denNgay", denNgay);

      const res = await fetch(`${API_URL}/Parking/history?${params}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setLichGuiXe(data);
    } catch (err) {
      console.error("Lỗi tải lịch sử gửi xe:", err);
      setLoi(err.message || "Không thể tải lịch sử gửi xe.");
      setLichGuiXe([]);
    } finally {
      setDangTim(false);
    }
  };

  useEffect(() => {
    taiLichSu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timKiem = () => taiLichSu();

  const xoaLoc = () => {
    setTuNgay("");
    setDenNgay("");
    setLoi("");
    setTimeout(taiLichSu, 0);
  };

  // ============================================
  // FORMAT
  // ============================================
  const formatNgay = (str) => {
    if (!str) return "--";
    const d = new Date(str);
    const ngay = String(d.getDate()).padStart(2, "0");
    const thang = String(d.getMonth() + 1).padStart(2, "0");
    const nam = d.getFullYear();
    const gio = String(d.getHours()).padStart(2, "0");
    const phut = String(d.getMinutes()).padStart(2, "0");
    return `${gio}:${phut} ${ngay}/${thang}/${nam}`;
  };

  const tinhThoiGianGui = (vao, ra) => {
    if (!vao) return "--";
    const end = ra ? new Date(ra) : new Date();
    const diffMs = end - new Date(vao);
    const gio = Math.floor(diffMs / (1000 * 60 * 60));
    const phut = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (gio === 0) return `${phut} phút`;
    return `${gio} giờ ${phut} phút`;
  };

  const xemChiTiet = (item) => {
    alert(
      `Biển số: ${item.bienSo}\n` +
        `Loại xe: ${item.loaiXe || "--"}\n` +
        `Cư dân / Khách: ${item.laXeKhach ? "Khách" : item.cuDan || "--"}\n` +
        `Căn hộ: ${item.canHo || "--"}\n` +
        `Thời gian vào: ${formatNgay(item.thoiGianVao)}\n` +
        `Thời gian ra: ${formatNgay(item.thoiGianRa)}\n` +
        `Người ghi vào: ${item.nguoiGhiVao || "--"}\n` +
        `Người ghi ra: ${item.nguoiGhiRa || "--"}\n` +
        `Số tiền: ${
          item.soTien ? item.soTien.toLocaleString("vi-VN") + " đ" : "--"
        }`
    );
  };

  return (
    <div className="lich-gui-xe-page">
      <div className="lich-gui-xe-header">
        <h1>Lịch gửi xe</h1>
        <p>Theo dõi lịch gửi và nhận xe của bạn</p>
      </div>

      {loi && (
        <div
          style={{
            background: "#fff1f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            padding: "12px 20px",
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          ⚠️ {loi}
        </div>
      )}

      <div className="bo-loc-lich-gui">
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

        <button className="btn-tim-kiem" onClick={timKiem} disabled={dangTim}>
          {dangTim ? "Đang tìm..." : "Tìm kiếm"}
        </button>

        <button className="btn-xoa-loc" onClick={xoaLoc}>
          Xóa lọc
        </button>
      </div>

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
                  <tr key={item.luotGuiXeId || index}>
                    <td>{index + 1}</td>
                    <td className="bien-so">{item.bienSo}</td>
                    <td>{item.loaiXe || "--"}</td>
                    <td className="cu-dan-khach">
                      {item.laXeKhach ? (
                        <span className="badge-khach">Khách</span>
                      ) : (
                        <>
                          <span className="ten-cu-dan">
                            {item.cuDan || "--"}
                          </span>
                          {item.canHo && (
                            <span className="ma-can-ho">{item.canHo}</span>
                          )}
                        </>
                      )}
                    </td>
                    <td>{formatNgay(item.thoiGianVao)}</td>
                    <td>{formatNgay(item.thoiGianRa)}</td>
                    <td>
                      {tinhThoiGianGui(item.thoiGianVao, item.thoiGianRa)}
                    </td>
                    <td>
                      {item.trangThai === "Đang gửi" ? (
                        <span className="trang-thai-dang-gui">Đang gửi</span>
                      ) : (
                        <span className="trang-thai-da-thanh-toan">
                          {item.trangThai}
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
                  <td colSpan="9" className="khong-co-du-lieu">
                    <div className="icon-khong-co">🚗</div>
                    <p>
                      {dangTim ? "Đang tải..." : "Chưa có lịch sử gửi xe"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bang-footer">
          <span>
            Hiển thị{" "}
            <strong>
              {lichGuiXe.length > 0 ? 1 : 0} - {lichGuiXe.length}
            </strong>{" "}
            trong <strong>{lichGuiXe.length}</strong> lượt gửi
          </span>

          <div className="phan-trang">
            <button disabled>‹</button>
            <span className="trang-hien-tai">1</span>
            <button disabled>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LichGuiXeU;
