var express = require('express');
var router = express.Router();
let ticketController=require("../controllers/ticketsController")
const passport = require('passport');

router.get('/',passport.authenticate('jwt', { session: false }),ticketController.findAllTickets);//אולי להוסיף בדיקה אם המשתמש הזה מהטוקן הוא אדמין*** 
router.get('/:id',passport.authenticate('jwt', { session: false }),ticketController.getOneTicket );
router.post('/',ticketController.addOneTicket );
router.put('/:id',passport.authenticate('jwt', { session: false }),ticketController.updateTicket );
router.delete('/:id',passport.authenticate('jwt', { session: false }),ticketController.deleteTicket );


module.exports = router;
