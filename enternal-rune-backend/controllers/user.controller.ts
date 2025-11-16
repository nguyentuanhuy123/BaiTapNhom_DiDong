require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { redis } from "../utils/redis";
interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}
import { v2 as cloudinary } from "cloudinary";

export const registrationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body as IRegistrationBody;
    const isEmailExist = await userModel.findOne({ email });
    if (isEmailExist) {
      return next(new ErrorHandler("Email already exist", 400));
    }
    const newUser = await userModel.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role,
      },
    });
  }
);
interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as ILoginRequest;

    if (!email || !password) {
      return next(new ErrorHandler("Please enter email and password", 400));
    }

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        courses: user.courses,
      },
    });
  }
  
);
export const getUserById = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    if (!userId) {
      return next(new ErrorHandler("User ID is required", 400));
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        courses: user.courses,
      },
    });
  }
);
interface IUpdateUserInfo {
  userId: string;
  name?: string;
}

export const updateUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, name } = req.body as IUpdateUserInfo;

    console.log("updateUserInfo called:", req.body); // debug

    if (!userId) {
      return next(new ErrorHandler("User ID is required", 400));
    }

    const user = await userModel.findById(userId);
    if (!user) return next(new ErrorHandler("User not found", 404));

    if (name) user.name = name;

    await user.save();
    await redis.set(userId, JSON.stringify(user));

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user,
    });
  }
);

// 2️⃣ Update user password
interface IUpdatePassword {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

export const updatePassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return next(new ErrorHandler("Please enter old and new password", 400));
    }

    const user = await userModel.findById(userId).select("+password");
    if (!user) return next(new ErrorHandler("User not found", 404));

    const isPasswordMatch = await user.comparePassword(oldPassword);
    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid old password", 400));
    }

    // Cập nhật mật khẩu + hash tự động
    user.password = newPassword;
    await user.save();

    // Cập nhật Redis
    await redis.set(userId, JSON.stringify(user));

    // Tạo token mới
    const token = user.getJwtToken();

    res.status(201).json({
      success: true,
      message: "Password updated successfully!",
      token,
      user,
    });
  }
);


interface IUpdateProfilePicture {
  userId: string;
  avatar: string;
}
export const updateProfilePicture = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, avatar } = req.body as IUpdateProfilePicture;

    try {
      console.log("Received updateProfilePicture request:", { userId, avatarPreview: avatar?.slice(0, 30) + "..." });

      const user = await userModel.findById(userId);
      if (!user) return next(new ErrorHandler("User not found", 404));

      if (avatar) {
        if (user.avatar?.public_id) {
          console.log("Deleting old avatar:", user.avatar.public_id);
          await cloudinary.uploader.destroy(user.avatar.public_id);
        }

        console.log("Uploading new avatar to Cloudinary...");
        const myCloud = await cloudinary.uploader.upload(avatar, {
          folder: "avatars",
          width: 150,
          crop: "scale",
        });

        console.log("Upload successful:", { public_id: myCloud.public_id, url: myCloud.secure_url });

        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      await user.save();
      await redis.set(userId, JSON.stringify(user));

      console.log("User saved successfully:", { _id: user._id, avatar: user.avatar });
      res.status(200).json({
        success: true,
        message: "Profile picture updated successfully!",
        user,
      });
    } catch (err) {
      console.error("Error in updateProfilePicture:", err);
      next(err);
    }
  }
);

export const checkEmailExists = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) return next(new ErrorHandler("Email is required", 400));

    const user = await userModel.findOne({ email });
    if (!user) return next(new ErrorHandler("Email not found", 404));

    res.status(200).json({
      success: true,
      message: "Email exists",
      userId: user._id, // trả về để frontend chuyển sang reset password
    });
  }
);
interface IUpdatePassword {
  userId: string;
  newPassword: string;
}
export const resetPassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword)
      return next(new ErrorHandler("UserId and newPassword are required", 400));

    const user = await userModel.findById(userId).select("+password");
    if (!user) return next(new ErrorHandler("User not found", 404));

    user.password = newPassword; // hash tự động khi save
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully!",
    });
  }
);


