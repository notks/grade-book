const mongoClient=require('mongodb').MongoClient
const express=require('express')
const app=express()
const url="mongodb://localhost:27017/"


app.get('/update',(req,res)=>{
mongoClient.connect(url,(err,db)=>{
    if (err) throw err
var dbo=db.db('local').collection('test').update ({tree:'3'},{$set:{five:'5',six:'7'}},(err,resp)=>{
if(err) throw err;
console.log(resp);
res.send({succes:"succesfull"})

})




})



})
console.log("listening")
app.listen(300)