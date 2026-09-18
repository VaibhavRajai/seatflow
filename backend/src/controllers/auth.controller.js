const authService=require('../services/auth.services')

const signup = async (req, res) => {
  try {
    const { email, password, phoneNumber } = req.body;

    const result = await authService.signup(
      email,
      password,
      phoneNumber
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports={signup}