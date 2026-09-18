const userService=require('../services/user.service')

const createUser=async(req,res)=>{
    try{
        const {email,phoneNumber}=req.body;
        const user=await userService.createUser(email,phoneNumber);
        res.status(201).json({message:'User created successfully',user})
    }
    catch(error){
        res.status(400).json({
      message: error.message,
    });
    }
}

module.exports={createUser}