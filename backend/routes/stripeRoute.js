const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const {
    listOfSubcription,
    manageSubscription,
    subscribeToPlan
} = require('../controllers/stripeController');


/////Routes ////    /api/v1
router.get('/stripe/priceslist', listOfSubcription);
router.post('/stripe/subscribe/plan', isAuthenticated, subscribeToPlan);
router.get('/stripe/managesubscription', isAuthenticated, manageSubscription);


module.exports = router; 