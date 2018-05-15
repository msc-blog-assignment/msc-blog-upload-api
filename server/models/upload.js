'use strict';

let {getFileFromRequest} = require('../utils/upload');
let {uploadFileToS3} = require('../utils/s3');

module.exports = Upload => {
  Upload.upload = (userId, req, next) => {
    let uploadedFile = Upload.app.models.UploadedFile;

    getFileFromRequest(req)
      .then((file) => uploadFileToS3(file))
      .then((file) => {
        uploadedFile.create({
          userId,
          link: file.Location,
          etag: file.ETag,
          bucket: file.Bucket,
          key: file.Key
        }, (err, file) => {
          next(err, file);
        });
      })
      .catch((err) => next(err, 'Unable to upload to s3'));
  };

  Upload.sharedClass.methods().forEach(method => {
    Upload.disableRemoteMethodByName(method.name);
  });

  Upload.remoteMethod('upload', {
    accepts: [
      {arg: 'userId', type: 'string', required: true},
      {arg: 'req', type: 'object', http: {source: 'req'}}
    ],
    returns: {root: true, type: 'object'},
    http: {path: '/upload', verb: 'post'}
  });
};
