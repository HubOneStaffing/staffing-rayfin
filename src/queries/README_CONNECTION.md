# Power BI Semantic Model — Staffing Rayfin

- Workspace: `PO Project` (`8ae93cdf-8dcf-4c9a-b238-5c7616194909`)
- Semantic Model: `Staffing Dash Rayfin App` (`5fd5ae0b-e139-49b5-8a59-e741fb5fd1a6`)
- `src/services/staffingFilters.ts`: mapping của chín bộ lọc chung HC và Turnover.
- `src/services/headcountApi.ts`: contract JSON đến backend, chưa gọi vào UI.
- `src/queries/headcount/*.dax`: truy vấn measure tách riêng, là mẫu ban đầu chưa có filter context.

## Chưa hoàn thành

1. IT/Microsoft Entra xác nhận đăng nhập, quyền Build + Execute Queries REST API.
2. Backend xác thực phía server, whitelist bộ lọc và truy vấn DAX parameterized an toàn.
3. API `/api/powerbi/filter-options` trả danh mục từ semantic model.
4. API `/api/powerbi/headcount` trả KPI, sau đó nối hooks/component từng phần.
5. Đối chiếu 2026/T9/Galderma: 79 actual, 79 plan, 4 new, 3 resign.
6. HC Plan hiện chưa đủ phân bổ Region/Channel/Province; null/missing khác với số 0.

## Lưu ý

Không đưa bearer token, client secret, tenant credential vào `src`, `VITE_*` hay zip frontend.
Tất cả chart còn hiển thị demo cho đến khi backend và phép đối chiếu hoàn tất.
