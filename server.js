import express from 'express'
import cors from 'cors'
import Stripe from 'stripe'
import dotenv from 'dotenv'
import connectDB from './data/db.js'
import productRoutes from './routes/productRoutes.js'
import userRoutes from './routes/userRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'
import path from 'path'
import morgan from 'morgan'

// import { getAllUsers } from './controllers/userController.js'



dotenv.config();

connectDB()

const app = express();

if (process.env.NODE_ENV === 'developement') {
    app.use(morgan('dev'))
}

app.use(express.json())



app.use(cors())


app.get('/configure', (req, res) => {
    res.send(process.env.PUBLISHABLE_KEY)
})

app.post('/create-payment-intent', async (req, res) => {
    try {

        const { totalPrice } = req.body

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalPrice,
            currency: 'inr',
            payment_method_types: ['card']
        });
        res.json({ clientSecret: paymentIntent.client_secret })
    } catch (error) {
        res.status(400).json({
            error: {
                message: error.message,
            },
        });
    }
})

const __dirname = path.resolve()

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))


app.use('/api/products', productRoutes)
app.get('/getMyUsers', (req, res) => {
    return res.send("hello world")
})
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/upload', uploadRoutes)
app.use(notFound)
app.use(errorHandler)





const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_ae6c7caf0c8e003856e0121184c39389b1e30f2590a1c63c4bdd5b33d22e28a0";

app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            break;
        case 'charge.succeeded':
            console.log('🐇🐇🐇🐇🐇🐇🐇🐇');
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send({ message: '🌱' });
});





const PORT = process.env.PORT || 5000

app.listen(PORT, console.log("server running"))