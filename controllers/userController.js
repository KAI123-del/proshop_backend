
import asyncHandler from 'express-async-handler'
import User from '../models/userModal.js'
import generateToken from '../utlis/generateToken.js'





// @ Auth user and get token
// @route POST /api/users/login
// @access public
const authUser = asyncHandler(
    async (req, res) => {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            })
        } else {
            res.status(401)
            throw new Error('Invalid email or password')
        }

    })



// @ get user profile
// @route GET /api/users/profile
// @access private

const getUserProfile = asyncHandler(
    async (req, res) => {
        const user = await User.findById(req.user._id)

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            })
        } else {
            res.status(404)
            throw new Error('User not found')
        }

    }
)



// @ Update user profile
// @route PUT /api/users/profile
// @access private
const updateUserProfile = asyncHandler(
    async (req, res) => {


        const user = await User.findById(req.user._id)


        if (user) {
            user.name = req.body.name || user.name
            user.email = req.body.email || user.email
            if (req.body.password) {
                user.password = req.body.password
            }

            const updatedUser = await user.save()

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser._id),
            })
        } else {
            res.status(404)
            throw new Error('User not found')
        }

    }
)



// @ register user
// @route POST /api/users
// @access public
const registerUser = asyncHandler(

    async (req, res) => {


        const { name, email, password } = req.body

        const userExists = await User.findOne({ email })

        if (userExists) {
            res.status(400)
            throw new Error('User already exists')
        }

        const user = await User.create({
            name,
            email,
            password,
        })

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            })
        } else {
            res.status(400)
            throw new Error('Invalid user data')
        }
    }
)



// @ delete user
// @route DEL /api/users/:id
// @access private admin

const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (user) {
        await user.remove()
        res.json({ message: "user's account deleted" })

    } else {
        res.status(400)
        throw new Error('user not found')
    }
})


// @desc GET all users
// @route /api/users
// @access private admin

const getUsers = asyncHandler(async (req, res) => {
    try {
        const pageSize = 4;
    const page = Number(req.query.pageNumber) || 1;
    const count = await User.countDocuments({})
    const users = await User.find({}).limit(pageSize).skip(pageSize * (page - 1))
    res.json({ users, page, pages: Math.ceil(count / pageSize) })
    } catch (error) {
        throw new Error("'user's not found")
    }
})


// @desc GET users by id
// @route /api/users/:id
// @access private admin



const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password')
    if (user) {
        res.json(user)
    } else {
        res.status(404)
        throw new Error('user not found')
    }
})



// @ PUT update user
// @route /api/users/:id
// @access private admin

const updateUser = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.email = req.body.email || user.email,
                user.name = req.body.name || user.name,
                user.isAdmin = req.body.isAdmin
        }
        const updatedUser = await user.save()
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        })
    } catch (error) {
        res.status(404)
        throw new Error('user not found')
    }

})



export { authUser, getUserProfile, registerUser, updateUserProfile, getUsers, deleteUser, getUserById, updateUser }