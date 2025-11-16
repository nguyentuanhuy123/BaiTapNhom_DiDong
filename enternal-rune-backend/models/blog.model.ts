import mongoose from 'mongoose';
const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  slug: String,
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coverImageUrl: String,
  status: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
export default mongoose.model('Blog', blogSchema);
