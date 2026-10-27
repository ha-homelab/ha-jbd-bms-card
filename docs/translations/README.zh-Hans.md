# JBD Battery & Cell Card — 简体中文

[语言](README.md) · [完整英文文档](../../README.md)

这是一张只读的 Home Assistant 卡片，用于显示电量、整组电池电压、电流、功率、温度以及各个电芯的电压。卡片使用已有的数值实体，不需要 Victron 或 Cerbo GX。支持全部 24 种界面语言需要 0.2.0 或更新版本。请查看已发布版本的发行说明；开发文档可能描述比最新发布版本更新的代码。

## 安装与配置

在 HACS 中将 `https://github.com/ha-homelab/ha-jbd-bms-card` 添加为**自定义仓库**，类型选择 **Dashboard**，然后下载所需版本。卡片尚未列入默认目录。如果 HACS 尚未注册以下 JavaScript 模块，请手动注册：

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

手动安装时，将发布版本中的 `ha-jbd-bms-card.js` 复制到 `/config/www/`，并将 `/local/ha-jbd-bms-card.js` 注册为 JavaScript 模块。只保留一个资源 URL，然后重新加载浏览器。要替换已有的手动安装副本，请参阅 [HACS、更新与迁移](../hacs.md)。

添加一张 Manual 卡片。将示例中的每个实体 ID 替换为 Home Assistant **开发者工具 → 状态（Developer Tools → States）**中的实际 ID：

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

每增加一组电池，就在列表中添加一项。SOC、整组电压和电芯列表是必填项，其他测量项可选。请选择属于同一个 BMS 和监测设备的电芯。点击读数会打开该实体在 HA 中的历史记录或详情，不会向电池发送命令。

## 语言

省略 `language` 或使用 `language: auto` 即可跟随 Home Assistant 个人资料中的语言设置。使用 `language: zh-Hans` 可以将这张卡片固定为简体中文。卡片会处理地区语言标签，不支持的语言会回退为英语。用户自行设置的名称和实体 ID 不会被翻译。所有翻译词典都随卡片提供，不会连接任何翻译服务。请参阅[语言选择](../i18n.md)。

## ESPHome 与测量质量

请按照 [ESPHome 部署指南](../esphome-deployment.md)和[固件项目](https://github.com/victron-venus/esphome-jbd-bms-mqtt)进行配置。该项目维护的每个配置方案都要求**四个 BMS，每个 BMS 有四个电芯**。请私下配置 Bluetooth 地址、Wi-Fi 和 MQTT broker，然后在 HA 中添加 MQTT 或 ESPHome 集成。安装此卡片不会为 ESP32 烧录固件，也不会创建电池实体。

缺失的读数仍会显示为缺失。仅当所有已配置电芯都有有效值时，卡片才会计算最高与最低电芯电压之间的差值。颜色表示显示阈值，并非 BMS 保护设置。MQTT 保留值和在线连接并不能证明测量数据是最新的；有需要时，应在数据来源端设置过期机制。请参阅[配置与数据时效性](../configuration.md)以及单独的 [Echo Dot 可行性评估](../echo-dot-bluetooth.md)。
