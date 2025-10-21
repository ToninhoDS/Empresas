-- Limpar dados existentes (exceto o usuário auth.users que foi criado via interface)
DELETE FROM perfis_usuario;
DELETE FROM empresas;

-- Criar empresa inicial
INSERT INTO empresas (
    nome,
    email,
    cnpj,
    status,
    telefone
) VALUES (
    'Santa Casa',
    'admin@santacasa.com',
    '12345678901234',
    'ativa',
    '(11) 1234-5678'
);

-- Criar perfil do usuário admin-master
INSERT INTO perfis_usuario (
    id,
    empresa_id,
    nome,
    cargo,
    ativo,
    cartao_ponto
)
SELECT 
    u.id,
    e.id,
    'Admin Master',
    'admin-master',
    true,
    '123456'
FROM auth.users u
CROSS JOIN empresas e
WHERE u.email = 'admin@santacasa.com'
AND e.email = 'admin@santacasa.com'; 