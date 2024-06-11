const ProductCategory = require('../models/productCategoryModel');
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId');



const createCategory = asyncHandler(async (req, res) => {
  try {
    const category = await ProductCategory.create(req.body)

    res.json(category);
  } catch (error) {
    throw new Error(error)
  }
});


const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongodbId(id);

  try {
    const updatedCategory = await ProductCategory.findByIdAndUpdate(id, req.body, {
      new: true
    });

    res.json(updatedCategory);
  } catch (error) {
    throw new Error(error)
  }
});


const deleteCategory= asyncHandler(async(req, res) => {
  const {id}= req.params;

  validateMongodbId(id);

  try {
    const deletedCategory= await ProductCategory.findByIdAndDelete(id);

    res.json(deletedCategory);
  } catch (error) {
    throw new Error(error);
  }
});


const getCategory= asyncHandler(async(req, res) => {
  const {id} = req.params;

  validateMongodbId(id);

  try {
    const category= await ProductCategory.findById(id);

    res.json(category);
  } catch (error) {
    throw new Error(error)
  }
});


const getAllCategories= asyncHandler(async(req, res) => {
  try {
    const categories= await ProductCategory.find();

    res.json(categories);
  } catch (error) {
    throw new Error(error)
  }
})


module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories
}