const api_url_prod = 'https://openfav-dev.vercel.app'
const api_url_dev = 'http://localhost:4321'
//const _url_old = 'https://bookmarks-list.netlify.app'
const _url = api_url_prod
const sessionAuthUrl = _url + '/api/v1/auth/signin'
const YOUR_TOKEN = '89773db3-7863-460c-ad3c-6abd0db43f1c'
const API_URL = 'https://vnavarra.nuvolaris.dev/api/my/openfavs/classify?url='



let user_id = null;
let id = null;

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
  valid_url: null,
  environment: null
};

// Initial state check on load
document.addEventListener('DOMContentLoaded', async () => {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    console.log('user not authenticated')
    showLoginPrompt()
  } else {
    const sessionInfo = await getSessionInfo()
    user_id = sessionInfo.session.user.id
    updateUIForAuthenticatedUser()
  }
});

// Save button click handler
document.querySelector('#saveButton').addEventListener('click', () => {
  const selectedEnv = document.querySelector('.env-btn.active');
  if (!selectedEnv) {
    alert('Please select an environment');
    return;
  }
  
  siteObj.environment = selectedEnv.dataset.env;
  
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const activeTab = tabs[0];
    const url = activeTab.url;
    
    try {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('saveState').classList.add('hidden');
        
        const sessionInfo = await getSessionInfo();
        user_id = sessionInfo.session.user.id;
        const aiResponse = await testAiBackend(url);
        
        let responseObject = aiResponse;
        
        siteObj.accessible = responseObject['accessible'];
        siteObj.AI = responseObject['AI'] ? true : false;
        siteObj.AI_think = responseObject['my_string'];
        siteObj.description = responseObject['description'];
        siteObj.domain_exists = responseObject['domain_exists'];
        siteObj.html_content_exists = responseObject['html_content_exists'];
        siteObj.id_area = responseObject['tag_1'].id;
        siteObj.id_cat = responseObject['tag_2'].id;
        siteObj.name = responseObject['name'];
        siteObj.redirect_exists = responseObject['redirect_exists'];
        siteObj.secure = responseObject['secure'];
        siteObj.status_code = responseObject['status_code'];
        siteObj.type = responseObject['type'];
        siteObj.tag_3 = responseObject['tag_3'].id;
        siteObj.tag_4 = responseObject['tag_4'].id;
        siteObj.tag_5 = responseObject['tag_5'].id;
        siteObj.title = responseObject['title'];
        siteObj.url = url;
        siteObj.user_id = user_id;
        siteObj.valid_url = responseObject['valid_url'];

        await postData(siteObj.url);
        
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('successState').classList.remove('hidden');
        
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        showLoginPrompt();
      }
    } catch(e) {
      document.getElementById('loadingState').classList.add('hidden');
      document.getElementById('saveState').classList.remove('hidden');
      alert('Error: ' + e.message);
    }
  });
});

// Environment button handlers
document.querySelectorAll('.env-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.env-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  })
})

function updateUIForAuthenticatedUser() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    document.getElementById('siteTitle').textContent = activeTab.title
    document.getElementById('siteUrl').textContent = activeTab.url
    document.getElementById('siteFavicon').src = activeTab.favIconUrl || 'assets/favicon.svg'
    
    document.getElementById('loginState').classList.add('hidden')
    document.getElementById('saveState').classList.remove('hidden')
  })
}

function showLoginPrompt() {
  document.getElementById('saveState').classList.add('hidden');
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('successState').classList.add('hidden');
  document.getElementById('loginState').classList.remove('hidden');
}

async function checkAuth() {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAll({ url: _url }, function (cookies) {
      let isAuthenticated = false;
      for (let i = 0; i < cookies.length; i++) {
        if (cookies[i].name === 'sb-access-token') {
          isAuthenticated = true;
          break;
        }
      }
      resolve(isAuthenticated);
    });
  });
}

async function getSessionInfo() {
  const response = await fetch(sessionAuthUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Error retrieving session information');
  }
  return response.json();
}

async function postData(site_url) {
  const api_url = api_url_prod + '/api/v1/main/main';
  
  try {
    const response = await fetch(api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(siteObj)
    });
    
    if (!response.ok) {
      throw new Error(`Request error: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function testAiBackend(url) {
  const _url = `${API_URL}${url}`;
  const response = await fetch(_url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${YOUR_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('AI analysis request failed');
  }
  
  return response.json();
}

// Login button handler
document.getElementById('loginButton').addEventListener('click', () => {
  window.open('https://openfav-dev.vercel.app/login', '_blank');
})