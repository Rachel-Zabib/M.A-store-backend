let productModel=require("../models/productModel");

const limit_ = 1000;

exports.findAllProducts= async (req,res)=>{
    // try{
    //     let products=await productModel.find({});
    //     return res.json({error:false,message:"success",products:products})
    // }
    // catch(err){
    //     return res.json({error:true,message:"failed to get products"})
    // }

    let aggregate_options = [];
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
            docs: 'products'
        }
    };

    //FILTERING AND PARTIAL TEXT SEARCH
    let match = {};

    //filter- use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
    if (req.query.filter) {
       let filter=JSON.parse(req.query.filter)
        for(let property in filter){
            if(property=="buyNum")
                match.buyNum = {$gte: +filter[property], $lt: +filter[property]+1};
            else{
                if(Array.isArray(filter[property]))
                {
                    match[property] = { "$in": filter[property] };
                }
                else
                     match[property] = {$regex: ""+filter[property], $options: 'i'};
            }
                
        }
       
    }
    aggregate_options.push({$match: match});
    
    //SORTING
    if(req.query.sort){
        let sort=req.query.sort.slice(1,req.query.sort.length-1).split(",")
        sort[0]=sort[0].slice(1,sort[0].length-1);
        sort[1]=sort[1].slice(1,sort[1].length-1);
        let sortOrder =  sort[1].toLowerCase() === 'desc' ? -1 : 1;
        let field=sort[0];
        aggregate_options.push({$sort: {[field]: sortOrder}});
    }
    // Set up the aggregation
    try{
        const myAggregate = productModel.aggregate(aggregate_options);
        const result = await productModel.aggregatePaginate(myAggregate, options);
        res.setHeader('Content-Range', `products ${offset}-${end}/${result.totalResults}`)
        return res.send(result.products)
       // return res.json({error:false,message:"success",products:result.products})
    }
    catch(err){
        return res.status(400).send(err.message);
       // return res.json({error:true,message:"failed to get products"})
    }
   
}

exports.getOneProduct=async (req,res)=>{
    try{
        let product=await productModel.findById(req.params.id).exec();
        return res.send(product)
        //return res.json({error:false,message:"success",product:product})
    }
    catch(err){
        return res.status(400).send(err.message);
        //return res.json({error:true,message:"failed to get product"})
    }
}

exports.addOneProduct=async (req,res)=>{
    try{
       // console.log(req.body);
        let product=await productModel.create(req.body);
        const response = await productModel.updateOne({_id: product._id },{id:product._id});//add id to document(for react admin)
        return res.send({...product,id:product._id})
        // return res.json({error:false,message:"Product Added successfully",product:product})
    }
    catch(err){
        console.log(err)
        return res.status(400).send(err.message);
       // return res.json({error:true,message:"failed to add product"})
    }
}

exports.updateProduct=async (req,res)=>{
    try{
        const response = await productModel.updateOne({ _id: req.params.id },req.body);
        return res.send(req.body)//for react admin must send object with id key
        //return res.send(response)
       // return res.json({error: false,message: "product successfully updated"})
    }
    catch(err){
        return res.status(400).send(err.message);
       // return res.send({error: true,message:"error"});
    } 
}
exports.deleteProduct=async (req,res)=>{
    try{
        const product = await productModel.findByIdAndDelete(req.params.id);
        if(product==null){
            return res.status(400).send("Product not found");
           // return res.send({ error: true, message:"Product not found" });
        }
        return res.send(product)
       // return res.json({error: false,message: "product successfully deleted", product})
    }
    catch(err){
        //return res.status(400).send(err.message);
        return res.status(400).send(`Product "${err.value} " not found`);
    } 
}



