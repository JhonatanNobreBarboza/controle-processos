// Serviço de Relatórios - Configuração principal
const express = require('express');
const { Pool } = require('pg');

// Configuração do servidor
const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(express.json());

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/controle_processos',
});

// Rotas
// Relatório de processos por status
app.get('/status', async (req, res) => {
  try {
    const query = `
      SELECT s.name as status, COUNT(p.id) as total
      FROM status s
      LEFT JOIN processes p ON s.id = p.status_id
      GROUP BY s.name, s.order_num
      ORDER BY s.order_num
    `;
    
    const result = await pool.query(query);
    
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: 'Erro ao gerar relatório de status',
      status: 500
    });
  }
});

// Resumo geral de processos
app.get('/summary', async (req, res) => {
  try {
    // Total de processos
    const totalQuery = 'SELECT COUNT(*) as total FROM processes';
    const totalResult = await pool.query(totalQuery);
    
    // Processos por responsável
    const responsibleQuery = `
      SELECT r.name as responsible, COUNT(p.id) as total
      FROM responsibles r
      LEFT JOIN processes p ON r.id = p.responsible_id
      GROUP BY r.name
      ORDER BY total DESC
    `;
    const responsibleResult = await pool.query(responsibleQuery);
    
    // Processos por modalidade
    const modalityQuery = `
      SELECT modality, COUNT(*) as total
      FROM processes
      WHERE modality IS NOT NULL
      GROUP BY modality
      ORDER BY total DESC
    `;
    const modalityResult = await pool.query(modalityQuery);
    
    // Processos por mês
    const monthQuery = `
      SELECT TO_CHAR(opening_date, 'YYYY-MM') as month, COUNT(*) as total
      FROM processes
      GROUP BY month
      ORDER BY month
    `;
    const monthResult = await pool.query(monthQuery);
    
    // Processos por secretaria participante
    const secretaryQuery = `
      SELECT s.name as secretary, COUNT(DISTINCT ps.process_id) as total
      FROM secretaries s
      LEFT JOIN participating_secretaries ps ON s.id = ps.secretary_id
      GROUP BY s.name
      ORDER BY total DESC
    `;
    const secretaryResult = await pool.query(secretaryQuery);
    
    res.status(200).json({
      total: totalResult.rows[0].total,
      byResponsible: responsibleResult.rows,
      byModality: modalityResult.rows,
      byMonth: monthResult.rows,
      bySecretary: secretaryResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: 'Erro ao gerar resumo de processos',
      status: 500
    });
  }
});

// Rota de verificação de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Serviço de Relatórios funcionando corretamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Serviço de Relatórios rodando na porta ${PORT}`);
});

module.exports = app;
