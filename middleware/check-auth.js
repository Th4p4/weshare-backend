const jwt = require('jsonwebtoken')
const HttpError = require('../model/http-error')

module.exports = (req,res,next)=>{
    if(req.method ==="OPTIONS"){
        next()
    }
    try{
        const token = req.headers.authorization.split(' ')[1]
        if(!token){
            throw new Error("Authorization failed")
        }
        const decodedToken = jwt.verify(token,process.env.JWT_KEY)
        req.userData = {userId:decodedToken.userId}
        next()
    }
    catch (err){
        const error = new HttpError("authentication failed",401)
        next(error)
    }
}