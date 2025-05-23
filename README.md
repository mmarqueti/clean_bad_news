# 🧹 Clean Bad News

Uma extensão para Google Chrome que remove automaticamente blocos de notícias contendo palavras-chave específicas como "Guerra", ajudando você a manter um feed de notícias mais limpo e positivo.

## ✨ Funcionalidades

- **🎯 Filtragem Inteligente**: Remove automaticamente notícias contendo palavras-chave específicas
- **⚡ Tempo Real**: Funciona instantaneamente em todos os sites, incluindo carregamento dinâmico
- **🔧 Personalizável**: Adicione ou remova palavras-chave conforme sua preferência
- **📊 Estatísticas**: Acompanhe quantas notícias foram filtradas
- **🌐 Universal**: Funciona em qualquer site de notícias
- **🎨 Interface Moderna**: Popup bonito e intuitivo

## 🚀 Como Instalar

### Opção 1: Instalação Manual (Recomendada)

1. **Clone ou baixe este repositório**
   ```bash
   git clone https://github.com/seu-usuario/clean-bad-news.git
   cd clean-bad-news
   ```

2. **Abra o Google Chrome**

3. **Acesse as extensões**
   - Digite `chrome://extensions/` na barra de endereços
   - Ou vá em Menu (⋮) → Mais ferramentas → Extensões

4. **Ative o modo desenvolvedor**
   - Clique no botão "Modo do desenvolvedor" no canto superior direito

5. **Carregue a extensão**
   - Clique em "Carregar sem compactação"
   - Selecione a pasta `clean_bad_news` que você baixou

6. **Pronto! 🎉**
   - A extensão estará ativa e você verá o ícone 🧹 na barra de ferramentas

## 📱 Como Usar

### Interface Principal
1. **Clique no ícone 🧹** na barra de ferramentas do Chrome
2. **Use o botão de toggle** para ativar/desativar a extensão
3. **Veja as estatísticas** de quantas notícias foram filtradas
4. **Gerencie palavras-chave** na seção inferior

### Adicionar Palavras-chave
1. Digite a nova palavra-chave no campo de texto
2. Pressione Enter ou clique no botão "+"
3. A palavra será adicionada à lista e começará a filtrar imediatamente

### Remover Palavras-chave
1. Clique no "×" ao lado da palavra-chave que deseja remover
2. A palavra será removida da lista instantaneamente

### Ações Rápidas
- **Botão direito**: Use o menu de contexto para ações rápidas
- **Seleção de texto**: Selecione texto e clique com botão direito para adicionar como palavra-chave

## 🛠️ Estrutura do Projeto

```
clean_bad_news/
├── manifest.json          # Configuração da extensão
├── content.js             # Script que filtra as notícias
├── popup.html             # Interface do popup
├── popup.css              # Estilos do popup
├── popup.js               # JavaScript do popup
├── background.js          # Service worker
├── welcome.html           # Página de boas-vindas
├── icons/                 # Ícones da extensão
│   ├── icon16.svg
│   ├── icon32.svg
│   ├── icon48.svg
│   └── icon128.svg
├── create_icons.py        # Script para gerar ícones
└── README.md              # Este arquivo
```

## ⚙️ Configurações Padrão

A extensão vem pré-configurada com as seguintes palavras-chave:
- guerra

Você pode adicionar ou remover palavras-chave conforme sua preferência.

## 🔧 Funcionalidades Técnicas

### Detecção Inteligente
A extensão utiliza múltiplos seletores CSS para detectar blocos de notícias:
- `article`, `.article`
- `.news-item`, `.story`, `.post`
- `[data-testid*="story"]`
- E muitos outros padrões comuns

### Performance Otimizada
- **Mutation Observer**: Detecta novos elementos adicionados dinamicamente
- **Throttling**: Evita execução excessiva em sites com muitas atualizações
- **Caching**: Marca elementos já verificados para evitar reprocessamento

### Animações Suaves
- Elementos são removidos com animação de fade-out
- Interface responsiva com transições suaves

## 🌐 Compatibilidade

A extensão funciona em:
- ✅ Sites de notícias brasileiros (G1, UOL, Folha, etc.)
- ✅ Sites de notícias internacionais (CNN, BBC, etc.)
- ✅ Redes sociais com feeds de notícias
- ✅ Agregadores de notícias
- ✅ Qualquer site com conteúdo dinâmico

## 🔒 Privacidade

- **Sem coleta de dados**: A extensão não coleta informações pessoais
- **Processamento local**: Toda filtragem é feita no seu navegador
- **Sem conexões externas**: Não faz chamadas para servidores externos
- **Configurações sincronizadas**: Usa apenas o Chrome Sync para salvar suas preferências

## 🐛 Solução de Problemas

### A extensão não está funcionando
1. Verifique se está ativada no popup
2. Recarregue a página onde não está funcionando
3. Verifique se as palavras-chave estão configuradas corretamente

### Algumas notícias não são filtradas
- A extensão usa padrões comuns, mas alguns sites podem ter estruturas diferentes
- Você pode reportar sites específicos para melhorarmos a compatibilidade

### Performance lenta
- A extensão é otimizada, mas sites com muitos elementos podem ser afetados
- Use o toggle para desativar temporariamente se necessário

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir funcionalidades
- Melhorar a detecção de elementos
- Adicionar suporte a novos sites

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🎯 Roadmap

- [ ] Modo whitelist (mostrar apenas certas palavras-chave)
- [ ] Suporte a expressões regulares
- [ ] Estatísticas avançadas
- [ ] Categorização de palavras-chave

---

**Feito com ❤️ para um consumo de notícias mais saudável** 