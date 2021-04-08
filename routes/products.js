var express = require('express');
var router = express.Router();
let productsController=require("../controllers/productsController")
const passport = require('passport');

router.get('/', productsController.findAllProducts);
router.get('/:id',productsController.getOneProduct );
router.post('/',passport.authenticate('jwt', { session: false }),productsController.addOneProduct );//אולי להוסיף בדיקה אם המשתמש הזה מהטוקן הוא אדמין*** 
router.put('/:id',passport.authenticate('jwt', { session: false }),productsController.updateProduct );
router.delete('/:id',passport.authenticate('jwt', { session: false }),productsController.deleteProduct );


module.exports = router;
