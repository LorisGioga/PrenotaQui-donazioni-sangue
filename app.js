// ===================================================================
//Programma Prenotazioni PrenotaQui EVO - 07/02/2026 - FIXED VERSION
// ===================================================================
// 1. Importazioni Firebase e Vue.js
// ===================================================================
//
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import { getDatabase, ref, push, onValue, set, get, child, remove, update } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js';

const { createApp, reactive, ref: vueRef, computed, watch } = Vue;
//=====================================================================
// 2. Configurazione Firebase: Fidas San Giusto Can 2
//=====================================================================
// >>> PrenotaQui EVO: incolla qui i dati del NUOVO progetto Firebase "PrenotaQui EVO"
// (Firebase > Impostazioni progetto > Le tue app > Configurazione SDK).

// Database. Fidas San Giusto Can 2
const firebaseConfig = {
  apiKey: "AIzaSyAoToelGIbZy2w_Kk0u4HDFIB56AuQNwRU",
  authDomain: "fidas-san-giusto-can-2.firebaseapp.com",
  databaseURL: "https://fidas-san-giusto-can-2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fidas-san-giusto-can-2",
  storageBucket: "fidas-san-giusto-can-2.firebasestorage.app",
  messagingSenderId: "963864891985",
  appId: "1:963864891985:web:33161373f6712197751e70"
};
if (String(firebaseConfig.apiKey).startsWith('INCOLLA')) {
  alert('Manca la configurazione Firebase di EVO: apri app.js e incolla i dati del progetto al posto di INCOLLA-QUI.');
  throw new Error('Configurazione Firebase mancante');
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'it'; // Forza l'italiano nelle email di Firebase (reset password, ecc.)
const db = getDatabase(app);
//
//=====================================================================
// 3. Applicazione Vue.js
//=====================================================================
createApp({
  setup() {
    
    //=====================================================================
    // 3.1 VARIABILI REATTIVE PRINCIPALI E FUNZIONI
    //=====================================================================
    // 
    
    // Link alla guida all'uso dell'app (pagina del sito del Gruppo).
    // Incolla qui l'indirizzo completo: finché è vuoto, i pulsanti Guida non compaiono.
    const GUIDA_URL = 'https://sites.google.com/view/fidas-gruppo-san-giusto-can/prenotazioni/guida-per-prenotaqui';

    const view = vueRef('landing');
    // Mostra/nascondi password nel login
    const showPwd = vueRef(false);
    // Il :class scritto su #app in index.html non viene letto da Vue 3 (#app è il contenitore di mount),
    // quindi segno io la pagina di login con la classe "is-landing", usata dal CSS
    const appEl = document.getElementById('app');
    watch(view, v => {
      if (appEl) appEl.classList.toggle('is-landing', v === 'landing' || v === 'register');
    }, { immediate: true });
    // Ad ogni cambio pagina, torna in cima (utile da telefono)
    watch(view, () => {
      showPwd.value = false;
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, { flush: 'post' });
    const seatsPerSlot = vueRef(6);
    const user = reactive({ lastName:'', firstName:'', matricola:'', email:'', password:'', pageChoice:'' });
    const booking = reactive({ matricola:'', name:'', slot: null });
    const slots = [
      { id:0, label:'Fascia 1: 07:50 – 08:05' }, { id:1, label:'Fascia 2: 08:10 – 08:30' },
      { id:2, label:'Fascia 3: 08:35 – 08:55' }, { id:3, label:'Fascia 4: 09:00 – 09:20' },
      { id:4, label:'Fascia 5: 09:25 – 09:45' }, { id:5, label:'Fascia 6: 09:50 – 10:10' },
      { id:6, label:'Fascia 7: 10:15 – 10:35' }, { id:7, label:'Fascia 8: 10:40 – 11:00' },
      { id:8, label:'Riserve' }
    ];
    const bookingsBySlot = reactive({});
    const bookingsLoaded = vueRef(false);   // true quando le prenotazioni sono state lette dal database
    const isAdmin = vueRef(false);
    const menuOpen = vueRef(false);
    const pageNames = reactive({}); 
    const blocks = reactive({});
    const newPageName = vueRef('');
    const idoneiAll = reactive({});          // liste idonei: una per ogni data (chiave = chiave della data)
    const idoneiTarget = vueRef(null);       // data a cui si sta caricando una lista Excel
    const fileInputIdonei = vueRef(null);
    const MAX_DATE = 10;                     // numero massimo di date di donazione
    
    const medicoEmail = vueRef('');
    const donationPlace = vueRef('');

    // Date donazioni: riconosce "17 Gennaio 2026" (anche con "Sabato" davanti, mese abbreviato
    // oppure solo "Gennaio 2027" senza giorno: in quel caso vale fino a fine mese)
    const mesiIt = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
    function parseDataIt(testo) {
      const m = String(testo).toLowerCase().match(/(?:(\d{1,2})\s+)?([a-zà]{3,})\.?\s+(\d{4})/);
      if (!m) return null;
      const mese = mesiIt.findIndex(x => x.startsWith(m[2]));
      if (mese < 0) return null;
      const anno = Number(m[3]);
      // senza giorno: vale fino a fine mese
      return m[1]
        ? new Date(anno, mese, Number(m[1]), 23, 59)
        : new Date(anno, mese + 1, 0, 23, 59);
    }

    // Le date di donazione (max 10), in ordine di calendario. La prima futura è "Prossima data".
    const sessions = computed(() => {
      const ora = new Date();
      const lista = Object.keys(pageNames).map((key, i) => {
        const label = String(pageNames[key] || '');
        const data = parseDataIt(label);
        return { key, label, data, passata: data ? data < ora : false, blocked: !!blocks[key], ordine: i };
      });
      lista.sort((a, b) => (a.data && b.data) ? a.data - b.data : (a.data ? -1 : (b.data ? 1 : a.ordine - b.ordine)));
      let trovata = false;
      lista.forEach(s => { s.prossima = !s.passata && !trovata; if (s.prossima) trovata = true; });
      return lista;
    });

    // Date che l'utente può aprire: l'admin tutte, gli altri solo quelle NON bloccate
    const sessionsAccessibili = computed(() =>
      sessions.value.filter(s => isAdmin.value || !s.blocked)
    );

    // Se la data scelta non esiste più, ripiega sulla prossima data
    function fixPageChoice() {
      const lista = sessions.value;
      if (lista.length && !lista.some(s => s.key === user.pageChoice)) {
        user.pageChoice = (lista.find(s => s.prossima) || lista[0]).key;
      }
    }
    watch(sessions, fixPageChoice);

    // Lista idonei della data scelta, e riga dell'utente loggato (null se non presente)
    const idoneiList = computed(() => idoneiAll[user.pageChoice] || []);
    const idoneiAllCount = key => (idoneiAll[key] || []).length;
    const mioIdoneo = computed(() => {
      if (!user.matricola) return null;
      return idoneiList.value.find(p => String(p.matricola) === String(user.matricola)) || null;
    });
    
    // Footer contacts
    const footerContacts = reactive({
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      website: ''
    });

    // Privacy in overlay (testo mostrato in un pulsante/modale invece che inline)
    const showPrivacy = vueRef(false);

    // Pulsanti di collegamento in home: News, Sospensioni, e un terzo generico
    const quickLinks = reactive({
      news: { url: '', desc: '' },
      sospensioni: { url: '', desc: '' },
      extra: { url: '', desc: '', label: '' }
    });
    
    const texts = reactive({ 
      plasma: '',
      privacy: "Ai sensi del Regolamento (UE) 2016/679 (GDPR), informiamo che i dati personali inseriti nel presente modulo di prenotazione sono trattati esclusivamente per finalità organizzative legate alla donazione di sangue. Il trattamento è svolto da persone autorizzate dal Presidente del Gruppo FIDAS San Giusto, Titolare del trattamento, nell'ambito delle attività associative e in conformità all'informativa sottoscritta dal donatore al momento dell'iscrizione alla FIDAS. I dati raccolti non saranno utilizzati per altri scopi e non saranno comunicati a soggetti terzi, salvo obblighi di legge. Il trattamento avviene nel rispetto delle misure di sicurezza previste dalla normativa vigente. Per ulteriori informazioni sul trattamento dei dati, è possibile consultare l'Informativa Privacy FIDAS disponibile presso la sede o richiederne copia al momento della donazione."
    });
    
    const fileInput = vueRef(null);

    // SISTEMA MODALE
    const modal = reactive({
      show: false,
      type: 'alert',
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

    // LETTURE DAL DATABASE
    // Partono solo dopo il login (e si fermano all'uscita): nel database non c'è nulla di pubblico.
    let unsubs = [];
    const toArray = v => Array.isArray(v) ? v.filter(Boolean) : (v && typeof v === 'object' ? Object.values(v) : []);
    const replaceKeys = (target, data) => { Object.keys(target).forEach(k => delete target[k]); Object.assign(target, data || {}); };

    function startListeners() {
      if (unsubs.length) return;
      const on = (path, cb) => unsubs.push(onValue(ref(db, path), cb, err => console.warn('Lettura non riuscita:', path, err && err.code)));
      on('pageNames', s => replaceKeys(pageNames, s.val()));
      on('blocks', s => replaceKeys(blocks, s.val()));
      on('h4Texts', s => s.val() && Object.assign(texts, s.val()));
      on('seatsPerSlot', s => { if (s.exists()) seatsPerSlot.value = s.val(); });
      on('idonei', s => {
        const dati = s.val() || {};
        replaceKeys(idoneiAll, Object.fromEntries(Object.entries(dati).map(([k, v]) => [k, toArray(v)])));
      });
      on('medicoEmail', s => { medicoEmail.value = s.val() || ''; });
      on('donationPlace', s => { donationPlace.value = s.val() || ''; });
      on('footerContacts', s => { replaceKeys(footerContacts, s.val() || { email:'', phone:'', whatsapp:'', address:'', website:'' }); });
      // Pulsanti News / Sospensioni / Extra in home
      on('quickLinks', s => {
        const data = s.val() || {};
        quickLinks.news = data.news || { url: '', desc: '' };
        quickLinks.sospensioni = data.sospensioni || { url: '', desc: '' };
        quickLinks.extra = data.extra || { url: '', desc: '', label: '' };
      });
    }

    function stopListeners() {
      unsubs.forEach(u => { try { u(); } catch (e) { /* già chiuso */ } });
      unsubs = [];
    }

    const isRegistering = vueRef(false);

    onAuthStateChanged(auth, u => {
      if (u) {
        startListeners();
        get(child(ref(db), `users/${u.uid}`))
          .then(snap => {
            if (snap.exists()) {
              Object.assign(user, snap.val());
              fixPageChoice();
            } else {
              // Se stiamo registrando, non disconnettere
              if (!isRegistering.value) {
                console.warn("Utente autenticato (Auth) ma dati profilo mancanti nel DB:", u.uid);
              }
            }
            console.log("Utente autenticato rilevato. Rimango sulla landing page (o vista corrente).");
          })
          .catch(dbError => {
            console.error("Errore caricamento dati utente all'avvio:", dbError);
          });
      } else {
        stopListeners();
        view.value = 'landing';
        isAdmin.value = false;
        user.lastName = ''; 
        user.firstName = ''; 
        user.matricola = '';
        user.email = ''; 
        user.password = '';
      }
    });

    const remaining = slot => seatsPerSlot.value - (bookingsBySlot[slot.id]?.length || 0);

    // Numero progressivo del posto (stesso conteggio della tabella da computer): fascia * posti + posizione nella fascia
    const posNumber = (slot, i) => slot.id * seatsPerSlot.value + i + 1;

    // Tendine fatte da noi (al posto dei select del telefono, che si vedono giganti)
    const slotMenuOpen = vueRef(false);
    const dateMenuOpen = vueRef(false);
    const slotScelta = computed(() => slots.find(s => s.id === booking.slot) || null);
    function toggleSlotMenu() { if (giaPrenotato.value) return; const v = !slotMenuOpen.value; closeMenus(); slotMenuOpen.value = v; }
    function toggleDateMenu() { const v = !dateMenuOpen.value; closeMenus(); dateMenuOpen.value = v; }
    // Fascia piena: non si può scegliere (Riserve comprese). Solo l'admin può aggiungere oltre il limite nelle Riserve.
    const slotPieno = slot => remaining(slot) <= 0 && !(slot.id === 8 && isAdmin.value);
    function pickSlot(slot) {
      if (slotPieno(slot)) return;
      booking.slot = slot.id;
      slotMenuOpen.value = false;
    }
    // Cambio data dalla tendina nella pagina idonei: le date bloccate non sono selezionabili (tranne per l'admin)
    function pickDate(key) {
      const s = sessions.value.find(x => x.key === key);
      if (!s || (s.blocked && !isAdmin.value)) return;
      user.pageChoice = key;
      dateMenuOpen.value = false;
    }
    function closeMenus() { menuOpen.value = false; slotMenuOpen.value = false; dateMenuOpen.value = false; }
    
    const mask = (name, matricola) => {
      if (!name) return '';
      if (isAdmin.value) {
        return name;
      }
      if (user.matricola && String(matricola) === String(user.matricola)) {
        return name;
      }
      return name.split(' ').map(p => p.slice(0,2)+'..').join(' ');
    };

    // Pulisce l'e-mail: toglie gli spazi (la tastiera del telefono ne aggiunge spesso uno alla fine) e le maiuscole
    function cleanEmail(e) {
      return String(e || '').trim().toLowerCase();
    }

    // Messaggi di errore di Firebase Auth in italiano; in coda resta il codice, utile per capire cosa è successo
    function authErrorMessage(error) {
      const code = (error && error.code) || '';
      const credenziali = 'E-mail o password non corrette. Controlla di averle scritte bene; se non ricordi la password usa «Password dimenticata?».';
      const messaggi = {
        'auth/invalid-email': "L'indirizzo e-mail non è scritto correttamente. Controlla di non aver lasciato spazi.",
        'auth/invalid-credential': credenziali,
        'auth/invalid-login-credentials': credenziali,
        'auth/wrong-password': credenziali,
        'auth/user-not-found': credenziali,
        'auth/missing-password': 'Inserisci la password.',
        'auth/too-many-requests': 'Troppi tentativi di accesso. Attendi qualche minuto e riprova, oppure usa «Password dimenticata?».',
        'auth/network-request-failed': 'Connessione assente o instabile. Controlla internet e riprova.',
        'auth/user-disabled': 'Questo account è stato disattivato. Contatta il Gruppo.',
        'auth/email-already-in-use': 'Questa e-mail risulta già registrata. Torna alla pagina iniziale e accedi; se non ricordi la password usa «Password dimenticata?».',
        'auth/weak-password': 'La password è troppo corta: servono almeno 6 caratteri.',
        'auth/web-storage-unsupported': 'Il browser blocca il salvataggio dei dati del sito (navigazione privata?). Prova con un altro browser.'
      };
      if (messaggi[code]) return `${messaggi[code]} (codice: ${code})`;
      return `Si è verificato un errore imprevisto. ${code ? '(codice: ' + code + ')' : ((error && error.message) || '')}`.trim();
    }

    // Salva i dati del nuovo utente subito dopo la creazione dell'account.
    // Se Firebase non ha ancora attivato l'accesso (permesso negato) riprova poco dopo, al massimo 3 volte.
    async function saveProfile(uid, profile) {
      for (let tentativo = 1; ; tentativo++) {
        try {
          await set(ref(db, `users/${uid}`), profile);
          return;
        } catch (e) {
          const permessoNegato = String((e && (e.code || e.message)) || '').toUpperCase().includes('PERMISSION');
          if (!permessoNegato || tentativo >= 3) throw e;
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
    }

    async function register() {
      if (isRegistering.value) return; // evita il doppio tocco su "Continua"

      user.email = cleanEmail(user.email);
      user.lastName = String(user.lastName || '').trim();
      user.firstName = String(user.firstName || '').trim();
      user.matricola = String(user.matricola || '').trim();
      if (!(await validateAuthFields())) return;

      isRegistering.value = true;
      let accountCreato = false;
      try {
        const cred = await createUserWithEmailAndPassword(auth, user.email, user.password);
        accountCreato = true;

        // I dati si salvano subito, senza attese fisse
        await saveProfile(cred.user.uid, {
          lastName: user.lastName,
          firstName: user.firstName,
          matricola: user.matricola,
          email: user.email
        });

        isRegistering.value = false;
        await showAlert('Registrazione effettuata con successo! Ora puoi procedere.');
        view.value = 'home';

      } catch (error) {
        isRegistering.value = false;
        console.error("Errore registrazione:", error);
        if (accountCreato) {
          await showAlert("L'account è stato creato ma non siamo riusciti a salvare i tuoi dati. Torna alla pagina iniziale e contatta il Gruppo, indicando la tua e-mail.", 'Registrazione incompleta');
        } else {
          await showAlert(authErrorMessage(error), 'Registrazione non riuscita');
        }
      }
    }

    function forceReloadIdonei() {
      const key = user.pageChoice;
      get(ref(db, `idonei/${key}`)).then(snap => {
        idoneiAll[key] = toArray(snap.val());
        showAlert(`Lista aggiornata! ${idoneiAll[key].length} persone caricate.`);
      }).catch(err => {
        showAlert('Errore nel caricamento della lista: ' + err.message);
      });
    }

    async function login() {
      // Per il login servono SOLO email e password
      const email = cleanEmail(user.email);
      user.email = email;
      if (!email || !user.password) {
        await showAlert('Per favore, inserisci E-mail e Password per accedere.');
        return;
      }

      try {
        const cred = await signInWithEmailAndPassword(auth, email, user.password);
        const snap = await get(child(ref(db), `users/${cred.user.uid}`));

        if (snap.exists()) {
          Object.assign(user, snap.val());
          await showAlert('Accesso effettuato con successo!');
          view.value = 'home';
        } else {
          console.warn("Utente autenticato (Auth) ma dati profilo mancanti nel DB:", cred.user.uid);
          await showAlert('Accesso effettuato, ma dati profilo non trovati nel database. Contatta l\'amministrazione.');
          signOut(auth);
        }
      } catch (error) {
        console.error("Errore login:", error);
        await showAlert(authErrorMessage(error), 'Accesso non riuscito');
      }
    }

    // Recupero password tramite email nativa di Firebase Auth
    async function resetPassword() {
      let email = cleanEmail(user.email);

      if (!email) {
        email = cleanEmail(await showPrompt('Inserisci la tua email per ricevere il link di reimpostazione password:'));
        if (!email) return; // utente ha annullato
      }

      try {
        await sendPasswordResetEmail(auth, email);
        await showAlert(`Ti abbiamo inviato una email a ${email} con le istruzioni per reimpostare la password. Controlla anche nella cartella Spam/Posta indesiderata.`);
      } catch (error) {
        console.error("Errore invio email di reset password:", error);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
          await showAlert('Non troviamo nessun account registrato con questa email. Verifica di averla scritta correttamente.');
        } else {
          await showAlert(authErrorMessage(error));
        }
      }
    }

    async function validateAuthFields() {
      // Per la registrazione servono TUTTI i campi
      if (!user.lastName || !user.firstName || !user.matricola || !user.email || !user.password) {
        await showAlert('Per favore, compila tutti i campi (Cognome, Nome, Matricola, E-mail, Password) per registrarti.');
        return false;
      }
      return true;
    }

    function logout() {
      signOut(auth).then(() => {
        console.log("Utente disconnesso");
      }).catch((error) => {
        console.error("Errore durante la disconnessione:", error);
        showAlert("Si è verificato un errore durante la disconnessione.");
      });
    }

    // MODIFICA: Admin bypass per pagine bloccate
    async function enterPage() {
      if (!auth.currentUser) {
        await showAlert("Devi accedere per prenotare.");
        view.value = 'landing';
        return;
      }
      if (!Object.keys(pageNames).includes(user.pageChoice)) {
        await showAlert("Questa data non è più disponibile. Torna alla Home e scegline un'altra.");
        return;
      }
      
      // ADMIN BYPASS: se è admin, può sempre entrare anche se bloccato
      if (!isAdmin.value && blocks[user.pageChoice]) {
        await showAlert('Al momento la pagina di prenotazione è bloccata. Sarai avvisato quando sarà disponibile.');
        return;
      }
      
      // Solo chi è nella lista idonei può prenotare (l'admin no: può sempre entrare)
      if (!isAdmin.value && !mioIdoneo.value) {
        await showAlert("Non risulti nella lista degli idonei per questa data: non puoi prenotare. Se pensi sia un errore, contatta il Gruppo.");
        return;
      }
      
      view.value = user.pageChoice; 
      loadBookings();
    }

    let unsubBookings = null;
    function loadBookings() {
      if (unsubBookings) unsubBookings();
      bookingsLoaded.value = false;
      unsubBookings = onValue(ref(db, `prenotazioni/${user.pageChoice}`), snap => { 
        const data=snap.val()||{}; 
        slots.forEach(s=>bookingsBySlot[s.id]=[]); 
        Object.entries(data).forEach(([key,b])=>{ if (bookingsBySlot[b.slot]) bookingsBySlot[b.slot].push({...b,key}); }); 
        bookingsLoaded.value = true;
      }, () => { bookingsLoaded.value = false; }); 
    }

    // La prenotazione dell'utente loggato per la data aperta, letta dal database (null se non c'è)
    const miaPrenotazione = computed(() => {
      if (!user.matricola) return null;
      for (const s of slots) {
        const lista = bookingsBySlot[s.id] || [];
        const i = lista.findIndex(x => String(x.matricola) === String(user.matricola));
        if (i >= 0) return { fascia: s.id === 8 ? 'Riserve' : s.label, key: lista[i].key, pos: posNumber(s, i) };
      }
      return null;
    });

    // Utente normale già prenotato per questa data: pulsante Prenota e tendina fasce si disattivano
    const giaPrenotato = computed(() => !isAdmin.value && !!miaPrenotazione.value);
    // Utente normale non presente nella lista idonei della data scelta: il pulsante Avanti si disattiva
    const nonIdoneo = computed(() => !isAdmin.value && !mioIdoneo.value);

    // MODIFICA: Admin bypass anche nella prenotazione
    // Il pulsante Prenota non parte due volte se si tocca in fretta
    const isBooking = vueRef(false);
    async function book() {
      if (isBooking.value) return;
      isBooking.value = true;
      try { await bookInner(); } finally { isBooking.value = false; }
    }

    async function bookInner() {
      if (!auth.currentUser) {
        await showAlert("Devi accedere per prenotare.");
        view.value = 'landing';
        return;
      }
      
      // ADMIN BYPASS: se è admin, può prenotare anche se pagina bloccata
      if (!isAdmin.value && blocks[user.pageChoice]) {
        await showAlert('La pagina è bloccata. Non puoi prenotare al momento.');
        return;
      }
      
      if (!isAdmin.value && !mioIdoneo.value) {
        await showAlert('Non risulti nella lista degli idonei per questa data: non puoi prenotare.');
        return;
      }

      if (giaPrenotato.value) {
        await showAlert('Risulti già prenotato per questa data.');
        return;
      }
      
      if (booking.slot==null) {
        await showAlert('Seleziona fascia');
        return;
      }

      const matricolaToCheck = isAdmin.value ? booking.matricola : user.matricola;
      if (!matricolaToCheck) {
        await showAlert('Matricola mancante');
        return;
      }

      try {
        const pageKeys = sessions.value.filter(s => !s.passata).map(s => s.key);
        for (let p of pageKeys) {
          const snap = await get(ref(db, `prenotazioni/${p}`));
          const list = snap.val() ? Object.values(snap.val()) : [];
          if (list.find(b => String(b.matricola) === String(matricolaToCheck))) {
            booking.name = '';
            booking.matricola = '';
            booking.slot = null;
            await showAlert(`Matricola già prenotata in un altro giorno (${pageNames[p]}).`);
            return;
          }
        }

        const nome = isAdmin.value ? booking.name : `${user.lastName} ${user.firstName}`;
        if (!nome) {
          await showAlert('Nome/Cognome mancante per la prenotazione');
          return;
        }

        const currentSlotBookings = bookingsBySlot[booking.slot] || [];
        const maxSeats = (booking.slot === 8 && isAdmin.value) ? 9999 : seatsPerSlot.value;

        if (currentSlotBookings.length >= maxSeats) {
          await showAlert(`Posti esauriti per la fascia selezionata (${slots.find(s => s.id === booking.slot).label}).`);
          return;
        }

        const slotScelto = slots.find(s => s.id === booking.slot);
        const slotId = booking.slot;
        const percorso = `prenotazioni/${user.pageChoice}`;
        const nuovaKey = push(ref(db, percorso)).key;
        const record = { name: nome, matricola: matricolaToCheck, slot: slotId };

        // Ultimo controllo con i dati appena letti dal database (non quelli già sullo schermo)
        const fresche = await get(ref(db, percorso));
        const lista = fresche.val() ? Object.values(fresche.val()) : [];
        if (lista.some(x => String(x.matricola) === String(matricolaToCheck))) {
          await showAlert('Questa matricola risulta già prenotata per questa data.');
          return;
        }
        if (lista.filter(x => x.slot === slotId).length >= maxSeats) {
          await showAlert(`Posti esauriti per la fascia selezionata (${slotScelto.label}).`);
          return;
        }

        await set(ref(db, `${percorso}/${nuovaKey}`), record);

        // Controllo: la prenotazione deve esistere davvero nel database
        const verifica = await get(ref(db, `${percorso}/${nuovaKey}`));
        if (!verifica.exists()) throw new Error('La prenotazione non risulta salvata nel database. Riprova.');

        booking.name = '';
        booking.matricola = '';
        booking.slot = null;

        await showAlert(`Prenotazione registrata e verificata nel database: ${slotScelto.id === 8 ? 'Riserve' : slotScelto.label}, ${pageNames[user.pageChoice]}.`);

      } catch (error) {
        console.error("Errore durante la prenotazione:", error);
        await showAlert(`Si è verificato un errore: ${error.message}`);
      }
    }

    async function confirmBook() {
      if (!auth.currentUser) {
        await showAlert("Devi accedere per prenotare.");
        view.value = 'landing';
        return;
      }
      const confirmed = await showConfirm('Confermi la prenotazione per la fascia selezionata?');
      if (confirmed) book();
    }

    // Admin: non c'è più una password nel database. Si è admin se l'account è nell'elenco admins/{uid}
    // (lo aggiungi a mano dalla console Firebase) e le regole del database lo verificano anche in scrittura.
    async function adminLogin() {
      try {
        if (!auth.currentUser) {
          await showAlert('Devi accedere per entrare nell\'Area riservata.');
          return;
        }
        const s = await get(ref(db, `admins/${auth.currentUser.uid}`));
        if (s.val() === true) {
          isAdmin.value = true;
          await showAlert('Accesso Admin effettuato');
        } else {
          await showAlert('Questo account non è abilitato come amministratore.');
        }
      } catch (e) {
        console.error("Errore verifica admin:", e);
        await showAlert("Errore nel verificare l'accesso admin: " + (e && e.message ? e.message : e));
      }
    }

    async function exitAdmin() { 
      isAdmin.value=false; 
      await showAlert('Uscito Area Riservata'); 
    }

    // ---- Menu a tendina nella barra in alto ----
    function goMenu(destinazione) {
      menuOpen.value = false;
      view.value = destinazione;
    }
    async function menuAdmin() {
      menuOpen.value = false;
      await adminLogin();
      if (isAdmin.value) view.value = 'adminPage';
    }
    async function menuExitAdmin() {
      menuOpen.value = false;
      await exitAdmin();
      if (view.value === 'adminPage') view.value = 'home';
    }
    // Home: tocco su una data -> prima la lista degli idonei di quella data.
    // Le date passate e (per gli utenti normali) quelle bloccate non si aprono.
    function chooseDate(key) {
      const s = sessions.value.find(x => x.key === key);
      if (!s || s.passata) return;
      if (s.blocked && !isAdmin.value) {
        showAlert('Le prenotazioni per questa data sono chiuse.');
        return;
      }
      user.pageChoice = key;
      view.value = 'idoneiPage';
    }
    // Voci del menu in alto: una per ogni data
    function menuDate(cosa, key) {
      menuOpen.value = false;
      if (cosa === 'idonei') chooseDate(key); else adminOpenBookings(key);
    }
    // Area admin: apre le prenotazioni di una data (con Excel, reset ecc.)
    function adminOpenBookings(key) {
      user.pageChoice = key;
      view.value = key;
      loadBookings();
    }

    // Se l'admin blocca la data mentre un utente sta guardando la sua lista idonei, lo rimandiamo in Home
    watch(() => blocks[user.pageChoice], b => {
      if (b && !isAdmin.value && view.value === 'idoneiPage') {
        view.value = 'home';
        showAlert('Le prenotazioni per questa data sono state chiuse.');
      }
    });

    // il menu si chiude con un tocco fuori o con Esc
    document.addEventListener('click', closeMenus);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenus(); });

    // Stampa / PDF: le tendine degli elenchi si aprono da sole prima di stampare e si richiudono dopo
    let tendineAperte = [];
    window.addEventListener('beforeprint', () => {
      document.querySelectorAll('details.idonei-details').forEach(d => { if (!d.open) { d.open = true; tendineAperte.push(d); } });
    });
    window.addEventListener('afterprint', () => {
      tendineAperte.forEach(d => { d.open = false; });
      tendineAperte = [];
    });

    async function addPage() {
      const name = newPageName.value.trim();
      if (!name) {
        await showAlert('Scrivi la data della donazione (es. Sabato 17 Gennaio 2027).');
        return;
      }
      if (Object.keys(pageNames).length >= MAX_DATE) {
        await showAlert(`Puoi inserire al massimo ${MAX_DATE} date. Rimuovi una data passata per farne posto.`);
        return;
      }
      
      const newKey = 'page' + Date.now();
      
      const updates = {};
      updates[`pageNames/${newKey}`] = name;
      updates[`blocks/${newKey}`] = false;
      
      try {
        await update(ref(db), updates);
        newPageName.value = '';
        await showAlert(`Data "${name}" aggiunta.`);
      } catch (e) {
        console.error("Errore addPage:", e);
        await showAlert('Errore durante l\'aggiunta della data: ' + e.message);
      }
    }
    
    async function removePage(key) {
      const pageName = pageNames[key];
      const confirmed = await showConfirm(`ATTENZIONE: eliminando la data "${pageName}" si cancellano anche TUTTE le sue prenotazioni e la sua lista idonei. Confermi?`);
      
      if(confirmed){
        try {
          await remove(ref(db, `prenotazioni/${key}`));
          await remove(ref(db, `idonei/${key}`));
          await remove(ref(db, `blocks/${key}`));
          await remove(ref(db, `pageNames/${key}`));
          await showAlert(`Data "${pageName}" eliminata.`);
        } catch (e) {
          console.error("Errore removePage:", e);
          await showAlert(`Errore durante l'eliminazione della data: ${e.message}`);
        }
      }
    }

    async function updatePageName(key, newName) { 
      if (newName.trim() === '') {
        await showAlert('Il nome della pagina non può essere vuoto.');
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
    
    async function updateSeatsPerSlot() {
      const newValue = parseInt(seatsPerSlot.value);
      if (isNaN(newValue) || newValue < 1 || newValue > 20) {
        await showAlert('Inserisci un numero valido tra 1 e 20');
        const s = await get(ref(db, 'seatsPerSlot'));
        if (s.exists()) seatsPerSlot.value = s.val();
        return;
      }
      try {
        await set(ref(db, 'seatsPerSlot'), newValue);
        await showAlert('Numero posti per fascia aggiornato con successo!');
      } catch (e) {
        console.error("Errore updateSeatsPerSlot:", e);
        await showAlert('Errore durante l\'aggiornamento');
      }
    }
    
    async function updateMedicoEmail() {
      try {
        await set(ref(db, 'medicoEmail'), medicoEmail.value);
      } catch (e) {
        console.error("Errore updateMedicoEmail:", e);
        await showAlert('Errore durante l\'aggiornamento email medico');
      }
    }
    
    async function updateDonationPlace() {
      try {
        await set(ref(db, 'donationPlace'), donationPlace.value);
      } catch (e) {
        console.error("Errore updateDonationPlace:", e);
        await showAlert('Errore durante l\'aggiornamento del luogo donazioni');
      }
    }

    async function updateFooterContact(field) {
      try {
        await set(ref(db, 'footerContacts'), footerContacts);
      } catch (e) {
        console.error("Errore updateFooterContact:", e);
        await showAlert('Errore durante l\'aggiornamento contatti footer');
      }
    }

    // Aggiorna uno dei 3 pulsanti di collegamento (news / sospensioni / extra)
    async function updateQuickLink(key) {
      try {
        await set(ref(db, `quickLinks/${key}`), quickLinks[key]);
      } catch (e) {
        console.error("Errore updateQuickLink:", e);
        await showAlert('Errore durante l\'aggiornamento del pulsante di collegamento');
      }
    }
    
    async function removeBooking(key) {
      const confirmed = await showConfirm('Confermi cancellazione prenotazione?');
      if(confirmed){
        try {
          await remove(ref(db,`prenotazioni/${user.pageChoice}/${key}`));
        } catch (e) {
          console.error("Errore removeBooking:", e);
        }
      }
    }
    
    async function resetAll() {
      const confirmed = await showConfirm('ATTENZIONE: Questa operazione cancellerà TUTTE le prenotazioni per questa pagina. Confermi reset?');
      if(confirmed){
        try {
          await remove(ref(db,`prenotazioni/${user.pageChoice}`));
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
      // Limita il nome del foglio a 31 caratteri (limite Excel)
      const sheetName = (pageNames[user.pageChoice] || 'Prenotazioni').substring(0, 31);
      XLSX.utils.book_append_sheet(wb,ws,sheetName);
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

          const confirmed = await showConfirm('ATTENZIONE: Importando, sovrascriverai TUTTE le prenotazioni attuali per questa pagina. Confermi carica?');
          
          if(confirmed){
            await remove(ref(db,`prenotazioni/${user.pageChoice}`));
            const updates = {};
            let rowErrors = 0;
            rows.forEach(r=>{
              const slotObj=slots.find(s=>(s.id===8?'Riserve':s.label)===r.Fascia);
              if(slotObj && r.Matricola && r.Nome) {
                const newKey = push(ref(db,`prenotazioni/${user.pageChoice}`)).key;
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
              await set(ref(db,`prenotazioni/${user.pageChoice}`), updates);
              await showAlert(`Importazione Excel completata con successo! ${rowErrors > 0 ? `Attenzione: ${rowErrors} righe con errori o incomplete non sono state importate.` : ''}`);
            } else {
              await showAlert(`Nessun dato valido trovato nel file Excel da importare. ${rowErrors > 0 ? `(${rowErrors} righe con errori nel formato)` : ''}`);
            }
          }
        } catch (error) {
          await showAlert(`Errore durante la lettura del file Excel: ${error.message}. Assicurati che sia un file Excel valido (.xlsx) e abbia le colonne 'Fascia', 'Matricola', 'Nome'.`);
        }
        e.target.value = null;
      };
      if (e.target.files && e.target.files[0]) {
        reader.readAsBinaryString(e.target.files[0]);
      }
    }

    function importExcelIdonei(key) {
      idoneiTarget.value = key;
      fileInputIdonei.value.click();
    }

    async function handleFileUploadIdonei(e) {
      const reader = new FileReader();
      reader.onload = async evt => {
        try {
          const wb = XLSX.read(evt.target.result, {type:'binary'});
          if (!wb.SheetNames || wb.SheetNames.length === 0) {
            throw new Error("File Excel non valido: nessun foglio trovato.");
          }
          const sheetName = wb.SheetNames[0];
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);

          if(!Array.isArray(rows)) {
            throw new Error("Formato dati nel foglio Excel non valido.");
          }

          const newList = [];
          let rowErrors = 0;
          
          rows.forEach(r => {
            // Supporta sia formato "Matricola, Cognome, Nome" che "Matricola, Nome" (dove Nome = "COGNOME NOME")
            if (r.Matricola && r.Nome) {
              const nomeCompleto = String(r.Nome).trim();
              const parts = nomeCompleto.split(' ');
              
              if (r.Cognome) {
                // Formato con 3 colonne separate
                newList.push({
                  matricola: String(r.Matricola),
                  cognome: String(r.Cognome),
                  nome: String(r.Nome)
                });
              } else if (parts.length >= 2) {
                // Formato con 2 colonne: Nome contiene "COGNOME NOME"
                const cognome = parts[0];
                const nome = parts.slice(1).join(' ');
                newList.push({
                  matricola: String(r.Matricola),
                  cognome: cognome,
                  nome: nome
                });
              } else {
                console.warn("Riga Excel: nome non separabile in cognome/nome:", r);
                rowErrors++;
              }
            } else {
              console.warn("Riga Excel non valida (richiede Matricola e Nome):", r);
              rowErrors++;
            }
          });

          if (newList.length > 0) {
            await set(ref(db, `idonei/${idoneiTarget.value}`), newList);
            await showAlert(`Importazione completata per «${pageNames[idoneiTarget.value] || ''}»! ${newList.length} persone idonee caricate. ${rowErrors > 0 ? `Attenzione: ${rowErrors} righe con errori non importate.` : ''}`);
          } else {
            await showAlert(`Nessun dato valido trovato nel file Excel. ${rowErrors > 0 ? `(${rowErrors} righe con errori nel formato)` : ''} Assicurati che il file abbia almeno le colonne: Matricola, Nome.`);
          }
        } catch (error) {
          await showAlert(`Errore durante la lettura del file Excel: ${error.message}. Verifica che sia un file .xlsx valido.`);
        }
        e.target.value = null;
      };
      if (e.target.files && e.target.files[0]) {
        reader.readAsBinaryString(e.target.files[0]);
      }
    }

    async function resetIdoneiList(key) {
      const confirmed = await showConfirm(`Cancellare la lista degli idonei di «${pageNames[key] || ''}»?`);
      if(confirmed){
        try {
          await remove(ref(db, `idonei/${key}`));
          await showAlert('Lista persone idonee cancellata.');
        } catch (e) {
          console.error("Errore resetIdoneiList:", e);
          await showAlert('Errore durante la cancellazione della lista');
        }
      }
    }

    return { 
      view, GUIDA_URL, showPwd, menuOpen, goMenu, menuAdmin, menuExitAdmin, user, booking, slots, bookingsBySlot, seatsPerSlot, pageNames, texts, blocks, isAdmin, newPageName,
      sessions, sessionsAccessibili, MAX_DATE, chooseDate, adminOpenBookings, menuDate,
      idoneiList, idoneiAllCount, fileInputIdonei, isRegistering,
      mioIdoneo, miaPrenotazione, giaPrenotato, nonIdoneo, bookingsLoaded, medicoEmail, donationPlace, footerContacts,
      showPrivacy, quickLinks, updateQuickLink,
      isBooking, remaining, posNumber, slotPieno, slotMenuOpen, dateMenuOpen, slotScelta, toggleSlotMenu, toggleDateMenu, pickSlot, pickDate,
      mask, register, login, resetPassword, logout, enterPage, loadBookings, confirmBook, adminLogin, exitAdmin, 
      updatePageName, updateText, updateBlock, updateSeatsPerSlot, removeBooking, resetAll, exportExcel, 
      importExcel, handleFileUpload, fileInput, 
      addPage, removePage,
      importExcelIdonei, handleFileUploadIdonei, resetIdoneiList, forceReloadIdonei,
      updateMedicoEmail, updateDonationPlace, updateFooterContact,
      modal, modalConfirm, modalCancel
    };
  }
}).mount('#app');