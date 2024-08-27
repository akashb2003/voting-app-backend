const express = require('express')
const router = express.Router()
const {jwtAuthMiddleware, generateToken} = require('./../jwt')
const Candidate = require('./../models/candidate')
const User = require('./../models/user')


//check admin, then only we can add candidate to the data
const checkAdminRole = async (userId)=>{
    try{
        const user = await User.findById(userId)
        return user.role === 'admin'
    }
    catch(err){
        return false
    }
}

//POST route to add a candidate
router.post('/', jwtAuthMiddleware, async(req, res)=>{
    try{
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'user is not an admin'})
        }
        //Assuming the req body has candidate data
        const data = req.body

        //create a Candidate in database
        const newCandidate = new Candidate(data);

        //save the data to the database
        const response = await newCandidate.save()
        console.log('data saved of new Candidate')

        res.status(200).json({response: response})

    }
    catch(err){
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
    }
})

//change somthing
router.put('/:candidateId', jwtAuthMiddleware, async (req,res)=>{
    try{

        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'user is not an admin'})
        }

        const candidateId = req.params.candidateId
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new:true,
            runValidators: true
        })

        if(!response){
            return res.status(404).json({error: 'candidate not found'})
        }

        console.log('candidate updated')
        res.status(200).json(response)

    }catch(err){
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
    }
})

//delete a candidate
router.delete('/:candidateId', jwtAuthMiddleware, async (req,res)=>{
    try{

        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'user is not an admin'})
        }

        const candidateId = req.params.candidateId

        const response = await Candidate.findByIdAndDelete(candidateId)

        if(!response){
            return res.status(404).json({error: 'candidate not found'})
        }

        console.log('candidate deleted')
        res.status(200).json(response)

    }catch(err){
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
    }
})

//count votes
router.post('/vote/:candidateId', jwtAuthMiddleware, async(req,res)=>{
    const candidateId = req.params.candidateId
    const userId = req.user.id

    try{
        const candidate = await Candidate.findById(candidateId)
        if(!candidate){
            return res.status(404).json({message: 'candidate not found'})
        }
        
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message: 'user not found'})
        }

        //user can vote only once
        if(user.isVoted){
            return res.status(400).json({message: 'user alredy voted'})
        }

        //admins not allowed to vote
        if(user.role=== 'admin'){
            return res.status(403).json({message: 'admin cannot vote'})
        }

        //update candidate user vote and count
        candidate.votes.push({user: userId})
        candidate.voteCount++;
        await candidate.save()

        //update the user document
        user.isVoted = true
        await user.save()

        res.status(200).json({message: 'vote recoreded successfully'})
    }
    catch(err){
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
    }
} )

//vote count leaderboard
router.get('/vote/count', async (req,res)=>{
    try{
        //find all candidates and sort desc
        const candidate = await Candidate.find().sort({voteCount:'desc'})

        //map only party names
        const leaderboard = candidate.map((data)=>{
            return {
                party: data.party,
                count: data.voteCount
            }
        })

        return res.status(200).json(leaderboard)
    }
    catch(err){
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
    }
})

//see all candidates
router.get('/list', async (req,res)=>{
    try{
        //find all candidates
        const candidate = await Candidate.find()

        const list = candidate.map((data)=>{
            return {
                party: data.party,
            }
        })

        return res.status(200).json(list)
    }
    catch(err){
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
    }
})

module.exports = router;