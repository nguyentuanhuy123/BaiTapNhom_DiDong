import express from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import {
  createMobileOrder,
  newPayment,
  sendStripePublishableKey,
} from "../controllers/order.controller";
const orderRouter = express.Router();

orderRouter.post("/create-mobile-order", createMobileOrder);

orderRouter.get("/payment/stripepublishablekey", sendStripePublishableKey);

orderRouter.post("/payment", newPayment);

export default orderRouter;
