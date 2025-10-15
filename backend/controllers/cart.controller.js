import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const addToCart = async (req, res) => {

    try {
        const { productId } = req.body;
        const user = req.user;
        let existingItem = user.cartItems.find(item => item.product?.toString() === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            user.cartItems.push({ product: productId, quantity: 1 });
        }

        await user.save();
        res.json(user.cartItems);

    } catch (error) {
        console.error("Error in cart router:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }

};

export const removeAllFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        if (!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems?.filter(item => item.product?.toString() !== productId);
        }

        await user.save();
        res.json(user.cartItems);

    } catch (error) {
        console.log("error in cart router", error);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

export const updateQuantity = async (req, res) => {
    try {
        const { quantity, productId } = req.body;
        const user = req.user;

        const existingItem = user.cartItems?.find(
            item => item.product?.toString() === productId
        );

        if (!existingItem) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        if (quantity === 0) {
            user.cartItems = user.cartItems.filter(
                item => item.product?.toString() !== productId
            );
        } else {

            existingItem.quantity = quantity;
        }

        await user.save();
        res.json(user.cartItems);

    } catch (error) {
        console.error("Error in cart router:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getCatProduct = async (req, res) => {
    try {

        const cartItems = req.user.cartItems;
        const itemsId = cartItems?.map(item => item?.product);
        const product = await Product.find({ _id: { $in: itemsId } });
        const cartItem = product?.map(product => {
            const item = cartItems?.find((item => item?.product?.toString() === product?._id?.toString()));
            return { ...product.toJSON(), quantity: item?.quantity }
        });
        res.json(cartItem);
    } catch (error) {
        console.log("error in cart router", error);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

export const clearUserCartItem = async (req, res) => {
    try {
        const { user } = req;
        const _user_ = await User.findById(user);
        if (!_user_) return res.status(404).json({ message: "user not found" });
        _user_.cartItems = [];
        const response = await _user_.save();
        res.status(200).json({ message: "user item is clear", item: response.cartItems });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" });
    }
}
