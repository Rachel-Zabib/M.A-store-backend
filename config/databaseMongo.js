let mongoose=require("mongoose");
require("dotenv").config()

mongoose.connect(`mongodb+srv://dbRachel:${process.env.MONGODB_PASS}@cluster0.nq9ib.mongodb.net/StoreDB?retryWrites=true&w=majority`,{  useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex: true,useFindAndModify: false })

mongoose.connection.on("connected",()=>{
    console.log("mongo db connected");
})