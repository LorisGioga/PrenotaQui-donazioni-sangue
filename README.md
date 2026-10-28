# PrenotaQui EVO

App web per le prenotazioni delle donazioni di sangue del
Gruppo FIDAS San Giusto Canavese.

## Cosa fa
- Registrazione e accesso dei donatori (e-mail e password)
- Calendario con le date di donazione: prenotazioni aperte, chiuse, concluse
- Controllo della presenza nella lista idonei di ogni data
- Prenotazione della fascia oraria (una sola data per volta)
- Area riservata: date, liste idonei (Excel), prenotazioni, testi, contatti, posti per fascia
- Stampa e Excel di prenotazioni e idonei

## Tecnologie
Vue.js 3, Firebase (Authentication + Realtime Database), SheetJS (Excel).

## File
- `index.html`: pagine e struttura
- `app.js`: logica e collegamento a Firebase
- `style.css`: grafica

## Configurazione
1. In `app.js` il blocco `firebaseConfig` contiene i dati del progetto Firebase.
2. Le regole del database sono nel file delle regole Firebase.
3. L'amministratore è chi ha `admins/{uid} = true` nel database.
4. Il dominio del sito deve essere tra i domini autorizzati di Firebase Authentication.

## Uso
Guida per i donatori: https://sites.google.com/view/fidas-gruppo-san-giusto-can/prenotazioni/guida-per-prenotaqui

## Versioni
- v2: versione precedente (tag `backup-v2-prima-di-evo`)
- EVO: versione attuale