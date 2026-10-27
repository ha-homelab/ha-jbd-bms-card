# JBD Battery & Cell Card — 日本語

[言語一覧](README.md) · [英語の完全なドキュメント](../../README.md)

充電率、バッテリーパックの電圧、電流、電力、温度、各セルの電圧を表示する、Home Assistant 用の読み取り専用カードです。既存の数値エンティティを使用するため、Victron や Cerbo GX は不要です。全24言語のインターフェースを利用するには、バージョン 0.2.0 以降が必要です。公開済みのリリースノートを確認してください。開発用ドキュメントには、最新の公開版よりも新しいコードの説明が含まれる場合があります。

## インストールと設定

HACS で `https://github.com/ha-homelab/ha-jbd-bms-card` を **カスタムリポジトリ** として追加し、種類は **Dashboard** を選んで、必要なリリースをダウンロードします。このカードはまだ標準カタログには登録されていません。HACS が自動で登録していない場合は、次の JavaScript モジュールを登録してください。

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

手動でインストールする場合は、リリースの `ha-jbd-bms-card.js` を `/config/www/` にコピーし、`/local/ha-jbd-bms-card.js` を JavaScript モジュールとして登録します。リソース URL は1つだけにして、ブラウザーを再読み込みしてください。既存の手動インストールから切り替える場合は、[HACS・更新・移行](../hacs.md)を参照してください。

Manual カードを追加します。例のエンティティ ID はすべて、Home Assistant の **開発者ツール → 状態（Developer Tools → States）** にある実際の ID に置き換えてください。

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

バッテリーを追加するたびに、リストに項目を追加します。SOC、パック電圧、セル一覧は必須で、その他の測定項目は省略できます。同じ BMS とモニターに属するセルを選んでください。測定値をタップすると HA の履歴や詳細が開きます。バッテリーにコマンドは送信しません。

## 言語

`language` を省略するか `language: auto` にすると、Home Assistant のプロフィールの言語に従います。このカードを日本語に固定するには、`language: ja` を指定します。地域別の言語タグを解決し、対応していない言語では英語にフォールバックします。自分で付けた名前やエンティティ ID は翻訳されません。翻訳辞書はすべてカードに同梱されており、翻訳サービスへの通信は行いません。[言語の選択](../i18n.md)を参照してください。

## ESPHome と測定データの品質

[ESPHome の導入ガイド](../esphome-deployment.md)と[ファームウェアプロジェクト](https://github.com/victron-venus/esphome-jbd-bms-mqtt)に従ってください。このプロジェクトで保守されている各プロファイルは、**BMS 4台、各 BMS に4セル**の構成を想定しています。Bluetooth アドレス、Wi-Fi、MQTT ブローカーは非公開の設定として入力し、その後 HA に MQTT または ESPHome インテグレーションを追加します。このカードのインストールだけでは、ESP32 への書き込みやバッテリーエンティティの作成は行われません。

欠測値は欠測のまま表示されます。設定したすべてのセルに有効な値がある場合にのみ、最高セル電圧と最低セル電圧の差を計算します。色は表示上のしきい値であり、BMS の保護設定ではありません。MQTT の保持値やオンライン接続だけでは、測定値が新しいとは判断できません。必要に応じてデータの取得元で有効期限を設定してください。[設定とデータの鮮度](../configuration.md)、および別文書の [Echo Dot 利用の実現可能性評価](../echo-dot-bluetooth.md)を参照してください。
