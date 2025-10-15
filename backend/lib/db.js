import mongoose from "mongoose";

export const mongoDbConnect = async () => {
  try {
    const connection = await mongoose.connect(process.env.DB);
    console.log(`mongodb connected: ${connection.connection.host}`)
  } catch (error) {
    console.log("error connect mongoDB", error.message);
    process.exit(1);
  }
}

