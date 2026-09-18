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

const login=async(email,password)=>{
    const user=await userModel.findUserByEmail(email)
    if(!user){
        throw new Error("Invalid email")
    }
    const passwordMatch=await bcrypt.compare(password,user.password_hash)
     if (!passwordMatch) {
    throw new Error("Invalid  password");
  }
  const token=generateToken(user.id)
  return{
    user:{
         id: user.id,
      email: user.email,
      phone_number: user.phone_number,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
    token
  }
}

module.exports={
    signup,
    login
}