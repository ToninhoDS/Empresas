# Componente de Modal de Cookies Isolado

Este componente foi desenvolvido para exibir um modal de cookies que seja completamente isolado de estilos externos, garantindo que sua formatação seja preservada mesmo em páginas clonadas ou com CSS conflitante.

## Características

- **Isolamento completo**: Utiliza `React.createPortal()` para renderizar o modal fora da hierarquia do DOM principal
- **Estilos isolados**: Todos os estilos são aplicados inline para evitar conflitos com CSS externo
- **Classes com prefixos únicos**: Todos os IDs usam o prefixo `cookie-modal-*` para evitar colisões
- **Z-index alto**: Garante que o modal apareça acima de qualquer outro elemento da página
- **Totalmente personalizável**: Cores, textos, posições dos botões e outros aspectos podem ser configurados
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

## Como usar

### Importação

```tsx
import { CookieModal } from './components/cookie-modal';
```

### Uso básico

```tsx
import React, { useState, useEffect } from 'react';
import { CookieModal } from './components/cookie-modal';

export default function App() {
  const [showCookies, setShowCookies] = useState(true);

  const handleAccept = () => {
    // Salvar consentimento
    localStorage.setItem('cookie-consent', 'accepted');
    setShowCookies(false);
  };

  const handleClose = () => {
    setShowCookies(false);
  };

  return (
    <>
      {showCookies && (
        <CookieModal
          onAccept={handleAccept}
          onClose={handleClose}
        />
      )}
      {/* Conteúdo da página */}
    </>
  );
}
```

### Verificação de consentimento prévio

```tsx
import React, { useState, useEffect } from 'react';
import { CookieModal } from './components/cookie-modal';

export default function App() {
  const [showCookies, setShowCookies] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já aceitou os cookies
    const hasAcceptedCookies = localStorage.getItem('cookie-consent');
    if (!hasAcceptedCookies) {
      setShowCookies(true);
    }
  }, []);

  // Funções de manipulação...

  return (
    <>
      {showCookies && (
        <CookieModal
          onAccept={handleAccept}
          onClose={handleClose}
        />
      )}
    </>
  );
}
```

## Propriedades (Props)

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|------------|
| `title` | string | 'Política de Cookies' | Título do modal |
| `text` | string | 'Usamos cookies...' | Texto principal do modal |
| `acceptButtonText` | string | 'Aceitar' | Texto do botão de aceitar |
| `closeButtonText` | string | 'Fechar' | Texto do botão de fechar |
| `policyLink` | string | undefined | Link para a política de privacidade |
| `onAccept` | function | - | Função chamada quando o usuário aceita os cookies |
| `onClose` | function | - | Função chamada quando o usuário fecha o modal sem aceitar |
| `backgroundColor` | string | '#ffffff' | Cor de fundo do modal |
| `borderColor` | string | '#e5e7eb' | Cor da borda do modal |
| `shadowIntensity` | number | 2 | Intensidade da sombra (0-5) |
| `acceptButtonPosition` | 'bottom-left' \| 'bottom-right' | 'bottom-right' | Posição do botão de aceitar |
| `closeButtonPosition` | 'bottom-left' \| 'bottom-right' \| 'top-right' | 'bottom-right' | Posição do botão de fechar |
| `acceptButtonShadow` | boolean | false | Se o botão de aceitar deve ter sombra |
| `closeButtonShadow` | boolean | false | Se o botão de fechar deve ter sombra |

## Personalização avançada

### Cores adaptativas

O componente detecta automaticamente se o fundo é escuro e ajusta a cor do texto para garantir legibilidade:

```tsx
<CookieModal
  backgroundColor="#22c55e" // Fundo verde escuro
  // O texto será automaticamente branco para melhor contraste
  onAccept={handleAccept}
  onClose={handleClose}
/>
```

### Posicionamento dos botões

Você pode configurar diferentes posições para os botões:

```tsx
<CookieModal
  acceptButtonPosition="bottom-left"
  closeButtonPosition="top-right"
  onAccept={handleAccept}
  onClose={handleClose}
/>
```

## Implementação em páginas clonadas

O componente foi projetado para funcionar perfeitamente em páginas clonadas ou presell. O serviço de clonagem `injectCookieModal` foi atualizado para usar uma abordagem isolada similar ao componente React.

## Considerações técnicas

- O componente cria um elemento portal (`#cookie-modal-portal-root`) no `document.body` se ele não existir
- Estilos são aplicados inline para evitar conflitos com CSS externo
- O modal pode ser fechado clicando fora dele, no botão de fechar ou no botão de aceitar
- O componente é totalmente tipado com TypeScript