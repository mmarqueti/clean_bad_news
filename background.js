// Clean Bad News - Background Service Worker

// Inicialização da extensão
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Primeira instalação
        console.log('Clean Bad News: Extensão instalada com sucesso!');
        
        // Define configurações padrão
        chrome.storage.sync.set({
            enabled: true,
            keywords: [],
            installDate: Date.now()
        });
        
        // Abre uma aba de boas-vindas
        chrome.tabs.create({
            url: chrome.runtime.getURL('welcome.html')
        });
    } else if (details.reason === 'update') {
        console.log('Clean Bad News: Extensão atualizada!');
    }
});

// Listener para quando a extensão é iniciada
chrome.runtime.onStartup.addListener(() => {
    console.log('Clean Bad News: Extensão iniciada!');
});

// Gerencia mensagens entre diferentes partes da extensão
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getSettings':
            chrome.storage.sync.get(['enabled', 'keywords'], (result) => {
                sendResponse({
                    enabled: result.enabled !== false,
                    keywords: result.keywords || []
                });
            });
            return true; // Para resposta assíncrona
            
        case 'updateBadge':
            updateBadge(sender.tab.id, request.count);
            break;
            
        case 'logAction':
            console.log(`Clean Bad News: ${request.message}`);
            break;
    }
});

// Atualiza o badge da extensão com o número de itens filtrados
function updateBadge(tabId, count) {
    if (count > 0) {
        chrome.action.setBadgeText({
            text: count.toString(),
            tabId: tabId
        });
        chrome.action.setBadgeBackgroundColor({
            color: '#667eea',
            tabId: tabId
        });
        chrome.action.setBadgeTextColor({
            color: '#ffffff',
            tabId: tabId
        });
    } else {
        chrome.action.setBadgeText({
            text: '',
            tabId: tabId
        });
    }
}

// Limpa o badge quando a aba é fechada ou atualizada
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
        chrome.action.setBadgeText({
            text: '',
            tabId: tabId
        });
    }
});

// Remove badge quando a aba é fechada
chrome.tabs.onRemoved.addListener((tabId) => {
    chrome.action.setBadgeText({
        text: '',
        tabId: tabId
    });
});

// Listener para comandos de teclado (atalhos)
chrome.commands.onCommand.addListener((command) => {
    switch (command) {
        case 'toggle-extension':
            toggleExtension();
            break;
    }
});

// Função para toggle rápido da extensão
async function toggleExtension() {
    try {
        const result = await chrome.storage.sync.get(['enabled']);
        const newState = !result.enabled;
        
        await chrome.storage.sync.set({ enabled: newState });
        
        // Notifica todas as abas sobre a mudança
        const tabs = await chrome.tabs.query({});
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
                action: 'stateChanged',
                enabled: newState
            }).catch(() => {
                // Ignora erros para abas que não têm o content script
            });
        });
        
        console.log(`Clean Bad News: Extensão ${newState ? 'ativada' : 'desativada'}`);
    } catch (error) {
        console.error('Erro ao alternar estado da extensão:', error);
    }
}

// Função para limpar dados antigos periodicamente
function cleanupOldData() {
    chrome.storage.local.get(null, (items) => {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const keysToRemove = [];
        
        Object.keys(items).forEach(key => {
            if (key.startsWith('stats_') && items[key].timestamp < oneWeekAgo) {
                keysToRemove.push(key);
            }
        });
        
        if (keysToRemove.length > 0) {
            chrome.storage.local.remove(keysToRemove);
            console.log(`Clean Bad News: Removidos ${keysToRemove.length} registros antigos`);
        }
    });
}

// Executa limpeza de dados uma vez por dia
chrome.alarms.create('cleanup', { periodInMinutes: 24 * 60 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'cleanup') {
        cleanupOldData();
    }
});

// Funcionalidades de estatísticas e analytics (sem dados pessoais)
function trackUsage(action) {
    const today = new Date().toISOString().split('T')[0];
    const key = `stats_${today}`;
    
    chrome.storage.local.get([key], (result) => {
        const stats = result[key] || { date: today, actions: {} };
        stats.actions[action] = (stats.actions[action] || 0) + 1;
        stats.timestamp = Date.now();
        
        chrome.storage.local.set({ [key]: stats });
    });
}

// Context menu para ações rápidas (botão direito)
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'toggle-clean-bad-news',
        title: 'Ativar/Desativar Clean Bad News',
        contexts: ['page']
    });
    
    chrome.contextMenus.create({
        id: 'add-keyword-from-selection',
        title: 'Adicionar "%s" como palavra-chave',
        contexts: ['selection']
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    switch (info.menuItemId) {
        case 'toggle-clean-bad-news':
            await toggleExtension();
            break;
            
        case 'add-keyword-from-selection':
            if (info.selectionText) {
                const keyword = info.selectionText.trim().toLowerCase();
                if (keyword.length > 0 && keyword.length <= 50) {
                    try {
                        const result = await chrome.storage.sync.get(['keywords']);
                        const keywords = result.keywords || [];
                        
                        if (!keywords.includes(keyword) && keywords.length < 10) {
                            keywords.push(keyword);
                            await chrome.storage.sync.set({ keywords });
                            
                            // Notifica a aba atual
                            chrome.tabs.sendMessage(tab.id, {
                                action: 'updateKeywords',
                                keywords: keywords
                            });
                            
                            console.log(`Clean Bad News: Palavra-chave "${keyword}" adicionada`);
                        }
                    } catch (error) {
                        console.error('Erro ao adicionar palavra-chave:', error);
                    }
                }
            }
            break;
    }
});

console.log('Clean Bad News: Background service worker carregado!'); 