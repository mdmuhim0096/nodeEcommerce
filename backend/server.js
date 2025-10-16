import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";

import { mongoDbConnect } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config({path: "../.env"});

const app = express();
app.use(express.json());

import authRouter from "./routes/auth.router.js";
import productRouter from "./routes/product.router.js"
import cartRouter from "./routes/cart.router.js";
import cuponsRouter from "./routes/cupon.router.js";
import paymentRouter from "./routes/payment.router.js";
import anlyticsRouter from "./routes/anlytics.router.js";

app.use(cookieParser());
app.use(cors({ credentials: true }));
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/coupons", cuponsRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/analytics", anlyticsRouter);

console.log(process.env.CLIENT_URL);

const ___dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(___dirname, "/frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(___dirname, "frontend", "dist", "index.html"))
    })
}

const PORT = process.env.PORT;
app.listen(PORT, () => { console.log(`http://localhost:${PORT}`); mongoDbConnect(); });