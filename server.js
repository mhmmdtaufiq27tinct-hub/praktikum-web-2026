// Backend CRUD mahasiswa dengan Express dan MySQL.
const path = require('node:path');
const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_kampus',
});

db.connect((err) => {
  if (err) {
    console.error('Koneksi database gagal:', err.message);
    return;
  }
  console.log('Terhubung ke database MySQL.');
});

function validasiMahasiswa(req, res, next) {
  const { nim, nama, jurusan, email } = req.body || {};
  if (![nim, nama, jurusan, email].every((value) => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ success: false, message: 'NIM, nama, jurusan, dan email wajib diisi.' });
  }
  req.mahasiswa = {
    nim: nim.trim(),
    nama: nama.trim(),
    jurusan: jurusan.trim(),
    email: email.trim(),
  };
  next();
}

app.get('/api/mahasiswa', (req, res) => {
  db.query('SELECT * FROM mahasiswa ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json(results);
  });
});

app.post('/api/mahasiswa', validasiMahasiswa, (req, res) => {
  const { nim, nama, jurusan, email } = req.mahasiswa;
  const sql = 'INSERT INTO mahasiswa (nim, nama, jurusan, email) VALUES (?, ?, ?, ?)';
  db.query(sql, [nim, nama, jurusan, email], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.status(201).json({ success: true, id: result.insertId, message: 'Data mahasiswa berhasil disimpan!' });
  });
});

app.put('/api/mahasiswa/:id', validasiMahasiswa, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ success: false, message: 'ID mahasiswa tidak valid.' });
  }
  const { nim, nama, jurusan, email } = req.mahasiswa;
  const sql = 'UPDATE mahasiswa SET nim = ?, nama = ?, jurusan = ?, email = ? WHERE id = ?';
  db.query(sql, [nim, nama, jurusan, email, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Data mahasiswa tidak ditemukan.' });
    res.json({ success: true, message: 'Data mahasiswa berhasil diperbarui!' });
  });
});

app.delete('/api/mahasiswa/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ success: false, message: 'ID mahasiswa tidak valid.' });
  }
  db.query('DELETE FROM mahasiswa WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Data mahasiswa tidak ditemukan.' });
    res.json({ success: true, message: 'Data mahasiswa berhasil dihapus!' });
  });
});

app.use((err, req, res, next) => {
  console.error('Request gagal:', err.message);
  res.status(err.status || 500).json({ success: false, message: err.status === 400 ? 'Format JSON tidak valid.' : 'Terjadi kesalahan pada server.' });
});

app.listen(PORT, () => {
  console.log(`Server CRUD aktif di http://localhost:${PORT}`);
});
