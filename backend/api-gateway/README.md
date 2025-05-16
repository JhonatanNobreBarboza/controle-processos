# API Gateway - Documentação

## Visão Geral
O API Gateway serve como ponto de entrada único para todas as requisições do frontend, roteando-as para os microsserviços apropriados.

## Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de novos usuários
- `POST /api/auth/login` - Login de usuários
- `POST /api/auth/forgot-password` - Solicitação de recuperação de senha
- `POST /api/auth/reset-password` - Redefinição de senha

### Processos
- `GET /api/processes` - Listar todos os processos
- `GET /api/processes/:id` - Obter detalhes de um processo específico
- `POST /api/processes` - Criar novo processo
- `PUT /api/processes/:id` - Atualizar processo existente
- `PATCH /api/processes/:id/status` - Atualizar status de um processo

### Relatórios
- `GET /api/reports/status` - Relatório de processos por status
- `GET /api/reports/summary` - Resumo geral de processos

### Listas
- `GET /api/lists/status` - Listar todos os status disponíveis
- `GET /api/lists/responsibles` - Listar todos os responsáveis
- `GET /api/lists/secretaries` - Listar todas as secretarias

## Autenticação
Todas as rotas, exceto login, registro e recuperação de senha, exigem autenticação via token JWT no cabeçalho:

```
Authorization: Bearer {token}
```

## Tratamento de Erros
Respostas de erro seguem o formato:

```json
{
  "error": true,
  "message": "Descrição do erro",
  "status": 400
}
```

## Comunicação entre Serviços
O API Gateway se comunica com os microsserviços internos via HTTP, utilizando as seguintes portas:
- Auth Service: 3001
- Process Service: 3002
- Report Service: 3003
- List Service: 3004
