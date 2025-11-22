// programma fire base: FIDAS SAN GIUSTO CAN 2
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js';
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
    const seatsPerSlot = vueRef(6);
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
    const pageNames = reactive({}); 
    const blocks = reactive({});
    const newPageName = vueRef('');
    
    const texts = reactive({ 
      landing:'Se sei un nuovo donatore o non fai parte di questo gruppo, contatta il N. 333.78.36.256 o uno del Direttivo, ci penseremo noi ad inserirti nella lista.', 
      pageSelect:"Si prega di avere con sé la carta d' IDENTITA' ed il tesserino FIDAS" 
    });
    
    const fileInput = vueRef(null);
    const adminPass = vueRef('');

    // ===================================
    // SISTEMA MODALE PERSONALIZZATI
    // ===================================
    const modal = reactive({
      show: false,
      type: 'alert', // 'alert', 'confirm', 'prompt'
      title: '',
      message: '',
      input: '',
      resolve: null
    });

    function showAlert(message, title = 'Notifica') {
      return new Promise(resolve => {
        modal.type = 'alert';
        modal.title = title;
        modal.message = message;
        modal.show = true;
        modal.resolve = resolve;
      });
    }

    function showConfirm(message, title = 'Conferma') {
      return new Promise(resolve => {
        modal.type = 'confirm';
        modal.title = title;
        modal.message = message;
        modal.show = true;
        modal.resolve = resolve;
      });
    }

    function showPrompt(message, title = 'Inserisci') {
      return new Promise(resolve => {
        modal.type = 'prompt';
        modal.title = title;
        modal.message = message;
        modal.input = '';
        modal.show = true;
        modal.resolve = resolve;
      });
    }

    function modalConfirm() {
      if (modal.resolve) {
        if (modal.type === 'prompt') {
          modal.resolve(modal.input);
        } else {
          modal.resolve(true);
        }
      }
      modal.show = false;
      modal.input = '';
    }

    function modalCancel() {
      if (modal.resolve) {
        modal.resolve(modal.type === 'prompt' ? null : false);
      }
      modal.show = false;
      modal.input = '';
    }

    // ===================================
    // INIZIALIZZAZIONI DB
    // ===================================
    get(ref(db, 'adminPass')).then(s => { if (!s.exists()) set(ref(db, 'adminPass'), 'admin123'); });
    get(ref(db, 'h4Texts')).then(s => { if (!s.exists()) set(ref(db, 'h4Texts'), texts); });
    
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

    get(ref(db, 'seatsPerSlot')).then(s => { 
      if (!s.exists()) {
        set(ref(db, 'seatsPerSlot'), 6);
      } else {
        seatsPerSlot.value = s.val();
      }
    });

    onAuthStateChanged(auth, u => {
      if (u) {
        get(child(ref(db), `users/${u.uid}`))
          .then(snap => {
            if (snap.exists()) {
              Object.assign(user, snap.val());
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

    onValue(ref(db, 'pageNames'), snap => snap.val() && Object.assign(pageNames, snap.val()));
    onValue(ref(db, 'h4Texts'), snap => snap.val() && Object.assign(texts, snap.val()));
    onValue(ref(db, 'blocks'), snap => snap.val() && Object.assign(blocks, snap.val()));
    onValue(ref(db,'adminPass'),s=>adminPass.value=s.val()||'admin123');
    onValue(ref(db, 'seatsPerSlot'), s => {
      if (s.exists()) {
        seatsPerSlot.value = s.val();
      }
    });

    const remaining = slot => seatsPerSlot.value - (bookingsBySlot[slot.id]?.length || 0);
    
    const mask = (name, matricola) => {
      if (user.matricola && matricola === user.matricola) {
        return name;
      }
      return name.split(' ').map(p => p.slice(0,2)+'..').join(' ');
    };

    function focusNext(e) {
      const form = e.target.form;
      const idx = Array.prototype.indexOf.call(form, e.target);
      if (idx > -1 && idx + 1 < form.elements.length) {
        form.elements[idx + 1]?.focus();
      }
    }

    async function register() {
      if (!validateAuthFields()) return;

      try {
        const cred = await createUserWithEmailAndPassword(auth, user.email, user.password);
        await set(ref(db, `users/${cred.user.uid}`), {
          lastName: user.lastName,
          firstName: user.firstName,
          matricola: user.matricola,
          email: user.email
        });
        await showAlert('Registrazione effettuata con successo! Ora puoi procedere.', 'Successo');
        view.value = 'pageSelect';
        loadBookings();
      } catch (error) {
        console.error("Errore registrazione:", error);
        await showAlert(`Errore durante la registrazione: ${error.message}`, 'Errore');
      }
    }

    async function login() {
      if (!validateAuthFields()) return;

      try {
        const cred = await signInWithEmailAndPassword(auth, user.email, user.password);
        const snap = await get(child(ref(db), `users/${cred.user.uid}`));
        
        if (snap.exists()) {
          Object.assign(user, snap.val());
          await showAlert('Accesso effettuato con successo!', 'Successo');
          view.value = 'pageSelect';
          loadBookings();
        } else {
          console.warn("Utente autenticato (Auth) ma dati profilo mancanti nel DB:", cred.user.uid);
          await showAlert('Accesso effettuato, ma dati profilo non trovati nel database. Contatta l\'amministrazione.', 'Attenzione');
          signOut(auth);
        }
      } catch (error) {
        console.error("Errore login:", error);
        await showAlert(`Errore durante l\'accesso: ${error.message}`, 'Errore');
      }
    }

    async function validateAuthFields() {
      if (!user.lastName || !user.firstName || !user.matricola || !user.email || !user.password) {
        await showAlert('Per favore, compila tutti i campi (Cognome, Nome, Matricola, E-mail, Password) per procedere.', 'Campi mancanti');
        return false;
      }
      return true;
    }

    function logout() {
      signOut(auth).then(() => {
        console.log("Utente disconnesso");
      }).catch((error) => {
        console.error("Errore durante la disconnessione:", error);
        showAlert("Si è verificato un errore durante la disconnessione.", 'Errore');
      });
    }

    async function enterPage() {
      if (!auth.currentUser) {
        await showAlert("Devi accedere per prenotare.", 'Accesso richiesto');
        view.value = 'auth';
        return;
      }
      if (!Object.keys(pageNames).includes(user.pageChoice)) {
        await showAlert("Selezione pagina non valida. Scegli una pagina disponibile.", 'Errore');
        return;
      }
      if (blocks[user.pageChoice]) {
        await showAlert('Al momento la pagina di prenotazione è bloccata. Sarai avvisato quando sarà disponibile.', 'Pagina bloccata');
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
        await showAlert("Devi accedere per prenotare.", 'Accesso richiesto');
        view.value = 'auth';
        return;
      }
      if (booking.slot==null) {
        await showAlert('Seleziona fascia', 'Attenzione');
        return;
      }

      const matricolaToCheck = isAdmin.value ? booking.matricola : user.matricola;
      if (!matricolaToCheck) {
        await showAlert('Matricola mancante', 'Errore');
        return;
      }

      try {
        const pageKeys = Object.keys(pageNames);
        for (let p of pageKeys) {
          const snap = await get(ref(db, `${p}/prenotazioni`));
          const list = snap.val() ? Object.values(snap.val()) : [];
          if (list.find(b => b.matricola === matricolaToCheck)) {
            booking.name = '';
            booking.matricola = '';
            booking.slot = null;
            await showAlert(`Matricola già prenotata in un altro giorno (${pageNames[p]}).`, 'Prenotazione esistente');
            return;
          }
        }

        const nome = isAdmin.value ? booking.name : `${user.lastName} ${user.firstName}`;
        if (!nome) {
          await showAlert('Nome/Cognome mancante per la prenotazione', 'Errore');
          return;
        }

        const currentSlotBookings = bookingsBySlot[booking.slot] || [];
        const maxSeats = booking.slot === 8 ? 9999 : seatsPerSlot.value;

        if (currentSlotBookings.length >= maxSeats) {
          await showAlert(`Posti esauriti per la fascia selezionata (${slots.find(s => s.id === booking.slot).label}).`, 'Posti esauriti');
          return;
        }

        await push(ref(db, `${user.pageChoice}/prenotazioni`), {
          name: nome,
          matricola: matricolaToCheck,
          slot: booking.slot
        });

        booking.name = '';
        booking.matricola = '';
        booking.slot = null;

        await showAlert('Prenotazione registrata con successo!', 'Successo');

      } catch (error) {
        console.error("Errore durante la prenotazione:", error);
        await showAlert(`Si è verificato un errore: ${error.message}`, 'Errore');
      }
    }

    async function confirmBook() {
      if (!auth.currentUser) {
        await showAlert("Devi accedere per prenotare.", 'Accesso richiesto');
        view.value = 'auth';
        return;
      }
      const confirmed = await showConfirm('Confermi la prenotazione per la fascia selezionata?', 'Conferma prenotazione');
      if (confirmed) book();
    }

    async function adminLogin() {
      const p = await showPrompt('Inserisci la password admin:', 'Accesso Admin');
      if (!p) return;
      
      try {
        const s = await get(ref(db,'adminPass'));
        if(s.exists() && s.val()===p) {
          isAdmin.value=true;
          await showAlert('Accesso Admin effettuato', 'Successo');
        } else {
          await showAlert('Password admin errata', 'Errore');
        }
      } catch (e) {
        console.error("Errore lettura password admin:", e);
        await showAlert("Errore nel verificare la password admin.", 'Errore');
      }
    }

    async function exitAdmin() { 
      isAdmin.value=false; 
      await showAlert('Uscito Area Riservata', 'Info'); 
    }

    async function addPage() {
      const name = newPageName.value.trim();
      if (!name) {
        await showAlert('Inserisci un nome per la nuova pagina.', 'Errore');
        return;
      }
      
      const newKey = 'page' + Date.now();
      
      const updates = {};
      updates[`pageNames/${newKey}`] = name;
      updates[`blocks/${newKey}`] = false;
      
      try {
        await update(ref(db), updates);
        await showAlert(`Pagina "${name}" aggiunta con successo.`, 'Successo');
        newPageName.value = '';
      } catch (e) {
        console.error("Errore addPage:", e);
        await showAlert('Errore durante l\'aggiunta della pagina', 'Errore');
      }
    }
    
    async function removePage(key) {
      if(Object.keys(pageNames).length <= 1) {
        await showAlert('Non puoi eliminare l\'ultima pagina disponibile.', 'Errore');
        return;
      }
      
      const pageName = pageNames[key];
      const confirmed = await showConfirm(
        `ATTENZIONE: Eliminare la pagina "${pageName}" cancellerà TUTTE le prenotazioni ad essa associate. Confermi?`,
        'Eliminazione pagina'
      );
      
      if(confirmed){
        delete pageNames[key];
        delete blocks[key];
        
        try {
          await remove(ref(db, `pageNames/${key}`));
          await remove(ref(db, `blocks/${key}`));
          await remove(ref(db, key));
          await showAlert(`Pagina "${pageName}" eliminata con successo.`, 'Successo');
          
          if (user.pageChoice === key) {
            const remainingKeys = Object.keys(pageNames);
            user.pageChoice = remainingKeys.length > 0 ? remainingKeys[0] : 'page1';
          }
        } catch (e) {
          console.error("Errore removePage:", e);
          await showAlert(`Errore durante l'eliminazione della pagina: ${e.message}`, 'Errore');
          location.reload();
        }
      }
    }

    async function updatePageName(key, newName) { 
      if (newName.trim() === '') {
        await showAlert('Il nome della pagina non può essere vuoto.', 'Errore');
        return;
      }
      try {
        await set(ref(db,`pageNames/${key}`), newName);
      } catch (e) {
        console.error("Errore updatePageName:", e);
      }
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
    
    async function updateSeatsPerSlot() {
      const newValue = parseInt(seatsPerSlot.value);
      if (isNaN(newValue) || newValue < 1 || newValue > 20) {
        await showAlert('Inserisci un numero valido tra 1 e 20', 'Errore');
        const s = await get(ref(db, 'seatsPerSlot'));
        if (s.exists()) seatsPerSlot.value = s.val();
        return;
      }
      try {
        await set(ref(db, 'seatsPerSlot'), newValue);
        await showAlert('Numero posti per fascia aggiornato con successo!', 'Successo');
      } catch (e) {
        console.error("Errore updateSeatsPerSlot:", e);
        await showAlert('Errore durante l\'aggiornamento', 'Errore');
      }
    }
    
    async function removeBooking(key) {
      const confirmed = await showConfirm('Confermi cancellazione prenotazione?', 'Conferma');
      if(confirmed){
        try {
          await remove(ref(db,`${user.pageChoice}/prenotazioni/${key}`));
        } catch (e) {
          console.error("Errore removeBooking:", e);
        }
      }
    }
    
    async function resetAll() {
      const confirmed = await showConfirm(
        'ATTENZIONE: Questa operazione cancellerà TUTTE le prenotazioni per questa pagina. Confermi reset?',
        'Reset prenotazioni'
      );
      if(confirmed){
        try {
          await remove(ref(db,`${user.pageChoice}/prenotazioni`));
        } catch (e) {
          console.error("Errore resetAll:", e);
        }
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

    async function handleFileUpload(e) {
      const reader=new FileReader();
      reader.onload=async evt=>{
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

          const confirmed = await showConfirm(
            'ATTENZIONE: Importando, sovrascriverai TUTTE le prenotazioni attuali per questa pagina. Confermi carica?',
            'Importazione Excel'
          );
          
          if(confirmed){
            await remove(ref(db,`${user.pageChoice}/prenotazioni`));
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
              await set(ref(db,`${user.pageChoice}/prenotazioni`), updates);
              await showAlert(
                `Importazione Excel completata con successo! ${rowErrors > 0 ? `Attenzione: ${rowErrors} righe con errori o incomplete non sono state importate.` : ''}`,
                'Successo'
              );
            } else {
              await showAlert(
                `Nessun dato valido trovato nel file Excel da importare. ${rowErrors > 0 ? `(${rowErrors} righe con errori nel formato)` : ''}`,
                'Attenzione'
              );
            }
          }
        } catch (error) {
          await showAlert(
            `Errore durante la lettura del file Excel: ${error.message}. Assicurati che sia un file Excel valido (.xlsx) e abbia le colonne 'Fascia', 'Matricola', 'Nome'.`,
            'Errore'
          );
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
      addPage, removePage,
      modal, modalConfirm, modalCancel // Aggiunti per il sistema modale
    };
  }
}).mount('#app');
