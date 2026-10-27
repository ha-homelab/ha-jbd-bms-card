# JBD Battery & Cell Card — 한국어

[언어 목록](README.md) · [전체 영문 문서](../../README.md)

충전 상태, 배터리 팩 전압, 전류, 전력, 온도 및 개별 셀 전압을 표시하는 Home Assistant용 읽기 전용 카드입니다. 기존 숫자 엔티티를 사용하므로 Victron이나 Cerbo GX가 필요하지 않습니다. 인터페이스의 24개 언어를 모두 사용하려면 버전 0.2.0 이상이 필요합니다. 공개된 릴리스 노트를 확인하세요. 개발 문서는 최신 공개 릴리스보다 새로운 코드를 설명할 수 있습니다.

## 설치 및 구성

HACS에서 `https://github.com/ha-homelab/ha-jbd-bms-card`를 **사용자 지정 저장소**로 추가하고 유형은 **Dashboard**를 선택한 다음 원하는 릴리스를 다운로드하세요. 이 카드는 아직 기본 카탈로그에 포함되어 있지 않습니다. HACS가 등록하지 않았다면 다음 JavaScript 모듈을 등록하세요.

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

수동으로 설치하려면 릴리스의 `ha-jbd-bms-card.js`를 `/config/www/`에 복사하고 `/local/ha-jbd-bms-card.js`를 JavaScript 모듈로 등록하세요. 리소스 URL은 하나만 사용하고 브라우저를 새로 고침하세요. 기존 수동 설치를 교체하려면 [HACS, 업데이트 및 이전](../hacs.md)을 참고하세요.

Manual 카드를 추가하세요. 예제의 모든 엔티티 ID를 Home Assistant의 **개발자 도구 → 상태(Developer Tools → States)**에 있는 실제 ID로 바꾸세요.

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

배터리마다 목록 항목을 추가하세요. SOC, 팩 전압, 셀 목록은 필수이며 나머지 측정 항목은 선택 사항입니다. 동일한 BMS와 모니터에 속하는 셀을 선택하세요. 측정값을 누르면 HA의 기록 또는 세부 정보가 열리며 배터리에 명령을 보내지 않습니다.

## 언어

`language`를 생략하거나 `language: auto`를 사용하면 Home Assistant 프로필의 언어를 따릅니다. 이 카드의 언어를 한국어로 고정하려면 `language: ko`를 사용하세요. 지역별 언어 태그를 처리하며 지원하지 않는 언어는 영어로 표시합니다. 직접 지정한 이름과 엔티티 ID는 번역하지 않습니다. 모든 번역 사전이 카드에 포함되어 있어 외부 번역 서비스에 접속하지 않습니다. [언어 선택](../i18n.md)을 참고하세요.

## ESPHome 및 측정 품질

[ESPHome 배포 안내](../esphome-deployment.md)와 [펌웨어 프로젝트](https://github.com/victron-venus/esphome-jbd-bms-mqtt)의 지침을 따르세요. 프로젝트에서 유지 관리하는 각 프로필은 **BMS 4개, BMS당 셀 4개**를 전제로 합니다. Bluetooth 주소, Wi-Fi, MQTT 브로커를 비공개 설정으로 구성한 다음 HA에 MQTT 또는 ESPHome 통합을 추가하세요. 이 카드를 설치해도 ESP32에 펌웨어가 기록되거나 배터리 엔티티가 생성되지는 않습니다.

누락된 측정값은 누락 상태로 유지됩니다. 설정된 모든 셀에 유효한 값이 있을 때만 최고 셀 전압과 최저 셀 전압의 차이를 계산합니다. 색상은 표시용 임계값이며 BMS 보호 설정이 아닙니다. MQTT의 보관된 값이나 온라인 연결만으로 측정값이 최신임을 확인할 수는 없습니다. 필요한 경우 데이터 원본에서 유효 기간을 적용하세요. [구성 및 데이터 최신성](../configuration.md)과 별도 문서인 [Echo Dot 활용 가능성 평가](../echo-dot-bluetooth.md)를 참고하세요.
