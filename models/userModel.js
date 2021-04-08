const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: String,
    email: {
        type: String,
        required: true,
        unique: true
      },
    password:{ type: String, default: "" },
    firstName:{ type: String, default: "" },
    lastName: { type: String, default: "" },
    city: { type: String, default: "" },
    street: { type: String, default: "" },
    apartment:{ type: String, default: "" }, 
    building:{ type: String, default: "" },
    post:{ type: String, default: "" },
    phone: { type: String, default: "" },
    role: { type: String, default: "user" },
    active: { type: String, default: "true" },
    googleId:String
},{ versionKey: false});

userSchema.plugin(aggregatePaginate);

userSchema.pre(
    'save',async function(next) {
                const user = this;
                if(this.password){
                    let salt=parseInt(process.env.SALT_BCRYPT);
                    const hash = await bcrypt.hash(this.password,salt);
                    this.password = hash;
                }
                else
                    this.password = "";

                // if(!this.googleId)  
                //     this.googleId="";
            
                
                next();
            }
  );
  


  userSchema.methods.isValidPassword = async function(password) {
    const user = this;
    const compare = await bcrypt.compare(password, user.password);
    return compare;
}

userSchema.methods.generateJWT=function (){
    let userData={
        id: this._id,
        email:this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        city: this.city,
        street: this.street,
        apartment: this.apartment,
        building:this.building,
        post:this.post,
        phone: this.phone,
        role: this.role,
        active: this.active
    }

    return jwt.sign(userData, process.env.TOKEN_SECRET, { expiresIn: '2d' })
}
//from hadar
// UserSchema.methods.generateJWT = function() {
//   const today = new Date();
//   const expirationDate = new Date(today);
//   expirationDate.setDate(today.getDate() + 60);

//   let payload = {
//       id: this._id,
//       email: this.email,
//       firstName: this.firstName,
//       lastName: this.lastName,
//       country: this.country,
//       city: this.city,
//       address: this.address,
//       zip: this.zip,
//       phone: this.phone,
//       role: this.role,
//       active: this.active
//   };

//   return jwt.sign(payload, process.env.JWT_SECRET, {
//       expiresIn: parseInt(expirationDate.getTime() / 1000, 10)
//   });
// };
const userModel = mongoose.model('users', userSchema);

module.exports = userModel;

