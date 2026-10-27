# JBD Battery & Cell Card — Italiano

[🌐](README.md) · [English](../../README.md)

Una scheda Home Assistant di sola lettura per carica, tensione del pacco, corrente, potenza, temperatura e tensioni delle singole celle. Utilizza entità numeriche esistenti; Victron e Cerbo GX non sono necessari. Le 24 lingue dell’interfaccia richiedono la versione 0.2.0 o successiva. Controllare le note di rilascio: la documentazione di sviluppo può descrivere codice più recente dell’ultima versione pubblicata.

## Installazione e configurazione

In HACS, aggiungere `https://github.com/ha-homelab/ha-jbd-bms-card` come **repository personalizzato**, di tipo **Dashboard**, e scaricare la versione desiderata. La scheda non è ancora nel catalogo predefinito. Se HACS non registra automaticamente la risorsa, aggiungere questo modulo JavaScript:

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

Per l’installazione manuale, copiare `ha-jbd-bms-card.js` dal rilascio in `/config/www/` e registrare `/local/ha-jbd-bms-card.js` come modulo JavaScript. Usare un solo URL della risorsa, poi ricaricare il browser. La guida HACS spiega come sostituire un’installazione manuale esistente. [HACS](../hacs.md).

Aggiungere una scheda Manuale. Sostituire ogni ID di esempio con quello reale in **Strumenti per sviluppatori → Stati**:

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

Aggiungere una voce per ogni batteria. Stato di carica, tensione del pacco ed elenco delle celle sono obbligatori; le altre misure sono facoltative. Selezionare celle dello stesso BMS e monitor. Toccando una lettura si aprono cronologia e dettagli in HA, senza inviare comandi alla batteria.

## Lingua

Omettere `language` oppure usare `language: auto` per seguire il profilo Home Assistant. Usare `language: it` per impostare l’italiano nella scheda. Le varianti regionali vengono riconosciute; le lingue non supportate usano l’inglese. Nomi personalizzati e ID delle entità non vengono mai tradotti. Tutti i dizionari sono inclusi e non viene contattato alcun servizio di traduzione. [🌐](../i18n.md).

## ESPHome e qualità delle misure

Seguire la guida di distribuzione ESPHome e il progetto firmware. Ogni profilo mantenuto prevede **quattro BMS con quattro celle ciascuno**. Configurare privatamente indirizzi Bluetooth, Wi-Fi e broker MQTT, poi aggiungere l’integrazione MQTT o ESPHome in HA. L’installazione della scheda non programma un ESP32 e non crea entità delle batterie.

[ESPHome](../esphome-deployment.md) · [esphome-jbd-bms-mqtt](https://github.com/victron-venus/esphome-jbd-bms-mqtt)

Le letture mancanti restano mancanti. La differenza fra celle viene calcolata solo quando tutte le celle configurate hanno valori validi. I colori sono soglie di visualizzazione, non impostazioni di protezione del BMS. Valori MQTT conservati e connessione attiva non garantiscono misure recenti; applicare una scadenza alla fonte quando necessario. I riferimenti tecnici e la valutazione Echo Dot sono in inglese.

[Configuration](../configuration.md) · [Echo Dot](../echo-dot-bluetooth.md)
