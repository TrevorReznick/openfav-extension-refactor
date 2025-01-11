
console.log("Service worker attivato!")

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.type === 'login') {
      console.log('User logged in:', request.user)
      // Esegui le azioni necessarie quando l'utente si logga
      sendResponse({ status: 'success' })
  }
  return true// Indica che invierai una risposta asincrona
})

chrome.cookies.get({url: "https://openfav-dev.vercel.app", name: "sb-access-tocken"}, function(cookie) {
  if (chrome.runtime.lastError) {
    //console.error("Errore nell'accesso ai cookie:", chrome.runtime.lastError)
  } else if (cookie) {
    //console.log("Cookie trovato:", cookie)
  } else {
    //console.log("Cookie non trovato.")
  }
})
