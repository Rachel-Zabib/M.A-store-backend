var express = require('express');
var router = express.Router();
let ordersController=require("../controllers/ordersController")
const passport = require('passport');

router.get('/', ordersController.findAllOrders);
router.get('/seed',ordersController.seed );
router.get('/:id',ordersController.getOneOrder );
router.post('/',ordersController.addOneOrder );
//כאשר נשנה את הצד לקוח על הטוקנים אז להוסיף את האבטחה הזאת(כי הריאקט אדמין שולח טוקן)
// router.put('/:id',passport.authenticate('jwt', { session: false }),ordersController.updateOrder );
// router.delete('/:id',passport.authenticate('jwt', { session: false }),ordersController.deleteOrder );
router.put('/:id',ordersController.updateOrder );
router.delete('/:id',ordersController.deleteOrder );


module.exports = router;
