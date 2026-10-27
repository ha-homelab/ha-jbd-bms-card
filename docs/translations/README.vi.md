# JBD Battery & Cell Card — Tiếng Việt

[Ngôn ngữ](README.md) · [Tài liệu đầy đủ bằng tiếng Anh](../../README.md)

Thẻ Home Assistant chỉ đọc để hiển thị mức sạc, điện áp bộ pin, dòng điện, công suất, nhiệt độ và điện áp từng cell. Thẻ sử dụng các thực thể số đã có; không cần Victron hay Cerbo GX. Để hỗ trợ đủ 24 ngôn ngữ giao diện, cần phiên bản 0.2.0 trở lên. Hãy xem ghi chú của bản phát hành đã công bố; tài liệu phát triển có thể mô tả mã mới hơn bản phát hành gần nhất.

## Cài đặt và cấu hình

Trong HACS, thêm `https://github.com/ha-homelab/ha-jbd-bms-card` dưới dạng **kho tùy chỉnh (custom repository)**, chọn loại **Dashboard** rồi tải bản phát hành mong muốn. Thẻ chưa có trong danh mục mặc định. Nếu HACS chưa đăng ký, hãy đăng ký mô-đun JavaScript sau:

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

Để cài thủ công, sao chép `ha-jbd-bms-card.js` của bản phát hành vào `/config/www/` và đăng ký `/local/ha-jbd-bms-card.js` làm mô-đun JavaScript. Chỉ sử dụng một URL tài nguyên rồi tải lại trình duyệt. Xem [HACS, cập nhật và chuyển đổi](../hacs.md) để thay thế bản đã cài thủ công.

Thêm một thẻ Manual. Thay mọi ID thực thể trong ví dụ bằng ID thực tế từ **Công cụ nhà phát triển → Trạng thái (Developer Tools → States)** của Home Assistant:

```yaml
type: custom:ha-jbd-bms-card
language: auto
batteries:
  - name: Battery 1
    soc: sensor.my_battery_soc
    voltage: sensor.my_battery_voltage
    current: sensor.my_battery_current
    power: sensor.my_battery_power
    temperature: sensor.my_battery_temperature
    cells:
      - sensor.my_battery_cell_1
      - sensor.my_battery_cell_2
      - sensor.my_battery_cell_3
      - sensor.my_battery_cell_4
```

Thêm một mục trong danh sách cho mỗi bộ pin. SOC, điện áp bộ pin và danh sách cell là bắt buộc; các phép đo còn lại là tùy chọn. Chọn các cell thuộc cùng một BMS và thiết bị giám sát. Chạm vào một giá trị sẽ mở lịch sử hoặc thông tin chi tiết trong HA, không gửi lệnh đến pin.

## Ngôn ngữ

Bỏ qua `language` hoặc dùng `language: auto` để theo ngôn ngữ trong hồ sơ Home Assistant. Dùng `language: vi` để cố định tiếng Việt cho thẻ này. Các mã ngôn ngữ theo vùng được xử lý; ngôn ngữ không được hỗ trợ sẽ chuyển về tiếng Anh. Tên do bạn đặt và ID thực thể không bao giờ được dịch. Toàn bộ từ điển dịch được đóng gói sẵn; thẻ không liên hệ dịch vụ dịch thuật nào. Xem [chọn ngôn ngữ](../i18n.md).

## ESPHome và chất lượng phép đo

Làm theo [hướng dẫn triển khai ESPHome](../esphome-deployment.md) và [dự án firmware](https://github.com/victron-venus/esphome-jbd-bms-mqtt). Mỗi cấu hình được duy trì trong dự án đều yêu cầu **bốn BMS, mỗi BMS có bốn cell**. Thiết lập riêng tư địa chỉ Bluetooth, Wi-Fi và MQTT broker, sau đó thêm tích hợp MQTT hoặc ESPHome vào HA. Cài thẻ này không nạp firmware cho ESP32 và không tạo thực thể pin.

Giá trị bị thiếu vẫn được hiển thị là thiếu. Thẻ chỉ tính chênh lệch giữa điện áp cell cao nhất và thấp nhất khi tất cả cell đã cấu hình đều có giá trị hợp lệ. Màu sắc là các ngưỡng hiển thị, không phải thiết lập bảo vệ của BMS. Các giá trị MQTT được giữ lại và kết nối trực tuyến không chứng minh phép đo còn mới; hãy áp dụng thời hạn dữ liệu tại nguồn khi cần. Xem [cấu hình và độ mới của dữ liệu](../configuration.md) cùng tài liệu riêng [đánh giá khả năng sử dụng Echo Dot](../echo-dot-bluetooth.md).
