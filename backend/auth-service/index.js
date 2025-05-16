// Serviço de Autenticação - Configuração principal
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Configuração do servidor
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/controle_processos',
});

// Rotas
// Registro de usuário
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validação básica
    if (!name || !email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Nome, email e senha são obrigatórios',
        status: 400
      });
    }
    
    // Verificar se o email já existe
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({
        error: true,
        message: 'Email já cadastrado',
        status: 400
      });
    }
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Inserir usuário no banco
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'user']
    );
    
    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: 'Erro ao registrar usuário',
      status: 500
    });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Email e senha são obrigatórios',
        status: 400
      });
    }
    
    // Verificar se o usuário existe
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({
        error: true,
        message: 'Credenciais inválidas',
        status: 401
      });
    }
    
    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({
        error: true,
        message: 'Credenciais inválidas',
        status: 401
      });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET || 'seu_jwt_secret',
      { expiresIn: '1d' }
    );
    
    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: 'Erro ao realizar login',
      status: 500
    });
  }
});

// Recuperação de senha
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validação básica
    if (!email) {
      return res.status(400).json({
        error: true,
        message: 'Email é obrigatório',
        status: 400
      });
    }
    
    // Verificar se o usuário existe
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      // Por segurança, não informamos que o email não existe
      return res.status(200).json({
        message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha'
      });
    }
    
    // Em um ambiente real, enviaríamos um email com um token
    // Para este exemplo, apenas simulamos o processo
    const resetToken = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET || 'seu_jwt_secret',
      { expiresIn: '1h' }
    );
    
    res.status(200).json({
      message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha',
      // Em produção, não enviaríamos o token na resposta
      resetToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: 'Erro ao processar solicitação de recuperação de senha',
      status: 500
    });
  }
});

// Redefinição de senha
app.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Validação básica
    if (!token || !newPassword) {
      return res.status(400).json({
        error: true,
        message: 'Token e nova senha são obrigatórios',
        status: 400
      });
    }
    
    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret');
    } catch (err) {
      return res.status(400).json({
        error: true,
        message: 'Token inválido ou expirado',
        status: 400
      });
    }
    
    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Atualizar senha no banco
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, decoded.id]
    );
    
    res.status(200).json({
      message: 'Senha redefinida com sucesso'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: 'Erro ao redefinir senha',
      status: 500
    });
  }
});

// Rota de verificação de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Serviço de Autenticação funcionando corretamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Serviço de Autenticação rodando na porta ${PORT}`);
});

module.exports = app;
