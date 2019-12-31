const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const Ocjena=require('./dataTypes/ocjene')
const Users=require('./dataTypes/user')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const initializePassport = require('./passport-config')
const url="mongodb://localhost:27017/"
const MongoClient=require('mongodb').MongoClient
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)
const userroute=require('./routes/users')

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
app.use('/users',checkAuthenticated,userroute)

//passport
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


//frontpage
app.get('/', (req, res) => {
 
  if(req.query.login==='LogIn')
  res.redirect('/login')
  else
  res.render('home.ejs')
})




//home
app.get('/home',checkAuthenticated,(req,res)=>{
  if(req.user.role==="admin"){
    res.render('adminhome.ejs')
  }else if(req.user.role==="profesor"){
    res.render('profesorhome.ejs')
  }else if(req.user.role==="ucenik"){
res.render('index.ejs',{
  name:req.user.name})
  }
})

//ocjene
//----------------------------------------------------------------------------------------------------------------------

//ocjene
/*
app.get('/ocjene', checkAuthenticated, (req, res) => {
  console.log(req.user)
  MongoClient.connect(url,(err,db)=>{
    if (err) throw err
    var dbo=db.db('mainDB')
    var col=dbo.collection('ocjene').findOne({ime:req.user.name},(err,ocjene)=>{
      if (err) throw err
      res.render('ocjene.ejs',{ocjene})




    })
  })
  })
  */
 //renders specified ocjene view to all roles
  app.get('/ocjene',checkAuthenticated,(req,res)=>{
if(req.user.role==='admin'||req.user.role==='profesor'){
res.render('ocjeneprofview.ejs')
}else{
  res.render('ocjene.ejs')
}

  })
  
  
  
//renders dodajocjenu view to specific roles
app.get('/dodajocjenu',checkAuthenticated,(req,res)=>{
if(req.user.role==='profesor'||req.user.role==='admin'){
res.render('dodajocjenu.ejs')
}else{
  res.render('noauth.ejs')
}
})
// posts ocjena
 app.post('/dodajocjenu',checkAuthenticated,(req,res)=>{
  if(req.user.role==='profesor'||req.user.role==='admin'){
   
    let date ="current date";
    let ocjena=new Ocjena(req.body.ocjena,{opis:req.body.opis,date:date,profesor:(req.user.name+" "+req.user.surname)})
    console.log(ocjena)
    console.log(date)
    res.send('ok')
    }else{
      res.render('noauth.ejs')
    }


 })


//login
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true

})
)



//register
//--------------------------------------------------------------------------------------------------------------------------

app.get('/register',checkAuthenticated, (req, res) => {
  if(req.user.role==="admin"){
  if(req.query.user==="profesor"){
res.render("./register/regprofesor.ejs")
 }else if(req.query.user==="ucenik"){
  res.render("./register/regucenik.ejs")
 }
 else if(req.query.user==="admin"){
   res.render('./register/regadmin.ejs')
 }else if(JSON.stringify(req.query)){
res.render('./register/reg.ejs')
 }}else{
   res.render('noauth.ejs')
 }
})

app.post('/registerProfesor',(req,res)=>{
  if(req.user.role==="admin"){
  var regErrors=[]
 var role="profesor"
  const {ime,prezime, email, adresa,predmet,razrednoOdjeljenje,brojTelefona}=req.body
  MongoClient.connect(url,function(err,db){
    var dbo=db.db('mainDB')
    var col=dbo.collection('users').findOne({email:req.body.email}, async (err,existingUser)=>{
          if(existingUser!==null){
    //render partial    
    regErrors.push({msg:"User with that email already exists!"})
      }
      if(req.body.password!==req.body.password2){
    regErrors.push({msg:"Passwords do not match!"})    
      }
      if(regErrors.length>0){
    res.render('register.ejs',{
      regErrors,
    name,
    surname,
    email,razred,class2
    })
      }
      else{
          var hasshedPassword=await bcrypt.hash(req.body.password,10)
         var professor=new Users.Profesor(
           ime,
           prezime,
           email,
           hasshedPassword,
           predmet,
           brojTelefona,
           adresa,
           role,
           {
             razrednoOdjeljenje
          })
         dbo.collection('users').insertOne(professor,function(err,response){
          if(err){
            res.render('505.ejs')
            throw err
          }else{
          res.redirect('/register')
          }
          })
        }
        })
     })
    }
})

app.post('/registerUcenik',(req,res)=>{
  var regErrors=[]
 var role="ucenik"
  const {ime,prezime, email, adresa,predmet,razred,odjeljenje,brojTelefona}=req.body
  MongoClient.connect(url,{ useUnifiedTopology: true },function(err,db){
    var dbo=db.db('mainDB')
    var col=dbo.collection('users').findOne({email:req.body.email}, async (err,existingUser)=>{
    
      if(existingUser!==null){
    //render partial
    
    regErrors.push({msg:"User with that email already exists!"})
      }
      if(req.body.password!==req.body.password2){
    regErrors.push({msg:"Passwords do not match!"})
    
      }
      if(regErrors.length>0){
    res.render('register.ejs',{
      regErrors,
    name,
    surname,
    email,razred,class2
    
    })
      }
      else{
        
        
          var hasshedPassword=await bcrypt.hash(req.body.password,10);
       
        
        
        
         var ucenik=new Users.Ucenik(
           ime,
          prezime,
          email,
          hasshedPassword,
          brojTelefona,
          adresa,
          razred,
          odjeljenje,
          role)
         dbo.collection('users').insertOne(ucenik,(err,response)=>{
          if(err) throw err
           
        
          res.redirect('/register')
          
          })
        }
        
        })
    
    
    
     })
 
 
})

app.post('/register', async (req, res) => {
 // if(req.user.role==="admin"){
  var regErrors=[]
  var isValidInfo
  const {name,surname, razred, email, class2,role}=req.body;
  
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
surname:surname,
email:email,
password:hasshedPassword,
razred:razred,
class2:class2,
role:role

    }
    dbo.collection('users').insertOne(userToInsert,function(err,response){
      if(err) throw err
      console.log(response)
      res.redirect('/login')
      
      })
      console.log(userToInsert)
    }

})

 })
  
 // }
 // else
 // {
    res.redirect('/home')
  //}

})



//logout
app.delete('/logout', (req, res) => {
 
  req.logOut()
  res.redirect('/login')
})



//checking if user is authenticated
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  

  res.redirect('/login')
}



//checking if user is not authenticated
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/home')
  }
  next()
}



//port
app.listen(3000)