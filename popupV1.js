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
let session_id = null

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

/* @@ state management @@ */

/*
showState('login')
showState('loading')
showState('success')
showState('save')
*/

const states = {
  login: document.getElementById('loginState'),
  save: document.getElementById('saveState'),
  loading: document.getElementById('loadingState'),
  success: document.getElementById('successState')
}


Object.entries(states).forEach(([name, element]) => {
  if (!element) {
      logger.error(`Missing state element: ${name}`);
  }
})

function showState(stateName) {

  logger.log(`Changing state to: ${stateName}`)
  
  if (!states[stateName]) {
      logger.error(`Invalid state name: ${stateName}`)
      return
  }
  
  Object.entries(states).forEach(([name, state]) => {
      state.classList.add('hidden')
      logger.log(`${name} state hidden`)
  })
  
  states[stateName].classList.remove('hidden')
  logger.log(`${stateName} state shown`)
}

/* @@ test @@ */

const uuid = generateUUID()
logger.info('uuid', uuid)

/* @@ debug @@ */

//logger.log('Initializing global variables:', { user_id, id })

//logger.log('Initial siteObj state:', siteObj)

// Modifica il tuo codice principale
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  const activeTab = tabs[0];
  const url = activeTab.url;

  try {
    const { isAuthenticated, userId } = await checkAuthAndGetUser();
    
    if (isAuthenticated && userId) {
      user_id = userId; // Imposta la variabile globale
      logger.log(`Authenticated as user: ${userId}`);
      logger.log('Initializing global variables:', { user_id, id });
      
      // Aggiorna siteObj
      siteObj.user_id = userId;
      
      showState('save');
      return;
    }
    
    logger.info('not authenticated!');
    debugCookies();
    showState('login');
    handleBtnEvents();
    
  } catch (error) {
    logger.error('Authentication error:', error);
    showState('login');
    debugCookies();
  }
});

// Funzione opzionale per salvare i token in Redis
async function updateTokensInRedis(userId, accessToken, refreshToken) {
  try {
    const response = await fetch('https://openfav-node.fly.dev/api/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        accessToken,
        refreshToken
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update tokens in Redis');
    }

    return true;
  } catch (error) {
    logger.error('Failed to update tokens:', error);
    return false;
  }
}

// Funzione helper per debug avanzato dei token
async function debugTokenStatus() {
  const accessToken = await getCookie('sb-access-token');
  const refreshToken = await getCookie('sb-refresh-token');
  
  logger.log('Token status:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessTokenLength: accessToken?.length,
    refreshTokenLength: refreshToken?.length
  });
  
  return {
    accessToken,
    refreshToken
  };
}


/* @@ core code @@ */

document.addEventListener('DOMContentLoaded', async () => {

  logger.log('dom', 'dom loaded')
  debugCookies()
  //appState()
    
})


/* @@ auth @@ */

async function checkAuth() {
  const { isAuthenticated } = await checkAuthAndGetUser()
  return isAuthenticated
}

async function checkAuthAndGetUser() {
  try {
    // Verifica access token
    const accessToken = await getCookie('sb-access-token');
    if (!accessToken) {
      return { isAuthenticated: false, userId: null };
    }

    // Prima prova con access token
    try {
      const response = await fetch('https://openfav-node.fly.dev/api/tokens/access/' + accessToken, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          isAuthenticated: true,
          userId: data.userId
        }
      }
    } catch (error) {
      logger.warn('Access token validation failed, trying refresh token...')
    }

    // Se l'access token fallisce, prova con il refresh token
    const refreshToken = await getCookie('sb-refresh-token');
    if (!refreshToken) {
      return { isAuthenticated: false, userId: null }
    }

    const refreshResponse = await fetch('https://openfav-node.fly.dev/api/tokens/access/' + refreshToken, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!refreshResponse.ok) {
      return { isAuthenticated: false, userId: null };
    }

    const refreshData = await refreshResponse.json();
    return {
      isAuthenticated: true,
      userId: refreshData.userId
    };

  } catch (error) {
    logger.error('Auth check error:', error);
    return {
      isAuthenticated: false,
      userId: null
    }
  }
}

async function getSessionInfo() {
  const response = await fetch(sessionAuthUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (!response.ok) {
    throw new Error('Errore nel recupero delle informazioni di sessione')
  }
  return response.json()
}

function handleBtnEvents() {

  const envButtons = document.querySelectorAll('.env-btn')
  logger.log(`Found ${envButtons.length} environment buttons`)

  envButtons.forEach(button => {
    button.addEventListener('click', () => {

      const env = button.dataset.env

      logger.log(`Environment selected: ${env}`);
        
      if (!env) {
        logger.error('Invalid environment data attribute')
            return
      }        
      envButtons.forEach(btn => btn.classList.remove('active'))
      button.classList.add('active')
      siteObj.environment = env        
      logger.log('Updated siteObj environment:', siteObj.environment)
    })
  })

  document.getElementById('saveButton')?.addEventListener('click', async () => {

    logger.info('Save operation started')
    
    if (!siteObj.environment) {
      
      logger.warn('No environment selected')
      alert('Please select an environment')
      return
    }

    //showState('loading')

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      if (!tab?.url) {
        throw new Error('Cannot get current tab URL')
      }
      logger.log('Processing URL:', tab.url)

      showState('success')

      setTimeout(() => {
        logger.log('Closing popup window')
        window.close()
      }, 2000)
    } catch (error) {
      logger.error('Save operation failed:', error)
      alert(`Error saving website: ${error.message}`)
      showState('save')
    }
  })

  document.getElementById('loginButton')?.addEventListener('click', () => {

    logger.log('Login button clicked')
    
    try {

      chrome.tabs.create({ url: _url + '/login' })
      window.close()

    } catch (error) {

      logger.error('Failed to redirect to login:', error)

    }
  })
}



/* @@ utils @@ */

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

async function debugCookies() {

  logger.log('Debugging cookies...') 
  
  try {
      const allCookies = await chrome.cookies.getAll({ url: _url})

      logger.log('All cookies:', allCookies)
      
      const relevantCookies = allCookies.filter(cookie => 
          cookie.name.includes('sb-') ||
          cookie.name.includes('session') ||
          cookie.name.includes('auth')
      )
      
      logger.log('Relevant auth cookies:', relevantCookies)
      
      return relevantCookies

  } catch (error) {
      logger.error('Cookie debug failed:', error)
      return []
  }
}

function debugAppState () {

  if (hasCompositeClasses('loadingState', ['loader', 'hidden'])) {
    logger.log('loader: inactive')
  } else {
    logger.log('loader: active')
  }

  if (hasCompositeClasses('saveState', ['state', 'hidden'])) {
    logger.log('save: inactive');
  } else {
    logger.log('save: active');
  }

  if (hasCompositeClasses('loginState', ['state', 'hidden'])) {
    logger.log('login: inactive');
  } else {
    logger.log('login: active');
  }

}

function debugDomElements() {
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
  logger.log('inspection dom...')
  console.log('Classes:', classesArray)
  console.log('IDs:', idsArray)
  console.log('Composite Classes:', compositeClassesArray)
  logger.log('end dom inspection')
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
debugDomElements()
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