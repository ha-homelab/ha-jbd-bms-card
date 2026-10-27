# JBD Battery & Cell Card — Français

[🌐](README.md) · [English](../../README.md)

Une carte Home Assistant en lecture seule pour la charge, la tension de la batterie, le courant, la puissance, la température et la tension de chaque cellule. Elle utilise les entités numériques existantes ; Victron et Cerbo GX ne sont pas nécessaires. Les 24 langues de l’interface nécessitent la version 0.2.0 ou ultérieure. Consultez les notes de version : cette documentation peut décrire du code plus récent que la dernière publication.

## Installation et configuration

Dans HACS, ajoutez `https://github.com/ha-homelab/ha-jbd-bms-card` comme **dépôt personnalisé**, de type **Dashboard**, puis téléchargez la version souhaitée. La carte ne figure pas encore dans le catalogue par défaut. Si HACS n’enregistre pas automatiquement la ressource, ajoutez ce module JavaScript :

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

Pour une installation manuelle, copiez `ha-jbd-bms-card.js` de la publication dans `/config/www/`, puis enregistrez `/local/ha-jbd-bms-card.js` comme module JavaScript. Utilisez une seule URL de ressource, puis rechargez le navigateur. Le guide HACS explique comment remplacer une installation manuelle existante. [HACS](../hacs.md).

Ajoutez une carte manuelle. Remplacez chaque identifiant d’exemple par l’identifiant réel dans **Outils de développement → États** :

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

Ajoutez une entrée par batterie. L’état de charge, la tension de la batterie et la liste des cellules sont obligatoires ; les autres mesures sont facultatives. Sélectionnez des cellules provenant du même BMS et du même moniteur. Toucher une valeur ouvre son historique et ses détails dans HA, sans envoyer de commande à la batterie.

## Langue

Omettez `language` ou utilisez `language: auto` pour suivre le profil Home Assistant. Utilisez `language: fr` pour imposer le français à cette carte. Les variantes régionales sont reconnues ; les langues non prises en charge reviennent à l’anglais. Vos noms et identifiants d’entités ne sont jamais traduits. Tous les dictionnaires sont intégrés ; aucun service de traduction n’est contacté. [🌐](../i18n.md).

## ESPHome et qualité des mesures

Suivez le guide de déploiement ESPHome et le projet du firmware. Chaque profil maintenu attend **quatre BMS de quatre cellules chacun**. Configurez les adresses Bluetooth, le Wi-Fi et le serveur MQTT en privé, puis ajoutez l’intégration MQTT ou ESPHome dans HA. Installer cette carte ne programme pas un ESP32 et ne crée pas d’entités de batterie.

[ESPHome](../esphome-deployment.md) · [esphome-jbd-bms-mqtt](https://github.com/victron-venus/esphome-jbd-bms-mqtt)

Les mesures absentes restent absentes. L’écart entre cellules n’est calculé que si toutes les cellules configurées ont une valeur valide. Les couleurs sont des seuils d’affichage, pas des réglages de protection du BMS. Les valeurs MQTT conservées et une connexion active ne prouvent pas que les mesures sont récentes ; imposez une expiration à la source si nécessaire. Les références techniques et l’étude Echo Dot sont en anglais.

[Configuration](../configuration.md) · [Echo Dot](../echo-dot-bluetooth.md)
