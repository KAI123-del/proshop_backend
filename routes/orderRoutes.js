import express from 'express'
import { addOrderItems, getOrderById, getUpdatedOrderById, getMyOrders ,getAllOrders} from '../controllers/orderController.js'
import { protect , admin} from '../middleware/authMiddleware.js'


const router = express.Router()

router.route('/').post(protect, addOrderItems).get(protect,admin,getAllOrders)
router.route('/userOrders').get(protect, getMyOrders)
router.route('/:id').get(protect, getOrderById)
router.route('/:id/orderPaid').put(protect, getUpdatedOrderById)


export default router;