# 🌸 CẢ MỘT VƯỜN THƯƠNG — QUÀ TẶNG 20/10

> *"Dành bạn, cả một vườn thương."*  
> *"Từ một bông hoa, cả khu vườn đang thức giấc..."*

Website thiệp hoa 20/10 phong cách nghệ thuật được tái hiện từ video TikTok:
Bầu trời sớm mai trong vắt, ánh nắng mai ấm áp, đóa hoa hồng tâm điểm nở trước, kéo theo cả khu vườn 50+ đóa hoa đủ màu sắc (hồng, xanh bạc hà, xanh dương pastel, cam đào, vàng kem) thức giấc, cùng những cành hoa đồng nội vươn cao trong gió.

---

## ✨ Các tính năng nổi bật

1. **Procedural English Cabbage Roses (Hoa hồng xếp cánh đa tầng)**:
   - Tái hiện chính xác hình ảnh đóa hoa hồng trà/mẫu đơn cánh cuộn tròn lượn sóng trong video.
   - 5 bảng màu pastel botanical: Hồng phấn, Xanh bạc hà (Mint/Sage), Xanh dương pastel, Cam đào (Coral Peach), Vàng kem (Buttercream).
   - Đường nét viền sắc sảo, độ chuyển màu gradient tự nhiên, đọng giọt sương sớm lấp lánh.
2. **Hoa đồng nội Pom-pom vươn cao**:
   - Cành thanh mảnh, hoa tròn bung tỏa bồng bềnh trên nền trời cao.
3. **Hiệu ứng nở tuần tự (Awakening Animation)**:
   - Bông hoa hồng lớn ở vị trí trung tâm nở bung cánh trước.
   - Xuất hiện thông điệp: *"Từ một bông hoa, cả khu vườn đang thức giấc..."*.
   - Hàng chục đóa hoa vươn cành và nở rộ lan tỏa khắp màn hình.
4. **Vật lý gió tự nhiên & Tương tác sống động**:
   - Cành hoa và lá đung đưa nhịp nhàng theo làn gió sớm.
   - Rê chuột / chạm ngón tay: Hoa nghiêng ngả nhẹ nhàng theo cử động.
   - **Click / Chạm bất kỳ đâu: Gieo thêm một đóa hoa mới ngay tại điểm chạm!**
5. **Âm nhạc Piano Lo-fi tích hợp sẵn (Web Audio API)**:
   - Giai điệu Canon in D êm dịu được tổng hợp trực tiếp bằng mã JavaScript.
   - Không phụ thuộc vào file MP3 bên ngoài, không lo lỗi bản quyền hay lỗi đường truyền.
6. **Bức thư tình 20/10 (Glassmorphism Modal)**:
   - Nút *"Mở thiệp 20/10"* mở ra phong thư lãng mạn với lời chúc ngọt ngào.
   - **Có thể chỉnh sửa trực tiếp tên người nhận (ví dụ: Em, Linh, Mai,...)** và lưu tự động.
   - Nút *"Thả tim tặng hoa"* bung pháo tim rực rỡ.
7. **Chụp ảnh kỷ niệm (Snapshot)**:
   - Nút 📸 tự động chụp lại khu vườn với dấu mộc chữ thư pháp để lưu về máy.

---

## 🚀 Hướng Dẫn Deploy Lên Vercel (Trong 1 Phút)

Website hoàn toàn là Static Web (HTML, CSS, JS thuần), cực kỳ nhẹ, tối ưu 100% cho Vercel.

### Cách 1: Deploy qua Vercel CLI (Nhanh nhất từ Terminal)

1. Mở PowerShell hoặc Command Prompt tại thư mục dự án:
   ```bash
   cd d:\prj2010forU
   ```

2. Chạy lệnh deploy:
   ```bash
   npx vercel
   ```

3. Vercel CLI sẽ hỏi một vài câu hỏi ngắn:
   - *Set up and deploy “d:\prj2010forU”?* ➔ Chọn **Y**
   - *Which scope do you want to deploy to?* ➔ Chọn tài khoản của bạn (Enter)
   - *Link to existing project?* ➔ Chọn **N**
   - *What’s your project’s name?* ➔ Nhập tên (ví dụ: `ca-mot-vuon-thuong-2010`)
   - *In which directory is your code located?* ➔ Nhấn **Enter** (`./`)
   - Chờ ~15 giây, bạn sẽ nhận được liên kết Production trực tiếp (dạng `https://ca-mot-vuon-thuong-2010.vercel.app`)!

4. Để deploy phiên bản chính thức (Production):
   ```bash
   npx vercel --prod
   ```

---

### Cách 2: Deploy qua GitHub + Vercel Dashboard (Khuyên dùng)

1. Tạo một repository mới trên [github.com](https://github.com/new) (ví dụ: `vuon-hoa-2010`).
2. Đẩy toàn bộ mã nguồn lên:
   ```bash
   cd d:\prj2010forU
   git init
   git add .
   git commit -m "🌸 Cả một vườn thương 20/10"
   git branch -M main
   git remote add origin https://github.com/<tên-user-github>/vuon-hoa-2010.git
   git push -u origin main
   ```
3. Truy cập [vercel.com](https://vercel.com) ➔ Đăng nhập ➔ Bấm **"Add New..."** ➔ **"Project"**.
4. Chọn repository `vuon-hoa-2010` và bấm **"Deploy"**.
5. Sau 20 giây bạn sẽ có ngay đường link HTTPS vĩnh viễn để gửi tặng bạn nữ!

---

## 📱 Khả năng tương thích
- Hoạt động mượt mà trên iPhone, iPad, Android, MacBook, Windows PC.
- Chạy offline được ngay lập tức bằng cách click đúp vào file `index.html`.
