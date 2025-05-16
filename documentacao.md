# Documentação do Sistema de Controle de Processos

## Visão Geral

O Sistema de Controle de Processos é uma aplicação web desenvolvida para gerenciar processos administrativos, replicando fielmente as funcionalidades da planilha "controle processos 2025.xlsx". O sistema foi construído utilizando uma arquitetura de microsserviços, com backend em Node.js/Express, banco de dados PostgreSQL e frontend em Vue.js.

## Arquitetura

O sistema foi desenvolvido seguindo uma arquitetura de microsserviços, dividida em:

### Backend
- **API Gateway**: Ponto de entrada único para todas as requisições
- **Serviço de Autenticação**: Gerenciamento de usuários e autenticação
- **Serviço de Processos**: CRUD completo de processos
- **Serviço de Relatórios**: Geração de relatórios e estatísticas
- **Serviço de Listas**: Gerenciamento de listas de referência

### Frontend
- **Módulo de Autenticação**: Login, cadastro e recuperação de senha
- **Módulo de Processos**: Listagem, cadastro, edição e visualização de processos
- **Módulo de Relatórios**: Visualização de relatórios por status e resumo geral
- **Módulo de Configurações**: Gerenciamento de usuários (apenas para administradores)

## Funcionalidades

### Autenticação
- Login de usuários
- Cadastro de novos usuários
- Recuperação de senha
- Dois perfis: administrador e usuário comum

### Gerenciamento de Processos
- Listagem de processos com filtros
- Cadastro de novos processos
- Edição de processos existentes
- Visualização detalhada de processos
- Atualização de status

### Relatórios
- Relatório de processos por status
- Resumo geral de processos
- Estatísticas por responsável, modalidade e secretaria

## Tecnologias Utilizadas

### Backend
- Node.js
- Express
- PostgreSQL
- JWT para autenticação

### Frontend
- Vue.js
- Bootstrap para estilos
- Chart.js para gráficos

## Instruções de Uso

### Acesso ao Sistema
1. Acesse o sistema através da URL fornecida
2. Faça login com suas credenciais ou cadastre-se
3. Após o login, você será redirecionado para a tela principal

### Gerenciamento de Processos
1. Na tela principal, você verá a lista de processos
2. Use os filtros para encontrar processos específicos
3. Clique em "Novo Processo" para cadastrar um novo processo
4. Clique em "Ver" para visualizar detalhes de um processo
5. Clique em "Editar" para modificar um processo existente
6. Clique em "Status" para atualizar o status de um processo

### Relatórios
1. Clique em "Relatórios" no menu principal
2. Escolha entre "Por Status" ou "Resumo Geral"
3. Visualize os gráficos e tabelas com as informações

## Implantação

O sistema está preparado para ser implantado na Vercel, conforme solicitado. Para realizar a implantação:

1. Configure as variáveis de ambiente necessárias (DATABASE_URL, JWT_SECRET)
2. Faça o deploy do frontend e backend na Vercel
3. Configure o banco de dados PostgreSQL em um serviço compatível com Vercel

## Manutenção e Suporte

Para manutenção e suporte do sistema:

1. Verifique os logs de cada microsserviço em caso de problemas
2. Atualize as dependências regularmente para garantir segurança
3. Faça backup regular do banco de dados

## Conclusão

O Sistema de Controle de Processos foi desenvolvido para atender fielmente às necessidades especificadas, replicando todas as funcionalidades da planilha original em um ambiente web moderno, responsivo e fácil de usar.
