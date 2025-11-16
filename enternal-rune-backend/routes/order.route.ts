import express from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import {
  createMobileOrder,
  newPayment,
  sendStripePublishableKey,
  getUserOrders,
} from "../controllers/order.controller";
const orderRouter = express.Router();

orderRouter.post("/create-mobile-order", createMobileOrder);

orderRouter.get("/payment/stripepublishablekey", sendStripePublishableKey);
orderRouter.get("/user-orders/:userId", getUserOrders);
orderRouter.post("/payment", newPayment);

export default orderRouter;
