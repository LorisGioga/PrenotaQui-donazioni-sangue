# Changelog - PrenotaQui

Tutte le modifiche importanti al progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/),
e questo progetto aderisce al [Semantic Versioning](https://semver.org/lang/it/).

---

## [2.2.0] - 2026-02-07

### 🐛 Bug Fix & Stability Release - FIXED VERSION

#### Corretto
- 🐛 **Bug Critico Autenticazione**: Risolto problema disconnessione automatica dopo registrazione
  - Aggiunto flag `isRegistering` per gestire correttamente lo stato di registrazione
  - Impedisce la disconnessione dell'utente durante il processo di creazione profilo
  - Sincronizzazione Firebase ottimizzata con `await` appropriati
  
- 🔒 **Gestione Profilo Utente**: Migliorata logica `onAuthStateChanged`
  - Previene warning "dati profilo mancanti" durante registrazione in corso
  - Controllo condizionale basato su `isRegistering.value`
  - Messaggio console più chiaro per debugging

- 🪟 **Posizionamento Modal**: Ottimizzato per evitare sovrapposizioni
  - Modal ora si apre 100px dall'alto invece che centrato verticalmente
  - Previene conflitti con header globale e footer fisso
  - Aggiunto supporto overflow-y per scroll su contenuti lunghi

- 🎨 **Evidenziazione Lista Idonei**: Migliorata leggibilità
  - Testo utente loggato ora in **bianco grassetto** su sfondo arancione
  - Font-size incrementato a 1.1em per maggiore visibilità
  - Text-shadow aggiunto per contrasto ottimale

#### Aggiunto
- ✨ **Messaggio Informativo Registrazione**: 
  - Avviso tempi di caricamento (5-6 secondi) dopo registrazione
  - Testo: "ℹ️ Dopo la registrazione il caricamento dei dati richiederà circa 5-6 secondi. Ti preghiamo di attendere."
  - Posizionato sotto il pulsante "Pagina Successiva"

- 📝 **Commenti Codice Migliorati**:
  - Documentazione inline per logica `isRegistering`
  - Note esplicative per timing Firebase sync
  - Chiarimenti su gestione stato autenticazione

#### Modificato
- ⏱️ **Timing Sincronizzazione Firebase**:
  - Primo delay aumentato da 500ms a 2000ms (dopo `createUserWithEmailAndPassword`)
  - Secondo delay aumentato da 1000ms a 2000ms (dopo `set` dati profilo)
  - Garantisce sincronizzazione completa prima di procedere

- 🔄 **Flusso Registrazione Ottimizzato**:
  ```javascript
  // Prima (problematico)
  createUser → set profilo → view=idoneiPage (troppo veloce)
  
  // Dopo (corretto)
  createUser → wait 2s → set profilo → wait 2s → view=idoneiPage
  ```

#### CSS Updates
```css
/* Modal posizionamento dall'alto */
.modal-overlay {
    align-items: flex-start;
    padding-top: 100px;
    overflow-y: auto;
}

/* Evidenziazione lista idonei */
.bookings-table tbody tr.highlight-user td {
    color: #ffffff !important;
    font-weight: bold !important;
    font-size: 1.1em !important;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}
```

#### Benefici
- ✅ **Esperienza Utente Migliorata**: Nessuna disconnessione inaspettata
- ✅ **Affidabilità**: Gestione robusta del flusso di registrazione
- ✅ **Chiarezza**: Messaggi informativi per attese previste
- ✅ **Accessibilità**: Testo bianco su arancione per contrasto WCAG AA
- ✅ **UX**: Modal posizionati correttamente senza sovrapposizioni

#### Impatto Tecnico
- 🔧 Stabilità autenticazione: **CRITICO** → Risolto
- 🎨 UX modal: **MEDIO** → Risolto
- 📱 Leggibilità mobile: **BASSO** → Migliorato
- ⏱️ Performance: Nessun impatto negativo (delay necessari per sync Firebase)

---

## [2.1.0] - 2026-02-07

### 🎨 UX Enhancement - Navigazione Migliorata

#### Aggiunto
- ✨ **Frecce Direzionali nei Pulsanti di Navigazione**
  - `← Indietro`: Freccia a sinistra prima del testo
  - `Avanti →`: Freccia a destra dopo il testo
  - `Pagina Successiva →`: Freccia a destra
- 🎨 **Guida Visiva Migliorata**: Le frecce guidano l'utente nel percorso di navigazione
- 📐 **Spacing Ottimizzato**: Gap di 8px tra freccia e testo per leggibilità

#### Modificato
- 🎨 **Pulsanti Avanti/Indietro**: Usano `display: inline-flex` per allineamento perfetto
- 📱 **Responsive Design**: Font-size adattivo su mobile (0.95em vs 0.9em desktop)
- 🎨 **Padding Uniforme**: 10px-18px su mobile per touch-friendly interface

#### CSS Updates
```css
.btn-forward,
.btn-back {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    font-size: 0.9em !important;
}
```

#### Benefici UX
- 👁️ **Maggiore Chiarezza**: Direzione di navigazione immediatamente visibile
- 🎯 **Coerenza Visiva**: Frecce dello stesso colore del pulsante (blu FIDAS)
- 📱 **Mobile-Friendly**: Spacing adattivo per schermi piccoli
- ♿ **Accessibilità**: Indicatori visivi chiari per tutti gli utenti

---

## [2.0.0] - 2026-02-03

### 🎉 MAJOR RELEASE - Redesign Completo

#### Aggiunto
- 🎨 **Landing Page Rinnovata**: Login e registrazione separati con design moderno
- 📝 **Pagina Registrazione Dedicata**: Form completo con indicazioni per tesserino FIDAS
- 🎨 **Palette Colori FIDAS**: Blu, Rosso, Verde, Arancione, Viola con gradienti
- 🏷️ **Badge Posti Disponibili**: 
  - Verde (>3 posti)
  - Giallo (1-3 posti)
  - Rosso (0 posti)
- 🔴 **Evidenziazione Utente**: Testo rosso FIDAS per prenotazione personale
- 🔄 **Pulsante Aggiorna Lista**: Separato con sottotitolo dedicato per lista idonei
- 🔓 **Admin Bypass**: Gli admin possono operare anche su pagine bloccate
- ✨ **Animazioni Moderne**: Transizioni fluide e hover effects
- 🪟 **Modal Ridisegnati**: Con animazione slide-in dall'alto
- 📊 **Grammatica Corretta**: "posto" vs "posti" gestito dinamicamente
- 🚫 **Disabilitazione Fasce Piene**: Nel dropdown di selezione
- 🌐 **Header Globale**: Barra superiore con logo e nome gruppo sempre visibile
- 📍 **Footer Dinamico**: Contatti configurabili dall'area admin
  - Email gruppo
  - Telefono
  - WhatsApp
  - Indirizzo
  - Sito web

#### Modificato
- 🎨 **Design Completo**: Interfaccia completamente ridisegnata
- 🧭 **UX Flow**: Navigazione più intuitiva e user-friendly
- 🎨 **Pulsanti con Colori Distintivi**:
  - 🟦 Blu FIDAS: Avanti/Indietro
  - 🟣 Viola: Area Riservata
  - 🟢 Verde: Prenota/Aggiorna
  - 🟠 Arancione: Esci Area Riservata
  - 🔴 Rosso: Esci/Reset
- 📱 **Responsive Ottimizzato**: Layout mobile e tablet migliorati
- 📋 **Tabelle Moderne**: 
  - Header blu FIDAS con gradiente
  - Righe alternate (#e3f2fd / #f8f9fa)
  - Hover effect con scale transform
- 📝 **Input Fields**: Focus states migliorati per accessibilità
- 🎨 **Landing Page con Due Colonne**:
  - Sinistra: Calendario donazioni + Info medico
  - Destra: Form login + Registrazione

#### Corretto
- 🐛 **Excel Export**: Limite 31 caratteri per nomi fogli (requisito Excel)
- 🐛 **Margini Pulsanti**: Spaziatura corretta su tutte le pagine
- 🐛 **Layout Mobile**: Pulsanti che si adattano correttamente
- 🐛 **Navigation**: Allineamento pulsanti consistente
- 🐛 **Footer Multiriga**: Spacing corretto su schermi piccoli (padding-bottom: 180px)

#### Sicurezza
- 🔒 **Admin Privileges**: Bypass blocchi pagine solo per admin autenticati
- 📜 **GDPR Compliance**: Informativa privacy integrata e aggiornata
- 🔐 **Validazione Doppia Prenotazione**: Controllo su tutte le pagine esistenti

#### Performance
- ⚡ **Animazioni Ottimizzate**: Transizioni CSS invece di JavaScript
- 🎯 **CSS Custom Properties**: Variabili per manutenibilità
- 📦 **Gradienti Riutilizzabili**: Codice CSS più pulito

---

## [1.0.0] - 2026-01-19

### 🚀 INITIAL RELEASE

#### Aggiunto
- 🔐 **Sistema di Autenticazione**: Login e registrazione con Firebase
- 📅 **Gestione Prenotazioni**: Selezione fasce orarie (8 fasce + Riserve)
- 👥 **Lista Persone Idonee**: Visualizzazione con mascheramento nomi
- 🔧 **Area Amministratore**:
  - Gestione pagine (crea, rinomina, elimina)
  - Blocco prenotazioni per pagina
  - Import/Export Excel
  - Modifica posti per fascia (seatsPerSlot)
  - Gestione password admin
  - Caricamento lista idonei da Excel
- 🔒 **Protezione Dati**: Conforme GDPR
- 📱 **Responsive Design**: Base per mobile e desktop
- 🪟 **Sistema Modale**: Alert, Confirm, Prompt personalizzati
- 🔥 **Firebase Integration**: 
  - Realtime Database per sincronizzazione dati
  - Authentication per gestione utenti

#### Caratteristiche Tecniche
- ⚙️ Vue.js 3 (Composition API con `<script setup>`)
- 🔥 Firebase Authentication
- 📊 Firebase Realtime Database
- 📑 SheetJS (xlsx) per Import/Export Excel
- 🎨 CSS Custom Properties (variabili CSS)
- 🔄 Reactive Data con Vue 3

#### Funzionalità Base
- 📝 Registrazione con: Cognome, Nome, Matricola, Email, Password
- 🔑 Login con: Email, Password
- 📋 8 Fasce orarie configurabili + Riserve illimitate
- 🎯 Mascheramento nomi: "Ro.. Gi.." (primi 2 caratteri)
- 🚫 Prevenzione doppia prenotazione
- 📊 Visualizzazione posti disponibili
- 📤 Export Excel con colonne: Giorno, Fascia, Matricola, Nome
- 📥 Import Excel con validazione dati

---

## Formato Versioning

Formato: `MAJOR.MINOR.PATCH`

- **MAJOR**: Cambiamenti incompatibili (breaking changes)
- **MINOR**: Nuove funzionalità compatibili
- **PATCH**: Bug fix compatibili

---

## Legenda Emoji

### Tipologia Modifiche
- ✨ Nuova funzionalità
- 🐛 Bug fix
- 🎨 Design/UI
- ⚡ Prestazioni
- 🔒 Sicurezza
- 📱 Mobile
- 🔧 Manutenzione
- 📝 Documentazione
- ♿ Accessibilità
- 🔥 Rimozione codice/feature
- 💥 Breaking changes

### Componenti
- 🪟 Modal/Dialog
- 📋 Tabelle
- 🎨 Stili/CSS
- 🔐 Autenticazione
- 📊 Database
- 📤 Export
- 📥 Import
- 🧭 Navigazione
- 🏷️ Badge/Label

---

## Prossime Release (Roadmap)

### [2.3.0] - Pianificato
- 📧 **Notifiche Email**: Conferma prenotazione via email
- 📅 **Esportazione Calendario**: File .ics per Google/Apple Calendar
- 📊 **Dashboard Statistiche**: Grafici donazioni mensili/annuali
- 🔔 **Sistema Promemoria**: Notifiche 24h prima della donazione

### [3.0.0] - Futuro
- 📱 **App Mobile Nativa**: iOS e Android
- 🌍 **Multilingua**: Supporto IT/EN/FR
- 📄 **Certificati PDF**: Generazione automatica certificati donazione
- 🔗 **API REST**: Integrazione con sistemi esterni
- 👤 **Profilo Donatore**: Storico donazioni personale
- 🧪 **Test Suite**: Unit test e integration test
- 📈 **Analytics**: Monitoraggio utilizzo e metriche

---

## Bug Fix Critici Risolti

### v2.2.0
- ✅ **Disconnessione Post-Registrazione**: Utente non viene più disconnesso dopo la creazione dell'account
- ✅ **Modal Overlap**: Modal non si sovrappongono più a header/footer
- ✅ **Leggibilità Lista Idonei**: Testo utente loggato ora chiaramente visibile

### v2.0.0
- ✅ **Excel Sheet Names**: Nomi fogli troncati automaticamente a 31 caratteri
- ✅ **Layout Mobile**: Pulsanti responsive corretti su tutti gli schermi
- ✅ **Footer Mobile**: Padding corretto per footer multiriga

### v1.0.0
- ✅ **Doppia Prenotazione**: Sistema di validazione cross-page implementato
- ✅ **Autenticazione**: Gestione corretta sessioni Firebase

---

## Link Versioni

**[Unreleased]**: https://github.com/LorisGioga/PrenotaQui-donazioni-sangue/compare/v2.2.0...HEAD  
**[2.2.0]**: https://github.com/LorisGioga/PrenotaQui-donazioni-sangue/compare/v2.1.0...v2.2.0  
**[2.1.0]**: https://github.com/LorisGioga/PrenotaQui-donazioni-sangue/compare/v2.0.0...v2.1.0  
**[2.0.0]**: https://github.com/LorisGioga/PrenotaQui-donazioni-sangue/compare/v1.0.0...v2.0.0  
**[1.0.0]**: https://github.com/LorisGioga/PrenotaQui-donazioni-sangue/releases/tag/v1.0.0

---

## Contributi

Per contribuire al progetto:

1. Fork il repository
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

### Linee Guida per i Contributor
- Segui lo stile di codice esistente
- Aggiungi commenti per logiche complesse
- Testa su mobile e desktop
- Aggiorna il CHANGELOG.md
- Documenta nuove feature nel README.md

---

## Testing Checklist

### Pre-Release v2.2.0
- [x] Registrazione nuovo utente funziona senza disconnessione
- [x] Login utente esistente carica correttamente i dati
- [x] Modal si posizionano correttamente (100px dall'alto)
- [x] Lista idonei mostra utente loggato con testo bianco
- [x] Import/Export Excel funziona con nomi fogli lunghi
- [x] Admin bypass funziona su pagine bloccate
- [x] Responsive design OK su mobile (iPhone, Android)
- [x] Responsive design OK su tablet (iPad)
- [x] Footer contatti visibili e cliccabili
- [x] Navigazione frecce funziona correttamente

---

## Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

---

## Ringraziamenti Speciali

- 🙏 **Firebase Team**: Per la piattaforma affidabile
- 🙏 **Vue.js Team**: Per il framework reattivo
- 🙏 **SheetJS**: Per la libreria Excel robusta
- 🙏 **FIDAS Piemonte**: Per il supporto organizzativo
- 🙏 **Gruppo FIDAS San Giusto**: Per il testing e feedback

---

**Autore:** Loris Gioga  
**Organizzazione:** Gruppo FIDAS adsp di San Giusto Canavese  
**Contatto:** 333.78.36.256  
**Versione Corrente:** 2.2.0 - FIXED VERSION  
**Ultima Modifica:** 07 Febbraio 2026