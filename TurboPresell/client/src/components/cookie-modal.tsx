import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface CookieModalProps {
  title?: string;
  text?: string;
  acceptButtonText?: string;
  closeButtonText?: string;
  policyLink?: string;
  onAccept: () => void;
  onClose: () => void;
  backgroundColor?: string;
  borderColor?: string;
  shadowIntensity?: number;
  acceptButtonPosition?: 'bottom-left' | 'bottom-right';
  closeButtonPosition?: 'bottom-left' | 'bottom-right' | 'top-right';
  acceptButtonShadow?: boolean;
  closeButtonShadow?: boolean;
}

export function CookieModal({
  title = 'Política de Cookies',
  text = 'Usamos cookies para deixar sua experiência ainda melhor, personalizando conteúdos, anúncios e recursos sociais. Ao continuar navegando ou clicar em Aceitar, você concorda com isso.',
  acceptButtonText = 'Aceitar',
  closeButtonText = 'Fechar',
  policyLink,
  onAccept,
  onClose,
  backgroundColor = '#ffffff',
  borderColor = '#e5e7eb',
  shadowIntensity = 2,
  acceptButtonPosition = 'bottom-right',
  closeButtonPosition = 'bottom-right',
  acceptButtonShadow = false,
  closeButtonShadow = false,
}: CookieModalProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Verificar se o elemento portal já existe
    let element = document.getElementById('cookie-modal-portal-root');
    
    // Se não existir, criar e adicionar ao body
    if (!element) {
      element = document.createElement('div');
      element.id = 'cookie-modal-portal-root';
      document.body.appendChild(element);
      
      // Adicionar estilo global para garantir que o portal tenha z-index alto
      const style = document.createElement('style');
      style.innerHTML = `
        #cookie-modal-portal-root {
          position: relative;
          z-index: 9999;
        }
      `;
      document.head.appendChild(style);
    }
    
    setPortalRoot(element);
    
    // Cleanup: remover o elemento portal quando o componente for desmontado
    return () => {
      // Não removemos o elemento do DOM para evitar problemas com múltiplas instâncias
      // Apenas escondemos o conteúdo
      if (element) {
        element.innerHTML = '';
      }
    };
  }, []);

  // Calcular a sombra com base na intensidade
  const boxShadowValue = `0 ${4 * shadowIntensity}px ${6 * shadowIntensity}px ${2 * shadowIntensity}px rgba(0, 0, 0, 0.08)`;
  const acceptButtonShadowValue = acceptButtonShadow ? '0 2px 8px 2px rgba(0, 0, 0, 0.12)' : 'none';
  const closeButtonShadowValue = closeButtonShadow ? '0 2px 8px 2px rgba(0, 0, 0, 0.06)' : 'none';
  
  // Determinar a cor do texto com base na cor de fundo
  const isDarkBackground = ['#ef4444', '#22c55e'].includes(backgroundColor);
  const textColor = isDarkBackground ? '#ffffff' : '#1f2937';
  const paragraphColor = isDarkBackground ? '#ffffff' : '#6b7280';
  const linkColor = isDarkBackground ? '#ffffff' : '#3b82f6';

  // Estilos inline para garantir isolamento
  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    backgroundColor,
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: boxShadowValue,
    zIndex: 10000,
    width: '90%',
    maxWidth: '500px',
    border: `1px solid ${borderColor}`,
  };

  const titleStyle: React.CSSProperties = {
    margin: '0 0 1rem 0',
    fontSize: '1.25rem',
    fontWeight: 600,
    color: textColor,
    lineHeight: 1.2,
    ...(isDarkBackground ? { textShadow: '0 1px 2px rgba(0,0,0,0.3)' } : {}),
  };

  const textStyle: React.CSSProperties = {
    margin: '0 0 1.5rem 0',
    color: paragraphColor,
    lineHeight: 1.5,
    fontSize: '0.95rem',
    ...(isDarkBackground ? { textShadow: '0 1px 2px rgba(0,0,0,0.3)' } : {}),
  };

  const linkStyle: React.CSSProperties = {
    color: linkColor,
    textDecoration: 'underline',
    cursor: 'pointer',
  };

  const buttonsContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: acceptButtonPosition === 'bottom-left' ? 'flex-start' : 'flex-end',
    gap: '0.75rem',
  };

  const acceptButtonStyle: React.CSSProperties = {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.95rem',
    boxShadow: acceptButtonShadowValue,
  };

  const closeButtonStyle: React.CSSProperties = {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.95rem',
    boxShadow: closeButtonShadowValue,
  };

  const topRightCloseButtonStyle: React.CSSProperties = {
    ...closeButtonStyle,
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.875rem',
  };

  // Não renderizar nada se o portalRoot não estiver disponível
  if (!portalRoot) return null;

  // Renderizar o modal usando createPortal
  return ReactDOM.createPortal(
    <div 
      id="cookie-modal-backdrop"
      style={backdropStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div id="cookie-modal-container" style={containerStyle}>
        {closeButtonPosition === 'top-right' && (
          <button 
            id="cookie-modal-close-top"
            style={topRightCloseButtonStyle}
            onClick={onClose}
          >
            {closeButtonText}
          </button>
        )}
        
        <h3 id="cookie-modal-title" style={titleStyle}>
          {title}
        </h3>
        
        <p id="cookie-modal-text" style={textStyle}>
          {text}
          {policyLink && policyLink !== 'none' && (
            <>
              {' '}
              <a 
                id="cookie-modal-link"
                href={policyLink}
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                Saiba mais
              </a>
            </>
          )}
        </p>
        
        <div id="cookie-modal-buttons" style={buttonsContainerStyle}>
          {closeButtonPosition === 'bottom-left' && (
            <button 
              id="cookie-modal-close"
              style={closeButtonStyle}
              onClick={onClose}
            >
              {closeButtonText}
            </button>
          )}
          
          <button 
            id="cookie-modal-accept"
            style={acceptButtonStyle}
            onClick={onAccept}
          >
            {acceptButtonText}
          </button>
          
          {closeButtonPosition === 'bottom-right' && (
            <button 
              id="cookie-modal-close"
              style={closeButtonStyle}
              onClick={onClose}
            >
              {closeButtonText}
            </button>
          )}
        </div>
      </div>
    </div>,
    portalRoot
  );
}
