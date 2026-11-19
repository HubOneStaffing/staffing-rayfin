# Staffing Rayfin — bàn giao giao diện

## Đã kiểm tra

- TypeScript: `npx tsc -b` chạy thành công.
- Giao diện Vite: `npx vite build` chạy thành công.
- Giữ nguyên các component và giao diện Headcount / Turnover từ source Ninh cung cấp.
- Menu điều hướng hoạt động cho: Tổng quan, HC, Turnover, Recruitment, Attendance, Payroll.
- Bốn module chưa có dữ liệu thực dùng khung KPI, biểu đồ, bảng chung; giá trị để `—` để không tạo số liệu giả.
- Đã sửa import thiếu `@/types/visual.types` và `@/config/workforce-structure.config` của component `StructureViewSelector` không được đóng gói trong source.

## Chưa hoàn tất

1. Chưa kết nối DAX thật. Trong source hiện có, `src/services/headcountApi.ts` là hợp đồng `/api/powerbi` chưa có backend; **đừng xem đây là API đang hoạt động**.
2. Chưa có định nghĩa KPI/DAX hoặc layout cuối cùng cho Recruitment, Attendance và Payroll; các page này hiện là khung để hoàn thiện khi có đặc tả dữ liệu.
3. Chưa cập nhật App Fabric `staffing-rayfin-app` và chưa bảo đảm link cũ sẽ được giữ. Không chạy `npx rayfin up` khi chưa xác nhận đúng deployment ID.
4. Fabric CLI đã tìm thấy Semantic Model `Staffing Dash Rayfin App`, nhưng thông báo `workspaceRole: Viewer` / `addEligible: false` khi dùng connector search. Cần quyền đủ điều kiện hoặc người có quyền thực hiện cấu hình connector.

## Cách mở giao diện ở máy Ninh

1. Dùng thư mục này làm project trong VS Code (không trộn đè vào bản cũ nếu chưa backup).
2. `npm ci`
3. `npm run dev`
4. Mở URL localhost do Vite in ra.

## Nguồn dữ liệu sẽ sử dụng

- Workspace: `PO Project`, ID `8ae93cdf-8cdf-4c9a-b238-5c7616194909`
- Semantic Model: `Staffing Dash Rayfin App`, ID `5fd5ae0b-e139-49b5-8a59-e741fb5fd1a6`
- DAX dùng lại measure từ Semantic Model; không tính KPI bằng dữ liệu giả trong React.
- `F_HC PLAN` hiện chưa đầy đủ Channel/Region/Old Province cho phân tích chi tiết; không diễn giải giá trị Blank thành 0.

## App dự định sử dụng

- Fabric App hiện hữu: `staffing-rayfin-app`, item ID `dccb9988-7725-4424-bbb4-252cc733f2ee`.
- Chỉ khi xác nhận quyền Edit và cấu hình deployment mới cập nhật App này.

## Lưu ý cấu hình

Project `rayfin/rayfin.yml` hiện mang ID `staffing-dash-rayfin` (project local mới), không tự động liên kết với App `staffing-rayfin-app` hiện hữu. Không đổi ID rồi deploy như một cách nối App nếu chưa đối chiếu metadata deployment.
