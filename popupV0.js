const api_url_prod = 'https://openfav-dev.vercel.app'
const api_url_dev = 'http://localhost:4321'
//const _url_old = 'https://bookmarks-list.netlify.app'
const _url = api_url_prod
const sessionAuthUrl = _url + '/api/v1/auth/signin'
const YOUR_TOKEN = '89773db3-7863-460c-ad3c-6abd0db43f1c'
const API_URL = 'https://vnavarra.nuvolaris.dev/api/my/openfavs/classify?url='

const logger = {
    log: (...args) => DEBUG && console.log('[DEBUG]:', ...args),
    error: (...args) => console.error('[ERROR]:', ...args),
    warn: (...args) => console.warn('[WARN]:', ...args),
    info: (...args) => console.info('[INFO]:', ...args)
}

/* @@ utils @@ */

function listClassesAndIds() {
    // Ottieni tutti gli elementi del DOM
    const allElements = document.querySelectorAll('*')
    
    // Set per memorizzare classi e ID univoci
    const classesSet = new Set()
    const idsSet = new Set()
  
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
    })
  
    // Converti i Set in Array per facilitare la lettura
    const classesArray = Array.from(classesSet)
    const idsArray = Array.from(idsSet)
  
    // Stampa i risultati
    console.log('Classes:', classesArray)
    console.log('IDs:', idsArray)
  }
  
  // Esegui la funzione
  listClassesAndIds()

  // Funzione per mostrare il loader
function showLoader() {
  const loader = document.getElementById('loadingState')
  if (loader) {
    loader.classList.remove('hidden')
  }
}

// Funzione per nascondere il loader
function hideLoader() {
  const loader = document.getElementById('loadingState')
  if (loader) {
    loader.classList.add('hidden')
  }
}

hideLoader()
listClassesAndIds()
