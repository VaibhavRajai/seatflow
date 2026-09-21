const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// routes
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const venueAdminRoutes = require("./routes/venueAdmin.routes");
const venueRoutes = require("./routes/venue.routes");
const venueAreaRoutes = require("./routes/venueArea.routes");
const venueSectionRoutes = require("./routes/venueSection.routes");
const eventRoutes = require("./routes/event.routes");
const bookingRoutes=require('./routes/booking.routes')
const paymentRoutes=require('./routes/payment.routes')
const errorHandler=require('./middleware/error.middleware')
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json({
  verify:(req,res,buf)=>{
    if(req.originalUrl==="/api/payments/webhook"){
      req.rawBody=buf;
    }
  }
}));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", venueAdminRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/venue-areas", venueAreaRoutes);
app.use("/api/venue-sections", venueSectionRoutes);
app.use("/api/events", eventRoutes);
app.use('/api/bookings',bookingRoutes)
app.use('/api/payments',paymentRoutes)
app.use(errorHandler); // an user defined error handler

module.exports = app;