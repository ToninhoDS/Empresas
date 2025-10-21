import React, { useState, useEffect } from 'react';
import { CookieModal } from './cookie-modal';

/**
 * Exemplo de uso do componente CookieModal
 * 
 * Este componente demonstra como utilizar o CookieModal isolado
 * em uma aplicação React ou em páginas presell.
 */
export default function CookieModalExample() {
  const [showCookies, setShowCookies] = useState(false);
  
  useEffect(() => {
    // Verificar se o usuário já aceitou os cookies anteriormente
    const hasAcceptedCookies = localStorage.getItem('cookie-consent');
    
    // Se não aceitou, mostrar o modal
    if (!hasAcceptedCookies) {
      setShowCookies(true);
    }
  }, []);
  
  // Função para lidar com a aceitação dos cookies
  const handleAccept = () => {
    // Salvar o consentimento no localStorage
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    // Fechar o modal
    setShowCookies(false);
    
    // Aqui você pode adicionar código para ativar scripts de analytics, etc.
    console.log('Cookies aceitos pelo usuário');
  };
  
  // Função para lidar com o fechamento do modal sem aceitar
  const handleClose = () => {
    // Apenas fechar o modal sem salvar consentimento
    setShowCookies(false);
    
    console.log('Modal de cookies fechado sem aceitar');
  };
  
  // Botão para resetar o consentimento (apenas para teste)
  const resetConsent = () => {
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-consent-date');
    setShowCookies(true);
  };
  
  return (
    <div className="cookie-example-container">
      {/* Modal de cookies */}
      {showCookies && (
        <CookieModal
          title="Política de Cookies"
          text="Usamos cookies para deixar sua experiência ainda melhor, personalizando conteúdos, anúncios e recursos sociais. Ao continuar navegando ou clicar em Aceitar, você concorda com isso."
          acceptButtonText="Aceitar"
          closeButtonText="Fechar"
          policyLink="https://exemplo.com/politica-de-privacidade"
          onAccept={handleAccept}
          onClose={handleClose}
          backgroundColor="#ffffff"
          borderColor="#e5e7eb"
          shadowIntensity={2}
          acceptButtonPosition="bottom-right"
          closeButtonPosition="bottom-right"
          acceptButtonShadow={true}
          closeButtonShadow={false}
        />
      )}
      
      {/* Conteúdo da página */}
      <div style={{ padding: '20px' }}>
        <h1>Exemplo de Uso do Modal de Cookies</h1>
        <p>Este é um exemplo de como o modal de cookies isolado funciona em uma página.</p>
        
        <button 
          onClick={resetConsent}
          style={{
            marginTop: '20px',
            padding: '10px 15px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Resetar consentimento de cookies (para teste)
        </button>
      </div>
    </div>
  );
}