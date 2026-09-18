const authService=require('../services/auth.services')

const signup = async (req, res) => {
  try {
    const { email, password, phoneNumber } = req.body;

    const result = await authService.signup(
      email,
      password,
      phoneNumber
    );
       res.cookie("access_token",result.token,{
        httpOnly:true,
        secure:process.env.MODE_ENV==="prodcution",
        sameSite:"lax",
        maxAge:60*60*100
    })
    res.status(201).json({
      message: "User registered successfully",
      user: result.user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(
      email,
      password
    );
    res.cookie("access_token",result.token,{
        httpOnly:true,
        secure:process.env.MODE_ENV==="prodcution",
        sameSite:"lax",
        maxAge:60*60*100
    })

    res.status(200).json({
      message: "Login successful",
      user: result.user,
    });
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};

const logout=async(req,res)=>{
    res.clearCookie("access_token",{
        httpOnly:true,
        secure:process.env.MODE_ENV==="production",
        sameSite:"lax"
    })
    res.status(200).json({
        message:"Logout sucessful"
    })
}
module.exports={signup,login,logout}