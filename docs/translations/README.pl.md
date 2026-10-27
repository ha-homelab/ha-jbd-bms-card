# JBD Battery & Cell Card — Polski

[Języki](README.md) · [Pełna dokumentacja po angielsku](../../README.md)

Karta Home Assistant tylko do odczytu, wyświetlająca stan naładowania, napięcie pakietu, prąd, moc, temperaturę i napięcia poszczególnych ogniw. Korzysta z istniejących encji liczbowych; Victron ani Cerbo GX nie są wymagane. Obsługa wszystkich 24 języków interfejsu wymaga wersji 0.2.0 lub nowszej. Sprawdź informacje o opublikowanym wydaniu: dokumentacja rozwojowa może opisywać kod nowszy niż ostatnia wydana wersja.

## Instalacja i konfiguracja

W HACS dodaj `https://github.com/ha-homelab/ha-jbd-bms-card` jako **repozytorium niestandardowe (custom repository)** typu **Dashboard** i pobierz wybrane wydanie. Karty nie ma jeszcze w domyślnym katalogu. Jeśli HACS nie zarejestrował poniższego modułu JavaScript, dodaj go samodzielnie:

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

Przy instalacji ręcznej skopiuj plik `ha-jbd-bms-card.js` z wydania do `/config/www/` i zarejestruj `/local/ha-jbd-bms-card.js` jako moduł JavaScript. Używaj tylko jednego adresu URL zasobu, a następnie odśwież przeglądarkę. Zastępowanie wcześniej zainstalowanej ręcznie kopii opisano w [przewodniku po HACS, aktualizacjach i migracji](../hacs.md).

Dodaj kartę Manual. Zastąp każdy przykładowy identyfikator encji rzeczywistym identyfikatorem z sekcji Home Assistant **Narzędzia deweloperskie → Stany (Developer Tools → States)**:

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

Dodaj kolejny element listy dla każdej baterii. SOC, napięcie pakietu i lista ogniw są wymagane; pozostałe pomiary są opcjonalne. Wybierz ogniwa należące do tego samego BMS i urządzenia monitorującego. Dotknięcie odczytu otwiera jego historię lub szczegóły w HA i nie wysyła polecenia do baterii.

## Język

Pomiń `language` lub użyj `language: auto`, aby karta korzystała z języka profilu Home Assistant. Ustaw `language: pl`, aby wymusić język polski dla tej karty. Regionalne znaczniki języka są rozpoznawane, a języki nieobsługiwane zastępowane angielskim. Własne nazwy i identyfikatory encji nigdy nie są tłumaczone. Wszystkie słowniki są dołączone do karty; nie łączy się ona z usługą tłumaczeniową. Zobacz [wybór języka](../i18n.md).

## ESPHome i jakość pomiarów

Skorzystaj z [instrukcji wdrożenia ESPHome](../esphome-deployment.md) i [projektu oprogramowania układowego](https://github.com/victron-venus/esphome-jbd-bms-mqtt). Każdy utrzymywany profil projektu zakłada **cztery systemy BMS, po cztery ogniwa na BMS**. Skonfiguruj prywatnie adresy Bluetooth, Wi-Fi i broker MQTT, a następnie dodaj integrację MQTT lub ESPHome w HA. Instalacja karty nie wgrywa oprogramowania do ESP32 ani nie tworzy encji baterii.

Brakujące odczyty pozostają oznaczone jako brakujące. Karta oblicza różnicę między najwyższym a najniższym napięciem ogniwa tylko wtedy, gdy wszystkie skonfigurowane ogniwa mają prawidłowe wartości. Kolory oznaczają progi wyświetlania, a nie ustawienia zabezpieczeń BMS. Zachowane wartości MQTT i połączenie online nie potwierdzają aktualności pomiarów; w razie potrzeby ustaw wygasanie danych po stronie źródła. Zobacz [konfigurację i aktualność danych](../configuration.md) oraz osobną [ocenę możliwości wykorzystania Echo Dot](../echo-dot-bluetooth.md).
