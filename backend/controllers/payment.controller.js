import Cupon from "../models/cupons.model.js";
import Stripe from "../lib/stripe.js";
import Order from "../models/order.model.js";

export const createCheckoutSession = async (req, res) => {
    try {
        const { products, cuponCode } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Invalid or empty product array" });
        }

        let totalAmount = 0;

        const line_items = products.map((product) => {
            const amount = Math.round(product.price * 100);
            totalAmount += amount * (product.quantity || 1);

            return {
                price_data: {
                    currency: "usd",
                    unit_amount: amount,
                    product_data: {
                        name: product.name,
                        images: product.image ? [product.image] : [],
                    },
                },
                quantity: product.quantity || 1,
            };
        });

        let cupon = null;
        let discounts = [];

        if (cuponCode) {
            cupon = await Cupon.findOne({
                code: cuponCode,
                userId: req.user._id,
                isActive: true,
            });

            if (cupon) {
                totalAmount -= Math.round((totalAmount * cupon.discountPercentage) / 100);
                const stripeCouponId = await createStripeCoupon(cupon.discountPercentage);
                discounts = [{ coupon: stripeCouponId }];
            }
        }

        const session = await Stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts,
            metadata: {
                userId: req.user._id.toString(),
                cuponCode: cuponCode || "",
                products: JSON.stringify(
                    products.map((p) => ({
                        id: p._id,
                        quantity: p.quantity,
                        price: p.price,
                    }))
                ),
            },
        });

        if (totalAmount >= 20000) {
            await createOrUpdateCupon(req.user._id);
        }

        res.status(200).json({
            id: session.id,
            totalAmount: totalAmount / 100,
        });

    } catch (error) {
        console.error("Checkout error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

async function createStripeCoupon(discountPercentage) {
    const coupon = await Stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    });
    return coupon.id;
}

// Helper: Create or update user coupon
async function createOrUpdateCupon(userId) {
    const code = "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const discountPercentage = Math.floor(Math.random() * (40 - 10) + 10);
    const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const cupon = await Cupon.findOneAndUpdate(
        { userId },
        {
            code,
            discountPercentage,
            expirationDate,
            isActive: true,
        },
        { upsert: true, new: true }
    );

    return cupon;
}

export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ message: "Missing sessionId" });
        }

        // Retrieve Stripe session
        const session = await Stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== "paid") {
            return res.status(400).json({ message: "Payment not completed" });
        }

        // Prevent duplicate orders for the same Stripe session
        const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
        if (existingOrder) {
            return res.status(400).json({ message: "Order already exists", orderId: existingOrder._id });
        }

        // Handle coupon if exists
        if (session.metadata?.cuponCode) {
            await Cupon.findOneAndUpdate(
                {
                    code: session.metadata.cuponCode,
                    userId: session.metadata.userId,
                },
                { isActive: false }
            );
        }

        // Parse products from session metadata
        const products = JSON.parse(session.metadata.products || "[]");

        // Create new order
        const newOrder = new Order({
            user: session.metadata.userId,
            products: products.map((product) => ({
                product: product.id,
                quantity: product.quantity,
                price: product.price,
            })),
            totalAmount: session.amount_total / 100,
            stripeSessionId: sessionId, // ✅ matches schema
        });

        await newOrder.save();

        res.json({
            success: true,
            message: "Payment successful",
            orderId: newOrder._id,
        });

    } catch (error) {
        console.error("Checkout Success Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
