const express = require("express");
const router = express.Router();
const { createProduct, allProducts, productsSeeder } = require("../controllers/productController");
const { isAuthenticated } = require("../middleware/auth");


/////Routes ////    /api/v1
router.post("/product/create", isAuthenticated, createProduct);
router.get("/products", isAuthenticated, allProducts);
router.get("/products/seeder", productsSeeder);


module.exports = router;