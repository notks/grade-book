const MongoClient=require('mongodb').MongoClient

const Users=require('./dataTypes/user')

const bcrypt = require('bcrypt')
require('dotenv').config()
function makeAdmin(){
    console.log("adding first admin acc...")
MongoClient.connect(process.env.url,{useUnifiedTopology:true},(err,db)=>{
    if(err) throw err
    

    
    
   
      
       
  
  
    
   
  
     
     
   
      MongoClient.connect(process.env.url,{ useUnifiedTopology: true },async(err,db)=>{
        if(err) throw err
        var dbo=db.db(process.env.skolskaGodina)
       
           
       
         
              var hasshedPassword=await bcrypt.hash("changemeadmin",10)
             var admin=new Users.Admin(
               "admin",
               "admin",
               "admin@admin",
               hasshedPassword,
               null,
               null,
               "admin"
               )
               
             dbo.collection('users').insertOne(admin,function(err,response){
              if(err)throw err
              
                console.log("added first admin acc")
                console.log("you can now  log in as admin on your /login panel.")
               
              
            
              })
            
            
         })
        
   
    
    
    

    
     
  
    
    })


}
module.exports= makeAdmin