const bcrypt=require('bcrypt')
const userModel=require('../models/user.model')
const {generateToken}=require('../utils/jwt')
const signup=async(email,password,phoneNumber)=>{
    
  const existingUser = await userModel.findUserByEmail(email);

    if(existingUser){
        throw new Error("User already exists")
    }
    const passwordHash=await bcrypt.hash(password,10)
    const user=await userModel.createUser(email,passwordHash,phoneNumber);
    const token=generateToken(user.id);
    return {user,token};
}

module.exports={signup}