const api_url_prod = 'https://openfav-dev.vercel.app'
const api_url_dev = 'http://localhost:4321'
//const _url_old = 'https://bookmarks-list.netlify.app'
const _url = api_url_prod
const sessionAuthUrl = _url + '/api/v1/auth/signin'
const YOUR_TOKEN = '89773db3-7863-460c-ad3c-6abd0db43f1c'
const API_URL = 'https://vnavarra.nuvolaris.dev/api/my/openfavs/classify?url='

let user_id = null;
let siteObj = {
  user_id: null,
  name: null,
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
  valid_url: null,
  environment: null
};

// State management
const states = {
  login: document.getElementById('loginState'),
  save: document.getElementById('saveState'),
  loading: document.getElementById('loadingState'),
  success: document.getElementById('successState')
};

function showState(stateName) {
  Object.values(states).forEach(state => state.classList.add('hidden'));
  states[stateName].classList.remove('hidden');
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  showState('loading');
  
  try {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
      const sessionInfo = await getSessionInfo();
      user_id = sessionInfo.session.user.id;
      initializeSaveInterface();
    } else {
      showState('login');
    }
  } catch (error) {
    console.error('Initialization error:', error);
    showState('login');
  }
});

// Login handling
document.getElementById('loginButton').addEventListener('click', () => {
  window.open('https://openfav-dev.vercel.app/login', '_blank');
});

// Environment selection
const envButtons = document.querySelectorAll('.env-btn');
envButtons.forEach(button => {
  button.addEventListener('click', () => {
    envButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    siteObj.environment = button.dataset.env;
  });
});

// Save functionality
document.getElementById('saveButton').addEventListener('click', async () => {
  if (!siteObj.environment) {
    alert('Please select an environment');
    return;
  }

  showState('loading');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;
    
    const aiResponse = await testAiBackend(url);
    updateSiteObj(aiResponse, url);
    
    await postData(url);
    showState('success');
    
    // Auto-close after success
    setTimeout(() => {
      window.close();
    }, 2000);
  } catch (error) {
    console.error('Save error:', error);
    alert('Error saving website: ' + error.message);
    showState('save');
  }
});

async function initializeSaveInterface() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Update UI with current page info
  document.getElementById('siteTitle').textContent = tab.title;
  document.getElementById('siteUrl').textContent = tab.url;
  document.getElementById('siteFavicon').src = tab.favIconUrl || 'assets/default-favicon.png';
  
  showState('save');
}

function updateSiteObj(responseObject, url) {
  Object.assign(siteObj, {
    accessible: responseObject.accessible,
    AI: responseObject.AI ? true : false,
    AI_think: responseObject.my_string,
    description: responseObject.description,
    domain_exists: responseObject.domain_exists,
    html_content_exists: responseObject.html_content_exists,
    id_area: responseObject.tag_1.id,
    id_cat: responseObject.tag_2.id,
    name: responseObject.name,
    redirect_exists: responseObject.redirect_exists,
    secure: responseObject.secure,
    status_code: responseObject.status_code,
    type: responseObject.type,
    tag_3: responseObject.tag_3.id,
    tag_4: responseObject.tag_4.id,
    tag_5: responseObject.tag_5.id,
    title: responseObject.title,
    url: url,
    user_id: user_id,
    valid_url: responseObject.valid_url
  });
}

// Your existing utility functions
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