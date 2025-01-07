const api_url_prod = 'https://openfav-dev.vercel.app'
const api_url_dev = 'http://localhost:4321'
//const _url_old = 'https://bookmarks-list.netlify.app'
const _url = api_url_prod
const sessionAuthUrl = _url + '/api/v1/auth/signin'
const YOUR_TOKEN = '89773db3-7863-460c-ad3c-6abd0db43f1c'
const API_URL = 'https://vnavarra.nuvolaris.dev/api/my/openfavs/classify?url='

// Debug configuration
const DEBUG = true

const logger = {
    log: (...args) => DEBUG && console.log('[DEBUG]:', ...args),
    error: (...args) => console.error('[ERROR]:', ...args),
    warn: (...args) => console.warn('[WARN]:', ...args),
    info: (...args) => console.info('[INFO]:', ...args)
}

// Global variables
let user_id = null
let id = null

logger.log('Initializing global variables:', { user_id, id })

// Site object
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
};

logger.log('Initial siteObj state:', siteObj)

// State management
const states = {
    login: document.getElementById('loginState'),
    save: document.getElementById('saveState'),
    loading: document.getElementById('loadingState'),
    success: document.getElementById('successState')
}

// Validate state elements
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

// Debug cookies function
async function debugCookies() {

    logger.log('Debugging cookies...')

    

    
    
    try {
        const allCookies = await chrome.cookies.getAll({ url: _url})

        logger.log('All cookies:', allCookies)
        
        const relevantCookies = allCookies.filter(cookie => 
            cookie.name.includes('sb-') ||
            cookie.name.includes('session') ||
            cookie.name.includes('auth')
        );
        
        logger.log('Relevant auth cookies:', relevantCookies)
        
        return relevantCookies
    } catch (error) {
        logger.error('Cookie debug failed:', error);
        return [];
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    logger.info('Application starting...');
    showState('loading');
    
    try {
        // Debug cookies on startup
        await debugCookies();
        
        logger.log('Debug URLs:', {
            _url,
            sessionAuthUrl,
            api_url_prod
        });
        
        logger.log('Checking authentication...');
        const isAuthenticated = await checkAuth()
        
        if (isAuthenticated) {

            logger.info('User authenticated, fetching session info')
            
            try {
                const sessionInfo = await getSessionInfo();
                
                if (!sessionInfo?.session?.user?.id) {
                    logger.error('Invalid session info structure:', sessionInfo);
                    throw new Error('Invalid session info structure');
                }
                
                user_id = sessionInfo.session.user.id;
                logger.info(`Session initialized for user: ${user_id}`);
                
                await initializeSaveInterface();
            } catch (sessionError) {
                logger.error('Session info failed:', sessionError);
                showState('login');
            }
        } else {
            logger.warn('User not authenticated');
            showState('login');
        }
    } catch (error) {
        logger.error('Initialization failed:', error);
        showState('login');
    }
});

// Environment selection
const envButtons = document.querySelectorAll('.env-btn');
logger.log(`Found ${envButtons.length} environment buttons`);

envButtons.forEach(button => {
    button.addEventListener('click', () => {
        const env = button.dataset.env;
        logger.log(`Environment selected: ${env}`);
        
        if (!env) {
            logger.error('Invalid environment data attribute');
            return;
        }
        
        envButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        siteObj.environment = env;
        
        logger.log('Updated siteObj environment:', siteObj.environment);
    });
});

// Login button handler
document.getElementById('loginButton')?.addEventListener('click', () => {
    logger.log('Login button clicked');
    
    try {
        chrome.tabs.create({ url: _url + '/login' });
        window.close();
    } catch (error) {
        logger.error('Failed to redirect to login:', error);
    }
});

// Save button handler
document.getElementById('saveButton')?.addEventListener('click', async () => {
    logger.info('Save operation started');
    
    if (!siteObj.environment) {
        logger.warn('No environment selected');
        alert('Please select an environment');
        return;
    }

    showState('loading');
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url) {
            throw new Error('Cannot get current tab URL');
        }
        
        logger.log('Processing URL:', tab.url);
        
        const aiResponse = await testAiBackend(tab.url);
        logger.log('AI analysis completed', aiResponse);
        
        updateSiteObj(aiResponse, tab.url);
        logger.log('Site object updated', siteObj);
        
        const response = await postData(tab.url);
        logger.info('Data saved successfully', response);
        
        showState('success');
        
        setTimeout(() => {
            logger.log('Closing popup window');
            window.close();
        }, 2000);
    } catch (error) {
        logger.error('Save operation failed:', error);
        alert(`Error saving website: ${error.message}`);
        showState('save');
    }
});

async function initializeSaveInterface() {
    logger.log('Initializing save interface');
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            throw new Error('No active tab found');
        }
        
        const elements = {
            title: document.getElementById('siteTitle'),
            url: document.getElementById('siteUrl'),
            favicon: document.getElementById('siteFavicon')
        };
        
        // Validate all elements exist
        Object.entries(elements).forEach(([name, element]) => {
            if (!element) {
                throw new Error(`Missing UI element: ${name}`);
            }
        });
        
        elements.title.textContent = tab.title || 'Untitled';
        elements.url.textContent = tab.url || '';
        elements.favicon.src = tab.favIconUrl || 'assets/default-favicon.png';
        
        logger.log('Save interface initialized with:', {
            title: tab.title,
            url: tab.url,
            favicon: tab.favIconUrl
        });
        
        showState('save');
    } catch (error) {
        logger.error('Failed to initialize save interface:', error);
        throw error;
    }
}

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

async function checkAuthNew() {

    logger.log('Checking authentication status')
    
    try {
      return new Promise((resolve, reject) => {
        logger.log('Checking cookies for URL:', _url);
      
        chrome.cookies.getAll({ url: _url }, function(cookies) {
          if (chrome.runtime.lastError) {
            logger.error('Cookie access error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
            return
          }
          logger.log('Found cookies:', cookies)
          const isAuthenticated = cookies.some(cookie => 
            cookie.name === 'sb-access-token' || cookie.name === 'sb-refresh-token'
          )
          logger.log('Authentication status:', isAuthenticated)
          resolve(isAuthenticated)
        })
      })
    } catch (error) {
        logger.error('Authentication check failed:', error);
        throw error;
    }
}

async function getSessionInfo() {
    logger.log('Fetching session information');
    
    try {
        const response = await fetch(sessionAuthUrl, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Session info request failed: ${response.status}`);
        }
        
        const data = await response.json();
        logger.log('Session info retrieved:', data);
        return data;
    } catch (error) {
        logger.error('Failed to get session info:', error);
        throw error;
    }
}

function updateSiteObj(responseObject, url) {
    logger.log('Updating site object with response:', responseObject);
    
    if (!responseObject || !url) {
        logger.error('Invalid parameters for updateSiteObj');
        throw new Error('Invalid response object or URL');
    }
    
    try {
        Object.assign(siteObj, {
            accessible: responseObject.accessible,
            AI: Boolean(responseObject.AI),
            AI_think: responseObject.my_string,
            description: responseObject.description,
            domain_exists: responseObject.domain_exists,
            html_content_exists: responseObject.html_content_exists,
            id_area: responseObject.tag_1?.id,
            id_cat: responseObject.tag_2?.id,
            name: responseObject.name,
            redirect_exists: responseObject.redirect_exists,
            secure: responseObject.secure,
            status_code: responseObject.status_code,
            type: responseObject.type,
            tag_3: responseObject.tag_3?.id,
            tag_4: responseObject.tag_4?.id,
            tag_5: responseObject.tag_5?.id,
            title: responseObject.title,
            url: url,
            user_id: user_id,
            valid_url: responseObject.valid_url
        });
        
        logger.log('Site object updated successfully');
    } catch (error) {
        logger.error('Failed to update site object:', error);
        throw error;
    }
}

async function postData(site_url) {
    logger.log('Posting data to backend', { url: site_url });
    
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
            throw new Error(`Request failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        logger.log('Data posted successfully:', data);
        return data;
    } catch (error) {
        logger.error('Failed to post data:', error);
        throw error;
    }
}

async function testAiBackend(url) {
    logger.log('Testing AI backend for URL:', url);
    
    try {
        const _url = `${API_URL}${url}`;
        const response = await fetch(_url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${YOUR_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`AI analysis failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        logger.log('AI analysis completed successfully:', data);
        return data;
    } catch (error) {
        logger.error('AI analysis failed:', error);
        throw error;
    }
}