
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
//const mongodb=require('mongodb')
const initializePassport = require('./passport-config')
const url="mongodb://localhost:27017/"
const MongoClient=require('mongodb').MongoClient
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []
var hashedPassword 
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret:"seacret",
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
})
)

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  var regErrors=[]
  var isValidInfo
  const {name,surname, razred, email, class2}=req.body;
  
 MongoClient.connect(url,function(err,db){
var dbo=db.db('mainDB')
var col=dbo.collection('users').findOne({email:req.body.email}, async (err,existingUser)=>{

  if(existingUser!==null)
  {
//render partial

regErrors.push({msg:"User with that email already exists!"})
  }
  if(req.body.password!==req.body.password2)
  {
regErrors.push({msg:"Passwords do not match!"})

  }
  if(regErrors.length>0)
  {
res.render('register.ejs',{
  regErrors,
name,
surname,
email,razred,class2

})
  }
  else{
    
    
      var hasshedPassword=await bcrypt.hash(req.body.password,10);
   
    
    
    
    var userToInsert={
name:name,
email:email,
password:hasshedPassword,
razred:razred,
class2:class2

    }
    dbo.collection('users').insertOne(userToInsert,function(err,response){
      if(err) throw err
      res.redirect('/login')
      
      })
    }

})




 })
  


  
})

app.delete('/logout', (req, res) => {
 
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}


app.listen(300)