// Clean Bad News - Popup JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const enableToggle = document.getElementById('enableToggle');
    const blockedCountElement = document.getElementById('blockedCount');
    const keywordsContainer = document.getElementById('keywordsContainer');
    const newKeywordInput = document.getElementById('newKeyword');
    const addButton = document.getElementById('addButton');

    let currentKeywords = [];
    let isEnabled = true;

    // Inicializa o popup
    init();

    async function init() {
        try {
            // Carrega configurações salvas
            const settings = await chrome.storage.sync.get(['enabled', 'keywords']);
            
            isEnabled = settings.enabled !== false; // Padrão: true
            if (settings.keywords && Array.isArray(settings.keywords)) {
                currentKeywords = settings.keywords;
            }

            // Atualiza a interface
            enableToggle.checked = isEnabled;
            updateKeywordsDisplay();
            
            // Obtém estatísticas da aba atual
            await getStats();
        } catch (error) {
            console.error('Erro ao inicializar popup:', error);
        }
    }

    async function getStats() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            chrome.tabs.sendMessage(tab.id, { action: 'getStats' }, (response) => {
                if (response && response.blockedCount !== undefined) {
                    blockedCountElement.textContent = response.blockedCount;
                    
                    // Atualiza o estado da interface se necessário
                    if (response.isEnabled !== undefined) {
                        enableToggle.checked = response.isEnabled;
                        isEnabled = response.isEnabled;
                    }
                    
                    if (response.keywords) {
                        currentKeywords = response.keywords;
                        updateKeywordsDisplay();
                    }
                }
            });
        } catch (error) {
            console.log('Não foi possível obter estatísticas da aba atual');
        }
    }

    function updateKeywordsDisplay() {
        keywordsContainer.innerHTML = '';
        
        currentKeywords.forEach(keyword => {
            const tag = document.createElement('span');
            tag.className = 'keyword-tag';
            tag.textContent = keyword;
            tag.addEventListener('click', () => removeKeyword(keyword));
            keywordsContainer.appendChild(tag);
        });
    }

    async function removeKeyword(keyword) {
        currentKeywords = currentKeywords.filter(k => k.toLowerCase() !== keyword.toLowerCase());
        await saveKeywords();
        updateKeywordsDisplay();
        await updateContentScripts();
    }

    async function addKeyword() {
        const newKeyword = newKeywordInput.value.trim().toLowerCase();
        
        if (!newKeyword) {
            showNotification('Digite uma palavra-chave válida');
            return;
        }
        
        if (currentKeywords.includes(newKeyword)) {
            showNotification('Esta palavra-chave já existe');
            newKeywordInput.value = '';
            return;
        }

        if (currentKeywords.length >= 10) {
            showNotification('Máximo de 10 palavras-chave permitidas');
            return;
        }

        currentKeywords.push(newKeyword);
        await saveKeywords();
        updateKeywordsDisplay();
        await updateContentScripts();
        
        newKeywordInput.value = '';
        showNotification('Palavra-chave adicionada com sucesso!');
    }

    async function saveKeywords() {
        try {
            await chrome.storage.sync.set({ keywords: currentKeywords });
        } catch (error) {
            console.error('Erro ao salvar palavras-chave:', error);
        }
    }

    async function updateContentScripts() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            chrome.tabs.sendMessage(tab.id, { 
                action: 'updateKeywords', 
                keywords: currentKeywords 
            }, (response) => {
                if (response && response.success) {
                    console.log('Palavras-chave atualizadas no content script');
                }
            });
        } catch (error) {
            console.log('Não foi possível atualizar content script na aba atual');
        }
    }

    async function toggleExtension() {
        isEnabled = enableToggle.checked;
        
        try {
            await chrome.storage.sync.set({ enabled: isEnabled });
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            chrome.tabs.sendMessage(tab.id, { action: 'toggle' }, (response) => {
                if (response && response.success) {
                    console.log('Estado da extensão alterado:', isEnabled);
                    if (response.stats) {
                        blockedCountElement.textContent = response.stats.blockedCount;
                    }
                }
            });
            
            showNotification(isEnabled ? 'Extensão ativada' : 'Extensão desativada');
        } catch (error) {
            console.error('Erro ao alterar estado da extensão:', error);
        }
    }

    function showNotification(message) {
        // Cria uma notificação temporária
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: #28a745;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    // Event Listeners
    enableToggle.addEventListener('change', toggleExtension);
    addButton.addEventListener('click', addKeyword);
    
    newKeywordInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addKeyword();
        }
    });

    // Adiciona animações CSS dinamicamente
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        
        @keyframes slideOut {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
        
        .keyword-tag {
            transition: all 0.3s ease;
        }
        
        .keyword-tag:hover {
            transform: translateY(-1px);
        }
    `;
    document.head.appendChild(style);
});

// Adiciona um listener para atualizar as estatísticas quando a aba muda
chrome.tabs.onActivated.addListener(() => {
    setTimeout(() => {
        const blockedCountElement = document.getElementById('blockedCount');
        if (blockedCountElement) {
            getStatsFromActiveTab();
        }
    }, 100);
});

async function getStatsFromActiveTab() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        chrome.tabs.sendMessage(tab.id, { action: 'getStats' }, (response) => {
            if (response && response.blockedCount !== undefined) {
                const blockedCountElement = document.getElementById('blockedCount');
                if (blockedCountElement) {
                    blockedCountElement.textContent = response.blockedCount;
                }
            }
        });
    } catch (error) {
        console.log('Não foi possível obter estatísticas da nova aba');
    }
} 