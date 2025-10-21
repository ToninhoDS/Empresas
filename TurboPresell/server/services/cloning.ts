import * as cheerio from 'cheerio';

export async function clonePage(url: string): Promise<{ success: boolean; html?: string; error?: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const processedHtml = processClonedHtml(html, url);
    
    return { success: true, html: processedHtml };
  } catch (error) {
    console.error('Erro ao clonar página:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

function processClonedHtml(html: string, baseUrl: string): string {
  const $ = cheerio.load(html);
  
  // Convert relative URLs to absolute
  const base = new URL(baseUrl);
  
  $('img').each((_, img) => {
    const src = $(img).attr('src');
    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
      $(img).attr('src', new URL(src, base).href);
    }
  });
  
  $('link[rel="stylesheet"]').each((_, link) => {
    const href = $(link).attr('href');
    if (href && !href.startsWith('http')) {
      $(link).attr('href', new URL(href, base).href);
    }
  });
  
  $('script').each((_, script) => {
    const src = $(script).attr('src');
    if (src && !src.startsWith('http')) {
      $(script).attr('src', new URL(src, base).href);
    }
  });

  // Remove potentially problematic scripts
  $('script[src*="google-analytics"]').remove();
  $('script[src*="gtag"]').remove();
  $('script[src*="facebook"]').remove();

  
  return $.html();
}

export function injectCookieModal(html: string, modalConfig: {
  title: string;
  text: string;
  acceptButtonText: string;
  closeButtonText: string;
  policyLink?: string;
  affiliateUrl: string;
  campaignId: number;
  acceptButtonPosition?: string;
  acceptButtonShadow?: boolean;
  closeButtonPosition?: string;
  closeButtonShadow?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  shadowIntensity?: number;
}): string {
  // Definir valores padrão para os parâmetros de estilo
  const backgroundColor = modalConfig.backgroundColor || '#ffffff';
  const borderColor = modalConfig.borderColor || '#e5e7eb';
  const shadowIntensity = modalConfig.shadowIntensity || 2;
  const acceptButtonPosition = modalConfig.acceptButtonPosition || 'bottom-right';
  const closeButtonPosition = modalConfig.closeButtonPosition || 'bottom-right';
  const acceptButtonShadow = modalConfig.acceptButtonShadow || false;
  const closeButtonShadow = modalConfig.closeButtonShadow || false;
  
  // Calcular a sombra com base na intensidade
  const boxShadowValue = `0 ${4 * shadowIntensity}px ${6 * shadowIntensity}px ${2 * shadowIntensity}px rgba(0, 0, 0, 0.08)`;
  const acceptButtonShadowValue = acceptButtonShadow ? '0 2px 8px 2px rgba(0, 0, 0, 0.12)' : 'none';
  const closeButtonShadowValue = closeButtonShadow ? '0 2px 8px 2px rgba(0, 0, 0, 0.06)' : 'none';
  
  // Determinar a cor do texto com base na cor de fundo
  const isDarkBackground = ['#ef4444', '#22c55e'].includes(backgroundColor);
  const textColor = isDarkBackground ? '#ffffff' : '#1f2937';
  const paragraphColor = isDarkBackground ? '#ffffff' : '#6b7280';
  const linkColor = isDarkBackground ? '#ffffff' : '#3b82f6';
  
  // Construir o HTML do modal com estilos isolados
  const modalHtml = `
    <!-- Início do Modal de Cookies Isolado -->
    <div id="presell-cookie-modal-portal-root"></div>
    <style id="presell-cookie-modal-styles">
      /* Estilos isolados para o modal de cookies */
      #presell-cookie-modal-portal-root {
        position: relative;
        z-index: 9999;
      }
      
      #presell-cookie-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      }
      
      #presell-cookie-modal-container {
        position: relative;
        background-color: ${backgroundColor};
        padding: 2rem;
        border-radius: 12px;
        box-shadow: ${boxShadowValue};
        z-index: 10000;
        width: 90%;
        max-width: 500px;
        border: 1px solid ${borderColor};
      }
      
      #presell-cookie-modal-title {
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: ${textColor};
        line-height: 1.2;
        ${isDarkBackground ? 'text-shadow: 0 1px 2px rgba(0,0,0,0.3);' : ''}
      }
      
      #presell-cookie-modal-text {
        margin: 0 0 1.5rem 0;
        color: ${paragraphColor};
        line-height: 1.5;
        font-size: 0.95rem;
        ${isDarkBackground ? 'text-shadow: 0 1px 2px rgba(0,0,0,0.3);' : ''}
      }
      
      #presell-cookie-modal-link {
        color: ${linkColor};
        text-decoration: underline;
        cursor: pointer;
      }
      
      #presell-cookie-modal-buttons {
        display: flex;
        justify-content: ${acceptButtonPosition === 'bottom-left' ? 'flex-start' : 'flex-end'};
        gap: 0.75rem;
      }
      
      #presell-cookie-modal-accept {
        background-color: #3b82f6;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.95rem;
        box-shadow: ${acceptButtonShadowValue};
      }
      
      #presell-cookie-modal-close {
        background-color: #f3f4f6;
        color: #374151;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.95rem;
        box-shadow: ${closeButtonShadowValue};
      }
    </style>
    
    <script id="presell-cookie-modal-script">
      (function() {
        // Criar o modal de cookies
        function createCookieModal() {
          const backdrop = document.createElement('div');
          backdrop.id = 'presell-cookie-modal-backdrop';
          
          const container = document.createElement('div');
          container.id = 'presell-cookie-modal-container';
          
          const title = document.createElement('h3');
          title.id = 'presell-cookie-modal-title';
          title.textContent = '${modalConfig.title.replace(/'/g, "\\'")}';
          
          const text = document.createElement('p');
          text.id = 'presell-cookie-modal-text';
          text.textContent = '${modalConfig.text.replace(/'/g, "\\'")}';
          
          ${modalConfig.policyLink && modalConfig.policyLink !== 'none' ? `
          const link = document.createElement('a');
          link.id = 'presell-cookie-modal-link';
          link.textContent = 'Saiba mais';
          link.href = 'javascript:void(0)';
          link.addEventListener('click', handleCookieAction);
          text.appendChild(document.createTextNode(' '));
          text.appendChild(link);
          ` : ''}
          
          const buttonsContainer = document.createElement('div');
          buttonsContainer.id = 'presell-cookie-modal-buttons';
          
          ${closeButtonPosition === 'bottom-left' ? `
          const closeButton = document.createElement('button');
          closeButton.id = 'presell-cookie-modal-close';
          closeButton.textContent = '${modalConfig.closeButtonText.replace(/'/g, "\\'")}';
          closeButton.addEventListener('click', handleCookieAction);
          buttonsContainer.appendChild(closeButton);
          ` : ''}
          
          const acceptButton = document.createElement('button');
          acceptButton.id = 'presell-cookie-modal-accept';
          acceptButton.textContent = '${modalConfig.acceptButtonText.replace(/'/g, "\\'")}';
          acceptButton.addEventListener('click', handleCookieAction);
          buttonsContainer.appendChild(acceptButton);
          
          ${closeButtonPosition === 'bottom-right' ? `
          const closeButton = document.createElement('button');
          closeButton.id = 'presell-cookie-modal-close';
          closeButton.textContent = '${modalConfig.closeButtonText.replace(/'/g, "\\'")}';
          closeButton.addEventListener('click', handleCookieAction);
          buttonsContainer.appendChild(closeButton);
          ` : ''}
          
          ${closeButtonPosition === 'top-right' ? `
          const closeButton = document.createElement('button');
          closeButton.id = 'presell-cookie-modal-close';
          closeButton.textContent = '${modalConfig.closeButtonText.replace(/'/g, "\\'")}';
          closeButton.style.position = 'absolute';
          closeButton.style.top = '0.5rem';
          closeButton.style.right = '0.5rem';
          closeButton.style.padding = '0.25rem 0.5rem';
          closeButton.style.fontSize = '0.875rem';
          closeButton.addEventListener('click', handleCookieAction);
          container.appendChild(closeButton);
          ` : ''}
          
          container.appendChild(title);
          container.appendChild(text);
          container.appendChild(buttonsContainer);
          backdrop.appendChild(container);
          
          // Adicionar o modal ao portal root
          const portalRoot = document.getElementById('presell-cookie-modal-portal-root');
          portalRoot.appendChild(backdrop);
          
          // Adicionar evento de clique no backdrop
          backdrop.addEventListener('click', function(e) {
            if (e.target === backdrop) {
              handleCookieAction();
            }
          });
        }
        
        // Função para lidar com ações do cookie
        function handleCookieAction() {
          // Remover o modal
          const backdrop = document.getElementById('presell-cookie-modal-backdrop');
          if (backdrop) {
            backdrop.style.display = 'none';
          }
          
          // Registrar o clique na API
          fetch('/api/campaigns/${modalConfig.campaignId}/click', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }).finally(function() {
            // Redirecionar para o link de afiliado
            window.location.href = '${modalConfig.affiliateUrl.replace(/'/g, "\\'")}';
          });
        }
        
        // Criar o modal quando o DOM estiver pronto
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', createCookieModal);
        } else {
          createCookieModal();
        }
      })();
    </script>
    <!-- Fim do Modal de Cookies Isolado -->
  `;

  return html.replace('</body>', modalHtml + '</body>');
}
