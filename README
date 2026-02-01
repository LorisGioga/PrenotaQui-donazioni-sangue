# PrenotaQui 2.0 - Sistema Prenotazioni FIDAS

![FIDAS Logo](logofidas.png)

Sistema di prenotazione online per le donazioni di sangue del **Gruppo FIDAS adsp di San Giusto Canavese**.

## 📋 Descrizione

**PrenotaQui 1.1** è un'applicazione web moderna e intuitiva che permette ai donatori FIDAS di:
- ✅ Registrarsi e accedere con credenziali personali
- ✅ Visualizzare la lista delle persone idonee alla donazione
- ✅ Prenotare una fascia oraria per la donazione
- ✅ Gestire le prenotazioni in modo autonomo

## 🚀 Caratteristiche Principali

### Per gli Utenti
- **Sistema di Login/Registrazione** sicuro con Firebase Authentication
- **Lista Persone Idonee** aggiornabile in tempo reale
- **Prenotazione Fascia Oraria** con visualizzazione posti disponibili
- **Evidenziazione Prenotazione Personale** in arancione
- **Privacy GDPR-compliant** con informativa integrata
- **Interfaccia Responsive** ottimizzata per mobile e desktop

### Per gli Amministratori
- **Area Riservata** con password dedicata
- **Gestione Pagine** dinamica (creazione, rinomina, eliminazione)
- **Blocco Prenotazioni** selettivo per pagina
- **Import/Export Excel** per gestione liste
- **Modifica Posti Disponibili** per fascia oraria
- **Gestione Lista Idonei** con caricamento da Excel

## 🎨 Design e UX

- **Palette Colori FIDAS** (Blu, Rosso, Verde, Arancione, Viola)
- **Badge Colorati** per disponibilità posti (Verde: >3, Giallo: 1-3, Rosso: 0)
- **Animazioni Fluide** e transizioni moderne
- **Feedback Visivo** su tutte le azioni
- **Modal Personalizzati** per conferme e input

## 🛠️ Tecnologie Utilizzate

- **Frontend:**
  - Vue.js 3 (Composition API)
  - HTML5 / CSS3 (Custom Properties)
  - JavaScript ES6+

- **Backend:**
  - Firebase Authentication
  - Firebase Realtime Database

- **Librerie:**
  - SheetJS (xlsx) per Import/Export Excel
  - Vue 3 Global Production Build

## 📦 Struttura Progetto

```
prenotaqui/
├── index.html          # Pagina principale
├── app.js             # Logica applicazione (Vue.js + Firebase)
├── style.css          # Stili personalizzati
├── logofidas.png      # Logo FIDAS
├── README.md          # Questo file
└── LICENSE            # Licenza MIT
```

## 🔧 Installazione e Configurazione

### Prerequisiti
- Un account Firebase con Database Realtime abilitato
- Un server web (Apache, Nginx, o hosting statico)

### Setup

1. **Clona il repository:**
```bash
git clone https://github.com/LorisGioga/PrenotaQui-donazioni-sangue
cd prenotaqui
```

2. **Configura Firebase:**
   - Apri `app.js`
   - Sostituisci la configurazione Firebase con le tue credenziali:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAoToelGIbZy2w_Kk0u4HDFIB56AuQNwRU",
  authDomain: "fidas-san-giusto-can-2.firebaseapp.com",
  databaseURL: "https://fidas-san-giusto-can-2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fidas-san-giusto-can-2",
  storageBucket: "fidas-san-giusto-can-2.firebasestorage.app",
  messagingSenderId: "963864891985",
  appId: "1:963864891985:web:33161373f6712197751e70"
};
```

3. **Carica su server web:**
   - Carica tutti i file sul tuo server
   - Assicurati che `index.html` sia accessibile come pagina principale

4. **Configura Firebase Security Rules:**
```json
{
  "rules": {
    // Dati utente: solo il proprietario può accedere
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    
    // Configurazioni: lettura pubblica, scrittura solo autenticati
    "pageNames": {
      ".read": true,
      ".write": "auth != null"
    },
    "h4Texts": {
      ".read": true,
      ".write": "auth != null"
    },
    "blocks": {
      ".read": true,
      ".write": "auth != null"
    },
    "seatsPerSlot": {
      ".read": true,
      ".write": "auth != null"
    },
    
    // Password admin: solo utenti autenticati
    "adminPass": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    
    // Prenotazioni: lettura/scrittura solo autenticati
    "$pageId": {
      "prenotazioni": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

## 📱 Utilizzo

### Per i Donatori

1. **Prima Registrazione:**
   - Clicca su "Nuovo Utente"
   - Compila: Cognome, Nome, Matricola (dal tesserino), Email, Password
   - Clicca "Pagina Successiva"

2. **Accessi Successivi:**
   - Inserisci Email e Password
   - Clicca "Accedi"

3. **Prenotazione:**
   - Visualizza la lista persone idonee
   - Seleziona la pagina/data della donazione
   - Scegli una fascia oraria disponibile
   - Conferma la prenotazione

### Per gli Amministratori

1. **Accesso Area Riservata:**
   - Clicca "Area Riservata"
   - Inserisci password admin (default: `admin123`)

2. **Gestione Pagine:**
   - Aggiungi nuove pagine (es. "Gennaio 2026", "Febbraio 2026")
   - Rinomina pagine esistenti
   - Rimuovi pagine obsolete
   - Blocca/Sblocca prenotazioni per pagina

3. **Gestione Lista Idonei:**
   - Carica file Excel con colonne: `Matricola`, `Nome` ("COGNOME NOME")
   - Aggiorna il titolo della lista
   - Cancella lista quando necessario

4. **Operazioni Excel:**
   - **Scarica Excel:** Esporta tutte le prenotazioni
   - **Carica Excel:** Importa prenotazioni da file

## 🔐 Sicurezza e Privacy

- **GDPR Compliant:** Informativa privacy integrata
- **Autenticazione Firebase:** Password criptate
- **Mascheramento Dati:** I nomi sono mascherati per altri utenti
- **Admin Bypass:** Gli admin possono operare anche su pagine bloccate

## 🎯 Funzionalità Speciali

### Badge Posti Disponibili
- 🟢 **Verde:** Più di 3 posti disponibili
- 🟡 **Giallo:** 1-3 posti disponibili
- 🔴 **Rosso:** Nessun posto disponibile

### Evidenziazione Utente
- **Lista Idonei:** Riga con sfondo arancione
- **Tabella Prenotazioni:** Testo in arancione grassetto

### Limitazioni Excel
- I nomi dei fogli sono automaticamente troncati a 31 caratteri (limite Excel)

## 🐛 Troubleshooting

### Problema: "Sheet names cannot exceed 31 chars"
**Soluzione:** Aggiornato automaticamente in v1.1 - i nomi vengono troncati

### Problema: Lista idonei non si carica
**Soluzione:** Clicca sul pulsante "🔄 Aggiorna Lista"

### Problema: Password admin dimenticata
**Soluzione:** Accedi al Firebase Console → Realtime Database → `admin/password`

## 📄 Licenza

Questo progetto è rilasciato sotto licenza **MIT License**. Vedi il file [LICENSE](LICENSE) per i dettagli.

## 👥 Autori e Riconoscimenti

**Autore:** Loris Gioga  
**Sviluppato per:** Gruppo FIDAS adsp di San Giusto Canavese

- **Versione:** 2.0
- **Data Rilascio:** 31 Gennaio 2026
- **Ultima Modifica:** 31 Gennaio 2026

---

**Nota:** Questo software è di proprietà intellettuale dell'autore e può essere utilizzato, modificato e distribuito secondo i termini della licenza MIT.

## 📞 Supporto

Per supporto tecnico o segnalazione bug:
- 📧 Email: [inserisci email di supporto]
- 📱 Telefono: 333.78.36.256 (per nuovi donatori)

## 🔄 Changelog

### Versione 2.0.0 (31 Gennaio 2026) - 🎉 MAJOR RELEASE
**Redesign Completo e Nuove Funzionalità**

#### 🎨 Design e UX
- ✨ **Landing page completamente ridisegnata** con login diretto
- ✨ **Pagina registrazione separata** con info tesserino
- ✨ **Palette colori professionale FIDAS** (Blu, Rosso, Verde, Arancione, Viola)
- ✨ **Badge colorati** per disponibilità posti (Verde >3, Giallo 1-3, Rosso 0)
- ✨ **Animazioni e transizioni** moderne e fluide
- ✨ **Gradients** su tutti i pulsanti
- ✨ **Modal ridisegnati** con animazioni slide-in

#### 🔧 Funzionalità
- ✨ **Admin bypass** per pagine bloccate (admin può sempre operare)
- ✨ **Evidenziazione prenotazione utente** in arancione
- ✨ **Pulsante "Aggiorna Lista"** separato e ben visibile
- ✨ **Grammatica corretta** ("posto" vs "posti")
- ✨ **Disabilitazione fasce piene** nel select

#### 🐛 Bug Fix
- 🔧 **Fix: Limite 31 caratteri** per nomi fogli Excel
- 🔧 **Fix: Responsive** ottimizzato per mobile/tablet
- 🔧 **Fix: Margini pulsanti** corretti su tutte le pagine

#### 📱 Mobile/Tablet
- 📱 **Layout responsive** migliorato
- 📱 **Navigation** ottimizzata per schermi piccoli
- 📱 **Touch-friendly** buttons e spacing

#### 🎯 Miglioramenti UX
- ⚡ **Flow login** più intuitivo
- ⚡ **Feedback visivo** su tutte le azioni
- ⚡ **Hover effects** sui pulsanti
- ⚡ **Focus states** chiari per accessibilità

---

### Versione 1.0.0 (19 Gennaio 2026) - 🚀 INITIAL RELEASE
- 🎉 Prima release pubblica
- ✅ Sistema login/registrazione
- ✅ Gestione prenotazioni
- ✅ Area amministratore
- ✅ Import/Export Excel
- ✅ Lista persone idonee

---

⭐ **Se questo progetto ti è stato utile, lascia una stella su GitHub!** ⭐