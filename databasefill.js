const MongoClient=require('mongodb').MongoClient
const bcrypt = require('bcrypt')
const Users=require('./dataTypes/user')
const url="mongodb://localhost:27017/"
var ime=["adnan","bakir","mirha","amila","arslan","nazif","sanel",
"eldad","semir","amir","anes","azur","amer","ajdin","belmin","sahbaz",
"armen","hamza","amar","jusuf","armen","adi","darko","faris","enisa",
"ajla","maida","eldina","dino","vedran","besim","belmin","mirza","aldin","muamer","edo"]
var smjer=["Tehnicar Racunarstva","Tehnicar Meehatronike","Tehnicar Elektronike","Tehnicar Energetike"]
var odjeljenje=["4T1","4t2","4t3","4t4"]
var b=0
MongoClient.connect(url,{useUnifiedTopology:true},async(err,db)=>{
for(i=0;i<ime.length;i++){
    
    let smjerins=smjer[b]
    let odj=odjeljenje[b]
    var pwd=await  bcrypt.hash("changeme",10)
var user=new Users.Ucenik(
    ime[i],
    ime[i],
    ime[i]+"@"+ime[i],
    pwd,
    null,
    null,
    smjerins,
    odj,
    "ucenik"

)
if(b==4){
    b=0
}else{
  b+=1  
}

db.db('2019-2020').collection('test').insertOne(user,(err,res)=>{
    if(err)throw err
    console.log("ok")
})

}

})
