import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProduct = async (req, res) => {
    try {
        const product = await Product.find();
        res.json(product);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "server error", error: error.message })
    }
}

const uploadToCloudinary = (buffer, folder = "products", resourceType = "image") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType }, // auto detects image/video/raw
            (error, result) => {
                if (error) {
                    console.error("Cloudinary error:", error);
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        stream.end(buffer);
    });
};


export const getAllFeaturedProduct = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_products");
        if (featuredProducts) {
            return res.status(200).json(JSON.parse(featuredProducts));
        }
        featuredProducts = await Product.find({ isFeatured: true }).lean();
        if (!featuredProducts) {
            return res.status(404).json({ message: "products not found 404" });
        }

        await redis.set("featured_products", JSON.stringify(featuredProducts));
        res.json(featuredProducts);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "server error", error: error.message })
    }
}

export const createProduct = async (req, res) => {
    try {
        const { name, description, category, price } = req.body;
        let cloudInaryResponse = null;

        if (req.file) {
            cloudInaryResponse = await uploadToCloudinary(req.file.buffer);
        }

        const product = new Product({ name, description, category, price, image: cloudInaryResponse.secure_url ? cloudInaryResponse.secure_url : "" });
        const data = await product.save();
        res.status(201).json({ message: "product created successfully", data });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "server error", error: error.message })
    }
}


export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "fproduct not found 404" });
        }
        const publicId = product.image.split("/").pop().split(".")[0];
        try {
            await cloudinary.uploader.destroy(`products/${publicId}`);
        } catch (error) {
            console.log("error deleting product", error.message);
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "product deleted" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "server error", error: error.message })
    }
}

export const recommendedproducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            { $sample: { size: 3 } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1,
                }
            }
        ]);
        res.json(products)
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "server error", error: error.message })
    }
}

export const getproductbycategory = async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.category });
        res.json(products);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "server error", error: error.message })
    }
}

export const togleFeaturedProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.isFeatured = !product.isFeatured;
            const updateProduct = await product.save();
            await updateFeaturedProductCache();
            res.json(updateProduct);
        } else {
            return res.status(404).json({ message: "product not found" });
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "server error", error: error.message })
    }
}

async function updateFeaturedProductCache() {
    try {
        const featurdProducts = await Product.find({ isFeatured: true }).lean();
        redis.set("featured_products", JSON.stringify(featurdProducts));
    } catch (error) {
        console.log("error in update featured product cache");
    }
}