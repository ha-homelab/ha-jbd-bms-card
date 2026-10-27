# JBD Battery & Cell Card — Türkçe

[Diller](README.md) · [İngilizce tam belgeler](../../README.md)

Şarj durumu, batarya paketi gerilimi, akım, güç, sıcaklık ve tek tek hücre gerilimlerini gösteren, salt okunur bir Home Assistant kartıdır. Mevcut sayısal varlıklarla çalışır; Victron veya Cerbo GX gerekmez. Arayüzdeki 24 dilin tamamı için 0.2.0 veya daha yeni bir sürüm gerekir. Yayımlanmış sürüm notlarını kontrol edin; geliştirme belgeleri son yayımlanan sürümden daha yeni kodu açıklayabilir.

## Kurulum ve yapılandırma

HACS içinde `https://github.com/ha-homelab/ha-jbd-bms-card` adresini **özel depo (custom repository)** olarak, **Dashboard** türünde ekleyin ve istediğiniz sürümü indirin. Kart henüz varsayılan katalogda yer almıyor. HACS aşağıdaki JavaScript modülünü kaydetmediyse siz kaydedin:

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

Elle kurulum için sürümdeki `ha-jbd-bms-card.js` dosyasını `/config/www/` içine kopyalayın ve `/local/ha-jbd-bms-card.js` adresini JavaScript modülü olarak kaydedin. Yalnızca bir kaynak URL’si kullanın, ardından tarayıcıyı yenileyin. Daha önce elle kurulmuş kopyayı değiştirmek için [HACS, güncellemeler ve geçiş](../hacs.md) kılavuzuna bakın.

Bir Manual kartı ekleyin. Örnekteki her varlık kimliğini Home Assistant içindeki **Geliştirici Araçları → Durumlar (Developer Tools → States)** bölümünden aldığınız gerçek kimlikle değiştirin:

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

Her batarya için listeye yeni bir öğe ekleyin. SOC, paket gerilimi ve hücre listesi zorunludur; diğer ölçümler isteğe bağlıdır. Aynı BMS ve izleme cihazına ait hücreleri seçin. Bir ölçüm değerine dokunmak HA içindeki geçmişini veya ayrıntılarını açar ve bataryaya komut göndermez.

## Dil

Home Assistant profilinin dilini izlemek için `language` ayarını atlayın veya `language: auto` kullanın. Bu kartın dilini Türkçeye sabitlemek için `language: tr` kullanın. Bölgesel dil etiketleri çözümlenir; desteklenmeyen diller için İngilizce kullanılır. Kendi verdiğiniz adlar ve varlık kimlikleri hiçbir zaman çevrilmez. Tüm sözlükler karta dahildir; herhangi bir çeviri hizmetine bağlanılmaz. [Dil seçimine](../i18n.md) bakın.

## ESPHome ve ölçüm kalitesi

[ESPHome dağıtım kılavuzunu](../esphome-deployment.md) ve [aygıt yazılımı projesini](https://github.com/victron-venus/esphome-jbd-bms-mqtt) izleyin. Projede bakımı sürdürülen her profil, **her birinde dört hücre bulunan dört BMS** bekler. Bluetooth adreslerini, Wi-Fi ve MQTT aracısını bilgileri gizli tutarak yapılandırın, ardından HA’ya MQTT veya ESPHome entegrasyonunu ekleyin. Bu kartı kurmak ESP32’ye aygıt yazılımı yüklemez ve batarya varlıkları oluşturmaz.

Eksik ölçümler eksik olarak kalır. Kart, en yüksek ve en düşük hücre gerilimi arasındaki farkı yalnızca yapılandırılmış tüm hücrelerin geçerli değerleri olduğunda hesaplar. Renkler görüntüleme eşikleridir; BMS koruma ayarları değildir. Saklanan MQTT değerleri ve çevrimiçi bağlantı, ölçümlerin güncel olduğunu kanıtlamaz; gerektiğinde veri kaynağında son kullanma süresi uygulayın. [Yapılandırma ve veri güncelliği](../configuration.md) ile ayrı [Echo Dot uygulanabilirlik değerlendirmesine](../echo-dot-bluetooth.md) bakın.
