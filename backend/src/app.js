const express = require("express");
const userRoutes=require('./routes/user.routes')
const authRoutes=require('./routes/auth.routes')

const app = express();

app.use(express.json());

app.use('/api/users',userRoutes)
app.use('/api/auth',authRoutes)
module.exports = app;