const Product = require('../models/product');
const ErrorResponse = require('../utils/errorResponse');



exports.createProduct = async (req, res, next) => {

    try {

        const {
            name,
            description,
            price,
            countStock,
        } = req.body;

        const product = await Product.create({
            name,
            description,
            price,
            countStock,
        });

        res.status(200).json({
            success: true,
            product

        });

    } catch (err) {
        next(err);
    }
}



exports.allProducts = async (req, res, next) => {

    // enable pagination
    const pageSize = 8;
    const page = Number(req.query.pageNumber) || 1;
    const count = await Product.find().countDocuments();

    try {
        const products = await Product.find().sort({ createdAt: -1 })
            .skip(pageSize * (page - 1))
            .limit(pageSize)

        res.status(200).json({
            success: true,
            products,
            page,
            pages: Math.ceil(count / pageSize),
            count
        })
        next();
    } catch (error) {
        return next(new ErrorResponse('Server error', 500));
    }
}

//create products seeder
exports.productsSeeder = async (req, res, next) => {
    // create an array of documents to insert
    const data = [
        { name: "Headphone", description: "Lorem ipsu lorem", price: 30, countStock: 5 },
        { name: "LG", description: "Lorem ipsu lorem", price: 1200, countStock: 2 },
        { name: "Samsung", description: "Lorem ipsu lorem", price: 800, countStock: 3 },
        { name: "Iphone", description: "Lorem ipsu lorem", price: 2000, countStock: 5 },
        { name: "LG", description: "Lorem ipsu lorem", price: 300, countStock: 8 },
        { name: "Phone protection", description: "Lorem ipsu lorem", price: 30, countStock: 7 },
    ];
    // this option prevents additional documents from being inserted if one fails
    const options = { ordered: true };
    try {
        const products = await Product.insertMany(data, options);
        res.status(201).send(products);
        //console.log(`${products.insertedCount} documents were inserted`);
    } catch (error) {
        console.log(error);
    }
}


