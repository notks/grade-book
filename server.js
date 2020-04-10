const express = require('express')
process.env.firstRun=false
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const Ocjena=require('./dataTypes/ocjene')
const smjer=require('./dataTypes/smjerovi')
const predmet=require('./dataTypes/predmeti')
const Users=require('./dataTypes/user')
const ejsLint = require('ejs-lint');
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const initializePassport = require('./passport-config')
var path = require('path');
require('dotenv').config()
const url="mongodb://localhost:27017/"
const MongoClient=require('mongodb').MongoClient
const mongo=require('mongodb')
var ObjectID = require('mongodb').ObjectID;
var userpage=require('./dataTypes/page')
var fs=require('fs')
var opener=require('opener')
var fr=require('./firstrun')

initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const userroute=require('./routes/users')
var skolskaGodina=process.env.skolskaGodina;
const users = []
var hashedPassword 

app.use(express.static(path.join(__dirname,'views')))
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
MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
  if(err) throw err
  
  //console.log(db.db(skolskaGodina).collection('users'))
  
  db.db(skolskaGodina).collection('users').find({}).toArray((err,res)=>{
 
    if(err) throw err
   if(res.length===0){
     console.log("this is first run")
    
     fr()
   }
    })
  })

//frontpage
app.get('/', checkNotAuthenticated, (req, res) => {
 

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
    
      
        
        
      
      
      res.render('./home/profesorhome.ejs',{
        odjeljenja:req.user.odjeljenjeKojimaPredaje,
        predmet:req.user.predmet,
        ime:req.user.ime,
        prezime:req.user.prezime
        
      
      
      })
    /*else{
      res.render('./home/razrednihome.ejs',{
        odjeljenja:req.user.odjeljenjeKojimaPredaje,
        razrednoOdjeljenje:req.user.razrednoOdjeljenje,
        predmet:req.user.predmet

      })
    }*/
  }else if(req.user.role==="ucenik"){
MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
  if(err) throw err
db.db(skolskaGodina).collection('userinfo').findOne({_userid:ObjectID(req.user._id)},(err,ucenik)=>{

if(err) throw err
res.render('./home/ucenik.ejs',{
  ime:req.user.ime,
  prezime:req.user.prezime,
predmeti:ucenik.predmeti})
})

})




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
MongoClient.connect(url,(err,db)=>{
  if (err) throw err
db.db(skolskaGodina).collection('predmeti').find({}).toArray((err,predmeti)=>{
  if (err) throw err


db.db(skolskaGodina).collection('odjeljenja').find({}).toArray((err,odjeljenja)=>{
  if (err) throw err

res.render("./register/regprofesor.ejs",{predmeti:predmeti,odjeljenja:odjeljenja})
})
})
})



 }else if(req.query.user==="ucenik"){
   
  MongoClient.connect(url,(err,db)=>{
    if (err) throw err
  db.db(skolskaGodina).collection('smjerovi').find({}).toArray((err,smjerovi)=>{
    if (err) throw err
  
  
  db.db(skolskaGodina).collection('odjeljenja').find({}).toArray((err,odjeljenja)=>{
    if (err) throw err
  
  res.render("./register/regucenik.ejs",{smjerovi:smjerovi,odjeljenja:odjeljenja})
  })
  })
  })


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
  var predmetparsed=[]
  if(typeof predmet=="object"){
  predmet.forEach(p=>{

    predmetparsed.push(JSON.parse(p))
  })
}else{
  predmetparsed=JSON.parse(predmet)
}
 
  MongoClient.connect(url,{ useUnifiedTopology: true },function(err,db){
    var dbo=db.db(skolskaGodina)
    var col=dbo.collection('users').findOne({email:req.body.email}, async (err,existingUser)=>{
          if(existingUser!==null){
    //render partial    
    regErrors.push({msg:"User with that email already exists!"})
      }
      
      if(regErrors.length>0){
    res.render('./register/regadmin.ejs',{
      regErrors,
    name,
    surname,
    email,razred,class2
    })
      }
      else{
          var hasshedPassword=await bcrypt.hash("changemeprofesor",10)
         var professor=new Users.Profesor(
           ime,
           prezime,
           email,
           hasshedPassword,
           predmetparsed,
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
  const {ime,prezime, email, adresa,odjeljenje,brojTelefona,imeroditelj1,telefonroditelj1,imeroditelj2,telefonroditelj2,jmbg}=req.body
  console.log(odjeljenje)
  var o=JSON.parse(odjeljenje)
console.log(o)
  MongoClient.connect(url,{ useUnifiedTopology: true },function(err,db){
    var dbo=db.db(skolskaGodina)
    var col=dbo.collection('users').findOne({email:req.body.email}, async (err,existingUser)=>{
    
      if(existingUser!==null){
    //render partial
    
    regErrors.push({msg:"User with that email already exists!"})
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
        
        
          var hasshedPassword=await bcrypt.hash("changeme",10);
       
        
        
        
         var ucenik=new Users.Ucenik(
           ime,
          prezime,
          email,
          hasshedPassword,
          brojTelefona,
          adresa,
          o.smjer,
          o.odjeljenje,
           imeroditelj1,
          telefonroditelj1,
          imeroditelj2,
          telefonroditelj2,
          jmbg,
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
    var dbo=db.db(skolskaGodina)
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
//razredni----------------------------------------------------------------------------------------------------------------------
app.get('/predmetiOdjeljenja',checkAuthenticated,(req,res)=>{
if((req.user.role==="profesor" && req.user.razrednoOdjeljenje!=="nema")||(req.user.role==="admin")){
  MongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
    if (err) throw err
  
    var dbo=db.db(skolskaGodina).collection('predmeti').find({}).toArray((err,predmeti)=>{
if (err) throw err



 res.render('predmeti.ejs',{
   predmeti:predmeti,

})
})
}) 
}
})

app.post('/predmetiOdjeljenja',checkAuthenticated,(req,res)=>{
  if((req.user.role==="profesor" && req.user.razrednoOdjeljenje!=="nema")||(req.user.role==="admin")){
console.log(req.body)
console.log(JSON.parse(req.body))
res.send("ok")

  }


}  )



//page--------------------------------------------------------------------------------------------------------
app.get('/addpage',checkAuthenticated,checkAdmin,(req,res)=>{
  
    
if(req.query.smjer===undefined){

    MongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
      if (err) throw err
    
    
  
  db.db(skolskaGodina).collection("odjeljenja").find({}).toArray((err,odjeljenja)=>{
    if(err) throw err
res.render("./page/page.ejs",{odjeljenja:odjeljenja})

  })
  db.close()
  }) 
}
})




app.get('/addpage/predmeti',checkAuthenticated,checkAdmin,(req,res)=>{
  var odjeljenje=JSON.parse(req.query.odjeljenje)

MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
if (err) throw err



 
 
  db.db(skolskaGodina).collection('predmeti').find({smjer:odjeljenje.smjer,razred:odjeljenje.odjeljenje[0]},{ projection: { _id: 0 } }).toArray((err,predmet)=>{
    if (err) throw err

    
    res.render('./page/pageadd.ejs',{
  predmeti:predmet,odjeljenje:odjeljenje
})
  })
  


})


})

app.post('/addpage',checkAuthenticated,checkAdmin,(req,res)=>{
const {predmet,imeRoditelja1,imeRoditelja2,jmbg,o}=req.body


 var odjeljenjepars=JSON.parse(o)
  
  var predmeti=[]
 
 predmet.forEach(p => {
   var pred=JSON.parse(p)
  
    predmeti.push(pred)
  
    
  })
 
  
  MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
 if(err) throw err

db.db(skolskaGodina).collection('users').find({odjeljenje:odjeljenjepars.odjeljenje,role:'ucenik'}).toArray((err,users)=>{
  if(err)throw err
  console.log(users.length)
  users.forEach(user => {
    
    var userpageins={
ime:user.ime,
prezime:user.prezime,
imeRoditelja1:imeRoditelja1,
imeRoditelja2:imeRoditelja2,
jmbg:jmbg,
_userid:user._id,
odjeljenje:user.odjeljenje,
email:user.email,
smjer:user.smjer,
brojTelefona:user.brojTelefona,
adresa:user.adresa,
ocjene:[],
predmeti

}
db.db(skolskaGodina).collection('userinfo').insertOne(userpageins,(err,res)=>{
  if (err) throw err
})
  });
 res.send('ok')
})


 
  




 
})

})


//-------------------------------------------------------------------------------------------------------------
//ocjene
app.get('/ocjene/ucenici',checkAuthenticated,checkProfesor,(req,res)=>{

  MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
    if(err) throw err
    
    db.db(skolskaGodina).collection('userinfo').find({odjeljenje:req.query.odjeljenje}).toArray((err,resp)=>{
      if(err) throw err
     
      res.render('./ocjene/ucenici.ejs',
      {ucenici:resp,
      ime:req.user.ime,
      prezime:req.user.prezime
      })
      
    })
  })

})
app.get('/ocjene/ucenik',checkAuthenticated,checkProfesor,(req,res)=>{

MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
if(err) throw err
db.db(skolskaGodina).collection('userinfo').findOne({_userid:ObjectID(req.query.ucenik)},(err,ucenik)=>{
if(err) throw err
res.render('./ocjene/ucenik.ejs',{
ucenik:ucenik,
predmet:req.user.predmet,
ime:req.user.ime,
prezime:req.user.prezime



})

})


})


})
app.get('/ocjene/predmet',checkAuthenticated,checkProfesor,(req,res)=>{

var p=JSON.parse(req.query.predmet)
var u=JSON.parse(req.query.ucenik)

res.render('./ocjene/predmet.ejs',{predmet:p,
  ucenik:u,
user_predmet:req.user.predmet,
brojpredmeta:req.user.predmet.length})

})
app.get('/ocjene/dodaj',checkAuthenticated,checkProfesor,(req,res)=>{

  var p=JSON.parse(req.query.predmet)
  var u=JSON.parse(req.query.ucenik)


res.render('./ocjene/dodaj.ejs',{
  predmet:p,
  ucenik:u,

})




  

  

})
app.post('/ocjene/dodaj',checkAuthenticated,checkProfesor,(req,res)=>{
  var p=JSON.parse(req.body.predmet)
  var u=JSON.parse(req.body.ucenik)
  var currentdate = new Date();
  var datetime =  + currentdate.getDate() + "/" + currentdate.getMonth() 
  + "/" + currentdate.getFullYear() + " @ " 
  + currentdate.getHours() + ":" 
  + currentdate.getMinutes() + ":" + currentdate.getSeconds();


var o=new Ocjena(
  req.body.ocjena,
  req.body.opis,
  datetime,
  (req.user.prezime+" "+req.user.ime),
  req.body.modul,
  p.ime
  )

 

MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
  if(err) throw err
  db.db(skolskaGodina).collection('userinfo').updateOne({_userid:ObjectID(u._userid)},{ $push: {ocjene:o} },(err,done)=>{

    if(err) throw err
    
  })

})
res.redirect('/home')
})

//-----------------------------------------------------------------------------------------------------
//ucenik
app.get('/ucenik/predmet',checkAuthenticated,(req,res)=>{

var predmet=JSON.parse(req.query.predmet)
MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
if(err) throw err
db.db(skolskaGodina).collection('userinfo').findOne({_userid:ObjectID(req.user._id)},(err,ucenik)=>{
  if(err) throw err
var ocjene=[]
ucenik.ocjene.forEach(o=>{
if(o.predmet===predmet.ime)
{
  ocjene.push(o)
}


})



res.render('./ucenik/predmet.ejs',{
  predmet:predmet,
  ime:req.user.ime,
  prezime:req.user.prezime,
  ocjene:ocjene


})
})

})

})



//admin only
//---------------------------------------------------------------------------------------------------------------------------------
app.get('/predmeti',checkAuthenticated,(req,res)=>{

if(req.user.role==="admin"){
if(req.query.action==="dodaj"){
  MongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
    if (err) throw err
    var dbo=db.db(skolskaGodina)
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
    var dbo=db.db(skolskaGodina)
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
      var dbo=db.db(skolskaGodina)
      const {ime,smjer,razred,brojModula,opis}=req.body
      var predmetInsert=new predmet(
        ime,
        razred,
       
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
app.get('/smjerovi',checkAuthenticated,checkAdmin,(req,res)=>{
 // if(req.user.role==="admin"){
    if(req.query.action==="dodaj"){
      res.render('./smjerovi/dodaj.ejs')
    }else{
    MongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
      if (err) throw err
      var dbo=db.db(skolskaGodina)
      var col=dbo.collection('smjerovi').find({}).toArray((err,resp)=>{
if(err) throw err
res.render('./smjerovi/smjerovi.ejs',{
  smjerovi:resp
})
      })
      
          })
  }
//}
})

app.post('/smjerovi/dodaj',checkAuthenticated,(req,res)=>{
  const {ime,opis}=req.body
  MongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
    if (err) throw err
    var dbo=db.db(skolskaGodina)
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
app.get('/odjeljenja',checkAuthenticated,(req,res)=>{
  if(req.user.role==="admin"){
    if(req.query.action==="dodaj"){
      MongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
        if (err) throw err
        var dbo=db.db(skolskaGodina)
        var col=dbo.collection('smjerovi').find({}).toArray((err,resp)=>{
  if(err) throw err
  res.render('./odjeljenja/dodaj.ejs',{
    smjerovi:resp
  })
        })
        
            })
     
    }else{
    MongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
      if (err) throw err
      var dbo=db.db(skolskaGodina)
      var col=dbo.collection('odjeljenja').find({}).toArray((err,resp)=>{
if(err) throw err
res.render('./odjeljenja/odjeljenja.ejs',{
  odjeljenja:resp
})
      })
      
          })
  }}


})
app.post('/odjeljenja/dodaj',checkAuthenticated,checkAdmin,(req,res)=>{
  const {odjeljenje,smjer}=req.body
  MongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
    if (err) throw err
    var dbo=db.db(skolskaGodina)
   
    var odjeljenjeinsert={
      odjeljenje:odjeljenje,
      smjer:smjer
    }

    var col=dbo.collection('odjeljenja').insertOne(odjeljenjeinsert,(err,succes)=>{
if (err) throw err
res.redirect('/odjeljenja')
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
function checkAdmin(req, res, next) {
  if (req.user.role==="admin") {
   return next()
  }
 else {
   return res.render('noauth.ejs')
 }
}
function checkProfesor(req, res, next) {
  if (req.user.role==="profesor") {
   return next()
  }
 else {
   return res.render('noauth.ejs')
 }
}
function checkRazredni(req, res, next) {
  if (req.user.role==="profesor" && req.user.razrednoOdjeljenje!=="nema") {
   return next()
  }
 else {
   return res.render('noauth.ejs')
 }
}
function checkUcenik(req, res, next) {
  if (req.user.role==="ucenik") {
   return next()
  }
 else {
   return res.render('noauth.ejs')
 }
}



//port
app.listen(3000)