import Cupon from "../models/cupons.model.js";

export const getCupon = async (req, res) => {
    try {
        const cupon = await Cupon.findOne({ userId: req.user._id, isActive: true });
        res.json(cupon || null);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "server error ", error: error.message })
    }
}

export const varlidateCupon = async (req, res) => {
    try {
        const { code } = req.body;
        const cupon = await Cupon.findOne({ code: code, userId: req.user._id, isActive: true })

        if (!cupon) {
            return res.status(404).json({ message: "cupon not found 404" });
        }
        if (cupon.expirationDate < new Date()) {
            cupon.isActive = false,
                await cupon.save();
            return res.status(401).json({ message: "cupon is expired" });
        }
        res.json({ message: "cuopn is valid", code: cupon.code, discountPercentage: cupon.discountPercentage })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "server error ", error: error.message })
    }
}
