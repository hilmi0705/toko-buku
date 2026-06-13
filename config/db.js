const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

// Baca semua data dari db.json
function readDB() {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
}

// Simpan semua data ke db.json
function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Generate ID baru (ambil ID terbesar + 1)
function newId(arr) {
    if (!arr || arr.length === 0) return 1;
    return Math.max(...arr.map(x => x.id)) + 1;
}

module.exports = { readDB, writeDB, newId };
