'use strict';

/**
 * fileOverView update.js
 *
 * @author waricoma
 * @version 1.0.0
 */

const { describe, it } = require('kocha');
const chai = require('chai');
const expect = chai.expect;

const chReg = require('../../src/lib/model/channels_regexp');

const sampleData = [
  { channel_id: 'C-TEST-A', reg_exps: ['^pig$', '^racoon$'] },
  { channel_id: 'C-TEST-B', reg_exps: ['^fox$', '^cat$'] },
  { channel_id: 'C-TEST-C', reg_exps: ['c4k', 'kit'] }
];

describe('find method', () => {
  it('run find method than did not set value of channel', async () => {
    const nedb = require('../../src/lib/model/_nedb')(
      '',
      'test'
    );

    await nedb.asyncInsert(sampleData);

    const resultOfFindMethod = await chReg.findMethod(nedb);

    expect(resultOfFindMethod.length).to.equal(sampleData.length);
  });

  it('run find method than set value of channel', async () => {
    const nedb = require('../../src/lib/model/_nedb')(
      '',
      'test'
    );

    await nedb.asyncInsert(sampleData);

    const resultOfFindMethod = await chReg.findMethod(nedb, sampleData[0].channel_id);

    expect(resultOfFindMethod.length).to.equal(1);
    expect(resultOfFindMethod[0].channel_id).to.equal(sampleData[0].channel_id);
  });
});

describe('add method', () => {
  it('run add method than did not set the document than never exist', async () => {
    const nedb = require('../../src/lib/model/_nedb')(
      '',
      'test'
    );

    const testChId = 'C-TEST-N';
    const testRegExpStr = '^cat$';

    const resultOfAddMethod = await chReg.addMethod(nedb, testRegExpStr, testChId);

    expect(resultOfAddMethod.message).to.equal('added');
    expect(resultOfAddMethod.regExp).to.equal(testRegExpStr);
    expect(resultOfAddMethod.channel_id).to.equal(testChId);

    const resultOfFindMethod = await chReg.findMethod(nedb, testChId);

    expect(resultOfFindMethod.length).to.equal(1);
    expect(resultOfFindMethod[0].channel_id).to.equal(testChId);
    expect(resultOfFindMethod[0].reg_exps.indexOf(testRegExpStr)).to.not.equal(-1);
    expect(resultOfFindMethod[0].channel_id).to.equal(testChId);
  });

  it('run add method when already exist the regExp in documents', async () => {
    const nedb = require('../../src/lib/model/_nedb')(
      '',
      'test'
    );

    await nedb.asyncInsert(sampleData);

    const resultOfAddMethod = await chReg.addMethod(nedb, sampleData[0].reg_exps[0], sampleData[0].channel_id);

    expect(resultOfAddMethod.message).to.equal('This RegExp is already existed');
    expect(resultOfAddMethod.regExp).to.equal(sampleData[0].reg_exps[0]);
    expect(resultOfAddMethod.channel_id).to.equal(sampleData[0].channel_id);
  });
});

describe('remove method', () => {
  it('run remove method when regExp is not setting in documents', async () => {
    const nedb = require('../../src/lib/model/_nedb')(
      '',
      'test'
    );
    await nedb.asyncInsert(sampleData);
    const regExpIndex = 3;
    const chId = 'C-TEST-A';
    const resultOfRemoveMethod = await chReg.removeMethod(nedb, regExpIndex, chId);
    expect(resultOfRemoveMethod.message).to.equal('Cannot find this RegExp');
    expect(resultOfRemoveMethod.regExp).to.equal(regExpIndex);
    expect(resultOfRemoveMethod.channel).to.equal(chId);
  });

  it('run remove method when already set regExp in document', async () => {
    const nedb = require('../../src/lib/model/_nedb.js')(
      '',
      'test'
    );
    await nedb.asyncInsert(sampleData);
    const regExpIndex = 0;
    const chId = 'C-TEST-A';
    const resultOfRemoveMethod = await chReg.removeMethod(nedb, regExpIndex, chId);
    expect(resultOfRemoveMethod.message).to.equal('The remove method is completed');
    expect(resultOfRemoveMethod.regExp).to.equal(`受け取った${regExpIndex}`);
    expect(resultOfRemoveMethod.channel).to.equal(chId);
  });
});
