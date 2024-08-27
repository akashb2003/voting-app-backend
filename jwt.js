const jwt = require('jsonwebtoken')

const jwtAuthMiddleware = (req,res,next)=>{
    //fist check request headers has authorization or not
    const authorization = req.headers.authorization
    if(!authorization) return res.status(401).json({error: 'Token not found'})

    //extract the jwt token from the request headers
    const token = req.headers.authorization.split(' ')[1]
    if(!token) return res.status(401).json({error: 'Unauthorized'})

    try{
        //verify the jwt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        //attach user info to the request object
        req.user = decoded
        console.log(`decoded jwt: ${decoded}`)
        next()
    }
    catch(err){
        console.log(err);
        res.status(401).json({error: 'Invalid Token'})
    }
}

//function to generate jwt token
const generateToken = (userData) =>{
    //generate a new jwt token using user data
    return jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: 30000})
}

module.exports = {jwtAuthMiddleware, generateToken}