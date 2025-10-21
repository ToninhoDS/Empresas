
## Hierarquia do Banco de Dados - Sistema WhatsAppTech

├──empresas
 ├── administradores_empresa (incluindo admin-master que não pode ser excluído)
      ├── colaboradores_empresa
 ├── departamentos
      ├── sub_departamentos
 ├── clientes
 ├── mensagens (com status: enviada, entregue, lida, não_lida, aguardando, finalizada)
 ├── arquivos (associados às mensagens)
 ├── mensagens_prontas (templates)
 ├── chat_interno
 └── especialidades_clientes

### Principais Mudanças:
1. Renomeação de colunas:
   - Em departamentos: "título do sistema" alterado para "logotipo"
   - Nas interfaces: "Nome" para "Departamento" e "Nome" para "Subdepartamento"

2. Administrador Principal:
   - Renomeado para "Admin-Master"
   - Não pode ser excluído ou ter sua função alterada
   - Pode modificar permissões de outros usuários

3. Formato do cartão ponto:
   - Alterado para aceitar de 4 a 6 dígitos (varchar(6))

4. Status de mensagens:
   - Implementação de filtros: Todas, Não Lidas, Aguardando, Finalizadas
