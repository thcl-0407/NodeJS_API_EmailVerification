const jwt = require('jsonwebtoken')
require('dotenv').config()

const GenerateToken = (payload) => {
    return jwt.sign(payload, process.env.TOKEN_PRIVATE_KEY, { expiresIn: "10m" })
}

const VerifyToken = (token, callback) => {
    jwt.verify(token, process.env.TOKEN_PRIVATE_KEY, (err, decoded)=>{
       if(err){
           callback(false, null)
       }else{
           callback(true, decoded)
       } 
    })
}

module.exports = {
    GenerateToken,
    VerifyToken
}