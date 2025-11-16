import express from 'express';
import { getBlogDetail, getBlogs } from '../controllers/blog.controller';
const router = express.Router();
router.get('/', getBlogs);
router.get('/:id', getBlogDetail);
export default router;

