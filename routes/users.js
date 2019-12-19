const express=require('express')
const router =express.Router()

router.get('/1',(req,res)=>{

res.send("lol works")

})
module.exports = router