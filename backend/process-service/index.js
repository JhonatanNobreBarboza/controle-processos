// Serviço de Processos - Configuração principal
const express = require('express');
const { Pool } = require('pg');

// Configuração do servidor
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/controle_processos',
});

// Rotas
// Listar todos os processos
app.get('/', async (req, res) => {
  try {
    const { status, responsible } = req.query;
    let query = `
      SELECT p.*, r.name as responsible_name, s.name as status_name
      FROM processes p
      LEFT JOIN responsibles r ON p.responsible_id = r.id
      LEFT JOIN status s ON p.status_id = s.id
    `;
    
    const queryParams = [];
    const conditions = [];
    
    if (status) {
      conditions.push(`p.status_id = $${queryParams.length + 1}`);
      queryParams.push(status);
    }
    
    if (responsible) {
      conditions.push(`p.responsible_id = $${queryParams.length + 1}`);
      queryParams.push(responsible);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ' ORDER BY p.opening_date DESC';
    
    const result = await pool.query(query, queryParams);
    
    // Buscar secretarias participantes para cada processo
    for (const process of result.rows) {
      const secretariesResult = await pool.query(
        `SELECT s.name FROM participating_secretaries ps
         JOIN secretaries s ON ps.secretary_id = s.id
         WHERE ps.process_id = $1`,
        [process.id]
      );
      
      const supervisorsResult = await pool.query(
        `SELECT name FROM contract_supervisors
         WHERE process_id = $1`,
        [process.id]
      );
      
      process.participating_secretaries = secretariesResult.rows.map(row => row.name);
      process.contract_supervisors = supervisorsResult.rows.map(row => row.name);
    }
    
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: 'Erro ao buscar processos',
      status: 500
    });
  }
});

// Obter processo por ID
app.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const processResult = await pool.query(
      `SELECT p.*, r.name as responsible_name, s.name as status_name
       FROM processes p
       LEFT JOIN responsibles r ON p.responsible_id = r.id
       LEFT JOIN status s ON p.status_id = s.id
       WHERE p.id = $1`,
      [id]
    );
    
    if (processResult.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Processo não encontrado',
        status: 404
      });
    }
    
    const process = processResult.rows[0];
    
    // Buscar secretarias participantes
    const secretariesResult = await pool.query(
      `SELECT s.name FROM participating_secretaries ps
       JOIN secretaries s ON ps.secretary_id = s.id
       WHERE ps.process_id = $1`,
      [id]
    );
    
    // Buscar fiscais de contrato
    const supervisorsResult = await pool.query(
      `SELECT name FROM contract_supervisors
       WHERE process_id = $1`,
      [id]
    );
    
    process.participating_secretaries = secretariesResult.rows.map(row => row.name);
    process.contract_supervisors = supervisorsResult.rows.map(row => row.name);
    
    res.status(200).json(process);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: 'Erro ao buscar processo',
      status: 500
    });
  }
});

// Criar novo processo
app.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      sd_number,
      opening_date,
      simplified_object,
      modality,
      responsible,
      participating_secretaries,
      contract_supervisors,
      observations,
      status
    } = req.body;
    
    // Validação básica
    if (!simplified_object || !opening_date) {
      return res.status(400).json({
        error: true,
        message: 'Objeto simplificado e data de abertura são obrigatórios',
        status: 400
      });
    }
    
    // Verificar/inserir responsável
    let responsibleId = null;
    if (responsible) {
      const responsibleResult = await client.query(
        'SELECT id FROM responsibles WHERE name = $1',
        [responsible]
      );
      
      if (responsibleResult.rows.length > 0) {
        responsibleId = responsibleResult.rows[0].id;
      } else {
        const newResponsibleResult = await client.query(
          'INSERT INTO responsibles (name) VALUES ($1) RETURNING id',
          [responsible]
        );
        responsibleId = newResponsibleResult.rows[0].id;
      }
    }
    
    // Verificar status
    let statusId = null;
    if (status) {
      const statusResult = await client.query(
        'SELECT id FROM status WHERE name = $1',
        [status]
      );
      
      if (statusResult.rows.length > 0) {
        statusId = statusResult.rows[0].id;
      }
    }
    
    // Inserir processo
    const processResult = await client.query(
      `INSERT INTO processes 
       (sd_number, opening_date, simplified_object, modality, responsible_id, observations, status_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [sd_number, opening_date, simplified_object, modality, responsibleId, observations, statusId]
    );
    
    const processId = processResult.rows[0].id;
    
    // Inserir secretarias participantes
    if (participating_secretaries && participating_secretaries.length > 0) {
      for (const secretary of participating_secretaries) {
        // Verificar/inserir secretaria
        let secretaryId;
        const secretaryResult = await client.query(
          'SELECT id FROM secretaries WHERE name = $1',
          [secretary]
        );
        
        if (secretaryResult.rows.length > 0) {
          secretaryId = secretaryResult.rows[0].id;
        } else {
          const newSecretaryResult = await client.query(
            'INSERT INTO secretaries (name) VALUES ($1) RETURNING id',
            [secretary]
          );
          secretaryId = newSecretaryResult.rows[0].id;
        }
        
        // Inserir relação
        await client.query(
          'INSERT INTO participating_secretaries (process_id, secretary_id) VALUES ($1, $2)',
          [processId, secretaryId]
        );
      }
    }
    
    // Inserir fiscais de contrato
    if (contract_supervisors && contract_supervisors.length > 0) {
      for (const supervisor of contract_supervisors) {
        await client.query(
          'INSERT INTO contract_supervisors (process_id, name) VALUES ($1, $2)',
          [processId, supervisor]
        );
      }
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Processo criado com sucesso',
      id: processId
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({
      error: true,
      message: 'Erro ao criar processo',
      status: 500
    });
  } finally {
    client.release();
  }
});

// Atualizar processo
app.put('/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const {
      sd_number,
      opening_date,
      simplified_object,
      modality,
      responsible,
      participating_secretaries,
      contract_supervisors,
      observations,
      status
    } = req.body;
    
    // Verificar se o processo existe
    const processExists = await client.query(
      'SELECT id FROM processes WHERE id = $1',
      [id]
    );
    
    if (processExists.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Processo não encontrado',
        status: 404
      });
    }
    
    // Verificar/inserir responsável
    let responsibleId = null;
    if (responsible) {
      const responsibleResult = await client.query(
        'SELECT id FROM responsibles WHERE name = $1',
        [responsible]
      );
      
      if (responsibleResult.rows.length > 0) {
        responsibleId = responsibleResult.rows[0].id;
      } else {
        const newResponsibleResult = await client.query(
          'INSERT INTO responsibles (name) VALUES ($1) RETURNING id',
          [responsible]
        );
        responsibleId = newResponsibleResult.rows[0].id;
      }
    }
    
    // Verificar status
    let statusId = null;
    if (status) {
      const statusResult = await client.query(
        'SELECT id FROM status WHERE name = $1',
        [status]
      );
      
      if (statusResult.rows.length > 0) {
        statusId = statusResult.rows[0].id;
      }
    }
    
    // Atualizar processo
    await client.query(
      `UPDATE processes 
       SET sd_number = $1, 
           opening_date = $2, 
           simplified_object = $3, 
           modality = $4, 
           responsible_id = $5, 
           observations = $6, 
           status_id = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8`,
      [sd_number, opening_date, simplified_object, modality, responsibleId, observations, statusId, id]
    );
    
    // Atualizar secretarias participantes
    if (participating_secretaries) {
      // Remover relações existentes
      await client.query(
        'DELETE FROM participating_secretaries WHERE process_id = $1',
        [id]
      );
      
      // Inserir novas relações
      for (const secretary of participating_secretaries) {
        // Verificar/inserir secretaria
        let secretaryId;
        const secretaryResult = await client.query(
          'SELECT id FROM secretaries WHERE name = $1',
          [secretary]
        );
        
        if (secretaryResult.rows.length > 0) {
          secretaryId = secretaryResult.rows[0].id;
        } else {
          const newSecretaryResult = await client.query(
            'INSERT INTO secretaries (name) VALUES ($1) RETURNING id',
            [secretary]
          );
          secretaryId = newSecretaryResult.rows[0].id;
        }
        
        // Inserir relação
        await client.query(
          'INSERT INTO participating_secretaries (process_id, secretary_id) VALUES ($1, $2)',
          [id, secretaryId]
        );
      }
    }
    
    // Atualizar fiscais de contrato
    if (contract_supervisors) {
      // Remover fiscais existentes
      await client.query(
        'DELETE FROM contract_supervisors WHERE process_id = $1',
        [id]
      );
      
      // Inserir novos fiscais
      for (const supervisor of contract_supervisors) {
        await client.query(
          'INSERT INTO contract_supervisors (process_id, name) VALUES ($1, $2)',
          [id, supervisor]
        );
      }
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      message: 'Processo atualizado com sucesso'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({
      error: true,
      message: 'Erro ao atualizar processo',
      status: 500
    });
  } finally {
    client.release();
  }
});

// Atualizar status do processo
app.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validação básica
    if (!status) {
      return res.status(400).json({
        error: true,
        message: 'Status é obrigatório',
        status: 400
      });
    }
    
    // Verificar se o processo existe
    const processExists = await pool.query(
      'SELECT id FROM processes WHERE id = $1',
      [id]
    );
    
    if (processExists.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Processo não encontrado',
        status: 404
      });
    }
    
    // Verificar status
    const statusResult = await pool.query(
      'SELECT id FROM status WHERE name = $1',
      [status]
    );
    
    if (statusResult.rows.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Status inválido',
        status: 400
      });
    }
    
    const statusId = statusResult.rows[0].id;
    
    // Atualizar status do processo
    await pool.query(
      'UPDATE processes SET status_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [statusId, id]
    );
    
    res.status(200).json({
      message: 'Status do processo atualizado com sucesso'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: 'Erro ao atualizar status do processo',
      status: 500
    });
  }
});

// Rota de verificação de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Serviço de Processos funcionando corretamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Serviço de Processos rodando na porta ${PORT}`);
});

module.exports = app;
