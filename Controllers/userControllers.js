const userModel = require('../Models/userModels')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// http response codes
// 100 -199 - Informational responses
// 200 -299 - Successful responses
// 300 -399 - Redirection messages
// 400 -499 - Client Error Responses
// 500 - 599 - Server Error responses

// 200 - OK
// 201 - Created
// 202 - Accepted
// 400 - bad request
// 404 - not found
// 500 - internal server error

// CRUD -> Create or POST/ Read or GET/ Update or PATCH or PUT/ Delete - DELETE
const period = 1000 * 60 * 60 * 24 * 3

const registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, DOB, age, password } = req.body
    // existing user
    const existingUser = await userModel.findOne({ email })
    if (existingUser) {
      return res
        .status(402)
        .json({ success: false, message: 'Email already in use' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = userModel({
      firstname,
      lastname,
      email,
      DOB,
      age,
      password: hashedPassword
    })
    const savedUser = await newUser.save()
    res
      .status(201)
      .json({ success: true, message: 'Registration Successful', savedUser })
  } catch (err) {
    console.log(err.message)
  }
}

const allUsers = async (req, res) => {
  try {
    const users = await userModel.find()
    res
      .status(202)
      .json({ success: true, message: 'View all users Successful', users })
  } catch (err) {
    console.log(err.message)
  }
}

const updateUser = async (req, res) => {
  try {
    const id = req.params.id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid user ID' })
    }
    const updatedUser = await userModel.findByIdAndUpdate(id, req.body, {
      new: true
    })

    // id, {}

    res
      .status(202)
      .json({ success: true, message: 'Profile updated', updatedUser })
  } catch (err) {
    console.log(err.message)
  }
}

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id
    const deletedUser = await userModel.findByIdAndDelete(id, req.body)
    res
      .status(200)
      .json({
        success: true,
        message: 'User Deeleted Successfully',
        deletedUser
      })
  } catch (err) {
    console.log(err.message)
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User Not Found!' })
    }
    const isPassword = await bcrypt.compare(password, user.password)
    if (!isPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Incorrect Password' })
    }
   jwt.sign({id: user._id}, process.env.SECERT, {expiresIn: "1d"}, async (err, token) => {
    if(err){
      throw err;
    }
    res.cookie('userId', user._id, {maxAge : period, httpOnly: true})
    res.status(200).json({success: true, message: "User logged In Successfully", user, token})

   })
  } catch (err) {
    console.log(err.message)
  }
}

// id, serect

module.exports = { registerUser, allUsers, updateUser, deleteUser, loginUser }
