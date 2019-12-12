'use strict';
/**
 * @fileOverView http_server.js
 *
 * @author ray1525
 * @author MisoraKambe
 * @author Lin-Ja
 * @version 1.0.0
 * /

 /**
 * @param {object} res
 * @param {object} req
 * @param {String} systemName
 */
const main = (req, res, systemName) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset = utf-8'
  });
  res.write(systemName);
  res.end();
};

module.exports = main;
