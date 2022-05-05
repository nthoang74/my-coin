const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("schemas/db.json");
const db = low(adapter);

db.defaults({ wallets: [] }).write();

module.exports = db;
