const {Queue} =require('bullmq')

const seatExpiryQueue=new Queue("seat-expiry",{
    connection:{
        host:"127.0.0.1",
        port:6379
    }
})

module.exports=seatExpiryQueue;