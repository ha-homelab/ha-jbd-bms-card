# JBD Battery & Cell Card — Deutsch

[🌐](README.md) · [English](../../README.md)

Eine schreibgeschützte Home-Assistant-Karte für Ladezustand, Batteriespannung, Strom, Leistung, Temperatur und einzelne Zellspannungen. Sie verwendet vorhandene numerische Entitäten; Victron und Cerbo GX sind nicht erforderlich. Alle 24 Oberflächensprachen stehen ab Version 0.2.0 zur Verfügung. Prüfen Sie die Versionshinweise: Die Entwicklungsdokumentation kann neuer als die veröffentlichte Version sein.

## Installieren und konfigurieren

Fügen Sie in HACS `https://github.com/ha-homelab/ha-jbd-bms-card` als **benutzerdefiniertes Repository** mit dem Typ **Dashboard** hinzu und laden Sie die gewünschte Version herunter. Die Karte ist noch nicht im Standardkatalog enthalten. Falls HACS die Ressource nicht selbst registriert, fügen Sie dieses JavaScript-Modul hinzu:

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

Zur manuellen Installation kopieren Sie `ha-jbd-bms-card.js` aus der Veröffentlichung nach `/config/www/` und registrieren `/local/ha-jbd-bms-card.js` als JavaScript-Modul. Verwenden Sie nur eine Ressourcen-URL und laden Sie danach den Browser neu. Die HACS-Anleitung erklärt den Wechsel von einer vorhandenen manuellen Installation. [HACS](../hacs.md).

Fügen Sie eine manuelle Karte hinzu. Ersetzen Sie jede Beispiel-Entitäts-ID durch die tatsächliche ID unter **Entwicklerwerkzeuge → Zustände**:

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

Fügen Sie für jede Batterie einen weiteren Listeneintrag hinzu. Ladezustand, Batteriespannung und die Zellenliste sind erforderlich; die anderen Messgrößen sind optional. Wählen Sie Zellen desselben BMS und Messgeräts. Ein Klick auf einen Wert öffnet Verlauf und Details in HA und sendet keinen Batteriebefehl.

## Sprache

Lassen Sie `language` weg oder verwenden Sie `language: auto`, um dem Home-Assistant-Profil zu folgen. Mit `language: de` erzwingen Sie Deutsch für diese Karte. Regionale Sprachkennungen werden zugeordnet; bei nicht unterstützten Sprachen wird Englisch verwendet. Eigene Namen und Entitäts-IDs werden nie übersetzt. Alle Wörterbücher sind enthalten; es wird kein Übersetzungsdienst kontaktiert. [🌐](../i18n.md).

## ESPHome und Qualität der Messdaten

Folgen Sie der ESPHome-Bereitstellungsanleitung und dem Firmware-Projekt. Die gepflegten Profile erwarten jeweils **vier BMS mit je vier Zellen**. Konfigurieren Sie Bluetooth-Adressen, WLAN und MQTT-Broker privat und richten Sie dann die MQTT- oder ESPHome-Integration in HA ein. Die Installation dieser Karte flasht keinen ESP32 und erzeugt keine Batterie-Entitäten.

[ESPHome](../esphome-deployment.md) · [esphome-jbd-bms-mqtt](https://github.com/victron-venus/esphome-jbd-bms-mqtt)

Fehlende Messwerte bleiben fehlend. Die Zellspreizung wird nur berechnet, wenn alle konfigurierten Zellen gültige Werte besitzen. Farben sind Anzeigeschwellen, keine BMS-Schutzeinstellungen. Gespeicherte MQTT-Werte und eine Online-Verbindung beweisen keine aktuellen Messungen; setzen Sie bei Bedarf eine Ablaufzeit in der Datenquelle durch. Die technischen Referenzen und die Echo-Dot-Bewertung sind auf Englisch.

[Configuration](../configuration.md) · [Echo Dot](../echo-dot-bluetooth.md)
