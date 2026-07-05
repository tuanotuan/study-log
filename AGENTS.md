Tạo một web app ghi lại quá trình học tập mỗi ngày.

Mục tiêu sản phẩm:
- Mỗi lần học xong, user tạo 1 “commit học tập”.
- 1 commit = 1 tấm ảnh + ghi chú ngắn + ngày học.
- Có biểu đồ đóng góp giống GitHub contribution graph.
- Có đăng nhập đơn giản.
- Có database lưu user, commit học tập, ảnh, ngày tháng.

Yêu cầu kỹ thuật:
- Nếu repo đã có stack sẵn thì dùng theo stack hiện tại.
- Nếu repo trống, hãy dùng Next.js + TypeScript + Tailwind + SQLite + Prisma.
- Auth đơn giản: register, login, logout bằng email/password.
- Password phải hash bằng bcrypt.
- Dùng session cookie hoặc JWT cookie.
- Ảnh upload lưu local trong thư mục `public/uploads`, database lưu đường dẫn ảnh.
- Database cần có tối thiểu:
  - User: id, email, passwordHash, createdAt
  - StudyCommit: id, userId, title, note, imageUrl, studyDate, createdAt

Các màn hình cần có:
1. Login page
   - Email
   - Password
   - Nút Login
   - Link sang Register

2. Register page
   - Email
   - Password
   - Confirm password
   - Sau khi đăng ký thành công thì login được

3. Dashboard page
   - Form tạo commit học tập:
     - title
     - note
     - studyDate
     - upload đúng 1 ảnh
   - Danh sách các commit gần đây
   - Mỗi commit hiển thị ảnh, title, note, ngày học
   - Có nút xóa commit

4. Contribution graph
   - Hiển thị dạng ô vuông giống GitHub
   - Mỗi ngày là 1 ô
   - Màu đậm dần theo số commit trong ngày
   - Hover vào ô hiện ngày + số commit
   - Có thống kê:
     - tổng số commit
     - streak hiện tại
     - ngày học nhiều nhất
     - số ngày có học

UX/UI:
- Giao diện sạch, dễ dùng, ưu tiên dashboard là màn hình chính.
- Responsive trên mobile và desktop.
- Không cần landing page marketing.
- Style giống GitHub contribution, tối giản, sáng sủa.

Yêu cầu code:
- Code rõ ràng, chia component hợp lý.
- Validate form đầy đủ.
- Không cho tạo commit nếu chưa login.
- Không cho user thấy/xóa commit của user khác.
- Thêm README hướng dẫn chạy project:
  - install dependencies
  - migrate database
  - run dev server
- Sau khi làm xong, chạy lint/build/test nếu có.
- Báo lại file chính đã sửa và cách chạy app.

Acceptance criteria:
- User có thể register/login/logout.
- User có thể tạo commit học tập với đúng 1 ảnh.
- Commit được lưu vào database.
- Dashboard reload lại vẫn thấy dữ liệu.
- Contribution graph phản ánh đúng số commit theo ngày.
- User A không thấy dữ liệu của User B.