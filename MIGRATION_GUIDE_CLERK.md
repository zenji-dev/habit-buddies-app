# Guia de Migração para Clerk Auth

Este guia explica como configurar o Clerk e preparar seu projeto Supabase para a nova autenticação.

## 1. Configuração no Clerk Dashboard

1. Crie uma conta em [Clerk.com](https://clerk.com/) e crie uma nova aplicação.
2. No painel da sua aplicação, vá em **API Keys** e copie a "Publishable Key".
3. Adicione essa chave no arquivo `.env` do seu projeto:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

## 2. Integração com Supabase (JWT Templates)

Para que o Supabase entenda os usuários do Clerk, precisamos configurar um JWT Template.

1. No painel do Clerk, vá em **JWT Templates** -> **New Template** -> **Supabase**.
2. Ele pedirá a "Signing Key" do Supabase.
   - Vá no painel do Supabase -> Project Settings -> API -> JWT Settings -> JWT Secret.
   - Copie o segredo e cole no Clerk.
   - Dê um nome ao template, ex: `supabase` (tudo minúsculo).
   - Salve.

## 3. Alterações no Banco de Dados (CRUDO)

O Supabase Auth usa UUIDs para identificar usuários. O Clerk usa IDs de texto (ex: `user_2...`).
Para que o app funcione, precisamos alterar as colunas `user_id` de todas as tabelas de `UUID` para `TEXT` e remover as chaves estrangeiras que apontam para `auth.users`.

**Atenção:** Isso pode quebrar a referência dos dados existentes se não forem migrados manualmente. Como o projeto parece estar em desenvolvimento, recomendamos limpar os dados ou aceitar que os usuários antigos não acessarão seus dados antigos.

### Script SQL Necessário
Se você concordar, eu irei rodar um script que:
1. Remove as constraints de chave estrangeira (`fk_user`) das tabelas.
2. Altera o tipo das colunas `user_id` para `TEXT`.
3. Atualiza as políticas de segurança RLS para ler o ID do usuário do token JWT do Clerk.

## Próximos Passos Confirmados

Por favor, confirme se posso proceder com:
1. A alteração do banco de dados (mudança de UUID para TEXT).
2. A atualização do código Frontend para usar os componentes do Clerk.

E forneça sua `VITE_CLERK_PUBLISHABLE_KEY` para continuarmos.
