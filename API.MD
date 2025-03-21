# Quy trình xử lý hình ảnh, video và thumbnail

## 1. Quy trình tải lên (Upload)

### Khi tạo mới sản phẩm:

1. **Chuẩn bị dữ liệu**: 
   - Frontend gửi request có dạng `multipart/form-data` bao gồm:
     - Các trường thông tin sản phẩm (name, price, description, v.v.)
     - File thumbnail (một file)
     - Các file hình ảnh (một hoặc nhiều file)
     - Các file video (một hoặc nhiều file)

2. **Xử lý trên server**:
   - Backend nhận request và lưu thông tin sản phẩm vào database
   - Backend lưu các file vào MongoDB GridFS:
     - Mỗi file được gán một ID duy nhất trong GridFS
     - Backend lưu các ID này vào document của sản phẩm

3. **Kết quả trả về**:
   - Backend trả về thông tin sản phẩm kèm theo các ID file đã lưu
   - Frontend lưu lại ID sản phẩm và ID các file để hiển thị

### Khi cập nhật sản phẩm:

1. **Chuẩn bị dữ liệu**: 
   - Frontend gửi request có dạng `multipart/form-data` bao gồm:
     - ID sản phẩm cần cập nhật
     - Các trường thông tin cần cập nhật
     - File thumbnail mới (nếu cập nhật)
     - Các file hình ảnh mới (nếu cập nhật)
     - Các file video mới (nếu cập nhật)

2. **Xử lý trên server**:
   - Backend kiểm tra xem có file mới được tải lên không
   - Nếu có file mới:
     - Xóa file cũ từ GridFS (nếu có)
     - Lưu file mới vào GridFS và nhận ID mới
     - Cập nhật ID file mới vào document sản phẩm

3. **Kết quả trả về**:
   - Backend trả về thông tin sản phẩm đã cập nhật kèm theo các ID file mới

## 2. Quy trình hiển thị

### Lấy thông tin sản phẩm:

1. **Yêu cầu từ client**:
   - Frontend gửi request để lấy thông tin chi tiết sản phẩm
   - Backend trả về thông tin sản phẩm bao gồm ID của thumbnail, images và videos

2. **Xử lý trên client**:
   - Frontend nhận được thông tin sản phẩm cùng ID các file media
   - Frontend sẽ sử dụng các ID này để lấy nội dung file

### Lấy nội dung file:

1. **Yêu cầu từ client**:
   - Frontend gửi request đến endpoint `/api/products/files/{file_id}`
   - Backend kiểm tra ID file trong GridFS

2. **Xử lý trên server**:
   - Backend tìm kiếm file trong GridFS theo ID
   - Nếu tìm thấy, backend trả về nội dung file với loại MIME tương ứng
   - Nếu không tìm thấy, backend trả về lỗi 404

3. **Hiển thị trên client**:
   - Frontend nhận nội dung file và hiển thị tương ứng:
     - Thumbnail: Hiển thị như hình ảnh chính của sản phẩm
     - Images: Hiển thị trong gallery hoặc slider ảnh
     - Videos: Hiển thị kèm theo player để phát video

## 3. Xử lý lỗi

1. **File không tồn tại**:
   - Nếu file ID không tồn tại trong GridFS, backend trả về lỗi 404
   - Frontend hiển thị ảnh placeholder mặc định

2. **File không hợp lệ**:
   - Nếu file có vấn đề (định dạng không đúng, nội dung lỗi), backend trả về lỗi
   - Frontend hiển thị thông báo lỗi hoặc ảnh placeholder

## 4. Lưu ý quan trọng

1. **Định dạng file hỗ trợ**:
   - Images: JPEG, PNG, GIF
   - Videos: MP4, WebM

2. **Giới hạn kích thước**:
   - Thumbnail: Tối đa 2MB
   - Images: Tối đa 5MB mỗi file
   - Videos: Tối đa 20MB mỗi file

3. **Cấu trúc URL cho hiển thị file**:
   - Thumbnail: `/api/products/files/{thumbnail_id}`
   - Images: `/api/products/files/{image_id}`
   - Videos: `/api/products/files/{video_id}`

4. **Cơ chế bộ nhớ cache**:
   - Frontend nên cache file đã tải để tránh tải lại nhiều lần
   - Các file được phục vụ với header cache phù hợp

## 5. Vấn đề thường gặp và cách khắc phục

### Lỗi 404 khi truy cập file trong GridFS

**Nguyên nhân phổ biến**:
- Xung đột tên cơ sở dữ liệu trong cấu hình MongoDB
- ID file không tồn tại hoặc đã bị xóa
- Kết nối tới database sai

**Cách khắc phục**:
1. **Xung đột tên database**:
   - Trong file `database.py` có thể cấu hình tên database khác với tên được sử dụng trong API endpoint
   - Kiểm tra cấu hình kết nối trong endpoint `/api/products/files/{file_id}`
   - Đảm bảo tên database trong `.env` và trong code là giống nhau: 
     ```
     # Trong .env
     DB_NAME=product_catalog
     
     # Trong code endpoint
     db = client.product_catalog  # Không phải client.tech_laptop_db
     ```

2. **Kiểm tra dữ liệu**:
   - Sử dụng MongoDB Compass hoặc mongo shell để kiểm tra file trong GridFS:
     ```
     use product_catalog
     db.fs.files.find({_id: ObjectId("file_id_here")})
     ```
   - Nếu không tìm thấy, file có thể đã bị xóa hoặc chưa được lưu đúng

3. **Xử lý lỗi trong frontend**:
   - Luôn đặt ảnh placeholder mặc định cho trường hợp ảnh không tải được
   - Cài đặt xử lý lỗi trong các component hiển thị media để tránh giao diện bị vỡ

### Lỗi khi tải file lên

**Nguyên nhân phổ biến**:
- Kích thước file vượt quá giới hạn
- Định dạng file không được hỗ trợ
- Quyền truy cập vào MongoDB GridFS bị giới hạn

**Cách khắc phục**:
1. **Giới hạn dung lượng**:
   - Kiểm tra và thay đổi giới hạn dung lượng file trong cấu hình server
   - Thêm validation trên frontend để kiểm tra kích thước file trước khi gửi

2. **Định dạng file**:
   - Kiểm tra và chỉ cho phép các định dạng file được hỗ trợ
   - Hiển thị thông báo rõ ràng cho người dùng về các định dạng được chấp nhận

3. **Quyền truy cập**:
   - Kiểm tra quyền truy cập vào MongoDB
   - Kiểm tra cấu hình của GridFS collection trong database
