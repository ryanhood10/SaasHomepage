const express = require("express");
const router = express.Router();
const { allUsers, singleUser } = require('../controllers/userController');
const { isAuthenticated } = require("../middleware/auth");

/////Routes ////    /api/v1
//router.get('/allusers', allUsers);
router.get('/allusers', isAuthenticated, allUsers);
router.get('/user/:id', isAuthenticated, singleUser);
//User edit his own info



module.exports = router; 