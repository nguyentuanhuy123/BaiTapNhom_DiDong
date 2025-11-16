import Blog from '../models/blog.model';
import mongoose from 'mongoose';

export const getBlogs = async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
//   console.log(blogs);
  res.json(blogs);
};
export const getBlogDetail = async (req, res) => {
  try {
    const blogId = req.params.id;
    const objectId = new mongoose.Types.ObjectId(blogId);

    const result = await Blog.aggregate([
      { $match: { _id: objectId } },
      {
        $lookup: {
          from: 'users',
          localField: 'author_id',
          foreignField: '_id',
          as: 'authorInfo'
        }
      },
      { $unwind: '$authorInfo' }
    ]);
    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

