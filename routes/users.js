var express = require('express');
var router = express.Router();
let userController=require("../controllers/usersController")
const passport = require('passport');

router.get('/', userController.findAllUsers);
router.get('/:id',userController.getOneUser );
router.post('/',userController.addOneUser );
router.put('/:id',passport.authenticate('jwt', { session: false }),userController.updateUser );
router.delete('/:id',passport.authenticate('jwt', { session: false }),userController.deleteUser );

 router.post('/login',userController.login)
router.post('/signup',userController.signup)

router.get("/login/google", passport.authenticate("google", {
    scope: ["profile", "email"]
  }));
  
  router.get("/login/google/redirect",passport.authenticate('google'),(req,res)=>{
    res.redirect(`http://localhost:3000/token/${req.user.token}/${req.user._doc._id}`)
    //res.send(req.user);
    //res.send("you reached the redirect URI");
  });
  


module.exports = router;

