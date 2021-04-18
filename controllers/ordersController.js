
let orderModel=require("../models/orderModel")

exports.findAllOrders= async (req,res)=>{
    // try{
    //     let orders=await orderModel.find({});
    //     return res.json({error:false,message:"success",orders:orders})
    // }
    // catch(err){
    //     return res.json({error:true,message:"failed to get orders"})
    // }

    let aggregate_options = [];
    const limit_ = 1000;
    let offset=0;
    let end=24;
    let limit = limit_;
    //PAGINATION***
    if(req.query.range){
        req.query.range=JSON.parse(req.query.range);
        offset=parseInt(req.query.range[0])||0;
        end=+req.query.range[1]||24;
        limit = parseInt(+req.query.range[1]-(+req.query.range[0])+1) || limit_;
    }
    
    //set the options for pagination
    const options = {
        offset, limit,
        customLabels: {
            totalDocs: 'totalResults',
            docs: 'orders'
        }
    };

    //FILTERING AND PARTIAL TEXT SEARCH
    let match = {};

    //filter- use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
    if (req.query.filter) {
       let filter=JSON.parse(req.query.filter)
        for(let property in filter){
            if(Array.isArray(filter[property]))
            {
                match[property] = { "$in": filter[property] };
            }
            else{
                if(property=="date")
                    match["createdAt"] = {$gte:  new Date(filter[property])};
                else
                    match[property] = {$regex: ""+filter[property], $options: 'i'};
            }
               
        }
       
    }
    aggregate_options.push({$match: match});
    
    //SORTING
    if(req.query.sort){
        let sort=req.query.sort.slice(1,req.query.sort.length-1).split(",")
        sort[0]=sort[0].slice(1,sort[0].length-1);//remove ""
        sort[1]=sort[1].slice(1,sort[1].length-1);//remove ""
        let sortOrder =  sort[1].toLowerCase() === 'desc' ? -1 : 1;
        let field=sort[0];
        aggregate_options.push({$sort: {[field]: sortOrder}});
    }
    // Set up the aggregation
    try{
        const myAggregate = orderModel.aggregate(aggregate_options);
        const result = await orderModel.aggregatePaginate(myAggregate, options);
        res.setHeader('Content-Range', `orders ${offset}-${end}/${result.totalResults}`)
        return res.send(result.orders)
        //return res.json({error:false,message:"success",orders:result.orders})
    }
    catch(err){
        return res.status(400).send(err.message);
       // return res.json({error:true,message:"failed to get orders"})
    }
   
}

exports.getOneOrder=async (req,res)=>{
    try{
        let order=await orderModel.findById(req.params.id).exec();
        return res.send(order)
        //return res.json({error:false,message:"success",order:order})
    }
    catch(err){
        return res.status(400).send(err.message);
       // return res.json({error:true,message:"failed to get order"})
    }
}

exports.addOneOrder=async (req,res)=>{
    try{
        let order=await orderModel.create(req.body);
        const response = await orderModel.updateOne({_id: order._id},{id:order._id});//add id to document(for react admin)
        order.id=order._id
        return res.send(order)
        // return res.json({error:false,message:"order Added successfully",order:order})
    }
    catch(err){
        return res.status(400).send(err.message);
        //return res.json({error:true,message:"failed to add order"})
    }
}

exports.updateOrder=async (req,res)=>{
    try{
        const response = await orderModel.updateOne({ _id: req.params.id },req.body);
        return res.send(req.body)
        //return res.send(response)
        // return res.json({
        //     error: false,
        //     message: "order successfully updated"
        // })
    }
    catch(err){
        return res.status(400).send(err.message);
        // return res.send({
        //     error: true,
        //     message:"error"
        // });
    } 
}
exports.deleteOrder=async (req,res)=>{
    try{
        const order = await orderModel.findByIdAndDelete(req.params.id);
        if(order==null){
            return res.status(400).send("order not found")
            //return res.send({error: true,message:"order not found"});
        }
        return res.send(order)
       // return res.json({error: false, message: "order successfully deleted",order})
    }
    catch(err){
       // return res.status(400).send(err.message);
        return res.status(400).send(`Order "${err.value} " not found`);
    } 
}

exports.seed=async (req,res)=>{
    let orderObj={
        address: "ג/ג ראש העין ,ראש העין",
        comments: "",
        date: "04/04/2021 14:07",
        itemsInOrder: [
        {headerProduct: "LORIAL TRUE MATCH W2", brandProduct: "LORIAL PARIS", amountProduct: 1, priceProduct: "60", imgProduct: "https://ucare.co.il/images/catalog/make-up/W2.jpg"}
        ],
        name: "rachel zabib",
        status: "Received",
        totalItems: 1,
        totalOrder: "80₪",
        userId: "knueEgRAheWaYK0NfqEoa4xrK4D2"}
   
    try{
        let order=await orderModel.create(orderObj);
        const response = await orderModel.updateOne({_id: order._id},{id:order._id});//add id to document(for react admin)
        return res.json({error:false,message:"order Added successfully",order:order})
    }
    catch(err){
        console.log("err:",err)
        return res.json({error:true,message:"failed to add order"})
    }
}
