import mongoose from "mongoose";

const cuponSchema = new mongoose.Schema({
    code: {
        type:String,
        required: true,
        unique: true
    },
    discountPercentage:{
        type:Number,
        required: true,
        min: 0,
        max: 100
    },
    expirationDate:{
        type: Date,
        required: true,
    },
    isActive:{
        type:Boolean,
        required: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    }

}, {timestamps: true});

const Cupon = mongoose.model("Cupone", cuponSchema);
export default Cupon;
