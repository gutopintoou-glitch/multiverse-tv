const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const envFile = process.env.DATABASE_FILE || path.join(__dirname,'data','multiverse.db');
const db = new sqlite3.Database(envFile);
module.exports = db;
