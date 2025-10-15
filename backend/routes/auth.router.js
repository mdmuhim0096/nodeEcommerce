import express from "express";
const route = express.Router();

import { logincontroller as login, logoutcontroller as logout, signupcontroller as signup, refreshToken, getProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewar/auth.middleware.js";

route.post("/signup", signup);
route.post("/login", login);
route.post("/logout", logout);
route.post("/refresh-token", refreshToken);
route.get("/profile", protectRoute, getProfile)

export default route;