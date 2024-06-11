const Product = require('../models/productModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const uploadImgToCloudinary = require('../utils/cloudinary');
const validateMongodbId = require('../utils/validateMongodbId');
const fs= require('fs');

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);

    res.json(newProduct);

  } catch (error) {
    throw new Error(error)
  }
});


const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);

    res.json(product)
  } catch (error) {
    throw new Error(error)
  }
});


const getAllProducts = asyncHandler(async (req, res) => {
  try {

    // filtering
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];

    excludeFields.forEach(el => delete queryObj[el]);

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryString))

    // sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');

      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt')
    }

    // limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');

      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    //pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit)

    if (req.query.page) {
      const productsCount = await Product.countDocuments();

      if (skip >= productsCount) {
        throw new Error('The page does not exists');
      }
    }

    const Products = await query;

    res.json(Products);
  } catch (error) {
    throw new Error(error)
  }
});


const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title)
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });

    res.json(updatedProduct)
  } catch (error) {
    throw new Error(error)
  }
});


const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(id)

    res.json(deletedProduct);
  } catch (error) {
    throw new Error(error)
  }
});


const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { product_id } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyAdded = user.wishlist.find((id) => id.toString() === product_id.toString());

    if (alreadyAdded) {
      const user = await User.findByIdAndUpdate(_id, {
        $pull: { wishlist: product_id }
      }, {
        new: true
      });

      res.json(user);
    } else {
      const user = await User.findByIdAndUpdate(_id, {
        $push: { wishlist: product_id }
      }, {
        new: true
      });

      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});


const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment, product_id } = req.body;

  try {
    const product = await Product.findById(product_id);
    const alreadyRated = product.ratings.find(rating => rating.postedBy.toString() === _id.toString());

    if (alreadyRated) {
      await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated }
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment }
        },
        {
          new: true
        }
      );
    } else {
      await Product.findByIdAndUpdate(product_id,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedBy: _id
            }
          }
        }, {
        new: true
      }
      );
    }

    const ratedProduct = await Product.findById(product_id);
    let totalRatings = ratedProduct.ratings.length;
    let sumOfRatings = ratedProduct.ratings
      .map(rating => rating.star)
      .reduce((acc, cur) => acc + cur, 0);
    let result = Math.round(sumOfRatings / totalRatings);

    const finalProduct = await Product.findByIdAndUpdate(product_id,
      {
        totalratings: result
      }, {
      new: true
    });

    res.json(finalProduct);
  } catch (error) {
    throw new Error(error);
  }
});


const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongodbId(id);

  try {
    const uploader = path => uploadImgToCloudinary(path, 'images');
    const urls = [];
    const files = req.files;

    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);

      urls.push(newPath);

      fs.unlinkSync(path);
    }

    const product = await Product.findByIdAndUpdate(id, {
      images: urls.map((file) => ({url: file}))
    }, {
      new: true
    });

    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
})

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadImages
}