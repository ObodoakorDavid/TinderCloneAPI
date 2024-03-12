const cloudinary = require("../utils/cloudinaryConfig");
const uploadImages = require("../utils/uploadImages");

exports.uploadUserImage = async (tempFilePath) => {
  try {
    const { secure_url } = await cloudinary.uploader.upload(tempFilePath, {
      use_filename: true,
      folder: "dating-app",
    });
    return secure_url;
  } catch (error) {
    throw error;
  }
};

exports.uploadUserPhotos = async (photoFiles) => {
  try {
    const uploadedUrls = await uploadImages(photoFiles);
    return uploadedUrls;
  } catch (error) {
    throw error;
  }
};

