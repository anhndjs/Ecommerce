const asyncHandler = require('express-async-handler');
const Blog = require('../models/blogModel');
const User = require('../models/userModel');
const validateMongoDbid = require('../utils/validateMongodb');
const cloudinaryUploadImg = require('../utils/cloudinary');
const fs = require('http')

const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.json(newBlog);
  } catch (error) {
    throw new Error(error);
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateaBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateaBlog);
  } catch (error) {
    throw new Error(error);
  }
});

const getBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const getaBlog = await Blog.findById(id).populate('likes');
    await Blog.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      {
        new: true,
      },
    );
    res.json(getaBlog);
  } catch (error) {
    throw new Error(error);
  }
});

const getallBlog = asyncHandler(async (req, res) => {
  try {
    const getBlogs = await Blog.find();
    res.json(getBlogs);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deleteaBlog = await Blog.findByIdAndDelete(id);
    res.json(deleteaBlog);
  } catch (error) {
    throw new Error(error);
  }
});

const likeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  console.log(blogId);
  validateMongoDbid(blogId);
  // find the blog which you want to be
  const blog = await Blog.findById(blogId);
  // find the login user
  const loginUserId = req.user._id;
  // find if the user has linke the post
  const { isLiked } = blog;
  // find if the user has disliked the blog
  const alreadyDisliked = blog.dislikes.find(userId => userId.toString() === loginUserId.toString());

  if (alreadyDisliked) {
    const blogs = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true },
    );
    res.json(blogs);
  }
  if (isLiked) {
    const blogs = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true },
    );
    res.json(blogs);
  } else {
    const blogs = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      { new: true },
    );
    res.json(blogs);
  }
});

const disliketheBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoDbid(blogId);
  // Find the blog which you want to be liked
  const blog = await Blog.findById(blogId);
  // find the login user
  const loginUserId = req?.user?._id;
  // find if the user has liked the blog
  const isDisLiked = blog?.isDisliked;
  // find if the user has disliked the blog
  const alreadyLiked = blog?.likes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(blog);
  }
  if (isDisLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { dislikes: loginUserId },
        isDisliked: true,
      },
      { new: true }
    );
    res.json(blog);
  }
});

const uploadImages = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbid(id);
    const uploader = path => cloudinaryUploadImg(path, 'images');
    const urls = [];
    const { files } = req;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
      // fs.unlinkSync(path);

    }
    const findBlog = await Blog.findByIdAndUpdate(
      id,
      {
        images: urls.map(file => file),
      },
      {
        new: true,
      },
    );
    res.json(findBlog);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = { createBlog, updateBlog, getBlog, getallBlog, deleteBlog, likeBlog, disliketheBlog, uploadImages };
