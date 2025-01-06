const api_url_prod = 'https://openfav-dev.vercel.app'
const api_url_dev = 'http://localhost:4321'
//const _url_old = 'https://bookmarks-list.netlify.app'
const _url = api_url_prod
const sessionAuthUrl = _url + '/api/v1/auth/signin'
const YOUR_TOKEN = '89773db3-7863-460c-ad3c-6abd0db43f1c'
const API_URL = 'https://vnavarra.nuvolaris.dev/api/my/openfavs/classify?url='

let user_id = null
let id = null

let siteObj = {
  /* data from frontend */
  user_id: null,
  name: null,
  /* data from backend */
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
  name: null,
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
  user_id: null,
  valid_url: null
}

/* @@ core code @@ */

document.querySelector('#saveButton')
  .addEventListener('click', () => {

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {

      const activeTab = tabs[0]
      const url = activeTab.url
      
      try {

        const isAuthenticated = await checkAuth()

        if (isAuthenticated) {

          console.log('authenticated!')
          const sessionInfo = await getSessionInfo()
          user_id = sessionInfo.session.user.id
          console.log(`Authenticated as user: ${user_id}`)
          const aiResponse = await testAiBackend(url)

          /* @@ new code @@ */
          
          let responseObject = aiResponse;  // È già un oggetto, quindi lo usiamo direttamente

          siteObj.accessible = responseObject['accessible']
          siteObj.AI = responseObject['AI'] ? true : false
          siteObj.AI_think = responseObject['my_string']
          siteObj.description = responseObject['description']
          siteObj.domain_exists = responseObject['domain_exists']
          siteObj.html_content_exists = responseObject['html_content_exists']
          siteObj.id_area = responseObject['tag_1'].id
          siteObj.id_cat = responseObject['tag_2'].id
          siteObj.name = responseObject['name']
          siteObj.redirect_exists = responseObject['redirect_exists']
          siteObj.secure = responseObject['secure']
          siteObj.status_code = responseObject['status_code']
          siteObj.type = responseObject['type']
          siteObj.tag_3 = responseObject['tag_3'].id
          siteObj.tag_4 = responseObject['tag_4'].id
          siteObj.tag_5 = responseObject['tag_5'].id
          siteObj.title = responseObject['title']
          siteObj.url = url
          siteObj.user_id = user_id
          siteObj.valid_url = responseObject['valid_url']

          console.log('siteObj: ', siteObj)
          // Converte l'oggetto in una stringa JSON formattata
          //const formattedResponse = JSON.stringify(responseObject, null, 2);
          alert('virtual insert ok!')
          await postData(siteObj.url)
        } else {
          alert('not authenticated!')
          showLoginPrompt()
        }
      } catch(e) {
        alert('Errore: ' + e.message)
      }      
    })
  })


/* @@ functions @@ */

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

async function postData(site_url) {
  console.log('post data function')
  const api_url = api_url_prod + '/api/v1/main/main'
  console.log('Debug: ', api_url)  

  const payload = siteObj
  console.log(siteObj)

  try {
    const response = await fetch(api_url, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })    
    if (!response.ok) {
      throw new Error(`Errore nella richiesta: ${response.statusText}`)
    } else {
      alert('post avvenuto con successo')
    }    
    const data = await response.json()
    //id = data[0].id
    console.log(data)
    //alert('Dati ricevuti: ' + JSON.stringify(data[0]))
  } catch (error) {
    console.error('Errore:', error)
  }
}

function showLoginPrompt() {
  document.body.innerHTML = `
    <h3>Save Current Site</h3>
    <p>You need to be authenticated to use OpenFavs.</p>
    <button id="loginButton">Login</button>
  `  
  document.querySelector('#loginButton').addEventListener('click', () => {
    window.open('https://openfav-dev.vercel.app/login', '_blank')
  })
}


async function testAiBackend(url) {
  let _url = `${API_URL}${url}`
  const response = await fetch(_url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${YOUR_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
  if (!response.ok) {
    throw new Error('Errore nella richiesta')
  }  
  return response.json()
}


// Esegui una richiesta fetch al tuo endpoint
/*
const apiUrl = `https://bookmarks-list.netlify.app/api/v1/test`
  fetch(apiUrl, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    alert(data.message)
  })
    .catch((error) => {
      console.error('Error:', error)
      alert('Failed to fetch data.')
    })*/
