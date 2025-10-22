require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./db');
const bodyParser = require('body-parser');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: './data' }),
  secret: process.env.SESSION_SECRET || 'multiverse_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24*60*60*1000 }
}));

function isAuthenticated(req){
  return req.session && req.session.adminId;
}

app.get('/', (req, res) => {
  db.all("SELECT id, title, description, poster FROM channels ORDER BY created_at DESC", [], (err, rows) => {
    if(err) return res.status(500).send("DB error");
    res.render('index', { channels: rows, user: req.session.username });
  });
});

app.get('/player/:id', (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM channels WHERE id = ?", [id], (err, row) => {
    if(err) return res.status(500).send("DB erro");
    if(!row) return res.status(404).send("Canal não encontrado");
    res.render('player', { channel: row });
  });
});

app.get('/about', (req,res) => {
  res.send('<h2>Multiverse TV — Sobre</h2><p>Demo app</p>');
});

app.get('/admin/login', (req, res) => {
  if(isAuthenticated(req)) return res.redirect('/admin');
  res.render('admin/login', { error: null });
});

app.post('/admin/login', (req,res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM admins WHERE username = ?", [username], async (err, row) => {
    if(err) return res.status(500).send('erro db');
    if(!row) return res.render('admin/login', { error: 'Usuário não encontrado' });
    const ok = await bcrypt.compare(password, row.password);
    if(!ok) return res.render('admin/login', { error: 'Senha inválida' });
    req.session.adminId = row.id;
    req.session.username = row.username;
    res.redirect('/admin');
  });
});

app.get('/admin/logout', (req,res) => {
  req.session.destroy(()=> res.redirect('/admin/login'));
});

app.get('/admin', (req,res) => {
  if(!isAuthenticated(req)) return res.redirect('/admin/login');
  db.all("SELECT * FROM channels ORDER BY created_at DESC", [], (err, rows) => {
    if(err) return res.status(500).send("DB error");
    res.render('admin/dashboard', { channels: rows, user: req.session.username });
  });
});

app.get('/admin/channel/new', (req,res) => {
  if(!isAuthenticated(req)) return res.redirect('/admin/login');
  res.render('admin/channel_form', { channel: null, action: '/admin/channel' });
});

app.get('/admin/channel/:id/edit', (req,res) => {
  if(!isAuthenticated(req)) return res.redirect('/admin/login');
  const id = req.params.id;
  db.get("SELECT * FROM channels WHERE id = ?", [id], (err,row) => {
    if(err) return res.status(500).send('db error');
    if(!row) return res.status(404).send('Not found');
    res.render('admin/channel_form', { channel: row, action: `/admin/channel/${id}` });
  });
});

app.post('/admin/channel', (req,res) => {
  if(!isAuthenticated(req)) return res.redirect('/admin/login');
  const { title, description, stream_url, poster } = req.body;
  const id = uuidv4();
  const created_at = Date.now();
  db.run("INSERT INTO channels (id, title, description, stream_url, poster, created_at) VALUES (?, ?, ?, ?, ?, ?)", [id, title, description, stream_url, poster, created_at], function(err){
      if(err) return res.status(500).send('Erro ao criar canal');
      res.redirect('/admin');
    });
});

app.post('/admin/channel/:id', (req,res) => {
  if(!isAuthenticated(req)) return res.redirect('/admin/login');
  const id = req.params.id;
  const { title, description, stream_url, poster } = req.body;
  db.run("UPDATE channels SET title=?, description=?, stream_url=?, poster=? WHERE id=?", [title, description, stream_url, poster, id], function(err){
      if(err) return res.status(500).send('Erro ao atualizar');
      res.redirect('/admin');
    });
});

app.post('/admin/channel/:id/delete', (req,res) => {
  if(!isAuthenticated(req)) return res.redirect('/admin/login');
  const id = req.params.id;
  db.run("DELETE FROM channels WHERE id = ?", [id], function(err){
    if(err) return res.status(500).send('Erro ao deletar');
    res.redirect('/admin');
  });
});

app.get('/api/channels', (req,res) => {
  db.all("SELECT * FROM channels ORDER BY created_at DESC", [], (err, rows) => {
    if(err) return res.status(500).json({ error: 'db' });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Multiverse TV rodando em http://localhost:${PORT}`);
});
