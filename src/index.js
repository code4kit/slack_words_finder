'use strict';

/**
 * @fileoverview index.js
 *
 * @author shion0625
 * @author
 * @author
 * @author Lin-Ja
 */

require('dotenv').config();
const { WebClient, RTMClient } = require('@slack/client');
const packageInfo = require('../package.json');
const http = require('http');
const httpServer = require('./lib/http_server');

/**
 * port number
 * @type {Number}
 */
const PORT = parseFloat(process.env.PORT);
/**
 * host number
 * @type {String}
 */
const HOST = process.env.HOST.toString();
/**
 * @type {String}
 */
const WORKSPACE_DOMAIN = process.env.WORKSPACE_DOMAIN.toString();
/**
 * @type {String}
 */
const EMOJI = process.env.EMOJI.toString();
/**
 * slack bot token
 */
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN.toString();
/**
 * slack rtm client
 */
const rtmClient = new RTMClient(SLACK_BOT_TOKEN);
/**
 * slack web client
 */
const webClient = new WebClient(SLACK_BOT_TOKEN);

/**
 * db path
 *@type {String}
 */
const DB_PATH = process.env.DB_PATH.toString();

/**
 * system mode
 *@type {String}
 */
const SYSTEM_MODE = process.env.SYSTEM_MODE.toString();

const nedb = require('./lib/model/_nedb')(
  DB_PATH,
  SYSTEM_MODE
);
const chReg = require('./lib/model/channels_regexp');

const slackMsgRegExp = {
  addMsg: new RegExp(`^${EMOJI}( |) add( |)+`, 'i'),
  removeMsg: new RegExp(`^${EMOJI}( |) [0-9]+`, 'i'),
  list: new RegExp(`^${EMOJI}( |) list`)
};
rtmClient.on('message', (event) => {
  if (!('text' in event)) {
    return;
  }
  if (event.text.match(slackMsgRegExp.addMsg)) {
    console.log('add');
    addCmd(event);
    return;
  }
  if (event.text.match(slackMsgRegExp.removeMsg)) {
    console.log('remove');
    removeCmd(event);
    return;
  }
  if (event.text.match(slackMsgRegExp.list)) {
    console.log('list');
    listCmd(event);
    return;
  }
  receiveNewMsg(event);
});
rtmClient.start();

/**
 * add reg exp , channel
 * @param {Object} event
 */
const addCmd = async (event) => {
  console.log('addCmd');
  const regExp = await event.text.split(/add/i)[1].trim();
  const addMethod = await chReg.addMethod(nedb, regExp, event.channel);
  replyToThread(event.channel, event.ts, 'message' + addMethod.massage + ' reg exp' + addMethod.regExp + ' channel ID' + addMethod.channel);
};
/**
 * delete a reg exp
 * @param {Object} event
 */
const removeCmd = async (event) => {
  if (!(event.ts in event)) {
    const regExpIndex = await event.text.split(/:/)[2].trim();
    const removeMethod = await chReg.removeMethod(nedb, regExpIndex, event.channel);
    replyToThread(event.channel, event.ts, 'message' + removeMethod.message + ' reg exp:' + removeMethod.regExp + ' channel ID"' + removeMethod.channel);
  } else {
    replyToThread(event.channel, event.ts, 'You can not use this command in thread.');
  }
};
const listCmd = async (event) => {
  const findMethod = await chReg.findMethod(nedb, event.channel);
  if (!(findMethod)) {
    replyToThread(event.channel, event.ts, 'this channel is not set reg exp');
    return;
  }
  let regExpsMsg = '';
  for (let i = 0; i < findMethod[0].reg_exps.length; i++) {
    regExpsMsg += i + ', ```' + findMethod[0].reg_exps[i] + '``` \n';
  }
  replyToThread(event.channel, event.ts, regExpsMsg);
};

/**
 * receive new msg
 * @param {Object} event
 */
const receiveNewMsg = async (event) => {
  const docs = await chReg.findMethod(nedb);
  for (const doc of docs) {
    for (let i = 0; i < doc.reg_exps.length; ++i) {
      if (!event.text.match(new RegExp(doc.reg_exps[i]))) {
        continue;
      }
      webClient.chat.postMessage({
        channel: doc.channel_id,
        text: `\`${i}\` https://${WORKSPACE_DOMAIN}.slack.com/archives/${event.channel}/p${event.ts}${('thread_ts' in event) ? `?thread_ts=${event.thread_ts}` : ''}`
      });
      break;
    }
  }
};
/**
 * @param {String} ch
 * @param {String} ts
 * @param {String} msg
 */
const replyToThread = (ch, ts, msg) => {
  webClient.chat.postMessage({
    channel: ch,
    username: packageInfo.name,
    icon_emoji: EMOJI,
    thread_ts: ts,
    text: msg
  });
};
/**
 * @param {Object} req
 * @param {Object} res
 */
const server = http.createServer((req, res) => {
  httpServer(req, res, packageInfo.name);
});
server.listen(PORT, HOST, () => {
  console.log(`Listening to http://${HOST}:${PORT}`);
});
