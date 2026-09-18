const userModel=require('../models/user.model')

const createUser=async(email,phoneNumber)=>{
    const existingUser=await userModel.findUserByEmail(email);
    if(existingUser){
        throw new Error("User with this email already exists")
    }
    const  user=await userModel.createUser(email,phoneNumber)
    return user;
}

module.exports={
    createUser
}