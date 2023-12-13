const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');


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
    const limit= req.query.limit;
    const skip= (page- 1)* limit;

    query= query.skip(skip).limit(limit)

    if(req.query.page) {
      const productsCount= await Product.countDocuments();

      if(skip>= productsCount) {
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
})


module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct
}