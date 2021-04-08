const mongoose = require('mongoose');
//let connectMongo=require("../config/databaseMongo")
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    id:String,
    brandProduct:{
        type:String,
        required:true
    },
    categoryProduct:{
        type:String,
        required:true
    },
    buyNum:{
        type:Number,
        min:[0,"buyNum must be positive"],
        validate : {
            validator : Number.isInteger,
            message   : 'buyNum is not an integer value'
        },
         default: 0 
    },
    discountProduct:{ type: String, default: "none" },
    explanationproduct:{ type: String, default: "" },
    headerProduct:{
        type:String,
        required:true
    },
    imgSrc:[String],
    macatProduct:{ type: String, default: "" },
    moreInfoProduct:{ type: String, default: "" },
    priceProduct:{
        type:String,
        required:true
    },
    shortExplanation:{ type: String, default: "" },
    similarProducts:{ type: String, default: "" },//array of strings-headerProduct***
    stockProduct:{
        type:String,
        required:true
    }
},{ versionKey: false });

ProductSchema.plugin(aggregatePaginate);

const ProductModel = mongoose.model('products', ProductSchema);

module.exports = ProductModel;