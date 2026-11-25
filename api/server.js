require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'loja',
  decimalNumbers: true, // retorna DECIMAL como número, não string
  waitForConnections: true,
  connectionLimit: 10,
});

// Cria a tabela caso ainda não exista (o banco precisa existir: veja schema.sql)
async function garantirTabela() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS produtos (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      nome       VARCHAR(120)  NOT NULL,
      categoria  VARCHAR(80)   NOT NULL,
      preco      DECIMAL(10,2) NOT NULL,
      quantidade INT UNSIGNED  NOT NULL,
      criado_em  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// POST /produto -> cadastra um produto
app.post('/produto', async (req, res) => {
  const { nome, categoria, preco, quantidade } = req.body || {};
  const erros = [];

  if (typeof nome !== 'string' || !nome.trim()) erros.push('nome é obrigatório (texto).');
  if (typeof categoria !== 'string' || !categoria.trim()) erros.push('categoria é obrigatória (texto).');

  const precoNum = Number(preco);
  if (preco === undefined || preco === null || preco === '' || !Number.isFinite(precoNum) || precoNum < 0) {
    erros.push('preco é obrigatório (número decimal maior ou igual a 0).');
  }

  const qtdNum = Number(quantidade);
  if (quantidade === undefined || quantidade === null || quantidade === '' || !Number.isInteger(qtdNum) || qtdNum < 0) {
    erros.push('quantidade é obrigatória (número inteiro maior ou igual a 0).');
  }

  if (erros.length) return res.status(400).json({ erros });

  try {
    const [resultado] = await pool.execute(
      'INSERT INTO produtos (nome, categoria, preco, quantidade) VALUES (?, ?, ?, ?)',
      [nome.trim(), categoria.trim(), precoNum.toFixed(2), qtdNum]
    );
    res.status(201).json({
      id: resultado.insertId,
      nome: nome.trim(),
      categoria: categoria.trim(),
      preco: Math.round(precoNum * 100) / 100,
      quantidade: qtdNum,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar o produto.' });
  }
});

// GET /produtos -> lista todos os produtos
app.get('/produtos', async (req, res) => {
  try {
    const [linhas] = await pool.query(
      'SELECT id, nome, categoria, preco, quantidade FROM produtos ORDER BY id'
    );
    res.json(linhas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao consultar os produtos.' });
  }
});

const PORT = Number(process.env.PORT) || 3000;
garantirTabela()
  .then(() => app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Falha ao conectar no MySQL:', err.message);
    process.exit(1);
  });
