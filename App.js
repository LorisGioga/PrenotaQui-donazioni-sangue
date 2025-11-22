// programma fire base: FIDAS SAN GIUSTO CAN 2
//import { initializeApp } from 'hhttps://www.gstatic.com/firebasejs/12.5.0/firebase-app.js';
//import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js';
//import { getDatabase, ref, push, onValue, set, get, child, remove } from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js';

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js';

// Auth functions from firebase-auth.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js';

// Database functions from firebase-database.js
// HO AGGIUNTO L'IMPORTAZIONE DI 'update' QUI
import { getDatabase, ref, push, onValue, set, get, child, remove, update } from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js';

const { createApp, reactive, ref: vueRef } = Vue;

const firebaseConfig = {
  apiKey: "AIzaSyAoToelGIbZy2w_Kk0u4HDFIB56AuQNwRU",
  authDomain: "fidas-san-giusto-can-2.firebaseapp.com",
  databaseURL: "https://fidas-san-giusto-can-2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fidas-san-giusto-can-2",
  storageBucket: "fidas-san-giusto-can-2.firebasestorage.app",
  messagingSenderId: "963864891985",
  appId: "1:963864891985:web:33161373f6712197751e70"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

createApp({
  setup() {
    const view = vueRef('landing');
    const seatsPerSlot = vueRef(6); // ORA È MODIFICABILE
    const user = reactive({ lastName:'', firstName:'', matricola:'', email:'', password:'', pageChoice:'page1' });
    const booking = reactive({ matricola:'', name:'', slot: null });
    const slots = [
      { id:0, label:'07:50 – 08:05' }, { id:1, label:'08:10 – 08:30' },
      { id:2, label:'08:35 – 08:55' }, { id:3, label:'09:00 – 09:20' },
      { id:4, label:'09:25 – 09:45' }, { id:5, label:'09:50 – 10:10' },
      { id:6, label:'10:15 – 10:35' }, { id:7, label:'10:40 – 11:00' },
      { id:8, label:'Riserve' }
    ];
    const bookingsBySlot = reactive({});
    const isAdmin = vueRef(false);
    // Voci dinamiche per le pagine
    const pageNames = reactive({}); 
    const blocks = reactive({});
    const newPageName = vueRef(''); // Variabile per la nuova pagina admin
    
    const texts = reactive({ 
      landing:'Se sei un nuovo donatore o non fai parte di questo gruppo, contatta il N. 333.78.36.256 o uno del Direttivo, ci penseremo noi ad inserirti nella lista.', 
      pageSelect:"Si prega di avere con sé la carta d' IDENTITA' ed il tesserino FIDAS" 
    });
    
    const fileInput = vueRef(null);
    const adminPass = vueRef('');

    // ===================================
    // Inizializzazioni DB (AGGIORNATE per pagine dinamiche)
    // ===================================
    get(ref(db, 'adminPass')).then(s => { if (!s.exists()) set(ref(db, 'adminPass'), 'admin123'); });
    get(ref(db, 'h4Texts')).then(s => { if (!s.exists()) set(ref(db, 'h4Texts'), texts); });
    
    // INIZIALIZZAZIONE DINAMICA PAGINE: Assicura che ci sia almeno una pagina
    get(ref(db, 'pageNames')).then(s => { 
      if (!s.exists() || Object.keys(s.val()).length === 0) {
        set(ref(db, 'pageNames'), { page1: 'Pagina 1' });
        set(ref(db, 'blocks/page1'), false);
        user.pageChoice = 'page1';
      } else {
        const keys = Object.keys(s.val());
        if (!keys.includes(user.pageChoice)) {
             user.pageChoice = keys[0];
        }
      }
    });

    // INIZIALIZZA IL NUMERO DI POSTI PER FASCIA
    get(ref(db, 'seatsPerSlot')).then(s => { 
      if (!s.exists()) {
        set(ref(db, 'seatsPerSlot'), 6);
      } else {
        seatsPerSlot.value = s.val();
      }
    });

    // Listener per lo stato di autenticazione
    onAuthStateChanged(auth, u => {
      if (u) {
        get(child(ref(db), `users/${u.uid}`))
          .then(snap => {
            if (snap.exists()) {
              Object.assign(user, snap.val());
              // Assicura che l'utente abbia una pagina scelta valida
              if (!Object.keys(pageNames).includes(user.pageChoice)) {
                user.pageChoice = Object.keys(pageNames)[0] || 'landing';
              }
              console.log("Dati utente caricati all'avvio:", user);
            } else {
              console.warn("Utente autenticato (Auth) ma dati profilo mancanti nel DB:", u.uid);
            }
            console.log("Utente autenticato rilevato. Rimango sulla landing page (o vista corrente).");
          })
          .catch(dbError => {
            console.error("Errore caricamento dati utente all'avvio:", dbError);
          });
      } else {
        view.value = 'landing';
        isAdmin.value = false;
        console.log("Nessun utente autenticato. Vado sulla landing page.");
        user.lastName = ''; 
        user.firstName = ''; 
        user.matricola = '';
        user.email = ''; 
        user.password = '';
      }
    });

    // ===================================
    // LISTENERS
    // ===================================
    onValue(ref(db, 'pageNames'), snap => snap.val() && Object.assign(pageNames, snap.val()));
    onValue(ref(db, 'h4Texts'), snap => snap.val() && Object.assign(texts, snap.val()));
    onValue(ref(db, 'blocks'), snap => snap.val() && Object.assign(blocks, snap.val()));
    onValue(ref(db,'adminPass'),s=>adminPass.value=s.val()||'admin123');
    onValue(ref(db, 'seatsPerSlot'), s => {
      if (s.exists()) {
        seatsPerSlot.value = s.val();
      }
    });
    // ===================================

    const remaining = slot => seatsPerSlot.value - (bookingsBySlot[slot.id]?.length || 0);
    
    // FUNZIONE MASK MIGLIORATA: mostra nome completo per l'utente loggato
    const mask = (name, matricola) => {
      // Se l'utente loggato ha la stessa matricola, mostra il nome completo
      if (user.matricola && matricola === user.matricola) {
        return name;
      }
      // Altrimenti maschera il nome
      return name.split(' ').map(p => p.slice(0,2)+'..').join(' ');
    };

    function focusNext(e) {
      const form = e.target.form;
      const idx = Array.prototype.indexOf.call(form, e.target);
      if (idx > -1 && idx + 1 < form.elements.length) {
        form.elements[idx + 1]?.focus();
      }
    }

    function register() {
      if (!validateAuthFields()) return;

      createUserWithEmailAndPassword(auth, user.email, user.password)
        .then(cred => {
          set(ref(db, `users/${cred.user.uid}`), {
            lastName: user.lastName,
            firstName: user.firstName,
            matricola: user.matricola,
            email: user.email
          })
          .then(() => {
            alert('Registrazione effettuata con successo! Ora puoi procedere.');
            view.value = 'pageSelect';
            loadBookings();
          })
          .catch(dbError => {
            console.error("Errore salvataggio dati utente dopo registrazione:", dbError);
            alert(`Errore nel salvare i dati utente: ${dbError.message}. Riprova o contatta l'amministrazione.`);
          });
        })
        .catch(authError => {
          console.error("Errore registrazione:", authError);
          alert(`Errore durante la registrazione: ${authError.message}`);
        });
    }

    function login() {
      if (!validateAuthFields()) return;

      signInWithEmailAndPassword(auth, user.email, user.password)
        .then(cred => {
          get(child(ref(db), `users/${cred.user.uid}`))
          .then(snap => {
            if (snap.exists()) {
              Object.assign(user, snap.val());
              alert('Accesso effettuato con successo!');
              view.value = 'pageSelect';
              loadBookings();
            } else {
              console.warn("Utente autenticato (Auth) ma dati profilo mancanti nel DB:", cred.user.uid);
              alert('Accesso effettuato, ma dati profilo non trovati nel database. Contatta l\'amministrazione.');
              signOut(auth);
            }
          })
          .catch(dbError => {
            console.error("Errore caricamento dati utente dopo login:", dbError);
            alert(`Errore nel caricare i dati utente dal database: ${dbError.message}`);
            signOut(auth);
          });
        })
        .catch(authError => {
          console.error("Errore login:", authError);
          alert(`Errore durante l\'accesso: ${authError.message}`);
        });
    }

    function validateAuthFields() {
      if (!user.lastName || !user.firstName || !user.matricola || !user.email || !user.password) {
        alert('Per favore, compila tutti i campi (Cognome, Nome, Matricola, E-mail, Password) per procedere.');
        return false;
      }
      return true;
    }

    function logout() {
      signOut(auth).then(() => {
        console.log("Utente disconnesso");
      }).catch((error) => {
        console.error("Errore durante la disconnessione:", error);
        alert("Si è verificato un errore durante la disconnessione.");
      });
    }

    function enterPage() {
      if (!auth.currentUser) {
        alert("Devi accedere per prenotare.");
        view.value = 'auth';
        return;
      }
      // Verifica se la scelta pagina è valida
      if (!Object.keys(pageNames).includes(user.pageChoice)) {
        alert("Selezione pagina non valida. Scegli una pagina disponibile.");
        return;
      }
      if (blocks[user.pageChoice]) {
        alert('Al momento la pagina di prenotazione è bloccata. Sarai avvisato quando sarà disponibile.');
        return;
      }
      view.value = user.pageChoice; 
      loadBookings();
    }

    function loadBookings() { 
      onValue(ref(db, `${user.pageChoice}/prenotazioni`), snap => { 
        const data=snap.val()||{}; 
        slots.forEach(s=>bookingsBySlot[s.id]=[]); 
        Object.entries(data).forEach(([key,b])=>bookingsBySlot[b.slot].push({...b,key})); 
      }); 
    }

    async function book() {
      if (!auth.currentUser) {
        alert("Devi accedere per prenotare.");
        view.value = 'auth';
        return;
      }
      if (booking.slot==null) return alert('Seleziona fascia');

      const matricolaToCheck = isAdmin.value ? booking.matricola : user.matricola;
      if (!matricolaToCheck) return alert('Matricola mancante');

      try {
        // Itera su TUTTE le pagine per verificare se la matricola è già prenotata
        const pageKeys = Object.keys(pageNames);
        for (let p of pageKeys) {
          const snap = await get(ref(db, `${p}/prenotazioni`));
          const list = snap.val() ? Object.values(snap.val()) : [];
          if (list.find(b => b.matricola === matricolaToCheck)) {
            if (!isAdmin.value) {
              // Pulizia form non admin
              booking.name = '';
              booking.matricola = '';
              booking.slot = null;
            } else {
              // Pulizia form admin
              booking.name = '';
              booking.matricola = '';
              booking.slot = null;
            }
            return alert(`Matricola già prenotata in un altro giorno (${pageNames[p]}).`);
          }
        }

        const nome = isAdmin.value ? booking.name : `${user.lastName} ${user.firstName}`;
        if (!nome) return alert('Nome/Cognome mancante per la prenotazione');

        // Controlla disponibilità posti anche per l'admin
        const currentSlotBookings = bookingsBySlot[booking.slot] || [];
        const maxSeats = booking.slot === 8 ? 9999 : seatsPerSlot.value; // Riserve illimitate

        if (currentSlotBookings.length >= maxSeats) {
             return alert(`Posti esauriti per la fascia selezionata (${slots.find(s => s.id === booking.slot).label}).`);
        }

        await push(ref(db, `${user.pageChoice}/prenotazioni`), {
          name: nome,
          matricola: matricolaToCheck,
          slot: booking.slot
        });

        booking.name = '';
        booking.matricola = '';
        booking.slot = null;

        alert('Prenotazione registrata con successo!');

      } catch (error) {
        console.error("Errore durante la prenotazione:", error);
        alert(`Si è verificato un errore: ${error.message}`);
      }
    }

    function confirmBook() {
      if (!auth.currentUser) {
        alert("Devi accedere per prenotare.");
        view.value = 'auth';
        return;
      }
      if (confirm('Confermi la prenotazione per la fascia selezionata?')) book();
    }

    function adminLogin() {
      const p=prompt('Password admin:');
      if (!p) return;
      get(ref(db,'adminPass')).then(s=>{
        if(s.exists() && s.val()===p) {
          isAdmin.value=true;
          alert('Accesso Admin effettuato');
        } else {
          alert('Password admin errata');
        }
      }).catch(e => {
        console.error("Errore lettura password admin:", e);
        alert("Errore nel verificare la password admin.");
      });
    }

    function exitAdmin() { 
      isAdmin.value=false; 
      alert('Uscito Area Riservata'); 
    }

    // ===================================
    // NUOVE FUNZIONI ADMIN (PAGINE)
    // ===================================
    function addPage() {
      const name = newPageName.value.trim();
      if (!name) return alert('Inserisci un nome per la nuova pagina.');
      
      const newKey = 'page' + Date.now(); // Genera una chiave univoca
      
      const updates = {};
      updates[`pageNames/${newKey}`] = name;
      updates[`blocks/${newKey}`] = false;
      
      update(ref(db), updates)
        .then(() => {
          alert(`Pagina "${name}" aggiunta con successo.`);
          newPageName.value = '';
        })
        .catch(e => console.error("Errore addPage:", e));
    }
    
    function removePage(key) {
      if(Object.keys(pageNames).length <= 1) {
        return alert('Non puoi eliminare l\'ultima pagina disponibile.');
      }
      const pageName = pageNames[key]; // Salva il nome prima della cancellazione
      if(confirm(`ATTENZIONE: Eliminare la pagina "${pageName}" cancellerà TUTTE le prenotazioni ad essa associate. Confermi?`)){
        // Rimuove localmente la pagina prima di rimuoverla da Firebase
        delete pageNames[key];
        delete blocks[key];
        
        // Rimuove il nome della pagina
        remove(ref(db, `pageNames/${key}`))
          .then(() => remove(ref(db, `blocks/${key}`))) // Rimuove il blocco
          .then(() => remove(ref(db, key))) // Rimuove la cartella della pagina con tutte le prenotazioni
          .then(() => {
            alert(`Pagina "${pageName}" eliminata con successo.`);
            // Aggiorna la scelta pagina utente se è stata rimossa
            if (user.pageChoice === key) {
              const remainingKeys = Object.keys(pageNames);
              user.pageChoice = remainingKeys.length > 0 ? remainingKeys[0] : 'page1';
            }
          })
          .catch(e => {
            console.error("Errore removePage:", e);
            alert(`Errore durante l'eliminazione della pagina: ${e.message}. Controlla la console per i dettagli.`);
            // In caso di errore, ricarica i dati da Firebase
            location.reload();
          });
      }
    }
    // ===================================

    // Funzione modificata per accettare il nuovo nome
    function updatePageName(key, newName) { 
        if (newName.trim() === '') return alert('Il nome della pagina non può essere vuoto.');
        set(ref(db,`pageNames/${key}`), newName).catch(e => console.error("Errore updatePageName:", e)); 
    }
    
    function updateText(k) { 
      set(ref(db,`h4Texts/${k}`), texts[k]).catch(e => console.error("Errore updateText:", e)); 
    }
    
    function updateBlock(p) { 
      set(ref(db,`blocks/${p}`), blocks[p]).catch(e => console.error("Errore updateBlock:", e)); 
    }
    
    function updateAdminPass() { 
      set(ref(db,'adminPass'), adminPass.value).catch(e => console.error("Errore updateAdminPass:", e)); 
    }
    
    // NUOVA FUNZIONE PER AGGIORNARE IL NUMERO DI POSTI PER FASCIA
    function updateSeatsPerSlot() {
      const newValue = parseInt(seatsPerSlot.value);
      if (isNaN(newValue) || newValue < 1 || newValue > 20) {
        alert('Inserisci un numero valido tra 1 e 20');
        // Ricarica il valore dal database
        get(ref(db, 'seatsPerSlot')).then(s => {
          if (s.exists()) seatsPerSlot.value = s.val();
        });
        return;
      }
      set(ref(db, 'seatsPerSlot'), newValue)
        .then(() => alert('Numero posti per fascia aggiornato con successo!'))
        .catch(e => {
          console.error("Errore updateSeatsPerSlot:", e);
          alert('Errore durante l\'aggiornamento');
        });
    }
    
    function removeBooking(key) {
      if(confirm('Confermi cancellazione prenotazione?')){
        remove(ref(db,`${user.pageChoice}/prenotazioni/${key}`)).catch(e => console.error("Errore removeBooking:", e));
      }
    }
    
    function resetAll() {
      if(confirm('ATTENZIONE: Questa operazione cancellerà TUTTE le prenotazioni per questa pagina. Confermi reset?')){
        remove(ref(db,`${user.pageChoice}/prenotazioni`)).catch(e => console.error("Errore resetAll:", e));
      }
    }

    function exportExcel() {
      const wb=XLSX.utils.book_new(), data=[];
      slots.forEach(s=>bookingsBySlot[s.id]?.forEach(b=>data.push({ 
        Giorno:pageNames[user.pageChoice], 
        Fascia:(s.id===8?'Riserve':s.label), 
        Matricola:b.matricola, 
        Nome:b.name 
      })));
      const ws=XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb,ws,pageNames[user.pageChoice]||'Prenotazioni');
      XLSX.writeFile(wb,`prenotazioni_${user.pageChoice}.xlsx`);
    }
    
    function importExcel() { 
      fileInput.value.click(); 
    }

    function handleFileUpload(e) {
      const reader=new FileReader();
      reader.onload=evt=>{
        try {
          const wb=XLSX.read(evt.target.result,{type:'binary'});
          if (!wb.SheetNames || wb.SheetNames.length === 0) {
            throw new Error("File Excel non valido: nessun foglio trovato.");
          }
          const sheetName = wb.SheetNames[0];
          const rows=XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);

          if(!Array.isArray(rows)) {
            throw new Error("Formato dati nel foglio Excel non valido.");
          }

          if(confirm('ATTENZIONE: Importando, sovrascriverai TUTTE le prenotazioni attuali per questa pagina. Confermi carica?')){
            remove(ref(db,`${user.pageChoice}/prenotazioni`)).then(()=> {
              const updates = {};
              let rowErrors = 0;
              rows.forEach(r=>{
                const slotObj=slots.find(s=>(s.id===8?'Riserve':s.label)===r.Fascia);
                if(slotObj && r.Matricola && r.Nome) {
                  const newKey = push(ref(db,`${user.pageChoice}/prenotazioni`)).key;
                  if (newKey) {
                    updates[newKey] = { name:r.Nome, matricola:r.Matricola, slot:slotObj.id };
                  } else {
                    console.warn("Impossibile generare chiave per riga importata:", r);
                    rowErrors++;
                  }
                } else {
                  console.warn("Riga Excel non valida o incompleta (richiede Fascia, Matricola, Nome):", r);
                  rowErrors++;
                }
              });

              if (Object.keys(updates).length > 0) {
                set(ref(db,`${user.pageChoice}/prenotazioni`), updates)
                .then(() => {
                  alert(`Importazione Excel completata con successo! ${rowErrors > 0 ? `Attenzione: ${rowErrors} righe con errori o incomplete non sono state importate.` : ''}`);
                })
                .catch(e => alert(`Errore durante il salvataggio dei dati importati: ${e.message}`));
              } else {
                alert(`Nessun dato valido trovato nel file Excel da importare. ${rowErrors > 0 ? `(${rowErrors} righe con errori nel formato)` : ''}`);
              }

            }).catch(e => alert(`Errore durante la pulizia delle prenotazioni esistenti prima dell'importazione: ${e.message}`));
          }
        } catch (error) {
          alert(`Errore durante la lettura del file Excel: ${error.message}. Assicurati che sia un file Excel valido (.xlsx) e abbia le colonne 'Fascia', 'Matricola', 'Nome'.`);
        }
        e.target.value = null;
      };
      if (e.target.files && e.target.files[0]) {
        reader.readAsBinaryString(e.target.files[0]);
      }
    }

    return { 
      view, user, booking, slots, bookingsBySlot, seatsPerSlot, pageNames, texts, blocks, isAdmin, adminPass, newPageName,
      remaining, mask, register, login, logout, enterPage, loadBookings, confirmBook, adminLogin, exitAdmin, 
      updatePageName, updateText, updateBlock, updateAdminPass, updateSeatsPerSlot, removeBooking, resetAll, exportExcel, 
      importExcel, handleFileUpload, focusNext, fileInput, 
      addPage, removePage // Funzioni per la gestione dinamica delle pagine
    };
  }
}).mount('#app');