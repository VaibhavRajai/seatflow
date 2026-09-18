const authorizeVenueAdmin=(req,res,next)=>{
    if(req.user.role!=="venue_admin"){
        return res.status(403).json({
            message:'Venue admin access required'
        })
    }
    next();
}

module.exports={
    authorizeVenueAdmin
}