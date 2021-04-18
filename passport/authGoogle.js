const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
require("dotenv").config();
let userModel=require("../models/userModel")
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID  ,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/api/users/login/google/redirect"
  },
  async function(accessToken, refreshToken, profile, done) {
    userModel.findOne({email:profile._json.email}).then(async (currentUser)=>{
        if(currentUser){  //if we already have a record with the given email
            if(currentUser.googleId===null||currentUser.googleId===""||currentUser.googleId!== profile.id)//if we already have a record with the given email but not with google auth
            {
                user=await userModel.findByIdAndUpdate(currentUser._id,{googleId:profile.id},{ new: true });//can to take image from profile
                let token=user.generateJWT();
                user.token=token;
                done(null, user);//put the object in req.user
            }
            else{
                if(currentUser.googleId=== profile.id){//if we already have a record with the given email and with google auth
                    let token=currentUser.generateJWT();
                    currentUser.token=token;
                    done(null, currentUser);
                }
            }
        } else{
             //if not, create a new user
             user=await userModel.create({googleId:profile.id,email: profile._json.email,firstName: profile.displayName});//can to take image from profile
             user=await userModel.findByIdAndUpdate(user._id,{id:user._id},{ new: true });
             let token=user.generateJWT();
             user.token=token;
             done(null, user); 
         } 
      })
  }
));
passport.serializeUser((userModel, done) => {
    done(null, userModel);
  })
  
  passport.deserializeUser((userModel, done) => {
    done(null, userModel);
  })

// passport.serializeUser((googleUserModel, done) => {
//     done(null, googleUserModel.id);
//   });

//   passport.deserializeUser((id, done) => {
//     googleUserModel.findById(id).then(user => {
//       done(null, user);
//     });
//   });



  