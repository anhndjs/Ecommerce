const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET_KEY,
});

const cloudinaryUploadImg = async fileToUploads => new Promise(resolve => {
  cloudinary.uploader.upload(fileToUploads, result => {
    resolve(
      {
        url: result.secure_url,
        asset_id: result.asset_id,
        public_id: result.public_id,
      },
      {
        resource_type: 'auto',
      },
    );
  });
});
module.exports = cloudinaryUploadImg;
// cloudinary.config({
//   cloud_name: "dvk1yfkvh",
//   api_key: "357732696445951",
//   api_secret: "doAhSPQYC2hk-1Jc91VyyhcQmTA"
// });
