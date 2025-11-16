import {v2 as cloudinary} from "cloudinary";
import http from "http";
import connectDB from "./utils/db";
import { initSocketServer } from "./socketServer";
import { app } from "./app";
require("dotenv").config();
const server = http.createServer(app);


// cloudinary config
cloudinary.config({
 cloud_name: process.env.CLOUD_NAME,
 api_key: process.env.CLOUD_API_KEY,
 api_secret: process.env.CLOUD_SECRET_KEY,
});

cloudinary.api
  .ping()
  .then(() => console.log("✅ Cloudinary connected successfully!"))
  .catch((err) => console.error("❌ Cloudinary connection failed:", err));

initSocketServer(server);
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-08-16",
});
(async () => {
  try {
    const balance = await stripe.balance.retrieve();
    console.log("✅ Stripe connected successfully!");
    console.log(`💰 Available balance:`, balance.available);
  } catch (error: any) {
    console.error("❌ Stripe connection failed:", error.message);
  }
})();

// create server
server.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Server is connected with port ${process.env.PORT}`);
  connectDB();
});
