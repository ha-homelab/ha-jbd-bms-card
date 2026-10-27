# JBD Battery & Cell Card — עברית

[שפות](README.md) · [התיעוד המלא באנגלית](../../README.md)

כרטיס לקריאה בלבד ב־Home Assistant להצגת מצב טעינה, מתח מארז הסוללה, זרם, הספק, טמפרטורה ומתח של כל תא. הכרטיס משתמש בישויות מספריות קיימות; אין צורך ב־Victron או ב־Cerbo GX. תמיכה בכל 24 שפות הממשק מחייבת גרסה 0.2.0 ומעלה. יש לבדוק את הערות הגרסה שפורסמה; תיעוד הפיתוח עשוי לתאר קוד חדש יותר מהגרסה האחרונה שפורסמה.

## התקנה והגדרה

ב־HACS, הוסיפו את `https://github.com/ha-homelab/ha-jbd-bms-card` בתור **מאגר מותאם אישית**, מסוג **Dashboard**, והורידו את הגרסה הרצויה. הכרטיס עדיין אינו מופיע בקטלוג ברירת המחדל. רשמו את מודול ה־JavaScript הבא אם HACS לא עשה זאת:

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

להתקנה ידנית, העתיקו את הקובץ `ha-jbd-bms-card.js` של הגרסה אל `/config/www/` ורשמו את `/local/ha-jbd-bms-card.js` כמודול JavaScript. השתמשו בכתובת משאב אחת בלבד ולאחר מכן טענו מחדש את הדפדפן. להחלפת עותק שהותקן ידנית, ראו [HACS, עדכונים ומעבר מהתקנה ידנית](../hacs.md).

הוסיפו כרטיס Manual. החליפו כל מזהה ישות בדוגמה במזהה האמיתי מתוך **כלי מפתחים → מצבים (Developer Tools → States)** ב־Home Assistant:

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

הוסיפו פריט נוסף לרשימה לכל סוללה. מצב הטעינה SOC, מתח המארז ורשימת התאים הם שדות חובה; המדידות האחרות הן רשות. בחרו תאים השייכים לאותו BMS ולאותו התקן ניטור. לחיצה על ערך פותחת את ההיסטוריה או הפרטים שלו ב־HA ואינה שולחת פקודה לסוללה.

## שפה

השמיטו את `language` או השתמשו ב־`language: auto` כדי להשתמש בשפת הפרופיל של Home Assistant. השתמשו ב־`language: he` כדי לבחור עברית באופן קבוע לכרטיס הזה. תגיות שפה אזוריות מזוהות, ושפות שאינן נתמכות מוחלפות באנגלית. השמות שלכם ומזהי הישויות אינם מתורגמים. כל מילוני התרגום כלולים בכרטיס; לא מתבצעת פנייה לשירות תרגום. ראו [בחירת שפה](../i18n.md).

## ESPHome ואיכות המדידות

פעלו לפי [מדריך פריסת ESPHome](../esphome-deployment.md) ו[פרויקט הקושחה](https://github.com/victron-venus/esphome-jbd-bms-mqtt). כל אחד מהפרופילים המתוחזקים בפרויקט מצפה ל־**ארבע מערכות BMS, עם ארבעה תאים בכל BMS**. הגדירו באופן פרטי את כתובות ה־Bluetooth, רשת ה־Wi-Fi ושרת ה־MQTT, ואז הוסיפו ל־HA את שילוב MQTT או ESPHome. התקנת הכרטיס אינה צורבת ESP32 ואינה יוצרת ישויות סוללה.

מדידות חסרות נשארות חסרות. הכרטיס מחשב את ההפרש בין מתח התא הגבוה ביותר לנמוך ביותר רק כאשר לכל התאים שהוגדרו יש ערכים תקינים. הצבעים מייצגים ספי תצוגה ולא הגדרות הגנה של BMS. ערכי MQTT שמורים וחיבור מקוון אינם מוכיחים שהמדידות עדכניות; במידת הצורך יש להגדיר תפוגה במקור הנתונים. ראו [הגדרות ועדכניות נתונים](../configuration.md) ואת [בדיקת ההיתכנות לשימוש ב־Echo Dot](../echo-dot-bluetooth.md).
