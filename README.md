# 🩸 FIDAS San Giusto Canavese - Sistema Prenotazioni

Sistema web per la gestione delle prenotazioni delle donazioni di sangue del Gruppo FIDAS adsp di San Giusto Canavese.

## 📋 Descrizione

Applicazione web che permette ai donatori di:
- Registrarsi e accedere al sistema
- Visualizzare la lista delle persone idonee alla donazione (da Pangea)
- Prenotare una fascia oraria per la donazione
- Gestire le proprie prenotazioni

Gli amministratori possono:
- Gestire le pagine di prenotazione (creazione, modifica, eliminazione)
- Caricare/aggiornare la lista delle persone idonee da file Excel
- Visualizzare e gestire tutte le prenotazioni
- Esportare/importare dati in formato Excel
- Configurare il sistema (posti disponibili, testi, ecc.)

## ✨ Funzionalità Principali

### Per i Donatori
- **Registrazione veloce**: Compilazione completa solo alla prima registrazione
- **Login semplificato**: Accessi successivi con solo email e password
- **Lista Persone Idonee**: Visualizzazione della lista Pangea con privacy (nomi mascherati, completi solo per il proprio profilo)
- **Prenotazione Fasce Orarie**: Sistema a fasce con visualizzazione posti disponibili
- **Evidenziazione Personale**: La propria riga nella lista idonei è evidenziata in arancione

### Per gli Amministratori
- **Area Riservata**: Accesso tramite password admin
- **Gestione Pagine**: Creazione/modifica/eliminazione pagine di prenotazione (es. giorni diversi)
- **Gestione Lista Idonei**: Caricamento file Excel da Pangea, modifica titolo, cancellazione lista
- **Gestione Prenotazioni**: Visualizzazione completa, prenotazione per altri utenti, cancellazione, reset
- **Export/Import Excel**: Download e caricamento massivo delle prenotazioni
- **Configurazioni**: Modifica numero posti per fascia, blocco prenotazioni, testi interfaccia

## 🛠️ Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3, JavaScript ES6
- **Framework**: Vue.js 3 (CDN)
- **Backend**: Firebase
  - Authentication (gestione utenti)
  - Realtime Database (dati in tempo reale)
- **Librerie**: 
  - SheetJS (xlsx) - Gestione file Excel
  - Firebase SDK 12.5.0

## 📁 Struttura File
```
FIDAS-Prenotazioni/
├── index.html          # Struttura HTML principale
├── app.js              # Logica applicazione (Vue + Firebase)
├── style.css           # Stili personalizzati
├── logofidas.png       # Logo FIDAS
└── README.md           # Documentazione
```

## 🚀 Installazione e Configurazione

### Requisiti
- Browser moderno (Chrome, Firefox, Safari, Edge)
- Connessione internet (per CDN e Firebase)
- Account Firebase configurato

### Setup Firebase

1. Crea un progetto su [Firebase Console](https://console.firebase.google.com)
2. Attiva **Authentication** (Email/Password)
3. Attiva **Realtime Database**
4. Configura le regole di sicurezza del Database:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "pageNames": { ".read": true, ".write": "auth != null" },
    "seatsPerSlot": { ".read": true, ".write": "auth != null" },
    "blocks": { ".read": true, ".write": "auth != null" },
    "h4Texts": { ".read": true, ".write": "auth != null" },
    "adminPass": { ".read": "auth != null", ".write": "auth != null" },
    "idoneiList": { ".read": "auth != null", ".write": "auth != null" },
    "idoneiTitle": { ".read": true, ".write": "auth != null" },
    "$pageId": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

5. Copia le credenziali Firebase in `app.js`:
```javascript
const firebaseConfig = {
  apiKey: "TUA_API_KEY",
  authDomain: "TUO_DOMINIO.firebaseapp.com",
  databaseURL: "TUO_DATABASE_URL",
  projectId: "TUO_PROJECT_ID",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

### Avvio Locale

1. Clona il repository
2. Apri `index.html` con un server locale (es. Live Server in VS Code)
3. Oppure carica i file su un hosting web

### Deployment su Google Sites

1. Carica i file su Google Drive o altro hosting
2. Incorpora in Google Sites tramite embed HTML
3. Assicurati che i file siano pubblicamente accessibili

## 📖 Guida Utente

### Prima Registrazione

1. Clicca su **"Registrati"**
2. Compila tutti i campi:
   - Cognome
   - Nome  
   - Matricola
   - E-mail
   - Password
3. Clicca **"Registrati"**
4. Attendi 4 secondi (caricamento dati)

### Login Successivi

1. Clicca su **"Accedi"**
2. Inserisci solo:
   - E-mail
   - Password
3. Clicca **"Accedi"**

### Visualizzazione Lista Idonei

- Dopo il login, appare automaticamente la lista delle persone idonee
- I nomi sono mascherati (es: "RO.. MA..")
- La tua riga è evidenziata in **arancione** con il nome completo
- Usa **"🔄 Aggiorna Lista"** se non si carica

### Prenotazione

1. Dalla lista idonei, clicca **"Avanti"**
2. Seleziona il giorno dal menu a tendina
3. Clicca **"Conferma"**
4. Seleziona la fascia oraria desiderata
5. Clicca **"Prenota"**

## 🔐 Sicurezza e Privacy

- **Autenticazione**: Solo utenti registrati possono accedere
- **Privacy**: I nomi completi sono visibili solo al proprietario della matricola
- **Password**: Salvate in modo sicuro tramite Firebase Authentication
- **Dati personali**: Conformi al GDPR (Regolamento UE 2016/679)
- **Regole Firebase**: Accesso ai dati solo per utenti autenticati

## 📊 Formato File Excel

### Import Prenotazioni
Colonne richieste:
- **Fascia**: Testo fascia oraria (es: "Fascia 1: 07:50 – 08:05")
- **Matricola**: Numero matricola
- **Nome**: Nome completo (Cognome Nome)

### Import Lista Idonei Pangea
Colonne richieste:
- **Matricola**: Numero matricola
- **Nome**: Nome completo nel formato "COGNOME NOME"

## 🔧 Configurazione Admin

### Accesso Area Riservata
1. Dalla landing page o da qualsiasi vista loggata, clicca **"Area Riservata"**
2. Inserisci la password admin (default: `admin123` - **CAMBIALA SUBITO!**)

### Gestione Lista Idonei
1. Area Admin → "Gestione Lista Persone Idonee"
2. Modifica il titolo se necessario
3. Clicca **"Carica Lista Excel"**
4. Seleziona il file scaricato da Pangea
5. Conferma il caricamento

### Cambio Password Admin
1. Area Admin → "Modifica password admin"
2. Inserisci la nuova password
3. Clicca fuori dal campo (auto-salvataggio)

## 🆘 Risoluzione Problemi

### La lista idonei non si carica
- Attendi 4-5 secondi dopo il login
- Clicca sul pulsante **"🔄 Aggiorna Lista"**
- Verifica di essere connesso a internet
- Controlla le regole Firebase

### Errore "Permission Denied"
- Verifica che le regole Firebase siano configurate correttamente
- Assicurati di essere loggato
- Ricarica la pagina (F5)

### File Excel non si carica
- Verifica che il file abbia le colonne corrette
- Assicurati che sia formato `.xlsx`
- Controlla che non ci siano righe vuote

## 📝 Changelog

### Versione 1.0 - Gennaio 2026
- ✅ Sistema di registrazione e login
- ✅ Visualizzazione lista persone idonee Pangea
- ✅ Mascheramento nomi con privacy
- ✅ Evidenziazione riga utente
- ✅ Sistema prenotazioni con fasce orarie
- ✅ Area amministratore completa
- ✅ Gestione pagine multiple
- ✅ Export/Import Excel
- ✅ Pulsante aggiorna lista
- ✅ Etichette fasce: "Fascia 1", "Fascia 2", ecc.

## 👥 Autori

- **Sviluppo**: Progetto FIDAS San Giusto Canavese
- **Powered by**: Firebase & Vue.js

## 📄 Licenza

Questo progetto è proprietario del Gruppo FIDAS adsp di San Giusto Canavese.

## 📞 Supporto

Per assistenza o segnalazione bug:
- **Telefono**: 333.78.36.256
- **Sede**: Gruppo FIDAS adsp di San Giusto Canavese

---

**Versione**: 1.0  
**Data**: Gennaio 2026  
**Stato**: ✅ Produzione