const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');


// Configuring Multer storage
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

    cb(null, file.originalname + '-' + uniqueSuffix + '.jpeg');
  }
});

// Filtering file types
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb({ message: 'Unsupported file format' }, false);
  }
};

// Creating Multer instance with storage and filter
const uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fieldSize: 2000000 }
});

// Resizing product images
const productImageResize = async (req, res, next) => {
  if (!req.files) return next();

  await Promise.all(req.files.map(async (file) => {
    await sharp(file.path)
      .resize(300, 300)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/images/products/${file.filename}`)

    fs.unlinkSync(`public/images/products/${file.filename}`)
  })
  ) 

  next();
};

// Resizing blog images(similar logic to resizing product images)
const blogImageResize = async (req, res, next) => {
  if (!req.files) return next();

  await Promise.all(req.files.map(async (file) => {
    await sharp(file.path)
      .resize(300, 300)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/images/blogs/${file.filename}`)

    fs.unlinkSync(`public/images/blogs/${file.filename}`)
  })
  )

  next();
};



module.exports = { productImageResize, blogImageResize, uploadPhoto };