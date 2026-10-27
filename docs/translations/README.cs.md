# JBD Battery & Cell Card — Čeština

[Jazyky](README.md) · [Úplná dokumentace v angličtině](../../README.md)

Karta Home Assistant pouze pro čtení, která zobrazuje stav nabití, napětí baterie, proud, výkon, teplotu a napětí jednotlivých článků. Používá existující číselné entity; Victron ani Cerbo GX nejsou potřeba. Podpora všech 24 jazyků rozhraní vyžaduje verzi 0.2.0 nebo novější. Zkontrolujte poznámky k publikovanému vydání: vývojová dokumentace může popisovat novější kód, než obsahuje poslední vydaná verze.

## Instalace a nastavení

V HACS přidejte `https://github.com/ha-homelab/ha-jbd-bms-card` jako **vlastní repozitář (custom repository)** typu **Dashboard** a stáhněte požadované vydání. Karta zatím není ve výchozím katalogu. Pokud HACS nezaregistroval následující modul JavaScript, přidejte jej ručně:

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

Při ruční instalaci zkopírujte soubor `ha-jbd-bms-card.js` z vydání do `/config/www/` a zaregistrujte `/local/ha-jbd-bms-card.js` jako modul JavaScript. Používejte pouze jednu URL prostředku a potom obnovte stránku v prohlížeči. Nahrazení dříve ručně nainstalované kopie popisuje [průvodce HACS, aktualizacemi a migrací](../hacs.md).

Přidejte kartu Manual. Každé ukázkové ID entity nahraďte skutečným ID z části Home Assistant **Nástroje pro vývojáře → Stavy (Developer Tools → States)**:

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

Pro každou další baterii přidejte další položku seznamu. SOC, napětí baterie a seznam článků jsou povinné; ostatní měření jsou volitelná. Vyberte články patřící ke stejnému BMS a stejnému monitorovacímu zařízení. Klepnutí na hodnotu otevře její historii nebo podrobnosti v HA a neodešle baterii žádný příkaz.

## Jazyk

Vynechte `language` nebo použijte `language: auto`, aby se karta řídila jazykem profilu Home Assistant. Pomocí `language: cs` nastavíte pro tuto kartu pevně češtinu. Regionální jazykové značky se rozpoznávají a nepodporované jazyky se nahrazují angličtinou. Vlastní názvy a ID entit se nikdy nepřekládají. Všechny slovníky jsou součástí karty; žádná překladová služba se nekontaktuje. Viz [výběr jazyka](../i18n.md).

## ESPHome a kvalita měření

Postupujte podle [návodu k nasazení ESPHome](../esphome-deployment.md) a [projektu firmwaru](https://github.com/victron-venus/esphome-jbd-bms-mqtt). Každý udržovaný profil projektu předpokládá **čtyři systémy BMS se čtyřmi články na každý BMS**. Nastavte adresy Bluetooth, Wi-Fi a broker MQTT soukromě a poté do HA přidejte integraci MQTT nebo ESPHome. Instalace této karty nenahraje firmware do ESP32 ani nevytvoří entity baterií.

Chybějící údaje zůstávají označené jako chybějící. Karta vypočítá rozdíl mezi nejvyšším a nejnižším napětím článku pouze tehdy, když mají všechny nakonfigurované články platné hodnoty. Barvy představují prahy zobrazení, nikoli nastavení ochrany BMS. Uchované hodnoty MQTT ani připojení online nedokazují aktuálnost měření; podle potřeby nastavte platnost dat na straně zdroje. Viz [nastavení a aktuálnost dat](../configuration.md) a samostatné [posouzení možnosti využití Echo Dot](../echo-dot-bluetooth.md).
