'use strict';

const multiparty = require('multiparty');
const _ = require('lodash');

const getFileFromRequest = (req) => new Promise((resolve, reject) => {
  const form = new multiparty.Form();

  form.parse(req, (err, fields, files) => {
    if (err) reject(err);

    if (!_.has(files, 'file') || files['file'].length === 0) {
      return reject('File was not found in form data.');
    }

    const file = files['file'][0];

    file ? resolve(file) : reject('File was not found in form data.');
  });
});

module.exports = {
  getFileFromRequest
};
