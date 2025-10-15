import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized - no provided access token" });
        }
        try {
            const decode = jwt.verify(accessToken, process.env.JWT);
  
            const user = await User.findById(decode.userId); 

            if (!user) {
                return res.status(401).json({ message: "user not found", user });
            };

            req.user = user;
            next();
        } catch (error) {
            if(error.name === "TokenExpiredError"){
                return res.status(401).json({message: "Unauthorized - Access token expired"})
            }
            throw error;
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "server error", error: error.message })
    }
}

export const isAdmin = (req, res, next) => {
    if(req.user && req.user.role === "admin"){
        next();
    }else{
        return res.status(403).json({message: "Access denied only admin"});
    }
}