/*
    File where the DB queries are made
*/

const { r } = require('rethinkdb-ts');
const logger = require('./logger.js');
const config = require('../config.json');

module.exports = {

  //init
  init: async () => {
    logger.db('Creating DataBase connection pool.');
    r.connectPool({
      db: config.db.db,
      user: config.db.user,
      password: config.db.pass,
      servers: config.db.servers,
      pool: true,
      silent: true,
      log: (message) => logger.db(message)
    }).then(() => {
      logger.db('Created DataBase connection pool.');
    }).catch(e => {
      logger.error(`Failed to create DataBase connection pool. Connection will be created automatically once DataBase gets available.`, '\n', e);
      //setTimeout(() => { this.init; logger.db('Retrying to create DataBase connection pool.') }, 3000);
    });
  },

  //For visualizing the data better
  file: {
    id: String,
    path: String,
    uploaderID: String,
    createdAt: String,
    views: Number,
  },

  user: {
    name: String,
    subdomain: String,
    domain: String,
    uploads: Number,
    urls: Number,
    token: String,
    staff: String
  },

  url: {
    url: String,
    uploaderID: String,
    createdAt: String,
    views: Number
  },

  // Files
  saveFile: async (data) => {
    if(await this.has('files', data.id)) return false; 
    await r.table('files').insert(data).run();
    return true;
  },

  getFileInfo: async (id) => {
    return r.table('files').get(id).run(); // If not existent it will return null
  },

  // Users
  saveUser: async (data) => {
    return await r.table('users').insert(data).run();
  },

  getUserInfo: async () => {
    return r.table('users').get(id).run() // If not existent it will return null
  },


  // URLs
  shortenURL: async (data) => {
    if(await this.has('urls', data.id)) return false;
    await r.table('urls').insert(data).run();
    return true;
  },

  getURLInfo: async (id) => {
    return r.table('urls').get(id).run(); // If not existent it will return null
  },

  // Util
  has: async (table, id) => {
    return await r.table(table).get(id).ne(null).run();
  },


}