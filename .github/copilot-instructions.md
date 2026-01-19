# ConnectorAbi Client - Project Instructions

## Proje Genel Bakış

Bu proje, yerel bilgisayarlarda çalışan ve kernel.connectorabi.com sunucusundan WebSocket (wss://kernel.connectorabi.com/) üzerinden uzaktan kontrol edilebilen bir connector uygulamasıdır.

## Ana İşlevler

- **Uzaktan Veritabanı Yönetimi**: MSSQL, MySQL, PostgreSQL, MongoDB veritabanlarında SQL/NoSQL sorguları çalıştırma
- **Dosya İşlemleri**: Uzaktan dosya okuma ve yazma
- **Excel İşlemleri**: Excel dosyalarını okuma ve yazma
- **Komut Çalıştırma**: Yerel sistemde komut çalıştırma (cmd.socket.js)
- **REST API İstekleri**: Uzaktan REST API çağrıları yapma

## Mimari Yapı

### Ana Bileşenler

1. **connector.js**: Uygulamanın başlangıç noktası
2. **socket-manager/socket-manager.js**: WebSocket bağlantısını yöneten ana modül
3. **socket-manager/sockets/**: Her bir işlev için ayrı socket handler'ları
4. **lib/initialize.js**: Uygulama başlatma ve yapılandırma
5. **cli.js**: Komut satırı arayüzü

### WebSocket Mimarisi

- **Sunucu URL**: `wss://kernel.connectorabi.com/`
- **Bağlantı**: Client, sunucuya WebSocket ile bağlanır
- **Kimlik Doğrulama**: CLIENT_ID ve CLIENT_PASS ile kayıt/oturum açma
- **Event Sistemi**: Her socket handler modülü belirli bir event tipini işler

### Socket Handler Modülleri

Her socket handler şu yapıdadır:

```javascript
module.exports = (socket, params) => {
  // İşlem mantığı
  // Başarılı: sendSuccess(data, params.callback)
  // Hata: sendError(err, params.callback)
}
```

**Mevcut Handler'lar**:

- `cmd.socket.js` - Komut satırı komutları
- `datetime.socket.js` - Tarih/saat işlemleri
- `mssql.socket.js` - Microsoft SQL Server sorguları
- `mysql.socket.js` - MySQL sorguları
- `pg.socket.js` - PostgreSQL sorguları
- `read-excel.socket.js` - Excel okuma
- `write-excel.socket.js` - Excel yazma
- `read-file.socket.js` - Dosya okuma
- `write-file.socket.js` - Dosya yazma
- `rest.socket.js` - REST API istekleri
- `registered.socket.js` - Kayıt onayı
- `subscribed.socket.js` - Abonelik onayı

### Bağlantı Akışı

1. Client başlatılır (`connector.js`)
2. WebSocket bağlantısı kurulur
3. CLIENT_ID yoksa `register` eventi gönderilir
4. CLIENT_ID varsa `subscribe` eventi gönderilir
5. Sunucudan gelen mesajlar ilgili handler'a yönlendirilir
6. İşlem sonucu `callback` eventi ile geri gönderilir

### Yeniden Bağlanma

- Bağlantı koptuğunda otomatik yeniden bağlanır
- Yeniden bağlanma aralığı: `RECONNECTION_INTERVAL` (varsayılan: 30000ms)

### Güvenlik

- WSS (WebSocket Secure) protokolü kullanılır
- CLIENT_ID ve CLIENT_PASS ile kimlik doğrulama
- Hassas bilgiler .env dosyasında saklanır

### Environment Variables (.env)

- `SOCKET_SERVER_URL`: WebSocket sunucu adresi
- `CLIENT_ID`: Client kimlik numarası
- `CLIENT_PASS`: Client şifresi
- `RECONNECTION_INTERVAL`: Yeniden bağlanma aralığı (ms)
- `NODE_ENV`: Çalışma ortamı (development/production)

### Global Fonksiyonlar

- `sendSuccess(data, callback)`: Başarılı sonucu sunucuya gönderir
- `sendError(err, callback)`: Hata mesajını sunucuya gönderir
- `eventLog()`: Event loglaması
- `errorLog()`: Hata loglaması
- `devLog()`: Development loglaması

### Bağımlılıklar

**Ana Bağımlılıklar**:

- `ws`: WebSocket client
- `mssql`: Microsoft SQL Server driver
- `mysql`: MySQL driver
- `pg`: PostgreSQL driver
- `mongodb`: MongoDB driver
- `axios`: HTTP client
- `read-excel-file`: Excel okuma
- `node-cmd`: Sistem komutları
- `systeminformation`: Sistem bilgileri

### Platform Desteği

- **Windows**: Kurulum paketi (NSIS installer)
- **Linux**: Shell script installer
- **Global NPM Package**: npm install connectorabi -g

### CLI Komutları

```bash
connectorabi start       # Client'ı başlat
connectorabi show        # CLIENT_ID ve CLIENT_PASS'i göster
connectorabi -v          # Versiyon
connectorabi -h          # Yardım
```

## Kod Stilleri ve Kurallar

- Modüler yapı: Her işlev ayrı socket handler dosyası
- Promise/async-await kullanımı
- Error handling: try-catch ve .catch()
- Global helper fonksiyonlar kullanımı
- Event-driven architecture

## Geliştirme Notları

- Yeni özellik eklerken socket-manager/sockets/ altına yeni handler ekleyin
- Handler isimlendirmesi: `{feature}.socket.js`
- Handler her zaman callback parametresi almalı ve sendSuccess/sendError kullanmalı
- WebSocket bağlantısı global.ws olarak erişilebilir
