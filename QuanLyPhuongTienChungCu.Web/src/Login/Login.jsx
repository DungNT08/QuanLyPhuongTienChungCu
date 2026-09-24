import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_URL = "http://localhost:5022/api";

function Login() {
  const navigate = useNavigate();

  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [dangNhap, setDangNhap] = useState(false);
  const [loi, setLoi] = useState("");

  const xuLyDangNhap = async (e) => {
    e.preventDefault();

    setLoi("");
    setDangNhap(true);

    try {
      const response = await fetch(`${API_URL}/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenDangNhap,
          matKhau,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Tên đăng nhập hoặc mật khẩu không đúng"
        );
      }

      // Lưu token
      localStorage.setItem("token", data.token);

      // Lưu thông tin người dùng
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: data.userId,
          hoTen: data.hoTen,
          tenDangNhap: data.tenDangNhap,
          email: data.email,
          roleId: data.roleId,
          tenRole: data.tenRole,
        })
      );

      // Chuyển trang theo quyền
      if (data.tenRole === "Admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setLoi(error.message);
    } finally {
      setDangNhap(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-icon">🏢</div>

        <h1>Chung cư Sunrise</h1>
        <p>Đăng nhập hệ thống quản lý phương tiện</p>

        <form onSubmit={xuLyDangNhap}>
          <div className="login-field">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              value={tenDangNhap}
              onChange={(e) => setTenDangNhap(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div className="login-field">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          {loi && <div className="login-error">{loi}</div>}

          <button type="submit" disabled={dangNhap}>
            {dangNhap ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;