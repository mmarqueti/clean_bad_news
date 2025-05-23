// Clean Bad News - Content Script
// Remove elementos que contenham as palavras-chave especificadas

class CleanBadNews {
    constructor() {
        this.keywords = [];
        this.blockedCount = 0;
        this.isEnabled = true;
        this.observer = null;
        
        // Carrega configurações
        this.loadSettings();
        
        // Inicia o processo de limpeza
        this.initialize();
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['enabled', 'keywords']);
            this.isEnabled = result.enabled !== false; // Por padrão é true
            if (result.keywords && Array.isArray(result.keywords)) {
                this.keywords = result.keywords.map(k => k.toLowerCase());
            }
        } catch (error) {
            console.log('Usando configurações padrão');
        }
    }

    initialize() {
        if (!this.isEnabled) return;

        // Executa a limpeza inicial
        this.cleanPage();
        
        // Configura observer para elementos adicionados dinamicamente
        this.setupMutationObserver();
        
        // Executa limpeza periodicamente para sites com carregamento dinâmico
        setInterval(() => this.cleanPage(), 2000);
    }

    setupMutationObserver() {
        this.observer = new MutationObserver((mutations) => {
            if (!this.isEnabled) return;
            
            let shouldClean = false;
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    shouldClean = true;
                }
            });
            
            if (shouldClean) {
                setTimeout(() => this.cleanPage(), 100);
            }
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    cleanPage() {
        if (!this.isEnabled) return;

        // Seletores comuns para artigos e blocos de notícias
        const selectors = [
            'article',
            '.article',
            '.news-item',
            '.story',
            '.post',
            '.entry',
            '.card',
            '[class*="article"]',
            '[class*="news"]',
            '[class*="story"]',
            '[class*="post"]',
            'div[data-testid*="story"]',
            'div[data-testid*="article"]',
            '.feed-item',
            '.timeline-item',
            '.content-item',
            'li[data-testid]',
            'div[role="article"]'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => this.checkAndRemoveElement(element));
        });

        // Também verifica links e títulos
        const links = document.querySelectorAll('a[href*="/"]');
        links.forEach(link => this.checkAndRemoveElement(link));
    }

    checkAndRemoveElement(element) {
        if (!element || element.dataset.cleanedByCleanBadNews) return;

        const textContent = element.textContent?.toLowerCase() || '';
        const innerHTML = element.innerHTML?.toLowerCase() || '';
        const href = element.href?.toLowerCase() || '';
        
        // Verifica se contém alguma palavra-chave
        const containsKeyword = this.keywords.some(keyword => 
            textContent.includes(keyword) || 
            innerHTML.includes(keyword) || 
            href.includes(keyword)
        );

        if (containsKeyword) {
            this.removeElement(element);
        } else {
            // Marca como verificado para evitar re-verificação
            element.dataset.cleanedByCleanBadNews = 'checked';
        }
    }

    removeElement(element) {
        try {
            // Tenta encontrar o container pai mais apropriado
            const containerElement = this.findBestContainer(element);
            
            if (containerElement && containerElement.parentNode) {
                // Adiciona uma animação suave antes de remover
                containerElement.style.transition = 'opacity 0.3s ease-out, height 0.3s ease-out';
                containerElement.style.opacity = '0';
                containerElement.style.height = '0';
                containerElement.style.overflow = 'hidden';
                containerElement.style.marginTop = '0';
                containerElement.style.marginBottom = '0';
                containerElement.style.paddingTop = '0';
                containerElement.style.paddingBottom = '0';
                
                setTimeout(() => {
                    if (containerElement.parentNode) {
                        containerElement.parentNode.removeChild(containerElement);
                        this.blockedCount++;
                        console.log(`Clean Bad News: Removido elemento contendo palavra-chave. Total: ${this.blockedCount}`);
                    }
                }, 300);
            }
        } catch (error) {
            console.log('Erro ao remover elemento:', error);
        }
    }

    findBestContainer(element) {
        let current = element;
        let bestContainer = element;
        
        // Procura por containers comuns até 5 níveis acima
        for (let i = 0; i < 5 && current.parentElement; i++) {
            current = current.parentElement;
            
            const classList = current.className?.toLowerCase() || '';
            const tagName = current.tagName?.toLowerCase() || '';
            
            // Verifica se é um container apropriado
            if (
                tagName === 'article' ||
                tagName === 'li' ||
                classList.includes('item') ||
                classList.includes('card') ||
                classList.includes('post') ||
                classList.includes('story') ||
                classList.includes('article') ||
                classList.includes('news') ||
                classList.includes('entry') ||
                current.hasAttribute('data-testid')
            ) {
                bestContainer = current;
            }
        }
        
        return bestContainer;
    }

    // Método para toggle da extensão
    toggle() {
        this.isEnabled = !this.isEnabled;
        chrome.storage.sync.set({ enabled: this.isEnabled });
        
        if (this.isEnabled) {
            this.cleanPage();
        }
    }

    // Método para atualizar keywords
    updateKeywords(newKeywords) {
        this.keywords = newKeywords.map(k => k.toLowerCase());
        chrome.storage.sync.set({ keywords: this.keywords });
        if (this.isEnabled) {
            this.cleanPage();
        }
    }

    getStats() {
        return {
            blockedCount: this.blockedCount,
            isEnabled: this.isEnabled,
            keywords: this.keywords
        };
    }
}

// Inicializa a extensão
let cleanBadNewsInstance;

// Aguarda o DOM estar pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}

function initializeExtension() {
    cleanBadNewsInstance = new CleanBadNews();
    
    // Escuta mensagens do popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'toggle') {
            cleanBadNewsInstance.toggle();
            sendResponse({ success: true, stats: cleanBadNewsInstance.getStats() });
        } else if (request.action === 'getStats') {
            sendResponse(cleanBadNewsInstance.getStats());
        } else if (request.action === 'updateKeywords') {
            cleanBadNewsInstance.updateKeywords(request.keywords);
            sendResponse({ success: true });
        }
        return true;
    });
}

console.log('Clean Bad News: Extensão carregada e ativa!'); 