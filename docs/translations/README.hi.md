# JBD Battery & Cell Card — हिन्दी

[भाषाएँ](README.md) · [पूरा अंग्रेज़ी दस्तावेज़](../../README.md)

Home Assistant का यह कार्ड केवल जानकारी दिखाता है: चार्ज की स्थिति, बैटरी पैक का वोल्टेज, करंट, पावर, तापमान और हर सेल का वोल्टेज। यह मौजूदा संख्यात्मक एंटिटी के साथ काम करता है; Victron या Cerbo GX की आवश्यकता नहीं है। इंटरफ़ेस की सभी 24 भाषाओं के लिए संस्करण 0.2.0 या नया चाहिए। प्रकाशित संस्करण के रिलीज़ नोट देखें; विकास संबंधी दस्तावेज़ में नवीनतम रिलीज़ से नए कोड का विवरण हो सकता है।

## इंस्टॉल और कॉन्फ़िगर करें

HACS में `https://github.com/ha-homelab/ha-jbd-bms-card` को **custom repository** के रूप में जोड़ें, प्रकार **Dashboard** चुनें और मनचाहा संस्करण डाउनलोड करें। कार्ड अभी डिफ़ॉल्ट कैटलॉग में नहीं है। अगर HACS ने ऐसा नहीं किया है तो यह JavaScript module पंजीकृत करें:

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

मैन्युअल इंस्टॉलेशन के लिए रिलीज़ की `ha-jbd-bms-card.js` फ़ाइल को `/config/www/` में कॉपी करें और `/local/ha-jbd-bms-card.js` को JavaScript module के रूप में पंजीकृत करें। केवल एक resource URL रखें, फिर ब्राउज़र दोबारा लोड करें। पहले से मैन्युअली इंस्टॉल कॉपी को बदलने के लिए [HACS, अपडेट और माइग्रेशन](../hacs.md) देखें।

एक Manual कार्ड जोड़ें। उदाहरण की हर entity ID को Home Assistant के **Developer Tools → States** में उपलब्ध वास्तविक ID से बदलें:

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

हर बैटरी के लिए सूची में एक और प्रविष्टि जोड़ें। SOC, पैक वोल्टेज और सेल की सूची आवश्यक हैं; अन्य माप वैकल्पिक हैं। एक ही BMS और मॉनिटर से संबंधित सेल चुनें। किसी मान पर टैप करने से HA में उसका इतिहास या विवरण खुलता है; बैटरी को कोई कमांड नहीं भेजी जाती।

## भाषा

Home Assistant प्रोफ़ाइल की भाषा अपनाने के लिए `language` छोड़ दें या `language: auto` इस्तेमाल करें। इस कार्ड के लिए हिन्दी निश्चित करने के लिए `language: hi` लिखें। क्षेत्रीय भाषा टैग पहचाने जाते हैं और असमर्थित भाषाओं की जगह अंग्रेज़ी दिखाई जाती है। आपके अपने नाम और entity ID कभी अनुवादित नहीं होते। सभी अनुवाद कार्ड में शामिल हैं; किसी अनुवाद सेवा से संपर्क नहीं होता। [भाषा चयन](../i18n.md) देखें।

## ESPHome और माप की गुणवत्ता

[ESPHome डिप्लॉयमेंट](../esphome-deployment.md) और [फ़र्मवेयर प्रोजेक्ट](https://github.com/victron-venus/esphome-jbd-bms-mqtt) के निर्देशों का पालन करें। प्रोजेक्ट का हर अनुरक्षित प्रोफ़ाइल **चार BMS, हर BMS में चार सेल** मानकर बनाया गया है। Bluetooth पते, Wi-Fi और MQTT broker निजी रूप से कॉन्फ़िगर करें, फिर HA में MQTT या ESPHome integration जोड़ें। यह कार्ड इंस्टॉल करने से ESP32 फ़्लैश नहीं होता और बैटरी एंटिटी नहीं बनतीं।

अनुपलब्ध माप अनुपलब्ध ही रहते हैं। कार्ड सबसे अधिक और सबसे कम सेल वोल्टेज का अंतर तभी निकालता है जब सभी कॉन्फ़िगर किए गए सेल के मान वैध हों। रंग केवल प्रदर्शन की सीमाएँ हैं, BMS सुरक्षा सेटिंग नहीं। MQTT में सुरक्षित रखे गए मान और ऑनलाइन कनेक्शन यह साबित नहीं करते कि माप हाल के हैं; ज़रूरत के अनुसार डेटा स्रोत पर एक्सपायरी लागू करें। [कॉन्फ़िगरेशन और डेटा की ताज़गी](../configuration.md) तथा अलग [Echo Dot की व्यवहार्यता समीक्षा](../echo-dot-bluetooth.md) देखें।
