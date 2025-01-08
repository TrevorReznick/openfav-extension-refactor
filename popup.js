/* @@ config @@ */

const api_url_prod = 'https://openfav-dev.vercel.app'
const api_url_dev = 'http://localhost:4321'
//const _url_old = 'https://bookmarks-list.netlify.app'
const _url = api_url_prod
const sessionAuthUrl = _url + '/api/v1/auth/signin'
const YOUR_TOKEN = '89773db3-7863-460c-ad3c-6abd0db43f1c'
const API_URL = 'https://vnavarra.nuvolaris.dev/api/my/openfavs/classify?url='

let user_id = null
let id = null

const DEBUG = true

let siteObj = {
  /* Frontend data */
  user_id: null,
  name: null,
  environment: null,
  
  /* Backend data */
  AI: null,
  AI_summary: null,
  AI_think: null,
  accessible: null,
  author: null,
  canonical: null,
  description: null,
  domain: null,
  domain_exists: null,
  html_content_exists: null,
  icon: null,  
  image: null,
  keywords: null,
  logo: null,
  ratings: null,
  redirect_exists: null,
  secure: null,
  status_code: null,
  id_area: null,
  id_cat: null,
  id_provider: null,
  id_sub_cat: null,  
  tag_4: null,
  tag_5: null,
  title: null,
  type: null,
  url: null,
  valid_url: null
}

const logger = {
    log: (...args) => DEBUG && console.log('[DEBUG]:', ...args),
    error: (...args) => console.error('[ERROR]:', ...args),
    warn: (...args) => console.warn('[WARN]:', ...args),
    info: (...args) => console.info('[INFO]:', ...args)
}

const states = {
  login: document.getElementById('loginState'),
  save: document.getElementById('saveState'),
  loading: document.getElementById('loadingState'),
  success: document.getElementById('successState')
}

/* @@ test @@ */

      

/* @@ debug @@ */

logger.log('Initializing global variables:', { user_id, id })
logger.log('Initial siteObj state:', siteObj)

document.addEventListener('DOMContentLoaded', async () => {

  logger.log('DOM', 'started app')

  if (hasCompositeClasses('loadingState', ['loader', 'hidden'])) {
    logger.log('Il loader è nascosto.')
  } else {
    logger.log('Il loader non è nascosto.')
  }

  if (hasCompositeClasses('saveState', ['state', 'hidden'])) {
    console.log('Lo stato di salvataggio è nascosto.');
  } else {
    console.log('Lo stato di salvataggio non è nascosto.');
  }

  if (hasCompositeClasses('loginState', ['state', 'hidden'])) {
    console.log('Lo stato di login è nascosto.');
  } else {
    console.log('Lo stato di login non è nascosto.');
  }
})

/* @@ core code @@ */



/* @@ auth @@ */

async function checkAuth() {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAll({ url: _url }, function (cookies) {
      let isAuthenticated = false
      for (let i = 0; i < cookies.length; i++) {
        if (cookies[i].name === 'sb-access-token') {
          isAuthenticated = true
          break
        }
      }
      resolve(isAuthenticated)
    })
  })
}



/* @@ utils @@ */

function listClassesAndIds() {
  // Ottieni tutti gli elementi del DOM
  const allElements = document.querySelectorAll('*')
  
  // Set per memorizzare classi e ID univoci
  const classesSet = new Set();
  const idsSet = new Set();
  const compositeClassesSet = new Set() // Set per memorizzare classi composte

  // Scorri tutti gli elementi
  allElements.forEach(element => {
    // Aggiungi tutte le classi a classesSet
    element.classList.forEach(className => {
      classesSet.add(className)
    })

    // Aggiungi l'ID a idsSet se presente
    if (element.id) {
      idsSet.add(element.id)
    }

    // Genera tutte le possibili combinazioni di classi
    if (element.classList.length > 1) {
      const classListArray = Array.from(element.classList)
      const combinations = getCombinations(classListArray)
      combinations.forEach(combination => {
        compositeClassesSet.add(combination.join(' '))
      })
    }
  })

  // Converti i Set in Array per facilitare la lettura
  const classesArray = Array.from(classesSet)
  const idsArray = Array.from(idsSet)
  const compositeClassesArray = Array.from(compositeClassesSet)

  // Stampa i risultati
  console.log('Classes:', classesArray)
  console.log('IDs:', idsArray)
  console.log('Composite Classes:', compositeClassesArray)
}

// Funzione per generare tutte le possibili combinazioni di classi
function getCombinations(arr) {
  const result = [];

  const generateCombinations = (start, combo) => {
    result.push([...combo]);
    for (let i = start; i < arr.length; i++) {
      generateCombinations(i + 1, [...combo, arr[i]]);
    }
  };

  generateCombinations(0, [])
  return result.slice(1) // Rimuovi l'elemento vuoto iniziale
}

// Funzione per mostrare il loader
function showLoader() {
  const loader = document.getElementById('loadingState');
  if (loader) {
    loader.classList.remove('hidden');
  }
}

// Funzione per nascondere il loader
function hideLoader() {
  
  const loader = document.getElementById('loadingState')
  if (loader) {
    loader.classList.add('hidden');
  }
}

// Funzione generica per verificare se un elemento ha tutte le classi specificate
function hasCompositeClasses(elementId, classes) {
  const element = document.getElementById(elementId);
  if (element) {
    return classes.every(className => element.classList.contains(className));
  }
  return false;
}

// Esegui la funzione listClassesAndIds indipendentemente dalla presenza di saveButton
listClassesAndIds();

/*
document.addEventListener('DOMContentLoaded', () => {

  console.log('Il DOM è pronto!')  

  const saveButton = document.getElementById('saveButton')
  if (hasCompositeClasses('loadingState', ['loader', 'hidden'])) {
    console.log('Il loader è nascosto.');
  } else {
    console.log('Il loader non è nascosto.');
  }

  // Verifica altre combinazioni di classi
  if (hasCompositeClasses('saveState', ['state', 'hidden'])) {
    console.log('Lo stato di salvataggio è nascosto.');
  } else {
    console.log('Lo stato di salvataggio non è nascosto.');
  }

  if (hasCompositeClasses('loginState', ['state', 'hidden'])) {
    console.log('Lo stato di login è nascosto.');
  } else {
    console.log('Lo stato di login non è nascosto.');
  }
  

})

*/

// Esempio di utilizzo: aggiungi l'event listener solo se il pulsante esiste
/*
const saveButton = document.getElementById('saveButton');
if (saveButton) {
  saveButton.addEventListener('click', () => {
    showLoader(); // Mostra il loader quando si clicca sul pulsante di salvataggio

    // Simula un'operazione asincrona (ad esempio, una chiamata API)
    setTimeout(() => {
      hideLoader(); // Nasconde il loader dopo 2 secondi
      document.getElementById('successState').classList.remove('hidden'); // Mostra lo stato di successo

      // Verifica se il loader ha la classe 'loader hidden'
      if (hasCompositeClasses('loadingState', ['loader', 'hidden'])) {
        console.log('Il loader è nascosto.');
      } else {
        console.log('Il loader non è nascosto.');
      }

      // Verifica altre combinazioni di classi
      if (hasCompositeClasses('saveState', ['state', 'hidden'])) {
        console.log('Lo stato di salvataggio è nascosto.');
      } else {
        console.log('Lo stato di salvataggio non è nascosto.');
      }

      if (hasCompositeClasses('loginState', ['state', 'hidden'])) {
        console.log('Lo stato di login è nascosto.');
      } else {
        console.log('Lo stato di login non è nascosto.');
      }
    }, 2000);
  });
}

// Esempio di utilizzo: aggiungi l'event listener solo se il pulsante esiste
/*
const saveButton = document.getElementById('saveButton');
if (saveButton) {
  saveButton.addEventListener('click', () => {
    showLoader(); // Mostra il loader quando si clicca sul pulsante di salvataggio

    // Simula un'operazione asincrona (ad esempio, una chiamata API)
    setTimeout(() => {
      hideLoader(); // Nasconde il loader dopo 2 secondi
      document.getElementById('successState').classList.remove('hidden'); // Mostra lo stato di successo

      // Verifica se il loader è nascosto
      if (isLoaderHidden()) {
        console.log('Il loader è nascosto.');
      } else {
        console.log('Il loader non è nascosto.');
      }
    }, 2000);
  });
}
*/