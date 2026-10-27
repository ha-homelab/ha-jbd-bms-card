# JBD Battery & Cell Card — Nederlands

[🌐](README.md) · [English](../../README.md)

Een alleen-lezen Home Assistant-kaart voor laadstatus, accuspanning, stroom, vermogen, temperatuur en de spanning van elke cel. De kaart gebruikt bestaande numerieke entiteiten; Victron en Cerbo GX zijn niet nodig. Alle 24 interfacetalen vereisen versie 0.2.0 of nieuwer. Controleer de release-opmerkingen: ontwikkelingsdocumentatie kan nieuwere code beschrijven dan de laatste publicatie.

## Installeren en instellen

Voeg in HACS `https://github.com/ha-homelab/ha-jbd-bms-card` toe als **aangepaste repository**, met type **Dashboard**, en download de gewenste versie. De kaart staat nog niet in de standaardcatalogus. Registreer deze JavaScript-module als HACS dat niet automatisch doet:

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

Voor handmatige installatie kopieert u `ha-jbd-bms-card.js` uit de release naar `/config/www/` en registreert u `/local/ha-jbd-bms-card.js` als JavaScript-module. Gebruik slechts één bron-URL en laad daarna de browser opnieuw. De HACS-handleiding beschrijft het vervangen van een bestaande handmatige installatie. [HACS](../hacs.md).

Voeg een handmatige kaart toe. Vervang elke voorbeeld-ID door de echte entiteits-ID uit **Ontwikkelaarstools → Statussen**:

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

Voeg voor elke accu een extra lijstitem toe. Laadstatus, accuspanning en de cellenlijst zijn verplicht; andere metingen zijn optioneel. Kies cellen van dezelfde BMS en monitor. Als u op een meetwaarde tikt, opent HA de geschiedenis en details; er wordt geen opdracht naar de accu gestuurd.

## Taal

Laat `language` weg of gebruik `language: auto` om het Home Assistant-profiel te volgen. Gebruik `language: nl` om Nederlands voor deze kaart te kiezen. Regionale taalvarianten worden herkend; niet-ondersteunde talen vallen terug op Engels. Eigen namen en entiteits-ID’s worden nooit vertaald. Alle woordenboeken zijn meegeleverd; er wordt geen vertaaldienst benaderd. [🌐](../i18n.md).

## ESPHome en kwaliteit van metingen

Volg de ESPHome-installatiehandleiding en het firmwareproject. Elk onderhouden profiel verwacht **vier BMS-systemen met vier cellen per BMS**. Configureer Bluetooth-adressen, wifi en MQTT-broker privé en voeg daarna de MQTT- of ESPHome-integratie toe in HA. Deze kaart installeren flasht geen ESP32 en maakt geen accu-entiteiten aan.

[ESPHome](../esphome-deployment.md) · [esphome-jbd-bms-mqtt](https://github.com/victron-venus/esphome-jbd-bms-mqtt)

Ontbrekende meetwaarden blijven ontbreken. Het celverschil wordt alleen berekend wanneer alle ingestelde cellen geldige waarden hebben. Kleuren zijn weergavedrempels en geen BMS-beveiligingsinstellingen. Bewaarde MQTT-waarden en een online verbinding bewijzen niet dat metingen actueel zijn; regel zo nodig vervaltijden bij de bron. De technische naslag en de Echo Dot-beoordeling zijn in het Engels.

[Configuration](../configuration.md) · [Echo Dot](../echo-dot-bluetooth.md)
