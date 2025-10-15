import express from "express";
const route = express.Router();
import { getCupon, varlidateCupon } from "../controllers/cupon.controller.js";
import { protectRoute, isAdmin } from "../middlewar/auth.middleware.js";

route.get("/", protectRoute, getCupon);
route.post("/validateCupon", protectRoute, varlidateCupon);

export default route;