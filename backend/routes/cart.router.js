import express from "express";
const route = express.Router();
import { addToCart, removeAllFromCart, updateQuantity, getCatProduct, clearUserCartItem } from "../controllers/cart.controller.js";
import { protectRoute } from "../middlewar/auth.middleware.js";

route.get("/", protectRoute, getCatProduct);
route.post("/", protectRoute, addToCart);
route.delete("/", protectRoute, removeAllFromCart);
route.delete("/clearUserCartItems", protectRoute, clearUserCartItem);
route.put("/", protectRoute, updateQuantity);

export default route;