const validateSignup = (req, res, next) => {
  const { email, password, phoneNumber } = req.body;

  if (!email || !password || !phoneNumber) {
    return res.status(400).json({
      message: "Email, password and phone number are required",
    });
  }

  if (!email.includes("@")) {
    return res.status(400).json({
      message: "Invalid email",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters",
    });
  }

  if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
    return res.status(400).json({
      message: "Invalid phone number",
    });
  }

  next();
};

module.exports = validateSignup;