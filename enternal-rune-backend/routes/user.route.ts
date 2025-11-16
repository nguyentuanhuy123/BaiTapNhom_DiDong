import express from "express";
import {
  loginUser,
  registrationUser,
  updatePassword,
  updateProfilePicture,
  updateUserInfo,
  getUserById,
  checkEmailExists, resetPassword 
} from "../controllers/user.controller";

import { authorizeRoles, isAutheticated } from "../middleware/auth";
const userRouter = express.Router();

userRouter.post("/registration", registrationUser);

userRouter.post("/login", loginUser);
userRouter.put("/update-user-info", updateUserInfo);

userRouter.put("/update-user-password", updatePassword);

userRouter.put("/update-user-avatar", updateProfilePicture);
userRouter.get("/user/:id", getUserById);
// forgot password
userRouter.post("/forgot-password", checkEmailExists);

// reset password
userRouter.put("/reset-password", resetPassword);
export default userRouter;
