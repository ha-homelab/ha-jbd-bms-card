# JBD Battery & Cell Card — Português

[🌐](README.md) · [English](../../README.md)

Um cartão Home Assistant apenas de leitura para carga, tensão da bateria, corrente, potência, temperatura e tensão de cada célula. Usa entidades numéricas existentes; Victron e Cerbo GX não são necessários. Os 24 idiomas da interface exigem a versão 0.2.0 ou posterior. Consulte as notas de lançamento: a documentação de desenvolvimento pode descrever código mais recente que a última versão publicada.

## Instalação e configuração

No HACS, adicione `https://github.com/ha-homelab/ha-jbd-bms-card` como **repositório personalizado**, do tipo **Dashboard**, e transfira a versão pretendida. O cartão ainda não faz parte do catálogo predefinido. Se o HACS não registar automaticamente o recurso, adicione este módulo JavaScript:

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

Para instalação manual, copie `ha-jbd-bms-card.js` da versão publicada para `/config/www/` e registe `/local/ha-jbd-bms-card.js` como módulo JavaScript. Use apenas um URL de recurso e atualize o navegador. O guia do HACS explica como substituir uma instalação manual existente. [HACS](../hacs.md).

Adicione um cartão Manual. Substitua todos os identificadores de exemplo pelos reais em **Ferramentas de desenvolvimento → Estados**:

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

Adicione uma entrada para cada bateria. O estado de carga, a tensão da bateria e a lista de células são obrigatórios; as outras medições são opcionais. Escolha células do mesmo BMS e monitor. Ao tocar numa leitura, abre o histórico e os detalhes no HA, sem enviar comandos à bateria.

## Idioma

Omita `language` ou use `language: auto` para seguir o perfil do Home Assistant. Use `language: pt` para fixar o português neste cartão. As variantes regionais são reconhecidas; idiomas não suportados usam inglês. Os nomes personalizados e identificadores de entidades nunca são traduzidos. Todos os dicionários estão incluídos; nenhum serviço de tradução é contactado. [🌐](../i18n.md).

## ESPHome e qualidade das medições

Siga o guia de implementação ESPHome e o projeto de firmware. Cada perfil mantido espera **quatro BMS com quatro células por BMS**. Configure em privado os endereços Bluetooth, o Wi-Fi e o servidor MQTT; depois adicione a integração MQTT ou ESPHome no HA. Instalar este cartão não programa um ESP32 nem cria entidades de bateria.

[ESPHome](../esphome-deployment.md) · [esphome-jbd-bms-mqtt](https://github.com/victron-venus/esphome-jbd-bms-mqtt)

As leituras em falta continuam em falta. A diferença entre células só é calculada quando todas as células configuradas têm valores válidos. As cores são limites de visualização, não configurações de proteção do BMS. Valores MQTT retidos e uma ligação ativa não comprovam medições recentes; aplique uma validade na origem quando necessário. As referências técnicas e a avaliação do Echo Dot estão em inglês.

[Configuration](../configuration.md) · [Echo Dot](../echo-dot-bluetooth.md)
