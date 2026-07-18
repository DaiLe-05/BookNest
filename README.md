# BookNest - Website bán sách trực tuyến

BookNest là dự án cá nhân do **Lê Quốc Đại** phát triển nhằm xây dựng một website bán sách fullstack hoàn chỉnh. Dự án tập trung vào các chức năng thường gặp trong một hệ thống thương mại điện tử như xem sản phẩm, tìm kiếm, lọc, giỏ hàng, đặt hàng, quản trị dữ liệu, phân quyền và xuất hóa đơn PDF.

[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Build-Vite%206-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Style-TailwindCSS-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%206-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%20%2B%20XAMPP-4479A1?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io/)

---

## Thông tin dự án

| Mục | Nội dung |
| --- | --- |
| **Tên dự án** | BookNest - Website bán sách trực tuyến |
| **Tác giả** | Lê Quốc Đại |
| **Hình thức** | Dự án cá nhân |
| **Mục đích** | Học tập, rèn luyện kỹ năng fullstack và bổ sung vào CV |
| **Loại dự án** | Website thương mại điện tử fullstack |

---

## Tác giả

| Họ và tên | Vai trò |
| --- | --- |
| Lê Quốc Đại | Fullstack Developer |

---

## Mục tiêu dự án

BookNest được xây dựng nhằm mô phỏng một hệ thống bán sách trực tuyến hoàn chỉnh theo mô hình fullstack. Dự án tập trung vào việc xây dựng đầy đủ các chức năng phổ biến của một website thương mại điện tử, đồng thời áp dụng các công nghệ hiện đại ở cả frontend, backend và database.

Các mục tiêu chính:

- Xây dựng giao diện website bán sách hiện đại, dễ sử dụng và responsive.
- Phát triển REST API bằng Node.js và Express.js.
- Quản lý cơ sở dữ liệu MySQL thông qua Prisma ORM.
- Sử dụng XAMPP/phpMyAdmin để dễ cài đặt và chạy database trên máy cá nhân.
- Tích hợp đăng ký, đăng nhập, xác thực JWT và mã hóa mật khẩu bằng Bcrypt.
- Phân quyền rõ ràng giữa người dùng và admin.
- Hỗ trợ tìm kiếm, lọc, sắp xếp và phân trang danh sách sách.
- Xây dựng giỏ hàng, đặt hàng, lịch sử đơn hàng và xuất hóa đơn PDF.
- Xây dựng trang quản trị để quản lý sách, danh mục, tác giả, nhà xuất bản, đơn hàng và người dùng.
- Tạo dữ liệu mẫu lớn gồm 20 thể loại, mỗi thể loại 20 quyển sách, tổng cộng 400 sách.

---

## Công nghệ sử dụng

### Backend - `backend/`

| Công nghệ | Phiên bản | Vai trò |
| --- | --- | --- |
| Node.js | >= 18.x | Môi trường chạy backend |
| Express.js | `^4.21.2` | Xây dựng REST API |
| Prisma ORM | `^6.0.0` | Làm việc với database |
| MySQL | - | Cơ sở dữ liệu |
| jsonwebtoken | `^9.0.2` | Xác thực JWT |
| bcryptjs | `^2.4.3` | Mã hóa mật khẩu |
| Multer | `^1.4.5-lts.1` | Upload ảnh bìa sách |
| PDFKit | `^0.15.2` | Tạo hóa đơn PDF |
| Zod | `^3.24.1` | Kiểm tra dữ liệu đầu vào |
| CORS | `^2.8.5` | Cho phép frontend gọi API |

### Frontend - `frontend/`

| Công nghệ | Phiên bản | Vai trò |
| --- | --- | --- |
| React | `^18.3.1` | Xây dựng giao diện |
| Vite | `^6.0.7` | Công cụ build và dev server |
| Tailwind CSS | `^3.4.17` | Thiết kế giao diện |
| React Router DOM | `^7.1.1` | Điều hướng trang |
| TanStack React Query | `^5.62.7` | Gọi API và cache dữ liệu |
| Zustand | `^5.0.2` | Quản lý trạng thái đăng nhập và giỏ hàng |
| Axios | `^1.7.9` | HTTP client |
| Lucide React | `^0.468.0` | Icon giao diện |

---

## Kiến trúc hệ thống

```txt
User / Browser
    -> http://localhost:5173
        -> React + Vite Frontend
            -> Axios / React Query
                -> http://localhost:4000/api
                    -> Express REST API
                        -> Prisma ORM
                            -> MySQL / XAMPP
```

Frontend và backend được tách riêng:

- Frontend chịu trách nhiệm hiển thị giao diện, xử lý thao tác người dùng, quản lý giỏ hàng và gọi API.
- Backend chịu trách nhiệm xử lý nghiệp vụ, xác thực, phân quyền, thao tác database, upload ảnh và xuất hóa đơn PDF.
- Database lưu trữ tài khoản, sách, danh mục, tác giả, nhà xuất bản, đơn hàng và chi tiết đơn hàng.

---

## Phân quyền hệ thống

| Vai trò | Quyền truy cập |
| --- | --- |
| **User** | Xem sách, tìm kiếm, lọc, thêm vào giỏ hàng, đặt hàng, xem lịch sử đơn hàng, tải hóa đơn PDF, cập nhật hồ sơ |
| **Admin** | Toàn quyền quản lý sách, danh mục, tác giả, nhà xuất bản, đơn hàng, người dùng và xem thống kê |

---

## Chức năng chi tiết

### Chức năng người dùng

- Đăng ký tài khoản.
- Đăng nhập, đăng xuất.
- Xem danh sách sách.
- Xem chi tiết sách.
- Tìm kiếm sách theo tên hoặc tác giả.
- Lọc sách theo danh mục, tác giả và khoảng giá.
- Sắp xếp sách theo mới nhất, giá tăng dần hoặc giá giảm dần.
- Phân trang danh sách sách.
- Thêm sách vào giỏ hàng.
- Tăng, giảm số lượng sản phẩm trong giỏ hàng.
- Xóa sản phẩm khỏi giỏ hàng.
- Đặt hàng.
- Xem lịch sử đơn hàng.
- Tải hóa đơn PDF.
- Cập nhật thông tin cá nhân.

### Chức năng admin

- Đăng nhập bằng tài khoản admin.
- Xem dashboard thống kê doanh thu, số đơn hàng, số sách, số người dùng và sách bán chạy.
- Thêm sách mới.
- Sửa thông tin sách bằng cửa sổ chỉnh sửa riêng.
- Upload và cập nhật ảnh bìa sách.
- Xóa sách.
- Quản lý danh mục sách.
- Quản lý tác giả.
- Quản lý nhà xuất bản.
- Quản lý đơn hàng.
- Cập nhật trạng thái đơn hàng.
- Quản lý người dùng.
- Cập nhật phân quyền user/admin.

### Chức năng nổi bật

- Dữ liệu mẫu lớn với 400 sách tiếng Việt có dấu.
- Ảnh minh họa sách dạng ảnh chụp thật.
- Bộ lọc sách trực quan, dễ sử dụng.
- Thanh điều hướng cố định khi cuộn trang.
- Giao diện responsive cho desktop, tablet và mobile.
- Hóa đơn PDF được tạo sau khi đặt hàng.
- Giỏ hàng được lưu ở trình duyệt bằng Zustand persist.

---

## Thiết kế database

Các bảng chính:

| Bảng | Mục đích |
| --- | --- |
| `User` | Lưu tài khoản, thông tin cá nhân và vai trò |
| `Category` | Lưu danh mục sách |
| `Author` | Lưu tác giả |
| `Publisher` | Lưu nhà xuất bản |
| `Book` | Lưu thông tin sách, giá, tồn kho và ảnh bìa |
| `Order` | Lưu thông tin đơn hàng |
| `OrderItem` | Lưu chi tiết từng sản phẩm trong đơn hàng |

Quan hệ chính:

- Một danh mục có nhiều sách.
- Một tác giả có nhiều sách.
- Một nhà xuất bản có nhiều sách.
- Một người dùng có nhiều đơn hàng.
- Một đơn hàng có nhiều chi tiết đơn hàng.
- Một chi tiết đơn hàng liên kết với một sách.

---

## Cấu trúc thư mục

```txt
Web_Sach/
├── backend/                         # Backend Node.js + Express
│   ├── prisma/
│   │   ├── schema.prisma            # Thiết kế database
│   │   └── seed.js                  # Tạo dữ liệu mẫu
│   ├── src/
│   │   ├── controllers/             # Xử lý request
│   │   ├── middleware/              # JWT, phân quyền, upload
│   │   ├── routes/                  # Khai báo API routes
│   │   └── server.js                # Entry point backend
│   ├── uploads/                     # Lưu ảnh upload
│   ├── .env.example                 # File cấu hình mẫu
│   └── package.json
│
├── frontend/                        # Frontend React + Vite
│   ├── src/
│   │   ├── api/
│   │   │   └── http.js              # Cấu hình Axios
│   │   ├── stores/
│   │   │   └── authStore.js         # Zustand store
│   │   ├── App.jsx                  # Giao diện và route chính
│   │   └── main.jsx                 # Entry point frontend
│   └── package.json
│
├── docs/
│   └── HUONG_DAN_DU_AN.md           # Tài liệu hướng dẫn dự án
│
└── README.md
```

---

## Hướng dẫn cài đặt và chạy local

### Yêu cầu

```txt
Node.js >= 18.x
npm >= 9.x
XAMPP
MySQL
```

### 1. Chuẩn bị database bằng XAMPP

1. Mở XAMPP Control Panel.
2. Start `Apache` và `MySQL`.
3. Mở phpMyAdmin:

```txt
http://localhost/phpmyadmin
```

4. Tạo database mới:

```txt
booknest
```

5. Chọn collation:

```txt
utf8mb4_unicode_ci
```

Nếu MySQL chạy ở port khác, ví dụ `3307`, cần sửa lại port trong `DATABASE_URL`.

### 2. Cài đặt và chạy backend

```bash
cd backend
npm install
copy .env.example .env
```

Mở file `backend/.env` và kiểm tra cấu hình:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
DATABASE_URL="mysql://root:@localhost:3306/booknest"
JWT_SECRET="change-this-secret-for-production"
JWT_EXPIRES_IN=7d
```

Nếu MySQL chạy ở port `3307`, đổi thành:

```env
DATABASE_URL="mysql://root:@localhost:3307/booknest"
```

Nếu MySQL có mật khẩu, ví dụ `123456`, đổi thành:

```env
DATABASE_URL="mysql://root:123456@localhost:3306/booknest"
```

Khởi tạo bảng và dữ liệu mẫu:

```bash
npx prisma migrate dev --name init
npm run seed
```

Chạy backend:

```bash
npm run dev
```

Backend chạy tại:

```txt
http://localhost:4000
```

### 3. Cài đặt và chạy frontend

Mở terminal mới:

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại:

```txt
http://localhost:5173
```

Nếu cần cấu hình API riêng, tạo file `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

---

## Tài khoản mẫu

Sau khi chạy `npm run seed`, hệ thống tạo sẵn tài khoản:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@booknest.test` | `Admin123!` |
| User | `user@booknest.test` | `User123!` |

---

## API Endpoints tổng quan

| Nhóm | Prefix | Mô tả |
| --- | --- | --- |
| Auth | `/api/auth` | Đăng ký, đăng nhập, lấy thông tin tài khoản, cập nhật hồ sơ |
| Books | `/api/books` | Danh sách sách, chi tiết sách, thêm, sửa, xóa sách |
| Categories | `/api/categories` | Quản lý danh mục sách |
| Authors | `/api/authors` | Quản lý tác giả |
| Publishers | `/api/publishers` | Quản lý nhà xuất bản |
| Orders | `/api/orders` | Đặt hàng, lịch sử đơn hàng, cập nhật trạng thái, hóa đơn PDF |
| Admin | `/api/admin` | Dashboard thống kê và quản lý người dùng |

---

## Dữ liệu mẫu

Lệnh seed tạo dữ liệu mẫu gồm:

- 20 thể loại sách.
- Mỗi thể loại có 20 quyển sách.
- Tổng cộng 400 sách.
- Sách có tên tiếng Việt có dấu.
- Có tác giả, nhà xuất bản, giá và tồn kho mẫu.
- Có ảnh minh họa dạng ảnh chụp thật.

Lưu ý: `npm run seed` sẽ làm mới dữ liệu mẫu. Nếu đã thêm dữ liệu riêng, nên cân nhắc trước khi chạy lại.

---

## Một số lỗi thường gặp

### MySQL trong XAMPP không start được

Nguyên nhân thường gặp:

- Port `3306` bị chương trình khác chiếm.
- XAMPP chưa chạy bằng quyền Administrator.
- MySQL bị lỗi dữ liệu cũ.

Cách xử lý:

- Mở XAMPP bằng quyền Administrator.
- Kiểm tra port bằng `Netstat`.
- Đổi MySQL sang port `3307`.
- Sửa lại `DATABASE_URL` trong `backend/.env`.

### Prisma báo lỗi `_prisma_migrations` hoặc tablespace

Nếu database cũ bị lỗi migration hoặc tablespace, có thể tạo database mới, ví dụ:

```txt
booknest2
```

Sau đó sửa `.env`:

```env
DATABASE_URL="mysql://root:@localhost:3306/booknest2"
```

Rồi chạy lại:

```bash
npx prisma migrate dev --name init
npm run seed
```

### Đăng nhập hoặc đặt hàng bị lỗi

Kiểm tra:

- Backend đang chạy.
- MySQL trong XAMPP đang chạy.
- Database đã được migrate và seed.
- Token đăng nhập không bị cũ.
- Nếu vừa chạy lại seed, hãy đăng xuất rồi đăng nhập lại.

---

## Hướng phát triển

- [ ] Tích hợp thanh toán online bằng VNPay, Momo hoặc Stripe.
- [ ] Thêm đánh giá và bình luận sách.
- [ ] Thêm danh sách yêu thích.
- [ ] Thêm mã giảm giá.
- [ ] Gửi email xác nhận đơn hàng.
- [ ] Quản lý nhập kho.
- [ ] Thống kê doanh thu theo tháng, quý, năm.
- [ ] Gợi ý sách liên quan theo danh mục hoặc tác giả.
- [ ] Tối ưu SEO và hiệu năng frontend.

---

## Liên hệ

Dự án được thực hiện bởi **Lê Quốc Đại**.  
Mọi thắc mắc hoặc góp ý có thể trao đổi trực tiếp với tác giả dự án.

---

**© 2025 - 2026 - BookNest - Personal Fullstack Project by Lê Quốc Đại**
