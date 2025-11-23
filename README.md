# Jobs-Bridge App

## Mô tả dự án

Dự án xây dựng một ứng dụng di động và web tương tự TopCV, hỗ trợ kết nối giữa ứng viên (Candidates) và nhà tuyển dụng (Employers), với hệ thống quản trị (Admin) để quản lý toàn bộ nền tảng. Ứng dụng sử dụng các công nghệ hiện đại như React Native, Node.js và Supabase.

## Công nghệ sử dụng

- **React Native**: Phát triển ứng dụng di động đa nền tảng (iOS & Android)
- **Node.js**: Xây dựng backend RESTful API
- **Supabase**: Cơ sở dữ liệu, xác thực người dùng, lưu trữ file

## Các vai trò chính

- **Candidates (Ứng viên):**

  - Đăng ký, đăng nhập, cập nhật hồ sơ cá nhân
  - Tìm kiếm và ứng tuyển việc làm
  - Quản lý CV, theo dõi trạng thái ứng tuyển

- **Employers (Nhà tuyển dụng):**

  - Đăng ký, đăng nhập, tạo và quản lý tin tuyển dụng
  - Tìm kiếm, duyệt hồ sơ ứng viên
  - Quản lý danh sách ứng viên ứng tuyển

- **Admin (Quản trị viên):**
  - Quản lý người dùng (ứng viên, nhà tuyển dụng)
  - Quản lý tin tuyển dụng, kiểm duyệt nội dung
  - Thống kê, báo cáo hệ thống

## Kiến trúc tổng quan

- **Frontend:** React Native (Mobile), ReactJS (Web)
- **Backend:** Node.js (Express)
- **Database & Auth:** Supabase (PostgreSQL, Auth, Storage)

## Hướng dẫn cài đặt

1. Clone repository về máy:
   ```bash
   git clone https://github.com/CodeGang4/React_Native_CV_Finding_App.git
   ```
2. Cài đặt dependencies cho frontend và backend:
   ```bash
   cd client
   npm install
   cd employer
   npm install
   cd admin
   npm install
   cd ../backend
   npm install
   ```
3. Cấu hình kết nối Supabase trong file `.env` cho cả frontend và backend.
4. Chạy ứng dụng:
   - Frontend:
     ```bash
     npm start
     ```
   - Backend:
     ```bash
     npm run dev
     ```

## Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo Pull Request hoặc Issue để thảo luận thêm.

## Thành viên

    - Vũ Tuấn Kiên
    - Vũ Hồng Đăng
    - Nguyễn Thế Hưng

## License

MIT
