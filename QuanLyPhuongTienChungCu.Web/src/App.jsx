import "./App.css";

function App() {
  return (
    <div className="app">
      {/* ==================== SIDEBAR ==================== */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">🚗</div>

          <div className="logo-text">
            <h2>Quản Lý Phương Tiện</h2>
            <span>Chung cư</span>
          </div>
        </div>

        <nav className="menu">
          <div className="menu-title">TỔNG QUAN</div>

          <a className="menu-item active">
            <span>📊</span>
            <span>Tổng quan</span>
          </a>

          <div className="menu-title">QUẢN LÝ</div>

          <a className="menu-item">
            <span>🚗</span>
            <span>Phương tiện</span>
          </a>

          <a className="menu-item">
            <span>🅿️</span>
            <span>Lượt gửi xe</span>
          </a>

          <a className="menu-item">
            <span>👥</span>
            <span>Cư dân</span>
          </a>

          <a className="menu-item">
            <span>💰</span>
            <span>Thanh toán</span>
          </a>

          <div className="menu-title">BÁO CÁO</div>

          <a className="menu-item">
            <span>📈</span>
            <span>Báo cáo</span>
          </a>

          <a className="menu-item">
            <span>📋</span>
            <span>Nhật ký hệ thống</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">A</div>

            <div className="user-mini-info">
              <strong>Nguyễn Văn A</strong>
              <span>Quản trị viên</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ==================== MAIN ==================== */}
      <main className="main">
        {/* Header */}
        <header className="header">
          <div>
            <h1>Dashboard</h1>
            <p>Xin chào, Nguyễn Văn A 👋</p>
          </div>

          <div className="header-right">
            <button className="notification">
              🔔
              <span className="notification-dot"></span>
            </button>

            <div className="profile">
              <div className="avatar">A</div>

              <div className="profile-info">
                <strong>Nguyễn Văn A</strong>
                <span>Quản trị viên</span>
              </div>
            </div>
          </div>
        </header>

        {/* ==================== STATISTICS ==================== */}
        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon blue">
              🚗
            </div>

            <div className="stat-content">
              <span>Tổng phương tiện</span>
              <strong>5</strong>
              <small>Đang quản lý</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              🅿️
            </div>

            <div className="stat-content">
              <span>Xe đang gửi</span>
              <strong>0</strong>
              <small>Trong bãi hiện tại</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              📋
            </div>

            <div className="stat-content">
              <span>Tổng lượt gửi</span>
              <strong>5</strong>
              <small>Đã ghi nhận</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              💰
            </div>

            <div className="stat-content">
              <span>Doanh thu</span>
              <strong>25.000đ</strong>
              <small>Tổng thanh toán</small>
            </div>
          </div>
        </section>

        {/* ==================== CONTENT ==================== */}
        <section className="content-grid">
          {/* Tình hình bãi xe */}
          <div className="card parking-card">
            <div className="card-header">
              <div>
                <h2>Tình hình bãi xe</h2>
                <p>Theo dõi phương tiện trong bãi</p>
              </div>

              <button className="view-button">
                Xem chi tiết →
              </button>
            </div>

            <div className="parking-overview">
              <div className="parking-circle">
                <strong>0</strong>
                <span>Xe đang gửi</span>
              </div>

              <div className="parking-info">
                <div className="parking-number">
                  <span>Chỗ đang sử dụng</span>
                  <strong>0 / 100</strong>
                </div>

                <div className="progress">
                  <div className="progress-bar"></div>
                </div>

                <div className="parking-status">
                  <span>
                    <i className="dot green-dot"></i>
                    Đang gửi: 0
                  </span>

                  <span>
                    <i className="dot gray-dot"></i>
                    Còn trống: 100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Thao tác nhanh */}
          <div className="card quick-card">
            <div className="card-header">
              <div>
                <h2>Thao tác nhanh</h2>
                <p>Các chức năng thường dùng</p>
              </div>
            </div>

            <div className="quick-actions">
              <button className="quick-action">
                <span className="quick-icon blue-icon">
                  🚗
                </span>

                <div>
                  <strong>Thêm phương tiện</strong>
                  <small>Đăng ký xe mới</small>
                </div>
              </button>

              <button className="quick-action">
                <span className="quick-icon green-icon">
                  🅿️
                </span>

                <div>
                  <strong>Check-in</strong>
                  <small>Ghi nhận xe vào bãi</small>
                </div>
              </button>

              <button className="quick-action">
                <span className="quick-icon orange-icon">
                  🚪
                </span>

                <div>
                  <strong>Check-out</strong>
                  <small>Xe ra khỏi bãi</small>
                </div>
              </button>

              <button className="quick-action">
                <span className="quick-icon purple-icon">
                  💵
                </span>

                <div>
                  <strong>Thanh toán</strong>
                  <small>Ghi nhận giao dịch</small>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* ==================== HOẠT ĐỘNG GẦN ĐÂY ==================== */}
        <section className="card activity-card">
          <div className="card-header">
            <div>
              <h2>Hoạt động gần đây</h2>
              <p>Các thao tác mới nhất trên hệ thống</p>
            </div>

            <button className="view-button">
              Xem tất cả →
            </button>
          </div>

          <div className="activity-list">
            {/* Activity 1 */}
            <div className="activity">
              <div className="activity-icon blue-bg">
                🚗
              </div>

              <div className="activity-content">
                <strong>Check-in phương tiện</strong>
                <p>
                  Phương tiện 51B-99999 đã vào bãi
                </p>
              </div>

              <span className="activity-time">
                10 phút trước
              </span>
            </div>

            {/* Activity 2 */}
            <div className="activity">
              <div className="activity-icon green-bg">
                💰
              </div>

              <div className="activity-content">
                <strong>Thanh toán</strong>
                <p>
                  Thanh toán lượt gửi xe 5.000đ
                </p>
              </div>

              <span className="activity-time">
                20 phút trước
              </span>
            </div>

            {/* Activity 3 */}
            <div className="activity">
              <div className="activity-icon purple-bg">
                👤
              </div>

              <div className="activity-content">
                <strong>Cập nhật tài khoản</strong>
                <p>
                  Tài khoản Phạm Văn D đã được cập nhật
                </p>
              </div>

              <span className="activity-time">
                1 giờ trước
              </span>
            </div>
          </div>
        </section>

        {/* ==================== FOOTER ==================== */}
        <footer className="footer">
          <span>
            © 2026 Quản Lý Phương Tiện Chung Cư
          </span>

          <span>
            Phiên bản 1.0.0
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;