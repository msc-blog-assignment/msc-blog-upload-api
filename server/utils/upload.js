'use strict';

const multiparty = require('multiparty');
const {extname} = require('path');
const _ = require('lodash');
const cfenv = require('cfenv');
const AWS = require('aws-sdk');
const uuid = require('uuid4');

const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const bucket = process.env.S3_BUCKET;
const endpoint = process.env.S3_URL;
const appEnv = cfenv.getAppEnv();

const awsConfig = {
  accessKeyId,
  secretAccessKey,
  endpoint,
  sslEnabled: !appEnv.isLocal,
  s3ForcePathStyle: appEnv.isLocal
};

AWS.config.update(awsConfig);

const s3 = new AWS.S3({});

const getFileFromRequest = (req) => new Promise((resolve, reject) => {
  const form = new multiparty.Form();

  form.on('part', part => {
    if (part.filename) {
      const extension = extname(part.filename);

      const manager = s3.upload({
        Bucket: bucket,
        ACL: 'public-read',
        Key: `${uuid()}${extension}`,
        Body: part
      }, (err, result) => {
        err ? reject(err) : resolve(result);
      });

      manager.on('httpUploadProgress', (progress) => {
        console.log('progress', progress);
      });
    }
  });

  form.parse(req);
});

module.exports = {
  getFileFromRequest
};
