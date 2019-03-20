/*
 * @Author: ImmortalLark
 * @Date: 2018-11-23 15:21:47
 * @Last Modified by: ImmortalLark
 * @Last Modified time: 2019-03-20 11:33:59
 */
const log4js = require('log4js');
log4js.configure({
  appenders: { log: { type: 'console' } },
  categories: { default: { appenders: ['log'], level: 'error' } },
  pm2: true
});
const logger = log4js.getLogger();
logger.level = 'debug';
module.exports = logger;
