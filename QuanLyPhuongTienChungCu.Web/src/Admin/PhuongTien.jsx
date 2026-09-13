import React, { useState } from 'react';
import SidebarAdmin from '../layouts/sidebarAdmin';
import './PhuongTien.css';

const duLieuBanDau = [
  { id: 1, bienSo: '30A-123.45', loaiXe: 'Ô tô', cuDan: 'Nguyễn Văn A', canHo: 'A101', trangThai: 'Đang hoạt động' },
  { id: 2, bienSo: '51A-678.90', loaiXe: 'Xe máy', cuDan: 'Trần Thị B', canHo: 'B202', trangThai: 'Đang hoạt động' },
  { id: 3, bienSo: '29B-111.22', loaiXe: 'Ô tô', cuDan: 'Lê Văn C', canHo: 'C303', trangThai: 'Đang hoạt động' },
  { id: 4, bienSo: '50A-333.44', loaiXe: 'Xe máy', cuDan: 'Phạm Thị D', canHo: 'A104', trangThai: 'Đang hoạt động' },
  { id: 5, bienSo: '51C-555.66', loaiXe: 'Ô tô', cuDan: 'Hoàng Văn E', canHo: 'B105', trangThai: 'Đang hoạt động' },
];

const QuanLyPhuongTien = () => {
  const [tuKhoa, setTuKhoa] = useState('');
  const [danhSach] = useState(duLieuBanDau);

  const danhSachLoc = danhSach.filter(item =>
    item.bienSo.toLowerCase().includes(tuKhoa.toLowerCase()) ||
    item.cuDan.toLowerCase().includes(tuKhoa.toLowerCase()) ||
    item.canHo.toLowerCase().includes(tuKhoa.toLowerCase())
  );

  return (
    <div className="pt-wrapper">
      {/* Sidebar + Header chung */}
      <SidebarAdmin />

      {/* Nội dung chính */}
      <div className="pt-body">
        <div className="pt-title-bar">
          <h2>Phương tiện cư dân</h2>
          <button className="pt-btn-add">+ Thêm phương tiện</button>
        </div>

        <div className="pt-table-box">
          <div className="pt-table-search">
            <span>🔍</span>
            <input type="text" placeholder="Tìm kiếm biển số, tên cư dân, số căn..." />
          </div>

          <table className="pt-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Biển số xe</th>
                <th>Loại xe</th>
                <th>Cư dân</th>
                <th>Căn hộ</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {danhSachLoc.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.bienSo}</td>
                  <td>{item.loaiXe}</td>
                  <td>{item.cuDan}</td>
                  <td>{item.canHo}</td>
                  <td>
                    <span className="pt-status">{item.trangThai}</span>
                  </td>
                  <td className="pt-actions">
                    <button className="pt-edit">✏️</button>
                    <button className="pt-delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-pagination">
            <span>Hiển thị 1 - 5 trong 42 phương tiện</span>
            <div className="pt-pages">
              <button>1</button>
              <button>2</button>
              <button>3</button>
              <button>4</button>
              <button>5</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuanLyPhuongTien;