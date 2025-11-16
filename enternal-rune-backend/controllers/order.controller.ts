import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel from "../models/order.Model";
import userModel from "../models/user.model";
import CourseModel, { ICourse } from "../models/course.model";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.Model";
import { redis } from "../utils/redis";
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export const createMobileOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, userId, payment_info } = req.body;
      if (!userId) {
        return next(new ErrorHandler("User ID is required", 400));
      }
      const user = await userModel.findById(userId);
      if (!user) return next(new ErrorHandler("User not found", 404));
      const courseExistInUser = user.courses.some(
        (course: any) => course._id.toString() === courseId
      );
      if (courseExistInUser) {
        return next(
          new ErrorHandler("You have already purchased this course", 400)
        );
      }
      const course: ICourse | null = await CourseModel.findById(courseId);
      if (!course) return next(new ErrorHandler("Course not found", 404));
      const order = await OrderModel.create({
        courseId: course._id.toString(),
        userId: user._id.toString(),
        payment_info,
      });
      user.courses.push(course._id);
      await user.save();

      course.purchased = (course.purchased || 0) + 1;
      await course.save();
      await NotificationModel.create({
        title: "New Order",
        message: `You have successfully purchased the course: ${course.name}`,
        status: "unread",
        userId: user._id.toString(),
      });
      res.status(201).json({
        success: true,
        message: "Order created successfully",
        order,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getUserOrders = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Lấy userId từ req.user (Giả định bạn đã có middleware xác thực người dùng)
      // Trong môi trường của bạn (nếu không dùng req.user), bạn cần gửi userId qua params hoặc body.
      // Dựa trên mobile app, có thể lấy qua req.params.userId
      const { userId } = req.params; 

      if (!userId) {
        return next(new ErrorHandler("User ID is missing from request parameters", 400));
      }
      
      // 2. Tìm kiếm tất cả đơn hàng của người dùng
      // Sử dụng populate để lấy thông tin chi tiết của Khóa học (Course)
      const orders: IOrder[] = await OrderModel.find({ userId })
        .populate({
          path: 'courseId', // Trường trong OrderModel là ID của Course
          select: 'name price estimatedPrice thumbnail', // Chỉ lấy các trường cần thiết để hiển thị
          model: CourseModel,
        })
        .sort({ createdAt: -1 }); // Sắp xếp theo ngày tạo mới nhất

      if (!orders || orders.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No orders found for this user.",
          orders: [],
        });
      }

      // 3. Trả về danh sách đơn hàng
      res.status(200).json({
        success: true,
        orders,
      });

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
//  send stripe publishble key
export const sendStripePublishableKey = CatchAsyncError(
  async (req: Request, res: Response) => {
    res.status(200).json({
      publishablekey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  }
);

export const newPayment = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "usd",
        metadata: {
          company: "ELearning",
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.status(201).json({
        success: true,
        client_secret: myPayment.client_secret,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
