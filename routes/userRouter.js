const express = require('express')
const router = express.Router()
const User = require('./../models/user')
const {jwtAuthMiddleware, generateToken} = require('./../jwt')

router.post('/signup', async(req, res)=>{
    try{
        //Assuming the req body has person's data
        const data = req.body

        //create a new person database
        const newUser = new User(data);

        //save the data to the database
        const response = await newUser.save()
        console.log('data saved of new person')

        //object id = _id
        const payload = {
            id: response.id
        }

        console.log(JSON.stringify(payload))
        const token = generateToken(payload)
        console.log(`Token is : ${token}`)

        res.status(200).json({response: response, token: token})

    }
    catch(err){
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
    }
})

router.post('/login', async(req, res)=>{
    try{
        //extract the aadharCardNumber and password
        const {aadharCardNumber, password} = req.body

        //find the user by aadharCardNumber
        const user = await User.findOne({aadharCardNumber: aadharCardNumber})

        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid username or password'})
        }

        //after finding user
        //geneate the token
        const payload = {
            id: user.id
        }

        const token = generateToken(payload)

        //return the token as a response
        res.json({token})
    }
    catch(err){
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
    }
})

//see the profile
router.get('/profile', jwtAuthMiddleware, async(req, res)=>{
    try{
        const userData = req.user
        const userId = userData.id
        const user = await User.findById(userId)
        res.status(200).json({user})
    }
    catch(err){
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
    }
})

//change password
router.put('/profile/password', jwtAuthMiddleware, async (req,res)=>{
    try{
        const userId = req.user.id
        const {currentPassword, newPassword} = req.body;

        const user = await User.findById(userId)

        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error: 'Invalid current password'})
        }

        user.password = newPassword
        await user.save() //before saving it will go to pre-save state and converts it to hash, check in models/user.js

        console.log('password updated')
        res.status(200).json({message: "password updated"})
    }catch(err){
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
    }
})

module.exports = router;