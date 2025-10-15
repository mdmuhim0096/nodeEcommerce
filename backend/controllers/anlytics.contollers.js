import User from "../models/user.model.js"
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

export const getAnlyticsData = async () => {
    const totalUser = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const selesData = await Order.aggregate([{
        $group: {
            _id: null,
            totalSeles: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" }
        }
    }]);

    const { totalSeles, totalRevenue } = selesData[0] || { totalSeles: 0, totalRevenue: 0 }

    return { users: totalUser, products: totalProducts, totalSeles, totalRevenue };
}

export const getDailySelesData = async (startDate, endDate) => {
    try {
        const dailySelesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    seles: {
                        $sum: 1
                    },
                    revenue: {
                        $sum: "$totalAmount"
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);

        const dateArray = getDatesInRange(startDate, endDate);
        return dateArray.map(date => {
            const foundData = dailySelesData.find(item => item._id === date)
            return {
                date,
                seles: foundData?.seles || 0,
                revenue: foundData?.revenue || 0
            }
        })
    } catch (error) {
        throw error;
    }
}

function getDatesInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}