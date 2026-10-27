# JBD Battery & Cell Card — Español

[🌐](README.md) · [English](../../README.md)

Tarjeta de Home Assistant de solo lectura para carga, tensión de la batería, corriente, potencia, temperatura y tensión de cada celda. Utiliza entidades numéricas existentes; no requiere Victron ni Cerbo GX. Los 24 idiomas de la interfaz están disponibles a partir de la versión 0.2.0. Consulte las notas de publicación: la documentación de desarrollo puede describir código más reciente que la última versión publicada.

## Instalación y configuración

En HACS, añada `https://github.com/ha-homelab/ha-jbd-bms-card` como **repositorio personalizado**, de tipo **Dashboard**, y descargue la versión deseada. La tarjeta todavía no está en el catálogo predeterminado. Si HACS no registra el recurso automáticamente, añada este módulo JavaScript:

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

Para instalar manualmente, copie `ha-jbd-bms-card.js` de la publicación a `/config/www/` y registre `/local/ha-jbd-bms-card.js` como módulo JavaScript. Use una sola URL de recurso y vuelva a cargar el navegador. La guía de HACS explica cómo sustituir una instalación manual existente. [HACS](../hacs.md).

Añada una tarjeta Manual. Sustituya todos los identificadores de ejemplo por los reales de **Herramientas para desarrolladores → Estados**:

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

Añada una entrada por cada batería. El estado de carga, la tensión de la batería y la lista de celdas son obligatorios; las demás medidas son opcionales. Seleccione celdas del mismo BMS y monitor. Al pulsar una medida se abre su historial y detalles en HA; no se envía ninguna orden a la batería.

## Idioma

Omita `language` o use `language: auto` para seguir el perfil de Home Assistant. Use `language: es` para fijar el español en esta tarjeta. Se resuelven las variantes regionales; los idiomas no compatibles utilizan el inglés. Los nombres propios y los identificadores de entidades nunca se traducen. Todos los diccionarios están incluidos y no se consulta ningún servicio de traducción. [🌐](../i18n.md).

## ESPHome y calidad de las medidas

Siga la guía de despliegue de ESPHome y el proyecto de firmware. Cada perfil mantenido espera **cuatro BMS con cuatro celdas por BMS**. Configure de forma privada las direcciones Bluetooth, el Wi-Fi y el servidor MQTT; después añada la integración MQTT o ESPHome de HA. Instalar esta tarjeta no programa un ESP32 ni crea entidades de batería.

[ESPHome](../esphome-deployment.md) · [esphome-jbd-bms-mqtt](https://github.com/victron-venus/esphome-jbd-bms-mqtt)

Las medidas ausentes se mantienen ausentes. La dispersión entre celdas solo se calcula cuando todas las celdas configuradas tienen valores válidos. Los colores son umbrales visuales, no ajustes de protección del BMS. Los valores MQTT retenidos y una conexión activa no garantizan medidas recientes; aplique caducidad en el origen cuando sea necesario. Las referencias técnicas y el estudio de Echo Dot están en inglés.

[Configuration](../configuration.md) · [Echo Dot](../echo-dot-bluetooth.md)
