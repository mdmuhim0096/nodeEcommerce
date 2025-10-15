import express from "express";
import { getAllProduct, getAllFeaturedProduct, createProduct, deleteProduct, recommendedproducts, getproductbycategory, togleFeaturedProducts } from "../controllers/product.controller.js";
import { protectRoute, isAdmin } from "../middlewar/auth.middleware.js";
import { upload } from "../middlewar/uploader.js";
const route = express.Router();

route.get("/", protectRoute, isAdmin, getAllProduct);
route.get("/featured", getAllFeaturedProduct);
route.get("/recommendedproducts", recommendedproducts);
route.get("/category/:category", getproductbycategory);
route.patch("/:id", protectRoute, isAdmin, togleFeaturedProducts);
route.post("/", protectRoute, isAdmin, upload.single("image"), createProduct);
route.delete("/:id", protectRoute, isAdmin, deleteProduct);
export default route;
