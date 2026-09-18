const pool=require('../config/database')

const createUser=async(email,passwordHash,phoneNumber)=>{
    const query=`
    INSERT INTO users(email,password_hash,phone_number)
    VALUES ($1,$2,$3)
    RETURNING id,email,phone_number,created_at,updated_at`;
    const values=[email,passwordHash,phoneNumber];
    const result=await pool.query(query,values);
    return result.rows[0];
}

const findUserByEmail=async(email)=>{
    const query=`SELECT *
    FROM users
    WHERE email = $1`;
    const result=await pool.query(query,[email])

    return result.rows[0] || null;
}
module.exports={
    createUser,
    findUserByEmail
}