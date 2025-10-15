import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT, { expiresIn: "7d" });
    const refreshToken = jwt.sign({ userId }, process.env.RJWT, { expiresIn: "100d" });
    return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60);
};

const setCookies = (res, accessToken, refreshToken) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
    };

    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 100 * 24 * 60 * 60 * 1000,
    });
};

// Controller: Signup
export const signupcontroller = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User({ email, name, password });
        const user = await newUser.save();

        const { refreshToken, accessToken } = generateToken(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookies(res, accessToken, refreshToken);

        res.status(201).json({
            message: "User created",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Controller: Login (to be implemented)
export const logincontroller = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find single user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateToken(user._id);

        // Store refresh token (in Redis for example)
        await storeRefreshToken(user._id, refreshToken);

        // Set cookies
        setCookies(res, accessToken, refreshToken);

        // Success response
        res.status(200).json({
            message: "Login success",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name, // add only safe fields (avoid sending password)
            },
        });

    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Controller: Logout
export const logoutcontroller = async (req, res) => {
    try {

        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.RJWT);
            await redis.del(`refresh_token:${decoded.userId}`);
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.json({ message: "Logout successfully" });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(404).json({ message: "No refresh token provided" });
        }

        const decode = jwt.verify(refreshToken, process.env.RJWT);
        const storedToken = await redis.get(`refresh_token:${decode.userId}`);

        if (storedToken !== refreshToken) {
            return res.status(401).json({ message: "Refresh token mismatch" });
        }

        const accessToken = jwt.sign(
            { userId: decode.userId },
            process.env.JWT,
            { expiresIn: "7d" }
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({ message: "Access token refreshed successfully" });

    } catch (error) {
        console.error("Refresh Token Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "server error" });
    }
}