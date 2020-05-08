const mongoClient=require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID;
const url="mongodb+srv://ks:skola@cluster0-lptgc.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass%20Community&retryWrites=true&ssl=true"
const mongodb=require('mongodb')
const bcrypt=require('bcrypt')

/*
mongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
    if (err) throw err
   db.db('2019-2020').collection('users').updateMany({},{$set:{firstlogin:true}},(err,done)=>{


if (err) throw err
console.log("done")
console.log(done)
})
*/
async function a(){

   var pwd=await bcrypt.hash("changeme",10)
console.log(pwd) 
}
a()
/*
var procenti=
{testModula:Number(50),
pismenaProvjera:Number(10),
esej:Number(10),
usmenaprovjera:Number(10),
aktivnost:Number(10),
vjezba:Number(10)}



db.db('2019-2020').collection('predmeti').updateMany({},{$set:{procenti:procenti}},(err,ucenik)=>{

if(err) throw err
console.log("done")


})
db.db('2019-2020').collection('userinfo').find({},(err,ucenik=>{
if(err) throw err;
console.log(ucenik)
ucenik.forEach(u => {
   
    db.db('2019-2020').collection('users').update({_id:ObjectID(u._userid)},{$set:{ocjene:u.ocjene,predmeti:ucenik.predmeti}},(err,done)=>{
if(err) throw err
console.log("resi")

})
})

}))








*/
//})

console.log("done")

