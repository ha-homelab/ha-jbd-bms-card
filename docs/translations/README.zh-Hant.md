# JBD Battery & Cell Card — 繁體中文

[語言](README.md) · [完整英文文件](../../README.md)

這是一張唯讀的 Home Assistant 卡片，用於顯示電量、整組電池電壓、電流、功率、溫度及各個電芯的電壓。卡片使用現有的數值實體，不需要 Victron 或 Cerbo GX。支援全部 24 種介面語言需要 0.2.0 或更新版本。請查看已發布版本的發行說明；開發文件可能描述比最新發布版本更新的程式碼。

## 安裝與設定

在 HACS 中將 `https://github.com/ha-homelab/ha-jbd-bms-card` 加入為**自訂儲存庫**，類型選擇 **Dashboard**，然後下載所需版本。卡片尚未列入預設目錄。如果 HACS 尚未註冊以下 JavaScript 模組，請手動註冊：

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

手動安裝時，將發布版本中的 `ha-jbd-bms-card.js` 複製到 `/config/www/`，並將 `/local/ha-jbd-bms-card.js` 註冊為 JavaScript 模組。只保留一個資源 URL，然後重新載入瀏覽器。若要取代現有的手動安裝副本，請參閱 [HACS、更新與移轉](../hacs.md)。

新增一張 Manual 卡片。將範例中的每個實體 ID 替換為 Home Assistant **開發者工具 → 狀態（Developer Tools → States）**中的實際 ID：

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

每增加一組電池，就在清單中新增一個項目。SOC、整組電壓和電芯清單是必填項目，其他測量項目可省略。請選擇屬於同一個 BMS 和監測裝置的電芯。點選讀值會開啟該實體在 HA 中的歷史記錄或詳細資訊，不會向電池傳送指令。

## 語言

省略 `language` 或使用 `language: auto` 即可跟隨 Home Assistant 個人檔案中的語言設定。使用 `language: zh-Hant` 可以將這張卡片固定為繁體中文。卡片會處理地區語言標籤，不支援的語言會回退為英文。使用者自行設定的名稱和實體 ID 不會被翻譯。所有翻譯字典都隨卡片提供，不會連線至任何翻譯服務。請參閱[語言選擇](../i18n.md)。

## ESPHome 與測量品質

請依照 [ESPHome 部署指南](../esphome-deployment.md)和[韌體專案](https://github.com/victron-venus/esphome-jbd-bms-mqtt)進行設定。該專案維護的每個設定方案都要求**四個 BMS，每個 BMS 有四個電芯**。請私下設定 Bluetooth 位址、Wi-Fi 和 MQTT broker，然後在 HA 中新增 MQTT 或 ESPHome 整合。安裝此卡片不會為 ESP32 燒錄韌體，也不會建立電池實體。

缺少的讀值仍會顯示為缺少。只有在所有已設定電芯都有有效值時，卡片才會計算最高與最低電芯電壓之間的差值。顏色表示顯示門檻，並非 BMS 保護設定。MQTT 保留值與線上連線並不能證明測量資料是最新的；有需要時，應在資料來源端設定過期機制。請參閱[設定與資料時效性](../configuration.md)以及獨立文件 [Echo Dot 可行性評估](../echo-dot-bluetooth.md)。
