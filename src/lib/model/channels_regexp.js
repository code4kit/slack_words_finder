'use strict';

/**
 * find method
 * @param {Object} nedb
 * @param {String} ch
 * @returns {{ _id: String, channel_id: String, reg_exps: String[] }[]}
 */
const findMethod = async (nedb, ch) => {
  if (!ch) {
    console.log('docAll');
    const docAll = await nedb.asyncFind({});
    return docAll;
  } else {
    console.log('searchDoc');
    const searchDoc = await nedb.asyncFind({
      channel_id: ch
    });
    return searchDoc;
  }
};

/**
 * add method
 * @param {Object} nedb
 * @param {String} regExp
 * @param {String} ch
 * @returns {message: String, regExp: String, channel_id: String}
 */
const addMethod = async (nedb, regExp, chID) => {
  const searchDocs = await findMethod(nedb, chID);
  const searchDoc = searchDocs[0];

  if (!searchDoc) {
    await nedb.asyncInsert({
      channel_id: chID,
      reg_exps: [regExp]
    });
    return { message: 'added', regExp: regExp, channel_id: chID };
  }

  if (searchDoc.reg_exps.indexOf(regExp) !== -1) {
    return { message: 'This RegExp is already existed', regExp: regExp, channel_id: chID };
  }

  searchDoc.reg_exps.push(regExp);

  await nedb.asyncUpdate(
    {
      channel_id: chID
    },
    {
      $set: {
        reg_exps: searchDoc.reg_exps
      }
    }
  );
  const docsAll = await findMethod(nedb);
  console.log(docsAll);
  return { message: 'This method is completed', regExp: regExp, channel_id: chID };
};
/**
 * delete reg exp
 * @param {Object} nedb
 * @param {Number} regExpIndex
 * @param {String} chID
 */
const removeMethod = async (nedb, regExpIndex, chID) => {
  const searchDocs = await findMethod(nedb, chID);
  const searchDoc = searchDocs[0];
  if (!(searchDoc)) {
    return { message: 'This command is not available. This channel is not registered', regExp: regExpIndex, channel_id: chID };
  }
  if (!(searchDoc.reg_exps[regExpIndex])) {
    console.log('Cannot find this RegExp');
    return { message: 'Cannot find this RegExp', regExp: regExpIndex, channel: chID };
  }
  console.log('regExp do not in searchDoc.reg_exps in DB');

  searchDoc.reg_exps.splice(regExpIndex, 1);

  await nedb.asyncUpdate(
    {
      channel_id: chID
    },
    {
      $set: {
        reg_exps: searchDoc.reg_exps
      }
    }
  );
  const docAll = await findMethod(nedb);
  console.log(docAll);
  return { message: 'The remove method is completed', reg_exp: `受け取った${regExpIndex}`, channel: `${chID}` };
};

module.exports = {
  findMethod,
  addMethod,
  removeMethod
};
