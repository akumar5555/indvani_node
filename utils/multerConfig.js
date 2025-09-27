const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Returns a configured multer upload handler for the given subfolder name.
 * @param {string} subfolder - The subdirectory inside /uploads (e.g., "gift_images")
 */
function getUploadHandler(subfolder) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, "..", "uploads", subfolder);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueName = Date.now() + "-" + file.originalname;
      cb(null, uniqueName);
    }
  });

  return multer({ storage }).single("image_url");
}

module.exports = getUploadHandler;
