const asyncHandler = require('express-async-handler');
const Blog = require('../models/blogModel');
const User = require('../models/userModel');
const validateMongodbId = require('../utils/validateMongodbId');
const uploadImgToCloudinary = require('../utils/cloudinary');
const fs= require('fs');

const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);

    res.json(newBlog);
  } catch (error) {
    throw new Error(error);
  }
})


const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongodbId(id);

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true
    });

    res.json(updatedBlog)
  } catch (error) {
    throw new Error(error);
  }
})


const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongodbId(id);

  try {
    const blog = await Blog.findById(id)
      .populate('likes')
      .populate('dislikes');
    await Blog.findByIdAndUpdate(id, {
      $inc: { numViews: 1 }
    }, {
      new: true
    })

    res.json(blog)
  } catch (error) {
    throw new Error(error)
  }
})


const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find();

    res.json(blogs);
  } catch (error) {
    throw new Error(error)
  }
})


const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongodbId(id);

  try {
    const deletedBlog = await Blog.findByIdAndDelete(id);

    res.json(deletedBlog);
  } catch (error) {
    throw new Error(error)
  }
})


const likeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;

  validateMongodbId(blogId);

  const blog = await Blog.findById(blogId);
  const user_Id = req.user.id;
  const isLiked = blog.isLiked;

  // checking the dislikes array for user
  const alreadyDisliked = blog.dislikes.find(
    userId => userId.toString() === user_Id.toString()
  );

  if (alreadyDisliked) {
    const blog = await Blog.findByIdAndUpdate(blogId, {
      $pull: { dislikes: user_Id },
      isDisliked: false
    }, {
      new: true
    });
    res.json(blog)
  }

  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(blogId, {
      $pull: { likes: user_Id },
      isLiked: false
    }, {
      new: true
    })

    res.json(blog)
  } else {
    const blog = await Blog.findByIdAndUpdate(blogId, {
      $push: { likes: user_Id },
      isLiked: true
    }, {
      new: true
    })

    res.json(blog)
  }
});


const dislikeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;

  validateMongodbId(blogId);

  const blog = await Blog.findById(blogId);
  const user_Id = req.user.id;
  const isDisliked = blog.isDisliked;

  // checking the likes array for user
  const alreadyLiked = blog.likes.find(
    userId => userId.toString() === user_Id.toString()
  )

  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(blogId, {
      $pull: { likes: user_Id },
      isLiked: false
    }, {
      new: true
    })

    res.json(blog);
  }

  if (isDisliked) {
    const blog = await Blog.findByIdAndUpdate(blogId, {
      $pull: { dislikes: user_Id },
      isDisliked: false
    }, {
      new: true
    })

    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(blogId, {
      $push: { dislikes: user_Id },
      isDisliked: true
    }, {
      new: true
    })

    res.json(blog);
  }
})


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

    const blog = await Blog.findByIdAndUpdate(id, {
      images: urls.map((file) => ({ url: file }))
    }, {
      new: true
    });

    res.json(blog);
  } catch (error) {
    throw new Error(error);
  }
})



module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  uploadImages
}