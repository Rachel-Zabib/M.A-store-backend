
let userModel=require("../models/userModel")
const bcrypt = require('bcrypt');

exports.findAllUsers= async (req,res)=>{
    // try{
    //     let users=await userModel.find({});
    //     return res.json({error:false,message:"success",users})
    // }
    // catch(err){
    //     return res.json({error:true,message:"failed to get users"})
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
            docs: 'users'
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
            else
                match[property] = {$regex: ""+filter[property], $options: 'i'};
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
        const myAggregate = userModel.aggregate(aggregate_options);
        const result = await userModel.aggregatePaginate(myAggregate, options);
        res.setHeader('Content-Range', `users ${offset}-${end}/${result.totalResults}`)
        //send user without password and googleId
        let usersArray=result.users.map((user)=>{
            let {firstName,lastName,city,street,apartment, building, post,phone, role,active,_id,email,id}=user;
            return {firstName,lastName,city,street,apartment, building, post,phone, role,active,_id,email,id}
        })
        return res.send(usersArray)
    }
    catch(err){
        return res.status(400).send(err.message);
    }
   
}

exports.getOneUser=async (req,res)=>{
    try{
        let user=await userModel.findById(req.params.id).exec();
        let {firstName,lastName,city,street,apartment, building, post,phone, role,active,_id,email,id}=user;//send user without password and googleId
        return res.send({firstName,lastName,city,street,apartment, building, post,phone, role,active,_id,email,id})
    }
    catch(err){
        return res.status(400).send(err.message);
    }
}

exports.addOneUser=async (req,res)=>{
    try{
        let user=await userModel.create(req.body);
        const response = await userModel.updateOne({_id: user._id},{id:user._id});//add id to document(for react admin)
        user.id=user._id;
        user.password="";
        return res.send(user)
    }
    catch(err){
        console.log(err)
        return res.status(400).send(err.message);
    }
}

exports.updateUser=async (req,res)=>{
    try{
        const response = await userModel.updateOne({ _id: req.params.id },req.body);
        return res.send(req.body);
    }
    catch(err){
        return res.status(400).send(err.message); 
    } 
}
exports.deleteUser=async (req,res)=>{
    try{
        const user = await userModel.findByIdAndDelete(req.params.id);
        if(user==null){
            return res.status(400).send("user not found")
        }
        return res.send(user)
    }
    catch(err){
        return res.status(400).send(`user "${err.value} " not found`);
    } 
}


exports.signup=async (req,res)=>{
  let newUser=req.body;
  try{
      if(!newUser.email)    
         return res.send({error:true,message:"No email sent"})
      if(!req.body.password)
        return res.send({error:true,message:"No password sent"})
     let user= await userModel.findOne({email:newUser.email}).exec();
     if(user!=null){//The user already exists
        if(user.password==="")//The user already exists but with google auth(google auth put googleId and put password="")
        {
            req.body.password=await bcryptPassword(req.body.password)
            user=await userModel.findByIdAndUpdate(user._id,req.body,{ new: true });
            let token= user.generateJWT();
            let {firstName,lastName,city,street,apartment, building, post,phone, role,active,_id,email,id}=user;//send user without password and googleId
            user={firstName,lastName,city,street,apartment, building, post,phone, role,active,_id,email,id};
            return res.send({error:false,message:"success to signup",token,user})
        }
        else
            return res.send({error:true,message:"The user already exists"})
     }
     else{
        let user=await userModel.create(newUser);
        user=await userModel.findByIdAndUpdate(user._id,{id:user._id},{ new: true });
        let token= user.generateJWT();
        let {firstName,lastName,city,street,apartment, building, post,phone, role,active,_id,email,id}=user;//send user without password and googleId
        user={firstName,lastName,city,street,apartment, building, post,phone, role,active,_id,email,id};
        return res.send({error:false,message:"Success to signup",token,user})  
     }
  }
  catch(err){
      console.log(err)
    return res.status(400).send("failed to signup");
  }
}
async function bcryptPassword(password) {//async function return promise
    if(password){
        let salt=parseInt(process.env.SALT_BCRYPT);
        const hash = await bcrypt.hash(password,salt);
        return hash;
    }
    else
        return "";
}

exports.login=async (req,res)=>{
    let {email,password}=req.body;
    if(!email||!password)
        return res.send({error:true,message:"No email or password sent"})
    try{ 
       let user= await userModel.findOne({email:email}).exec();
       if(user==null){//The user not exists
            return res.send({error:true,message:"User not found"})
       }
       else{
            if(await user.isValidPassword(password)){
                let token= user.generateJWT();
                let {firstName,lastName,city,street,apartment, building, post,phone, role,active,_id,email,id}=user;//send user without password and googleId
                user={firstName,lastName,city,street,apartment, building, post,phone, role,active,_id,email,id};
                return res.send({error:false,message:"Logged in Successfully",token,user})
            }
            else
                return res.send({error:true,message:"Wrong Password"})
       }
    }
    catch(err){
      console.log(err)
      return res.status(400).send("failed to login");
    }
  }