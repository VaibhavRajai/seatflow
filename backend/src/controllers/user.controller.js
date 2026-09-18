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

const getCurrentUser = async (req, res) => {
  res.json({
    message: "You are authenticated",
    user: {
      id: req.user.userId,
      role: req.user.role,
    },
  });
};


module.exports={createUser,getCurrentUser}