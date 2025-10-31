import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import CourseModel, { IComment } from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.Model";
import axios from "axios";

// get single course --- without purchasing
export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;

      const isCacheExist = await redis.get(courseId);

      if (isCacheExist) {
        const course = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          course,
        });
      } else {
        const course = await CourseModel.findById(req.params.id).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days

        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get all courses --- without purchasing
export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await CourseModel.find().select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      );

      res.status(200).json({
        success: true,
        courses,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get course content -- only for valid user
export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const content = course.courseData;

      res.status(200).json({
        success: true,
        content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


// interface cho payload
interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
  userName?: string; // optional
}

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId, userName } = req.body as IAddQuestionData;
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }
      const courseContent = course.courseData?.find(
        (item: any) => item.title?.toString() === contentId?.toString()
      );

      if (!courseContent) {
        return next(new ErrorHandler("Content not found in course", 400));
      }
      const newQuestion: any = {
        user: userName || "Guest",
        question,
        questionReplies: [],
        createdAt: new Date(),
      };
      courseContent.questions.push(newQuestion);
      await course.save();

      console.log("Question added successfully:", newQuestion);

      res.status(200).json({ success: true, course });
    } catch (error: any) {
      console.error("Error in addQuestion:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

export const addAnwser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, courseId, contentId, questionId }: IAddAnswerData =
        req.body;

      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      const couseContent = course?.courseData?.find((item: any) =>
        item._id.equals(contentId)
      );

      if (!couseContent) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      const question = couseContent?.questions?.find((item: any) =>
        item._id.equals(questionId)
      );

      if (!question) {
        return next(new ErrorHandler("Invalid question id", 400));
      }

      // create a new answer object
      const newAnswer: any = {
        user: req.user,
        answer,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // add this answer to our course content
      question.questionReplies.push(newAnswer);

      await course?.save();

      if (req.user?._id === question.user._id) {
        // create a notification
        await NotificationModel.create({
          user: req.user?._id,
          title: "New Question Reply Received",
          message: `You have a new question reply in ${couseContent.title}`,
        });
      } else {
        const data = {
          name: question.user.name,
          title: couseContent.title,
        };

        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/question-reply.ejs"),
          data
        );

        try {
          await sendMail({
            email: question.user.email,
            subject: "Question Reply",
            template: "question-reply.ejs",
            data,
          });
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }
      }

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IAddReviewData {
  review: string;
  rating: number;
  userName?: string; // thêm nếu muốn
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const { review, rating, userName } = req.body as IAddReviewData;

      const reviewData: any = {
        user: userName || "Guest",
        rating,
        comment: review,
      };

      course.reviews.push(reviewData);
      let avg = 0;
      course.reviews.forEach((rev: any) => (avg += rev.rating));
      course.ratings = avg / course.reviews.length;

      await course.save();

      res.status(200).json({ success: true, course });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
interface IAddReviewData {
  comment: string;
  courseId: string;
  reviewId: string;
}
export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IAddReviewData;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const review = course?.reviews?.find(
        (rev: any) => rev._id.toString() === reviewId
      );

      if (!review) {
        return next(new ErrorHandler("Review not found", 404));
      }

      const replyData: any = {
        user: req.user,
        comment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!review.commentReplies) {
        review.commentReplies = [];
      }

      review.commentReplies?.push(replyData);
      
      await course?.save();

      await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);