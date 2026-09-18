const venueAdminService = require("../services/venueAdmin.service");

const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await venueAdminService.signup(
      email,
      password
    );

    res.cookie("access_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Venue admin registered successfully",
      admin: result.admin,
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

    const result = await venueAdminService.login(
      email,
      password
    );

    res.cookie("access_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Venue admin login successful",
      admin: result.admin,
    });
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};

const logout = async (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json({
    message: "Venue admin logout successful",
  });
};

module.exports = {
  signup,
  login,
  logout,
};