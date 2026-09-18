const authController=require('../controllers/auth.controller')

const validateSignup=require('../middleware/validatesignup')

const express=require('express')

const router=express.Router()

router.post('/signup',validateSignup,authController.signup)
router.post('/login',authController.login)
router.post("/logout", authController.logout);
module.exports=router;