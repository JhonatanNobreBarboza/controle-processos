// Serviço de Listas - Configuração principal
const express = require('express');
const { Pool } = require('pg');

// Configuração do servidor
const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(express.json());

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/controle_processos',
});

// Rotas
// Listar todos os status
app.get('/status', async (req, res) => {
  try {
    const query = 'SELECT * FROM status ORDER BY order_num';
    const result = await pool.query(query);
    
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: 'Erro ao buscar status',
      status: 500
    });
  }
});

// Listar todos os responsáveis
app.get('/responsibles', async (req, res) => {
  try {
    const query = 'SELECT * FROM responsibles ORDER BY name';
    const result = await pool.query(query);
    
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: 'Erro ao buscar responsáveis',
      status: 500
    });
  }
});

// Listar todas as secretarias
app.get('/secretaries', async (req, res) => {
  try {
    const query = 'SELECT * FROM secretaries ORDER BY name';
    const result = await pool.query(query);
    
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: 'Erro ao buscar secretarias',
      status: 500
    });
  }
});

// Rota de verificação de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Serviço de Listas funcionando corretamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Serviço de Listas rodando na porta ${PORT}`);
});

module.exports = app;
