import Product from '../models/productModel.js';
import asyncHandler from 'express-async-handler'

const getProducts = asyncHandler(
    async (req, res) => {

        const pageSize = 4;
        const page = Number(req.query.pageNumber) || 1;
        const keyword = req.query.keyword ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i'
            }
        } : {}


        const count = await Product.countDocuments({ ...keyword })
        const products = await Product.find({ ...keyword }).limit(pageSize).skip(pageSize * (page - 1))

        if (products.length) {
            res.json({ products, page, pages: Math.ceil(count / pageSize) })
        } else {
            res.status(404);
            throw new Error('product not found')
        }

    })


const getProductById = asyncHandler(
    async (req, res) => {
        const product = await Product.findById(req.params.id)

        if (product) {
            res.json(product)
        } else {
            res.status(404)
            throw new Error('product not found')
        }
    })


// @desc POST create a product
// @route api/products
// access private/admin

const createProduct = asyncHandler(async (req, res) => {
    try {

        const product = new Product({
            user: req.user._id,
            name: 'sample name',
            brand: 'sample brand',
            price: 0,
            image: '/images/sample.jpg',
            description: 'sample description',
            category: 'sample category',
            countInStock: 0,
            numReviews: 0
        })

        const createdProduct = await product.save();
        console.log("product here", createdProduct)
        res.status(201).json(createdProduct)

    } catch (error) {
        res.status(400);
        throw new Error(error)
    }
})

// @desc PUT update a product
// route api/products/:id
// access private/admin

const updateProduct = asyncHandler(async (req, res) => {
    const { name,
        price,
        description,
        image,
        brand,
        category,
        countInStock, } = req.body
    const product = await Product.findById(req.params.id)
    if (product) {
        product.name = name
        product.brand = brand
        product.category = category
        product.image = image
        product.countInStock = countInStock
        product.description = description
        product.price = price

        const updatedProduct = await product.save()
        res.status(200).json(updatedProduct)
    } else {
        res.status(404)
        throw new Error('product not found')
    }
})

// @desc DELETE a product
// route api/products/:id
// access private/admin

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
    if (product) {
        product.remove()
        res.status(200).json({ message: 'product successfull deleted' })
    } else {
        res.status(404)
        throw new Error('product not found')
    }
})

// @desc POST reviews
// route api/products/:id/reviews
// access private

const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id)

    if (product) {
        const alreadyReviewed = product.reviews.find(x => x.user.toString() === req.user._id.toString());

        if (alreadyReviewed) {
            res.status(400)
            throw new Error('product already reviewed')
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id
        }

        product.reviews.push(review)
        product.numReviews = product.reviews.length

        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

        await product.save()

        res.status(201).json({ message: 'Review added' })
    } else {
        res.status(404)
        throw new Error('Product not found')
    }
})

// @desc GET top products
// route api/products/top
// access public

const getTopProducts=asyncHandler(async(req,res)=>{
    const products=await Product.find({}).sort({rating:-1}).limit(6)
    res.json(products)
})

export { getProductById, getProducts, createProduct, updateProduct, deleteProduct, createProductReview,getTopProducts }