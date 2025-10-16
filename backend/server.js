
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { mongoDbConnect } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

// ✅ Load env once — no need for "../.env"
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));
app.use(morgan("dev"));

// ✅ Routers
import authRouter from "./routes/auth.router.js";
import productRouter from "./routes/product.router.js";
import cartRouter from "./routes/cart.router.js";
import cuponsRouter from "./routes/cupon.router.js";
import paymentRouter from "./routes/payment.router.js";
import analyticsRouter from "./routes/anlytics.router.js";

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/coupons", cuponsRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/analytics", analyticsRouter);

// ✅ Directory helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve frontend only in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    // ✅ Express 5+ fix: use regex literal instead of string
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
    });
}

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    mongoDbConnect();
});
