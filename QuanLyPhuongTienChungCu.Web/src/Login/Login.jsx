
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
          tenDangNhap: tenDangNhap.trim(),
          matKhau,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Tên đăng nhập hoặc mật khẩu không đúng."
        );
      }

      if (!data.token) {
        throw new Error(
          "Đăng nhập thành công nhưng không nhận được token."
        );
      }

      if (!data.vaiTro) {
        throw new Error(
          "Đăng nhập thành công nhưng tài khoản chưa có vai trò."
        );
      }

      // =====================================================
      // XÓA SESSION CŨ
      // =====================================================

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // =====================================================
      // LƯU TOKEN
      // =====================================================

      localStorage.setItem(
        "token",
        data.token
      );

      // =====================================================
      // LƯU THÔNG TIN USER
      // =====================================================

      const user = {
        userId: data.userId,
        hoTen: data.hoTen,
        tenDangNhap: data.tenDangNhap,
        email: data.email,
        vaiTro: data.vaiTro,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // =====================================================
      // ĐIỀU HƯỚNG
      // =====================================================

      switch (data.vaiTro) {
        case "Admin":
          navigate("/admin");
          break;

        case "BaoVe":
        case "KeToan":
        case "CuDan":
          navigate("/");
          break;

        default:
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          throw new Error(
            `Vai trò "${data.vaiTro}" không được hỗ trợ.`
          );
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);

      setLoi(
        error.message ||
          "Đăng nhập thất bại."
      );
    } finally {
      setDangNhap(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">

        <div className="login-icon">
          🏢
        </div>

        <h1>Chung cư Sunrise</h1>

        <p>
          Đăng nhập hệ thống quản lý
          phương tiện
        </p>

        <form onSubmit={xuLyDangNhap}>

          <div className="login-field">
            <label>
              Tên đăng nhập
            </label>

            <input
              type="text"
              value={tenDangNhap}
              onChange={(e) =>
                setTenDangNhap(
                  e.target.value
                )
              }
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
              required
            />
          </div>

          <div className="login-field">
            <label>
              Mật khẩu
            </label>

            <input
              type="password"
              value={matKhau}
              onChange={(e) =>
                setMatKhau(
                  e.target.value
                )
              }
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
              required
            />
          </div>

          {loi && (
            <div className="login-error">
              {loi}
            </div>
          )}

          <button
            type="submit"
            disabled={dangNhap}
          >
            {dangNhap
              ? "Đang đăng nhập..."
              : "Đăng nhập"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;
