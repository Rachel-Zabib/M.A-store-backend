
let ticketModel=require("../models/ticketModel")
var transporterEmail = require('../config/mail.conf')

exports.findAllTickets= async (req,res)=>{
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
            docs: 'tickets'
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
        const myAggregate = ticketModel.aggregate(aggregate_options);
        const result = await ticketModel.aggregatePaginate(myAggregate, options);
        res.setHeader('Content-Range', `tickets ${offset}-${end}/${result.totalResults}`)
        return res.send(result.tickets)
    }
    catch(err){
        return res.status(400).send(err.message);
    }
   
}

exports.getOneTicket=async (req,res)=>{
    try{
        let ticket=await ticketModel.findById(req.params.id).exec();
        return res.send(ticket)
    }
    catch(err){
        return res.status(400).send(err.message);
    }
}

exports.addOneTicket=async (req,res)=>{
    try{
        let ticket=await ticketModel.create(req.body);
        const response = await ticketModel.updateOne({_id: ticket._id},{id:ticket._id});//add id to document(for react admin)
        sendEmailToClient(req,ticket._id);//request: add ticket from client so we need to send a email 
        ticket.id=ticket._id;
        return res.send(ticket)
    }
    catch(err){
        return res.status(400).send(err.message);
    }
}

exports.updateTicket=async (req,res)=>{
    try{
        const ticket = await ticketModel.findByIdAndUpdate(req.params.id,req.body,{ new: true });
        if(ticket.status=="ACCEPTED"||ticket.status=="REJECTED")
            sendEmailUpdateToClient(ticket);
        return res.send(ticket)
    }
    catch(err){
        return res.status(400).send(err.message);
    } 
}
exports.deleteTicket=async (req,res)=>{
    try{
        const ticket = await ticketModel.findByIdAndDelete(req.params.id);
        if(ticket==null){
            return res.status(400).send("ticket not found")
        }
        return res.send(ticket)
    }
    catch(err){
        return res.status(400).send(`ticket "${err.value} " not found`);
    } 
}

function sendEmailToClient(req,ticketId){
    const subject = `Apply no. ${ticketId} sent`
    const html = `<p>Thank you for your message. <br/>Your inquiry tracking number is ${ticketId} and is currently pending for follow-up.<br/> We will get back to you as soon as possible. <br/><br/> Thank you for your patience,<br/>
    Makeup Art</p> `
    let email={
        from:process.env.EMAIL_ACCOUNT,
        to:req.body.email,
        subject,
        html
    }
    transporterEmail.sendMail(email, (err, data)=>{
        if(err)
          console.log("err: ",err);
        else
            console.log(data);
    })
}

function sendEmailUpdateToClient(ticket){
    const subject = `Follow-up regarding Apply no. ${ticket._id}`
    const html = `<p>Dear ${ticket.name}, <br/> The status of your inquiry no. ${ticket._id} from ${ticket.createdAt} is now ${ticket.status}.<br/> Details: ${ticket.comments}<br/><br/> Best regards,<br/>
    Makeup Art</p> `
    let email={
        from:process.env.EMAIL_ACCOUNT,
        to:ticket.email,
        subject,
        html
    }
    transporterEmail.sendMail(email, (err, data)=>{
        if(err)
          console.log("err: ",err);
        else
            console.log(data);
    })
}