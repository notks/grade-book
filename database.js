const mongoClient=require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID;
const url="mongodb://localhost:27017/"
const mongodb=require('mongodb')



mongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
    if (err) throw err
   /* db.db('2019-2020').collection('userinfo').find({}).toArray((err,ucenik)=>{


if (err) throw err
ucenik.forEach(u => {
   
   console.log(u.email)
   db.db('2019-2020').collection('users').update({_id:ObjectID(u._userid)},{$set:{ocjene:u.ocjene,predmeti:u.predmeti}},(err,done)=>{
    if(err) throw err
    console.log("resi")
})

    })
})
*/





db.db('2019-2020').collection('users').findOne({},{ projection: { password: 0 } },(err,ucenik)=>{

if(err) throw err
console.log(ucenik)


})
/*db.db('2019-2020').collection('userinfo').find({},(err,ucenik=>{
if(err) throw err;
console.log(ucenik)
ucenik.forEach(u => {
   
    db.db('2019-2020').collection('users').update({_id:ObjectID(u._userid)},{$set:{ocjene:u.ocjene,predmeti:ucenik.predmeti}},(err,done)=>{
if(err) throw err
console.log("resi")

})
})

}))*/









})

console.log("done")


