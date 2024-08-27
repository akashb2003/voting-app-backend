const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const userShcema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    mobile:{
        type: String
    },
    address: {
        type: String,
        required: true
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted:{
        type: Boolean,
        default: false
    }
});

userShcema.pre('save', async function (next){
    const user = this

    //hash the password only if it is New
    //or
    //user gave new password and we have to hash it
    if(!user.isModified('password')) return next();

    try{
        //hash password generation
        const salt = await bcrypt.genSalt(10)

        //hash password
        const hashedPassword = await bcrypt.hash(user.password, salt)

        //override the plain password with the hashed one
        user.password = hashedPassword
        next()
    }
    catch(err){
        return next(err);
    }
})

userShcema.methods.comparePassword = async function (userPassword){
    try{
        //use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(userPassword, this.password)
        return isMatch;
    }
    catch(err){
        throw err
    }
}

const User = mongoose.model('User', userShcema)
module.exports = User;