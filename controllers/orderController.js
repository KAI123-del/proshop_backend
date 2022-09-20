import AsyncHandler from "express-async-handler";
import Order from '../models/orderModel.js'


// @desc POST create order
// @route /api/orders
// @access private
const addOrderItems = AsyncHandler(async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;



    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('no order items')
    } else {
        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        })


        const createdOrder = await order.save()
        res.status(201).json(createdOrder)
    }
})


// @desc GET  order by id
// @route /api/orders/id
// @access private
const getOrderById = AsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if (order) {
        res.status(201)
        res.json(order)
    } else {
        res.status(404)
        throw new Error('order not found')
    }
})

// @desc PUT updatedOrder by id
// @route /api/orders/:id/orderPaid
// @access private

const getUpdatedOrderById = AsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    console.log("here")

    if (order) {
        order.isPaid = true,
            order.paidAt = Date.now()
        const updatedOrder = await order.save()
        res.send("order paid successfully")

    } else {
        res.status(400);
        throw new Error('order not found')
    }
})

const getMyOrders = AsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
    

    if (orders) {
        res.json(orders)
    } else {
        throw new Error('order not found')
    }
})

// @desc GET all orders 
// @route /api/orders
// @access private / admin

const getAllOrders=AsyncHandler(async(req,res)=>{
    const pageSize=4;
    const page=Number(req.query.pageNumber) || 1;
    const count=await Order.countDocuments({});
    const orders = await Order.find({}).populate('user', ' id name').limit(pageSize).skip(pageSize*(page-1))

 
        res.status(200).json({orders,page, pages: Math.ceil(count / pageSize)})
    
    
})


export { addOrderItems, getOrderById, getUpdatedOrderById, getMyOrders ,getAllOrders};