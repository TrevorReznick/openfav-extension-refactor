
console.log("Service worker attivato!")

chrome.cookies.get({url: "https://openfav-dev.vercel.app", name: "sb-access-tocken"}, function(cookie) {
  if (chrome.runtime.lastError) {
    //console.error("Errore nell'accesso ai cookie:", chrome.runtime.lastError)
  } else if (cookie) {
    //console.log("Cookie trovato:", cookie)
  } else {
    //console.log("Cookie non trovato.")
  }
})
