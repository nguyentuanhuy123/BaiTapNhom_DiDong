import express from "express";
import {
  addAnwser,
  addQuestion,
  addReplyToReview,
  addReview,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
} from "../controllers/course.controller";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
const courseRouter = express.Router();

courseRouter.get("/get-course/:id", getSingleCourse);

courseRouter.get("/get-courses", getAllCourses);

courseRouter.get("/get-course-content/:id", getCourseByUser);

courseRouter.put("/add-question", addQuestion);

courseRouter.put("/add-answer", addAnwser);

courseRouter.put("/add-review/:id", addReview);

courseRouter.put(
  "/add-reply",
  isAutheticated,
  authorizeRoles("admin"),
  addReplyToReview
);

export default courseRouter;
