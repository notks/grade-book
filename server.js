const express = require('express')
var skolskaGodina="2019-2020"
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const Ocjena=require('./dataTypes/ocjene')
const smjer=require('./dataTypes/smjerovi')
const predmet=require('./dataTypes/predmeti')
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



//--------------------------------------------------------------------------------------------------------------------------------
//home
app.get('/home',checkAuthenticated,(req,res)=>{
  if(req.user.role==="admin"){
    res.render('./home/adminhome.ejs')
  }else if(req.user.role==="profesor"){
    if(req.user.razrednoOdjeljenje==="nema"){
      res.render('./home/profesorhome.ejs',{
        odjeljenja:req.user.odjeljenjeKojimaPredaje,
        predmet:req.user.predmet
      })
    }else{
      res.render('./home/razrednihome.ejs',{
        odjeljenja:req.user.odjeljenjeKojimaPredaje,
        razrednoOdjeljenje:req.user.razrednoOdjeljenje,
        predmet:req.user.predmet

      })
    }
  }else if(req.user.role==="ucenik"){
res.render('./home/ucenikhome.ejs',{
  name:req.user.name})
  }
})
//ocjene
//------------------------------------------------------------------------------------------------------------------------------
app.get('/ocjene',checkAuthenticated,(req,res)=>{
 MongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
var dbo=db.db(skolskaGodina)
var col=dbo.collection(req.query.odjeljenje).find({}).toArray((req,resp)=>{
  console.log(resp)
})

    })

})



//login
//------------------------------------------------------------------------------------------------------------------------------
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
  //if(req.user.role==="admin"){
  if(req.query.user==="profesor"){
res.render("./register/regprofesor.ejs")
 }else if(req.query.user==="ucenik"){
  res.render("./register/regucenik.ejs")
 }
 else if(req.query.user==="admin"){
   res.render('./register/regadmin.ejs')
 }else if(JSON.stringify(req.query)){
res.render('./register/reg.ejs')
 }//}else{
  // res.render('noauth.ejs')
 //}
})

app.post('/registerProfesor',(req,res)=>{
  if(req.user.role==="admin"){
  var regErrors=[]
 var role="profesor"
  const {ime,prezime, email, adresa,predmet,razrednoOdjeljenje,brojTelefona,odjeljenjeKojimaPredaje}=req.body
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
           odjeljenjeKojimaPredaje,
           {
             razrednoOdjeljenje
          })
         dbo.collection('users').insertOne(professor,function(err,response){
          if(err)throw err
          else{
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

app.post('/registerAdmin',(req,res)=>{
  if(req.user.role==="admin"){
  var regErrors=[]
 var role="admin"
  const {ime,prezime, email, adresa,brojTelefona}=req.body
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
         var admin=new Users.Admin(
           ime,
           prezime,
           email,
           hasshedPassword,
           brojTelefona,
           adresa,
           role,
           )
         dbo.collection('users').insertOne(admin,function(err,response){
          if(err)throw err
          else{
          res.redirect('/register')
          }
          })
        }
        })
     })
    }
})
//admin only
//---------------------------------------------------------------------------------------------------------------------------------
app.get('/predmeti',checkAuthenticated,(req,res)=>{

if(req.user.role==="admin"){
if(req.query.action==="dodaj"){
  MongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
    if (err) throw err
    var dbo=db.db('mainDB')
    var col=dbo.collection('users').find({role:"profesor"}).toArray((err,users)=>{
if (err) throw err
var usersfromDB=users
var col=dbo.collection('smjerovi').find({}).toArray((err,smjerovi)=>{

 res.render('./predmeti/dodaj.ejs',{
   users:usersfromDB,
smjerovi:smjerovi
})
})
 
    })
  })



}else{
  MongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
    if (err) throw err
    var dbo=db.db('mainDB')
    var col=dbo.collection('predmeti').find().toArray((err,predmeti)=>{
if (err) throw err
 res.render('./predmeti/predmeti.ejs',{
   predmeti:predmeti
 })
 
    })
  })
 }
}else{
  res.render('noauth.ejs')
}})
app.post('/predmeti/dodaj',checkAuthenticated,(req,res)=>{
  if(req.user.role==="admin"){
    MongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
      if (err) throw err
      var dbo=db.db('mainDB')
      const {ime,smjer,razred,brojModula,profesor,opis}=req.body
      var predmetInsert=new predmet(
        ime,
        razred,
        profesor,
        brojModula,
        smjer,
        {
          opis
        }
        )
      var col=dbo.collection('predmeti').insertOne(predmetInsert,(err,succes=>{
        if(err) throw err
        else
        res.redirect('/predmeti')
      }))
      
          })

  }
})
app.get('/smjerovi',checkAuthenticated,(req,res)=>{
  if(req.user.role==="admin"){
    if(req.query.action==="dodaj"){
      res.render('./smjerovi/dodaj.ejs')
    }else{
    MongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
      if (err) throw err
      var dbo=db.db('mainDB')
      var col=dbo.collection('smjerovi').find({}).toArray((err,resp)=>{
if(err) throw err
res.render('./smjerovi/smjerovi.ejs',{
  smjerovi:resp
})
      })
      
          })
  }}
})

app.post('/smjerovi/dodaj',checkAuthenticated,(req,res)=>{
  const {ime,opis}=req.body
  MongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
    if (err) throw err
    var dbo=db.db('mainDB')
    var smjerinsert=new smjer(
      ime,
      {opis}
      )

    var col=dbo.collection('smjerovi').insertOne(smjerinsert,(err,succes)=>{
if (err) throw err
res.redirect('/smjerovi')
    })

    
    
        })
})

//-----------------------------------------------------------------------------------------------------------------------------------
//logout
app.delete('/logout',checkAuthenticated, (req, res) => {
 
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