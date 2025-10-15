import express from "express";
const route = express.Router();
import { protectRoute } from "../middlewar/auth.middleware.js";
import { createCheckoutSession, checkoutSuccess } from "../controllers/payment.controller.js"

route.post("/create-checkout-session", protectRoute, createCheckoutSession)
route.post("/checkout-success", protectRoute, checkoutSuccess);

export default route;