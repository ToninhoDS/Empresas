import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

export interface ScreenshotResult {
  success: boolean;
  paths?: { [width: string]: string };
  error?: string;
}

export async function captureScreenshots(url: string, campaignId: number): Promise<ScreenshotResult> {
  let browser;
  const widths = [2124, 2024, 1924, 1824, 1724, 1624, 1524, 1424, 1324, 1224, 1124, 1024, 924, 824, 724, 624, 524, 424, 324, 270];
  const height = 1080;

  try {
    console.log('Starting screenshot capture for campaign:', campaignId, 'URL:', url);
    
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--headless=new',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });

    const page = await browser.newPage();
    const screenshotsDir = path.join(process.cwd(), 'screenshots', `campaign-${campaignId}`);
    await fs.mkdir(screenshotsDir, { recursive: true });

    const paths: { [width: string]: string } = {};

    for (const width of widths) {
      console.log(`Capturing screenshot for width: ${width}px`);
      await page.setViewport({ width, height });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      const filename = `screenshot_${width}.jpeg`;
      const filePath = path.join(screenshotsDir, filename);
      await page.screenshot({
        path: filePath as `${string}.jpeg`,
        fullPage: true,
        type: 'jpeg',
        quality: 90
      });
      paths[width] = `/screenshots/campaign-${campaignId}/${filename}`;
      console.log(`Screenshot saved: ${filePath}`);
    }

    await browser.close();

    console.log('Screenshot capture completed successfully for campaign:', campaignId);
    console.log('Captured paths:', paths);

    return {
      success: true,
      paths
    };
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Screenshot capture failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export function generateScreenshotHtml(screenshotPaths: { [width: string]: string }, modalConfig: {
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
  // Ordena as larguras em ordem decrescente para facilitar o fallback
  const widths = Object.keys(screenshotPaths).map(Number).sort((a, b) => b - a);
  // Gera um array JS para uso no script do HTML
  const jsArray = JSON.stringify(widths);
  // Gera um objeto JS para mapear largura -> url
  const jsMap = JSON.stringify(screenshotPaths);
  
  // Definir valores padrão para os parâmetros de estilo
  const backgroundColor = modalConfig.backgroundColor || '#ffffff';
  const borderColor = modalConfig.borderColor || '#e5e7eb';
  const shadowIntensity = modalConfig.shadowIntensity || 2;
  const acceptButtonPosition = modalConfig.acceptButtonPosition || 'bottom-right';
  const closeButtonPosition = modalConfig.closeButtonPosition || 'bottom-right';
  const acceptButtonShadow = modalConfig.acceptButtonShadow || false;
  const closeButtonShadow = modalConfig.closeButtonShadow || false;
  
  // Determinar a justificação dos botões com base na posição
  const buttonsJustify = acceptButtonPosition === 'bottom-left' ? 'flex-start' : 'flex-end';
  
  // Determinar a cor do texto com base na cor de fundo
  const isDarkBackground = ['#ef4444', '#22c55e'].includes(backgroundColor);
  const textColor = isDarkBackground ? '#ffffff' : '#1f2937';
  const paragraphColor = isDarkBackground ? '#ffffff' : '#6b7280';
  const linkColor = isDarkBackground ? '#ffffff' : '#3b82f6';
  
  // Calcular a sombra com base na intensidade
  const boxShadowValue = `0 ${4 * shadowIntensity}px ${6 * shadowIntensity}px ${2 * shadowIntensity}px rgba(0, 0, 0, 0.08)`;
  const acceptButtonShadowValue = acceptButtonShadow ? '0 2px 8px 2px rgba(0, 0, 0, 0.12)' : 'none';
  const closeButtonShadowValue = closeButtonShadow ? '0 2px 8px 2px rgba(0, 0, 0, 0.06)' : 'none';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Presell Page</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; overflow-x: hidden; }
        .screenshot-image { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; object-fit: cover; object-position: top center; z-index: 1; }
        #presell-cookie-modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 10000; }
        .modal-content { background: ${backgroundColor}; padding: 2rem; border-radius: 8px; max-width: 500px; width: 90%; border: 1px solid ${borderColor}; box-shadow: ${boxShadowValue}; position: relative; }
        .modal-title { margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 600; color: ${textColor}; ${isDarkBackground ? 'text-shadow: 0 1px 2px rgba(0,0,0,0.3);' : ''} }
        .modal-text { margin: 0 0 1.5rem 0; color: ${paragraphColor}; line-height: 1.5; ${isDarkBackground ? 'text-shadow: 0 1px 2px rgba(0,0,0,0.3);' : ''} }
        .modal-text a { color: ${linkColor}; text-decoration: underline; ${isDarkBackground ? 'text-shadow: 0 1px 2px rgba(0,0,0,0.3);' : ''} }
        .modal-buttons { display: flex; gap: 0.75rem; justify-content: ${buttonsJustify}; }
        .btn { border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
        .btn-secondary { background: #f3f4f6; color: #374151; box-shadow: ${closeButtonShadowValue}; }
        .btn-secondary:hover { background: #e5e7eb; }
        .btn-primary { background: #3b82f6; color: white; box-shadow: ${acceptButtonShadowValue}; }
        .btn-primary:hover { background: #2563eb; }
        .btn-top-right { position: absolute; top: 0.5rem; right: 0.5rem; padding: 0.25rem 0.5rem; font-size: 0.875rem; }
      </style>
    </head>
    <body>
      <img id="screenshot-img" src="" alt="Screenshot" class="screenshot-image">
      <div id="presell-cookie-modal">
            <div class="modal-content">
              <h3 class="modal-title">${modalConfig.title}</h3>
              <p class="modal-text">
                ${modalConfig.text}
                ${modalConfig.policyLink ? `<a href="javascript:void(0)" onclick="handleCookieAction()">Learn more</a>` : ''}
              </p>
              ${closeButtonPosition === 'top-right' ? 
                `<button class="btn btn-secondary btn-top-right" id="cookie-close">${modalConfig.closeButtonText}</button>` : 
                ''
              }
              <div class="modal-buttons">
                ${closeButtonPosition === 'bottom-left' ? 
                  `<button class="btn btn-secondary" id="cookie-close">${modalConfig.closeButtonText}</button>` : 
                  ''
                }
                <button class="btn btn-primary" id="cookie-accept">${modalConfig.acceptButtonText}</button>
                ${closeButtonPosition === 'bottom-right' ? 
                  `<button class="btn btn-secondary" id="cookie-close">${modalConfig.closeButtonText}</button>` : 
                  ''
                }
              </div>
            </div>
          </div>
      <script>
        const widths = ${jsArray};
        const pathMap = ${jsMap};
        function getClosestWidth(w) {
          let closest = widths[0];
          let minDiff = Math.abs(w - closest);
          for (let i = 1; i < widths.length; i++) {
            const diff = Math.abs(w - widths[i]);
            if (diff < minDiff) {
              minDiff = diff;
              closest = widths[i];
            }
          }
          return closest;
        }
        function setScreenshot() {
          const w = window.innerWidth;
          const closest = getClosestWidth(w);
          document.getElementById('screenshot-img').src = pathMap[closest];
        }
        setScreenshot();
        window.addEventListener('resize', setScreenshot);

        function handleCookieAction() {
          // Remover o modal independentemente da ação
          document.getElementById('presell-cookie-modal').style.display = 'none';
          
          // Registrar o clique na API
          fetch('/api/campaigns/${modalConfig.campaignId}/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }).finally(function() {
            // Redirecionar para o link de afiliado independentemente da ação
            window.location.href = '${modalConfig.affiliateUrl}';
          });
        }
        
        // Botão de aceitar
        document.getElementById('cookie-accept').addEventListener('click', function() { handleCookieAction(); });
        
        // Botões de fechar (pode haver múltiplos com o mesmo ID)
        const closeBtns = document.querySelectorAll('#cookie-close');
        closeBtns.forEach(btn => {
          btn.addEventListener('click', function() { handleCookieAction(); });
        });

        // Fechar ao clicar fora do modal
        document.getElementById('presell-cookie-modal').addEventListener('click', function(e) {
          if (e.target === this) {
            handleCookieAction();
          }
        });
      </script>
    </body>
    </html>
  `;
}
