// Configurazione degli ambienti e delle relative opzioni
const environmentConfig = {
    "name": "Environment Selector",
    "environments": [
      {
        "name": "Production",
        "icon": "Briefcase",
        "resourceTypes": [
            {
                "resource_id": 1,
                "name": "infrastructure",
                "description": "Risorse infrastrutturali"
              },
              {
                "resource_id": 2,
                "name": "framework",
                "description": "Framework e librerie"
              },
              {
                "resource_id": 3,
                "name": "platform",
                "description": "Piattaforme"
              },
              {
                "resource_id": 4,
                "name": "database",
                "description": "Database"
              },
              {
                "resource_id": 5,
                "name": "hosting",
                "description": "Servizi Hosting"
              },
              {
                "resource_id": 6,
                "name": "platform",
                "description": "Applicazione"
              }
        ],
        "functionsTypes": [
            {
                "function_id": 1,
                "name": "service",
                "description": "Servizi web"
            },
            {
                "function_id": 2,
                "name": "tool",
                "description": "Strumenti"
            },
            {
                "function_id": 3,
                "name": "api",
                "description": "Interfacce di programmazione"
            },
            {
                "function_id": 4,
                "name": "provider",
                "description": "Fornitori di servizi"
            }
        ]
      },
      {
        "name": "Development",
        "icon": "Code2",
        "resourceTypes": [
            {
                "resource_id": 1,
                "name": "infrastructure",
                "description": "Risorse infrastrutturali"
              },
              {
                "resource_id": 2,
                "name": "framework",
                "description": "Framework e librerie"
              },
              {
                "resource_id": 3,
                "name": "platform",
                "description": "Piattaforme"
              },
              {
                "resource_id": 4,
                "name": "database",
                "description": "Database"
              },
              {
                "resource_id": 5,
                "name": "hosting",
                "description": "Servizi Hosting"
              },
              {
                "resource_id": 6,
                "name": "platform",
                "description": "Applicazione"
              }
        ],
        "functionsTypes": [
            {
                "function_id": 1,
                "name": "service",
                "description": "Servizi web"
            },
            {
                "function_id": 2,
                "name": "tool",
                "description": "Strumenti"
            },
            {
                "function_id": 3,
                "name": "api",
                "description": "Interfacce di programmazione"
            },
            {
                "function_id": 4,
                "name": "provider",
                "description": "Fornitori di servizi"
            }
        ]
      },
      {
        "name": "Personal",
        "icon": "User",
        "resourceTypes": [
            {
                "resource_id": 7,
                "name": "favorite",
                "label": "Favoriti"
            },
            {
                "resource_id": 8,
                "name": "todo",
                "label": "Todo"
            },
            {
                "resource_id": 9,
                "name": "readlater",
                "label": "Read Later"
            },
            {
                "resource_id": 10,
                "name": "generic",
                "label": "Generic"
            }
        ]
      },
      {
        "name": "Portfolio",
        "icon": "FolderKanban",
        "resourceTypes": []
      }
    ]
  };
  
  // Seleziona gli elementi del DOM
  const environmentButtons = document.querySelectorAll('.env-btn');
  const resourceTypesContainer = document.getElementById('resourceTypes');
  const functionTypesContainer = document.getElementById('functionTypes');
  const functionTypesGroup = document.getElementById('functionTypesGroup');
  
  // Funzione per creare una checkbox
  function createCheckbox(item, type) {
    const div = document.createElement('div');
    div.className = 'checkbox-item';
  
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `${type}-${item.name}`;
    checkbox.name = item.name;
    checkbox.value = type === 'resource' ? item.resource_id : item.function_id;
  
    const label = document.createElement('label');
    label.htmlFor = `${type}-${item.name}`;
    label.textContent = item.description || item.label || item.name;
  
    div.appendChild(checkbox);
    div.appendChild(label);
  
    return div;
  }
  
  // Funzione per aggiornare le opzioni in base all'ambiente selezionato
  function updateOptions(environmentName) {
    // Reset containers
    resourceTypesContainer.innerHTML = '';
    functionTypesContainer.innerHTML = '';
  
    // Trova l'ambiente selezionato
    const environment = environmentConfig.environments.find(env => 
        env.name.toLowerCase() === environmentName.toLowerCase()
    );
  
    if (!environment) return;
  
    // Popola i resource types
    if (environment.resourceTypes && environment.resourceTypes.length > 0) {
        environment.resourceTypes.forEach(resource => {
            const checkbox = createCheckbox(resource, 'resource');
            resourceTypesContainer.appendChild(checkbox);
        });
        document.getElementById('resourceTypesGroup').style.display = 'block';
    } else {
        document.getElementById('resourceTypesGroup').style.display = 'none';
    }
  
    // Popola i function types
    if (environment.functionsTypes && environment.functionsTypes.length > 0) {
        environment.functionsTypes.forEach(func => {
            const checkbox = createCheckbox(func, 'function');
            functionTypesContainer.appendChild(checkbox);
        });
        functionTypesGroup.style.display = 'block';
    } else {
        functionTypesGroup.style.display = 'none';
    }
  }
  
  // Gestione del click sui pulsanti dell'ambiente
  environmentButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Rimuovi la classe active da tutti i pulsanti
        environmentButtons.forEach(btn => btn.classList.remove('active'));
        
        // Aggiungi la classe active al pulsante cliccato
        button.classList.add('active');
        
        // Aggiorna le opzioni
        const environmentName = button.getAttribute('data-env');
        updateOptions(environmentName);
    });
  });
  
  // Inizializza le opzioni con il primo ambiente
  if (environmentButtons.length > 0) {
    const firstEnvironment = environmentButtons[0].getAttribute('data-env');
    environmentButtons[0].classList.add('active');
    updateOptions(firstEnvironment);
  }
  
  // Gestione del pulsante di salvataggio
  document.getElementById('saveButton').addEventListener('click', () => {
    // Mostra lo stato di caricamento
    document.getElementById('saveState').classList.add('hidden');
    document.getElementById('loadingState').classList.remove('hidden');
  
    // Simula un'operazione di salvataggio
    setTimeout(() => {
      document.getElementById('loadingState').classList.add('hidden');
      document.getElementById('successState').classList.remove('hidden');
  
      // Resetta dopo 2 secondi
      setTimeout(() => {
        document.getElementById('successState').classList.add('hidden');
        document.getElementById('saveState').classList.remove('hidden');
      }, 2000);
    }, 1500);
  });
  