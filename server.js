const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = Date.now() + '-' + Math.round(Math.random()*1e9) + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, 'public')));

const DBFILE = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(DBFILE);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS folders (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, created_at TEXT DEFAULT (datetime('now')))`);
  db.run(`CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, folder_id INTEGER, title TEXT, text TEXT, images TEXT, created_at TEXT DEFAULT (datetime('now')))`);
});

app.get('/api/folders', (req,res)=>{ db.all('SELECT * FROM folders ORDER BY created_at DESC', [], (err,rows)=> res.json(rows)); });

app.post('/api/folders', (req,res)=>{
  const name = req.body.name || 'Sem nome';
  db.run('INSERT INTO folders (name) VALUES (?)', [name], function(err){ res.json({id:this.lastID,name}); });
});

app.listen(PORT, ()=> console.log('Servidor rodando em http://localhost:'+PORT));
