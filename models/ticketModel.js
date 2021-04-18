const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const Schema = mongoose.Schema;


const ticketSchema = new Schema({
    id:String,
    name:{ type: String, default: "" },
    email:{ type: String, default: "" },
    phone:{ type: String, default: "" },
    message:{ type: String, default: "" },
    comments:{ type: String, default: "" },//comments of admin
    status:{ type: String, default: "PENDING" },
},{ versionKey: false,timestamps: true });

ticketSchema.plugin(aggregatePaginate);

const ticketModel = mongoose.model('tickets', ticketSchema);

module.exports = ticketModel;