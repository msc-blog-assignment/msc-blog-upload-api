'use strict';

const {extname} = require('path');
const {readFileSync} = require('fs');
const AWS = require('aws-sdk');
const uuid = require('uuid4');
const cfenv = require('cfenv');

const appEnv = cfenv.getAppEnv();

const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const bucket = process.env.S3_BUCKET;
const endpoint = process.env.S3_URL;

const awsConfig = {
  accessKeyId,
  secretAccessKey,
  endpoint,
  sslEnabled: !appEnv.isLocal,
  s3ForcePathStyle: appEnv.isLocal
};

AWS.config.update(awsConfig);

const s3 = new AWS.S3({});

const uploadFileToS3 = (file = {}) => {
  // turn the file into a buffer for uploading
  const buffer = readFileSync(file.path);

  // the extension of your file
  const extension = extname(file.path);

  // return a promise
  return new Promise((resolve, reject) => {
    return s3.upload({
      Bucket: bucket,
      ACL: 'public-read',
      Key: `${uuid()}${extension}`,
      Body: buffer
    }, (err, result) => {
      err ? reject(err) : resolve(result);
    });
  });
};

module.exports = {
  uploadFileToS3
};
