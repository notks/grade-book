const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const MongoClient= require('mongodb').MongoClient
const url="mongodb://localhost:27017/"
//initialize passport in main server file
function initialize(passport, getUserByEmail, getUserById) {
  //getting username and password from body
  const authenticateUser = async (email, password, done) => {
    //getting matching email and password from db
    MongoClient.connect(url,{ useUnifiedTopology: true }, function(err, db) {
     
       if (err) throw err;
      var dbo = db.db("mainDB")
  
      dbo.collection("users").findOne({email:email}, function(err, response) {
        var user=response;
        if (err) throw err 
        //checking if email exist in db
       if(user==null)
       {
        return done(null, false, { message: 'Incorrect email.' });

       }
       //if exists comparing password from body to hashed password in db
       try{
       bcrypt.compare(password,user.password,function(err,match){
//if  match return user 
if(match)
{
  return done(null,user)
}
//if doesnt match return false with error message 
else {
        return done(null,false,{message:'incorect password'})

       }
      

       })
       
      
      }
      //if error returning error
       catch(e){
return done(e)


       }
        

       
       
      })
    })


    }
   
//local strategi initalization
  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  //serializing user
  passport.serializeUser((user, done) => done(null, user))
  //desirializing user
  passport.deserializeUser((user, done) => {
   return done(null, user)
  })
}

module.exports = initialize