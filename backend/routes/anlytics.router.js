import express from "express";
const route = express.Router();
import { protectRoute, isAdmin } from "../middlewar/auth.middleware.js";
import { getAnlyticsData, getDailySelesData } from "../controllers/anlytics.contollers.js";

route.get("/", protectRoute, isAdmin, async (req, res) => {
    try {
        const anylitcsData = await getAnlyticsData();
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const dailySelesData = await getDailySelesData(startDate, endDate);
        res.json({anylitcsData, dailySelesData});
    } catch (error) {
        console.log("error in cart router", error);
        res.status(500).json({ message: "server error", error: error.message });
    }
})

export default route;