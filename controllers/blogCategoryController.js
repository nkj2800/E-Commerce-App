const BlogCategory = require('../models/blogCategoryModel');
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId');



const createCategory = asyncHandler(async (req, res) => {
  try {
    const category = await BlogCategory.create(req.body)

    res.json(category);
  } catch (error) {
    throw new Error(error)
  }
});


const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongodbId(id);

  try {
    const updatedCategory = await BlogCategory.findByIdAndUpdate(id, req.body, {
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
    const deletedCategory= await BlogCategory.findByIdAndDelete(id);

    res.json(deletedCategory);
  } catch (error) {
    throw new Error(error);
  }
});


const getCategory= asyncHandler(async(req, res) => {
  const {id} = req.params;

  validateMongodbId(id);

  try {
    const category= await BlogCategory.findById(id);

    res.json(category);
  } catch (error) {
    throw new Error(error)
  }
});


const getAllCategories= asyncHandler(async(req, res) => {
  try {
    const categories= await BlogCategory.find();

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