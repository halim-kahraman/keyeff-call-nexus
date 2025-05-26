
# FRITZ!Box 6591 Cable Konfiguration für KeyEff Call Panel

## Übersicht
Diese Anleitung führt Sie durch die komplette Konfiguration Ihrer FRITZ!Box 6591 Cable für die Nutzung mit dem KeyEff Call Panel. Sie werden VPN-Zugang und SIP-Telefonie einrichten.

## Voraussetzungen
- FRITZ!Box 6591 Cable mit aktueller Firmware
- Administratorzugang zur FRITZ!Box
- Internetverbindung
- KeyEff Call Panel Installation

---

## 1. FRITZ!Box Grundkonfiguration

### 1.1 FRITZ!Box Web-Interface aufrufen
1. Öffnen Sie Ihren Browser
2. Geben Sie ein: `http://fritz.box` oder `http://192.168.178.1`
3. Melden Sie sich mit Ihrem Administrator-Passwort an

### 1.2 Firmware Update prüfen
1. Gehen Sie zu **System** → **Update**
2. Prüfen Sie auf verfügbare Updates
3. Installieren Sie falls verfügbar und starten Sie neu

---

## 2. VPN-Server Konfiguration

### 2.1 VPN-Server aktivieren
1. Navigieren Sie zu **Internet** → **Freigaben** → **VPN**
2. Klicken Sie auf **VPN-Verbindung hinzufügen**
3. Wählen Sie **IPSec-VPN-Verbindung für andere Anwendungen**

### 2.2 VPN-Benutzer anlegen
1. Gehen Sie zu **System** → **FRITZ!Box-Benutzer**
2. Klicken Sie auf **Benutzer hinzufügen**
3. Konfigurieren Sie:
   ```
   Benutzername: keyeff-vpn-user
   Passwort: [Starkes Passwort, mindestens 12 Zeichen]
   VPN-Berechtigung: ✓ Aktiviert
   ```

### 2.3 VPN-Verbindungseinstellungen
1. Zurück zu **Internet** → **Freigaben** → **VPN**
2. Neue VPN-Verbindung konfigurieren:
   ```
   Name: KeyEff-VPN
   Typ: IPSec
   Benutzer: keyeff-vpn-user
   Verschlüsselung: AES-256
   Authentifizierung: SHA-256
   ```

### 2.4 Portfreigaben für VPN
1. Gehen Sie zu **Internet** → **Freigaben** → **Portfreigaben**
2. Neue Regel erstellen:
   ```
   Bezeichnung: VPN-IPSec
   Protokoll: UDP
   Port: 500, 4500
   an Computer: FRITZ!Box
   ```

---

## 3. SIP-Telefonie Konfiguration

### 3.1 Telefonie-Einstellungen
1. Navigieren Sie zu **Telefonie** → **Eigene Rufnummern**
2. Klicken Sie auf **Neue Rufnummer**
3. Wählen Sie **Internetrufnummer**

### 3.2 SIP-Trunk konfigurieren
1. Gehen Sie zu **Telefonie** → **Telefoniegeräte**
2. Klicken Sie auf **Gerät konfigurieren**
3. Wählen Sie **Telefon (mit und ohne Anrufbeantworter)**
4. Konfigurieren Sie:
   ```
   Name: KeyEff-SIP-Client
   Benutzername: keyeff-sip
   Passwort: [Starkes SIP-Passwort]
   Rufnummer zuweisen: Ja
   ```

### 3.3 SIP-Einstellungen erweitert
1. Unter **Telefonie** → **Erweiterte Einstellungen**
2. Aktivieren Sie:
   ```
   ✓ Internettelefonie über andere Anbieter möglich
   ✓ SIP-ALG deaktivieren (wichtig!)
   ✓ RTP-Proxy aktivieren
   ```

### 3.4 Portfreigaben für SIP
1. **Internet** → **Freigaben** → **Portfreigaben**
2. Neue Regeln erstellen:
   ```
   Regel 1:
   Bezeichnung: SIP-Signaling
   Protokoll: UDP
   Port: 5060
   an Computer: [IP des SIP-Servers]
   
   Regel 2:
   Bezeichnung: RTP-Audio
   Protokoll: UDP
   Port: 10000-20000
   an Computer: [IP des SIP-Servers]
   ```

---

## 4. Netzwerk-Optimierungen

### 4.1 QoS für VoIP
1. Gehen Sie zu **Internet** → **Online-Monitor** → **Priorisierung**
2. Aktivieren Sie Priorisierung
3. Erstellen Sie Regel:
   ```
   Anwendung: VoIP/Telefonie
   Priorität: Höchste
   Protokoll: UDP
   Ports: 5060, 10000-20000
   ```

### 4.2 DNS-Einstellungen
1. **Internet** → **Zugangsdaten** → **DNS-Server**
2. Verwenden Sie:
   ```
   Bevorzugter DNS-Server: 8.8.8.8
   Alternativer DNS-Server: 8.8.4.4
   ```

---

## 5. Sicherheitseinstellungen

### 5.1 Firewall-Konfiguration
1. **Internet** → **Filter** → **Listen**
2. Erstellen Sie Ausnahmen für KeyEff:
   ```
   Regel: KeyEff-VPN-Access
   Aktion: Erlauben
   Protokoll: Alle
   Quell-IP: VPN-Netzwerk (10.0.0.0/24)
   ```

### 5.2 Zugriffsbeschränkungen
1. **System** → **FRITZ!Box-Benutzer** → **Anmeldung im Heimnetz**
2. Aktivieren Sie:
   ```
   ✓ Anmeldung mit Benutzername und Kennwort erforderlich
   ✓ HTTPS für Web-Interface erzwingen
   ```

---

## 6. KeyEff Call Panel Konfiguration

### 6.1 VPN-Einstellungen
Tragen Sie in der Plattform unter **Einstellungen** → **VPN** ein:

```json
{
  "vpn_server": "[Ihre FRITZ!Box externe IP oder DynDNS]",
  "vpn_port": "500",
  "vpn_username": "keyeff-vpn-user",
  "vpn_password": "[Ihr VPN-Passwort]",
  "vpn_encryption": "AES-256",
  "vpn_protocol": "IPSec"
}
```

### 6.2 SIP-Einstellungen
Unter **Einstellungen** → **SIP**:

```json
{
  "sip_server": "[Ihre FRITZ!Box IP oder Domain]",
  "sip_port": "5060",
  "sip_username": "keyeff-sip",
  "sip_password": "[Ihr SIP-Passwort]",
  "sip_transport": "UDP",
  "sip_registration_timeout": "3600"
}
```

### 6.3 FRITZ!Box-Einstellungen
Unter **Einstellungen** → **FRITZ!Box**:

```json
{
  "fritzbox_ip": "[Interne IP der FRITZ!Box, z.B. 192.168.178.1]",
  "fritzbox_port": "80",
  "fritzbox_username": "[FRITZ!Box Admin Benutzer]",
  "fritzbox_password": "[FRITZ!Box Admin Passwort]",
  "fritzbox_ssl": false
}
```

---

## 7. Konfigurationstemplates

### 7.1 Vollständige Konfiguration für KeyEff
```json
{
  "connection_settings": {
    "vpn": {
      "enabled": true,
      "server": "ihr-dynamischer-dns.de",
      "port": 500,
      "username": "keyeff-vpn-user",
      "password": "VPN_PASSWORT_HIER",
      "encryption": "AES-256",
      "protocol": "IPSec",
      "timeout": 30
    },
    "sip": {
      "enabled": true,
      "server": "192.168.178.1",
      "port": 5060,
      "username": "keyeff-sip",
      "password": "SIP_PASSWORT_HIER",
      "transport": "UDP",
      "codec": "G.711",
      "registration_timeout": 3600
    },
    "fritzbox": {
      "enabled": true,
      "ip": "192.168.178.1",
      "port": 80,
      "username": "admin",
      "password": "FRITZBOX_ADMIN_PASSWORT",
      "ssl": false,
      "timeout": 10
    }
  }
}
```

### 7.2 Netzwerk-Template
```
FRITZ!Box Netzwerk: 192.168.178.0/24
Gateway: 192.168.178.1
VPN-Netzwerk: 10.0.0.0/24
SIP-Server: 192.168.178.1:5060
RTP-Bereich: 10000-20000
```

---

## 8. Troubleshooting

### 8.1 VPN-Verbindungsprobleme
- Prüfen Sie die Portfreigaben (500, 4500 UDP)
- Kontrollieren Sie die externe IP/DynDNS
- Testen Sie die VPN-Anmeldedaten

### 8.2 SIP-Probleme
- Deaktivieren Sie SIP-ALG in der FRITZ!Box
- Prüfen Sie RTP-Port-Bereich (10000-20000)
- Kontrollieren Sie Codec-Kompatibilität

### 8.3 Verbindungstest
1. VPN-Test: `ping [FRITZ!Box IP] über VPN`
2. SIP-Test: Registrierung im Call Panel prüfen
3. Audio-Test: Testanruf durchführen

---

## 9. Wartung und Updates

### 9.1 Regelmäßige Aufgaben
- FRITZ!Box Firmware monatlich prüfen
- VPN-Passwörter alle 90 Tage ändern
- SIP-Logs auf Anomalien prüfen
- Netzwerk-Performance überwachen

### 9.2 Backup-Einstellungen
1. **System** → **Sicherung** → **Sichern**
2. Speichern Sie die Konfiguration monatlich
3. Dokumentieren Sie alle Änderungen

---

## Support-Kontakt
Bei Problemen wenden Sie sich an:
- KeyEff Support: support@keyeff.de
- FRITZ!Box Support: AVM Hotline

**Erstellt:** $(date)
**Version:** 1.0
**Für:** KeyEff Call Panel mit FRITZ!Box 6591 Cable
