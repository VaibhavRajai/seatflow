const authController=require('../controllers/auth.controller')

const validateSignup=require('../middleware/validatesignup')

const express=require('express')

const router=express.Router()

router.post('/signup',validateSignup,authController.signup)

module.exports=router;