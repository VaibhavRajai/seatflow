const pool = require("../config/database");

const releaseExpiredSeats = async () => {
  const result = await pool.query(`
    UPDATE event_seats
    SET
      status = 'AVAILABLE',
      held_by = NULL,
      held_until = NULL,
      updated_at = NOW()
    WHERE status = 'HELD'
      AND held_until IS NOT NULL
      AND held_until <= NOW()
    RETURNING id;
  `);

  if (result.rowCount > 0) {
    console.log(
      `Released ${result.rowCount} expired seat hold(s)`
    );
  }
};

module.exports = {
  releaseExpiredSeats,
};

setInterval(async()=>{
    try{
        await releaseExpiredSeats();
    }
    catch(error){
        console.error("Seat expiry worker failed: ",error)
    }
},30*1000)