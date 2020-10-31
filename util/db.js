/*
    File where the DB queries are made
*/

const { r } = require('rethinkdb-ts');
const logger = require('./logger.js');
const config = require('../config.json');

const tables = ['users', 'files', 'urls', 'stats'];

// These take arrays, if not arrays will error
const secondaryIndexes = {
  users: ['name', 'password', 'token'],
  files: ['name'],
  urls: ['name'],
  stats: [null]
}

//init
const _init = async () => {
  logger.db('Creating DataBase connection pool...');
  try {
    await r.connectPool({
      db: config.db.db,
      user: config.db.user,
      password: config.db.pass,
      servers: config.db.servers,
      pool: true,
      silent: true,
      log: (message) => logger.db(message)
      //setTimeout(() => { this.init; logger.db('Retrying to create DataBase connection pool.') }, 3000);
    });
    logger.db('Created DataBase connection pool.');
    //console.log(await r.table('files').indexList().run());
    tables.forEach(_initTable);
  } catch (e) {
    await r.getPoolMaster().drain();
    logger.error(`Failed to create DataBase connection pool. Connection will be created automatically once DataBase gets available.`, '\n', e);
    setTimeout(() => { logger.db('Retrying to create DataBase connection pool...'); _init(); }, 3000);
  }
}

const _stop = async () => {
  logger.db('Draining the DataBase connection pool...');
  await r.getPoolMaster().drain();
  logger.db('Drained the DataBase connection pool.');
}

// Files
const _saveFile = async (data, durability) => {
  if (await this.hasInSecondaryIndex('files', data.name, 'name')) return false;
  await r.table('files').insert(data, { durability: durability }).run(); //{ durability: 'soft' }
  return true;
};

const _getFileInfo = async (id) => {
  return (await r.table('files').getAll(id, { index: 'name' }).run())[0]; //getting first of array
};

const _addFileView = async (id) => {
  let num = await r.table('files').get(id)('views').add(1).run();
  return r.table('files').get(id).update({ views: num }, { durability: 'soft' }).run({ noreply: true }); // We dont care much about stats so its made as fast as possible
}


// Users
const _saveUser = async (data) => {
  return r.table('users').insert(data).run();
}

const _getUserInfo = async (token) => {
  return (await r.table('users').getAll(token, { index: 'token' }).run())[0]; // If not existent it will return undefined
}

// URLs
const _shortenURL = async (data, durability) => {
  if (await this.hasInSecondaryIndex('urls', data.name, 'name')) return false;
  await r.table('urls').insert(data, { durability: durability }).run();
  return true;
}

const _getURLInfo = async (id) => {
  return (await r.table('urls').getAll(id, { index: 'name' }).run())[0]; // If not existent it will return null
}

const _addURLView = async (id) => {
  let num = await r.table('urls').get(id)('redirects').add(1).run();
  return r.table('urls').get(id).update({ redirects: num }, { durability: 'soft' }).run({ noreply: true }); // We dont care much about stats so its made as fast as possible
}

// Util
const _has = async (table, id) => {
  return r.table(table).get(id).ne(null).run();
}

const _hasInSecondaryIndex = async (table, id, index) => {
  return ((await r.table(table).getAll(id, { index: index }).run())[0] == undefined) ? false : true;
}

const _hasTable = async (table) => {
  return r.tableList().contains(table).run();
}

const _available = async () => {
  return r.getPoolMaster().isHealthy;
}

const _initTable = async (table) => {
  logger.debug(`Checking if DataBase table ${table} exists...`);
  if (!await _hasTable(table)) {
    logger.debug(`DataBase table ${table} does not exist. Creating it now...`);
    await r.tableCreate(table).run();
    logger.debug(`DataBase table ${table} has been created.`);
  } else logger.debug(`DataBase table ${table} exists.`);

  secondaryIndexes[table].forEach(async index => {
    if (!index) return;
    logger.debug(`Checking if DataBase secondary index ${index} for table ${table} exists...`);
    if (!(await r.table(table).indexList().run()).includes(index)) {
      logger.debug(`DataBase secondary index ${index} for table ${table} does not exist. Creating it now...`);
      await r.table(table).indexCreate(index).run();
      await r.table(table).indexWait(index).run();
      logger.debug(`DataBase secondary index ${index} for table ${table} has been created.`);
    } else logger.debug(`DataBase secondary index ${index} for table ${table} exists.`);
  })
}

module.exports.init = _init;
module.exports.stop = _stop;
// Users
module.exports.saveUser = _saveUser;
module.exports.getUserInfo = _getUserInfo;
// Files
module.exports.saveFile = _saveFile;
module.exports.getFileInfo = _getFileInfo;
module.exports.addFileView = _addFileView;
// Urls
module.exports.shortenURL = _shortenURL;
module.exports.getURLInfo = _getURLInfo;
module.exports.addURLView = _addURLView;
// Util
module.exports.has = _has;
module.exports.hasInSecondaryIndex = _hasInSecondaryIndex;
module.exports.hasTable = _hasTable;
module.exports.available = _available;