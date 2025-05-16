// API Gateway - Configuração principal
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

// Configuração do servidor
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança e logs
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Middleware de autenticação
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret', (err, user) => {
      if (err) {
        return res.status(403).json({
          error: true,
          message: 'Token inválido ou expirado',
          status: 403
        });
      }
      
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({
      error: true,
      message: 'Autenticação necessária',
      status: 401
    });
  }
};

// Rotas públicas (sem autenticação)
app.use('/api/auth', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/'
  }
}));

// Rotas protegidas (com autenticação)
app.use('/api/processes', authenticateJWT, createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/processes': '/'
  }
}));

app.use('/api/reports', authenticateJWT, createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/reports': '/'
  }
}));

app.use('/api/lists', authenticateJWT, createProxyMiddleware({
  target: 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: {
    '^/api/lists': '/'
  }
}));

// Rota de verificação de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API Gateway funcionando corretamente' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: 'Erro interno do servidor',
    status: 500
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`API Gateway rodando na porta ${PORT}`);
});

module.exports = app;
