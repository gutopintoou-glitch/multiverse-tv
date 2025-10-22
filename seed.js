require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./db');
const { v4: uuidv4 } = require('uuid');

function run(sql, params=[]) {
  return new Promise((res, rej) => {
    db.run(sql, params, function(err){
      if(err) return rej(err);
      res(this);
    });
  });
}

async function setup() {
  try {
    await run(`CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT
    )`);
    await run(`CREATE TABLE IF NOT EXISTS channels (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      stream_url TEXT,
      poster TEXT,
      created_at INTEGER
    )`);

    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    db.get("SELECT * FROM admins WHERE username = ?", [adminUser], async (err,row) => {
      if(err) throw err;
      if(!row){
        const hash = await bcrypt.hash(adminPass, 10);
        await run(`INSERT INTO admins (id, username, password) VALUES (?, ?, ?)`, [uuidv4(), adminUser, hash]);
        console.log(`Admin criado -> username: ${adminUser} password: ${adminPass}`);
      } else {
        console.log(`Admin já existe -> ${adminUser}`);
      }
    });

    db.get("SELECT COUNT(1) as cnt FROM channels", [], async (err,row) => {
      if(err) throw err;
      if(row.cnt === 0){
        const now = Date.now();
        const sample = [
          {
            id: uuidv4(),
            title: 'Multiverse News',
            description: 'Canal 24/7 com notícias do Multiverse.',
            stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            poster: '/public/img/news-poster.jpg'
          },
          {
            id: uuidv4(),
            title: 'Chill Beats',
            description: 'Músicas e ambientações relaxantes.',
            stream_url: 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8',
            poster: '/public/img/chill-poster.jpg'
          }
        ];
        for(const c of sample){
          await run(`INSERT INTO channels (id, title, description, stream_url, poster, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [c.id, c.title, c.description, c.stream_url, c.poster, now]);
        }
        console.log('Canais seed criados.');
      } else {
        console.log('Canais já existem.');
      }
    });

    setTimeout(()=> {
      console.log('Seed concluído.');
      process.exit(0);
    }, 800);
  } catch (e){
    console.error('Erro no seed:', e);
    process.exit(1);
  }
}

setup();
