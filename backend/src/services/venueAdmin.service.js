const bcrypt = require("bcrypt");
const venueAdminModel = require("../models/venueAdmin.model");
const { generateToken } = require("../utils/jwt");

const signup = async (email, password) => {
  // Check if admin already exists
  const existingAdmin =
    await venueAdminModel.findVenueAdminByEmail(email);

  if (existingAdmin) {
    throw new Error("Venue admin already exists");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create admin
  const admin = await venueAdminModel.createVenueAdmin(
    email,
    passwordHash
  );

  // Generate JWT
  const token = generateToken(admin.id, "venue_admin");

  return {
    admin,
    token,
  };
};

const login = async (email, password) => {
  // Find admin
  const admin =
    await venueAdminModel.findVenueAdminByEmail(email);

  if (!admin) {
    throw new Error("Invalid email or password");
  }

  // Compare password
  const passwordMatch = await bcrypt.compare(
    password,
    admin.password_hash
  );

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT
  const token = generateToken(admin.id, "venue_admin");

  return {
    admin: {
      id: admin.id,
      email: admin.email,
      created_at: admin.created_at,
      updated_at: admin.updated_at,
    },
    token,
  };
};

module.exports = {
  signup,
  login,
};