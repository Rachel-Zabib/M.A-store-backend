const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const Schema = mongoose.Schema;

const itemInOrder = new Schema({ 
    headerProduct:String,
    brandProduct:String,
    amountProduct:String,
    priceProduct:String,
    imgProduct:String
});

const orderSchema = new Schema({
    id:String,
    date:{ type: String, default: "" },
    //userId:String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name:{ type: String, default: "" },
    address:{ type: String, default: "" },
    comments:{ type: String, default: "" },
    itemsInOrder:[itemInOrder],
    totalOrder:{ type: String, default: "0" },
    totalItems:{ type: String, default: "0" },
    // totalItems:{
    //     type:Number,
    //     min:[0,"totalItems must be positive"],
    //     validate : {
    //         validator : Number.isInteger,
    //         message   : 'totalItems is not an integer value'
    //     }
    // },
    status:{ type: String, default: "" },
    refunded:{ type: String, default: "false" }
},{ versionKey: false,timestamps: true });

orderSchema.plugin(aggregatePaginate);

const orderModel = mongoose.model('orders', orderSchema);

module.exports = orderModel;