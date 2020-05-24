require('dotenv').config()
const express = require('express')
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
const path = require('path');
const MongoClient=require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const fr=require('./firstrun')
const url=process.env.url
const skolskaGodina=process.env.skolskaGodina


initializePassport(passport)





app.use(express.static(path.join(__dirname,'views')))
app.set('view-engine', 'ejs')


app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret:process.env.hash,
  resave: false,
  saveUninitialized: false
}))


//passport
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
  if(err) throw err
  

  
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

  res.render('home.ejs')
})



//--------------------------------------------------------------------------------------------------------------------------------
//home
app.get('/home',checkAuthenticated,checkFirstTimeLogin,(req,res)=>{
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
db.db(skolskaGodina).collection('users').findOne({_id:ObjectID(req.user._id)},{ projection: { password: 0 } },(err,ucenik)=>{
if(err) throw err
res.render('./home/ucenik.ejs',{
  ime:req.user.ime,
  prezime:req.user.prezime,
predmeti:ucenik.predmeti})
})

})




  }
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
MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
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
   
  MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
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

app.post('/registerProfesor',checkAuthenticated,checkAdmin,(req,res)=>{

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
  predmetparsed.push(JSON.parse(predmet))
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
           true,
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
  var predmeti
  var ocjene=[]
 var role="ucenik"
  const {ime,prezime, email, adresa,odjeljenje,brojTelefona,imeroditelj1,telefonroditelj1,imeroditelj2,telefonroditelj2,jmbg}=req.body
  
  var o=JSON.parse(odjeljenje)

  MongoClient.connect(url,{ useUnifiedTopology: true },function(err,db){
    if(err) throw err
    
    db.db(skolskaGodina).collection('predmeti').find({smjer:o.smjer,razred:o.odjeljenje[0]},{projection:{procenti:0}}).toArray((err,predmet)=>{
      if (err) throw err
  predmeti=predmet
      

    })



    var dbo=db.db(skolskaGodina)
    var col=dbo.collection('users').findOne({email:req.body.email}, async (err,existingUser)=>{
    if(err) throw err;
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
          predmeti,
          ocjene,
          role,
          true)
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
  MongoClient.connect(url,{useUnifiedTopology:true},function(err,db){
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
           true
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

//-------------------------------------------------------------------------------------------------------------
//ocjene
app.get('/ocjene/ucenici',checkAuthenticated,checkProfesor,(req,res)=>{

  MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
    if(err) throw err
    
    db.db(skolskaGodina).collection('users').find({odjeljenje:req.query.odjeljenje},{ projection: { password: 0 } }).toArray((err,resp)=>{
      if(err) throw err
     
      res.render('./ocjene/ucenici.ejs',
      {ucenici:resp,
      ime:req.user.ime,
      prezime:req.user.prezime,
      odjeljenje:req.query.odjeljenje
      })
      
    })
  })

})
app.get('/ocjene/ucenik',checkAuthenticated,checkProfesor,(req,res)=>{
  
MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
if(err) throw err
db.db(skolskaGodina).collection('users').findOne({_id:ObjectID(req.query.ucenik)},{ projection: { password: 0 } },(err,ucenik)=>{
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
  if(req.query.action=="update"){

    MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
      if(err) throw err;
      db.db(skolskaGodina).collection('predmeti').updateOne({ime:p.ime,razred:p.razred,brojModula:p.brojModula,smjer:p.smjer,opis:p.opis},
        {$set:{procenti:
          {testModula:Number(req.query.Testmodula),
        pismenaProvjera:Number(req.query.Pismenaprovjera),
        esej:Number(req.query.Esej),
      usmenaprovjera:Number( req.query.Usmenaprovjera),
    aktivnost:Number(req.query.Aktivnost),
  vjezba:Number(req.query.Vjezba)}}},(err,done)=>{
    if(err) throw err

  })



    })
    
    }

 MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
if(err) throw err;

 db.db(skolskaGodina).collection('predmeti').findOne({_id:ObjectID(p._id)},(err,predmet)=>{
if (err) throw err


var ocjene=[]
u.ocjene.forEach(o=>{
if(o.predmet===predmet.ime)
{
  ocjene.push(o)
}
})


res.render('./ocjene/predmet.ejs',{predmet:predmet,
  ocjene:ocjene,
  ucenik:u,
user_predmet:req.user.predmet,
brojpredmeta:req.user.predmet.length})







})


  })


 
   

})
app.get('/ocjene/dodaj',checkAuthenticated,checkProfesor,(req,res)=>{


MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
    db.db(skolskaGodina).collection('users').findOne({_id:ObjectID(req.query.ucenik)},{ projection: { password: 0 } },(err,studentFromDb)=>{
if(err) throw err;

 db.db(skolskaGodina).collection('predmeti').findOne({ _id: ObjectID(req.query.predmet) }, (err, subjectFromDb) => {
    if (err) throw err
    
    res.render('./ocjene/dodaj.ejs',{
      predmet:subjectFromDb,
      ucenik:studentFromDb,
    
    })
  })
  })
  

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
  Math.random().toString(36).substring(2),
  req.body.ocjena,
  req.body.opis,
  datetime,
  (req.user.prezime+" "+req.user.ime),
  req.body.modul,
  p.ime
  )

 

MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
  if(err) throw err
  db.db(skolskaGodina).collection('users').updateOne({_id:ObjectID(u._id)},{ $push: {ocjene:o} },(err,done)=>{

    if(err) throw err
    res.redirect('/ocjene/ucenici?odjeljenje='+u.odjeljenje)
    db.db(skolskaGodina).collection('log').insertOne({
      type:"notify",
      msg:"Korisnik "+(req.user.prezime+" "+req.user.ime)+" je unio novu ocjenu iz predmeta "+p.ime+"!",
      odjeljenje:u.odjeljenje,
      datum:datetime,
      ip:req.ip
    },(err,res)=>{
      if(err)throw err;
    })
  })

})

})


app.get('/deleteGrade',checkAuthenticated,checkProfesor,(req,res)=>{
  MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
    if(err) throw err
    db.db(skolskaGodina).collection('users').findOne({_id:ObjectID(req.query.ucenik)},{ projection: { password: 0 } },(err,studentFromDb)=>{
if(err) throw err;

 db.db(skolskaGodina).collection('predmeti').findOne({ _id: ObjectID(req.query.predmet) }, (err, subjectFromDb) => {
    if (err) throw err
    
    var ocjene=[]
    studentFromDb.ocjene.forEach(o=>{
    if(o.predmet===subjectFromDb.ime)
    {
      ocjene.push(o)
    }
    })
  console.log(ocjene)
   res.render('./ocjene/delete.ejs',{
     ucenik:studentFromDb._id,
     ocjene:ocjene,
     ime:studentFromDb.ime,
     prezime:studentFromDb.prezime,
     predmet:subjectFromDb
   })
  })
  })
  

})


   
})
app.post('/deleteGrade',(req,res)=>{
  MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
if(err) throw err
db.db(skolskaGodina).collection('users').findOneAndUpdate({_id:ObjectID(req.body.student)},{ $pull: { ocjene: {id:req.body.id } } },(err,student)=>{
  if(err) throw err;
  console.log("done")
  res.redirect("/home")
})


  })
  
})

app.get('/testovi',checkAuthenticated,checkProfesor,(req,res)=>{
  res.render('./testovi/testoviGet.ejs',{
    odjeljenje:req.query.odjeljenje,
    predmeti:req.user.predmet
  })
  

})
app.post('/testovi',checkAuthenticated,checkProfesor,(req,res)=>{
  MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
    db.db(skolskaGodina).collection('users').find({odjeljenje:req.body.odjeljenje}).toArray((err,students)=>{
      if(err) throw err
      var studentsWithoutGrade=[]
  
   students.forEach(s=>{
     var brojOcijena=0
  s.ocjene.forEach(o=>{
  if(o.opis===req.body.test && o.predmet==req.body.predmet){
    brojOcijena=brojOcijena+1
  }
    
  })
  
  studentsWithoutGrade.push(
    {
      id:s._id,
      name:s.ime+" "+s.prezime,
      noGrades:brojOcijena
      
    }
  )
  
   })
   console.log(studentsWithoutGrade)
      res.render('./testovi/testoviShow.ejs',{
        studentsWithoutGrade:studentsWithoutGrade
      })
    })
  })

})
//-----------------------------------------------------------------------------------------------------
//ucenik
app.get('/ucenik/predmet',checkAuthenticated,(req,res)=>{

var predmet=JSON.parse(req.query.predmet)
MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
if(err) throw err
db.db(skolskaGodina).collection('users').findOne({_id:ObjectID(req.user._id)},{ projection: { password: 0 } },(err,ucenik)=>{
  if(err) throw err
var ocjene=[]
ucenik.ocjene.forEach(o=>{
if(o.predmet===predmet.ime)
{
  ocjene.push(o)
}


})

  if(err) throw err;
  
   db.db(skolskaGodina).collection('predmeti').findOne({_id:ObjectID(predmet._id)},(err,predmet)=>{
  if (err) throw err
  
  
  
  
  
  
  res.render('./ucenik/predmet.ejs',{
    predmet:predmet,
    ime:req.user.ime,
    prezime:req.user.prezime,
    ocjene:ocjene
  
  
  })
  
  
  
  
  
  
  
  })
  
  
    
  



})

})

})



//admin only
//---------------------------------------------------------------------------------------------------------------------------------
app.get('/logs',checkAuthenticated,checkAdmin,(req,res)=>{
MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
  if(err)throw err
  db.db(skolskaGodina).collection('log').find({}).toArray((err,logs)=>{
if(err) throw err
res.render('./log.ejs',{logs:logs})

  })
})


})

app.get('/manageusers',checkAuthenticated,checkAdmin,(req,res)=>{
  MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
if(err) throw err
    db.db(skolskaGodina).collection('users').find({},{projection:{_id:1,ime:1,prezime:1,role:1}}).toArray((err,users)=>{
    if(err) throw err
      res.render('./menageUsers/menageUsers.ejs',{
        users:users
      }) 
    })
  })
 

})
app.get('/menageUser',checkAuthenticated,checkAdmin,(req,res)=>{
  MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
    if(err) throw err
    db.db(skolskaGodina).collection('users').findOne({_id:ObjectID(req.query.id)},{projection:{password:0}},(err,user)=>{
      if(err) throw err
     if(user.role==="ucenik"){
       res.render('./menageUsers/menageUcenik.ejs',{
         id:req.query.id,
        ime:user.ime,
        prezime:user.prezime,
        odjeljenje:user.odjeljenje,
        tel:user.brojTelefona,
        tel1:user.telefonroditelj1,
        tel2:user.telefonroditelj2,
        rod1:user.imeroditelj1,
        rod2:user.imeroditelj2,
        jmbg:user.jmbg,
        smjer:user.smjer,
        adresa:user.adresa,
        email:user.email
         
       })
     }if(user.role==="profesor"){
      res.render('./menageUsers/menageProfesor.ejs',{
    id:req.query.id,
     ime:user.ime,
    tel:user.brojTelefona,
    prezime:user.prezime,
    odjeljenje:user.razrednoOdjeljenje,
    tel:user.brojTelefona,
    adresa:user.adresa,
    email:user.email
      })
     }
     if(user.role==="admin")
     res.render('./menageUsers/menageAdmin.ejs',{
      id:req.query.id,
      ime:user.ime,
      tel:user.brojTelefona,
      prezime:user.prezime,
      tel:user.brojTelefona,
      adresa:user.adresa,
      email:user.email
     })
    })
  })
  
})
app.post('/manageUsers',checkAuthenticated,checkAdmin,(req,res)=>{
  async function createPassword(){
     MongoClient.connect(url, { useUnifiedTopology: true }, async (err, db) => {
       if (err)
         throw err
       var password = await bcrypt.hash('changeme', 10)
       db.db(skolskaGodina).collection('users').findOneAndUpdate({ _id: ObjectID(req.body.id) }, { $set: { password: password } }, (err, resp) => {
         
         if (err)
           throw err
       })
     })
res.redirect('/manageusers')
    }


   
  if(req.body.action==="resetpwd"){
    
    createPassword()
    
   }

  
  if(req.body.action==="ucenik"){
   
const {name,surname,clas,dep,email,tel,p1tel,p2tel,adresa}=req.body
    
                   MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{

                   
             
                db.db(skolskaGodina).collection('users').findOneAndUpdate({_id:ObjectID(req.body.id)},
              {
                $set:{
                  ime:name,
                  prezime:surname,
                  smjer:dep,
                  odjeljenje:clas,
                  email:email,
                  brojTelefona:tel,
                  telefonroditelj2:p2tel,
                  telefonroditelj1:p1tel,
                  adresa:adresa
                }
              },(err,response)=>{
              if(err)throw err
                res.redirect('/manageusers')
              })
             
            })


            
          
        
       
            }  
            if(req.body.action==="profesor"){
   
              const {name,surname,clas,email,tel,adresa}=req.body
                  
                                 MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
              
                                 
                           
                              db.db(skolskaGodina).collection('users').findOneAndUpdate({_id:ObjectID(req.body.id)},
                            {
                              $set:{
                                ime:name,
                                prezime:surname,
                                razrednoOdjeljenje:clas,
                                email:email,
                                brojTelefona:tel,
                                adresa:adresa
                              }
                            },(err,response)=>{
                            if(err)throw err
                              res.redirect('/manageusers')
                            })
                           
                          })
              
              
                          
                        
                      
                     
                          }  
                          if(req.body.action==="admin"){
   
                            const {name,surname,email,tel,adresa}=req.body
                                
                                               MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
                            
                                               
                                         
                                            db.db(skolskaGodina).collection('users').findOneAndUpdate({_id:ObjectID(req.body.id)},
                                          {
                                            $set:{
                                              ime:name,
                                              prezime:surname,
                                              email:email,
                                              brojTelefona:tel,
                                              adresa:adresa
                                            }
                                          },(err,response)=>{
                                          if(err)throw err
                                            res.redirect('/manageusers')
                                          })
                                         
                                        })
                            
                            
                                        
                                      
                                    
                                   
                                        }  


      
  
})/*
  if(req.user.role==="profesor"){
    const {oldpwd,newpwd,newpwd2,email,tel,clas,adresa}=req.body
    console.log("body:"+req.body)
     try{
       MongoClient.connect(url,{useUnifiedTopology:true},async(err,db)=>{
         if(err)throw err
         console.log("oldpwd"+oldpwd)
         if(oldpwd!=''){
            
  
         
           await bcrypt.compare(oldpwd,req.user.password,async(err,match)=>{
             if (err) throw err
             if(match){
              console.log("match")
              

               if (newpwd===newpwd2){
                console.log("new"+newpwd)
                console.log("new2"+newpwd2)

                 
 var password=await bcrypt.hash(newpwd,10)
                 db.db(skolskaGodina).collection('users').findOneAndUpdate({_id:ObjectID(req.user._id)},
               {
                 $set:{
                   email:email,
                   adresa:adresa,
                   brojTelefona:tel,
                   password:password,
                   razrednoOdjeljenje:clas
                 }
               },(err,response)=>{
               if(err)throw err
                 res.redirect(307,'/logout?_method=DELETE')
               })
               }else{
                 
                 res.send("Not matching passwords")
               }
             
 
 
             }
           })
         }
         
         db.db(skolskaGodina).collection('users').findOneAndUpdate({_id:ObjectID(req.user._id)},
         {$set:{
           email:email,
           brojTelefona:tel,
           adresa:adresa,
           razrednoOdjeljenje:clas
         }},(err,response)=>{
           if(err)throw err
           res.redirect(307,'/logout?_method=DELETE')
         })
       })
 
 
     }catch(e){
      if (e) throw e
     }
       
   }if(req.user.role==="admin"){
     const {oldpwd,newpwd,newpwd2,email,tel,adresa}=req.body
     console.log(req.body)

     try{
       MongoClient.connect(url,{useUnifiedTopology:true},async(err,db)=>{
         if(err)throw err
                   console.log("oldpwd"+oldpwd)

         if(oldpwd!=''){

          
           await bcrypt.compare(oldpwd,req.user.password,async(err,match)=>{
             if(match){
              console.log("match")

               if (newpwd===newpwd2){
                 
                console.log("new"+newpwd)
                console.log("new2"+newpwd2)
 var password=await bcrypt.hash(newpwd,10)
                 db.db(skolskaGodina).collection('users').findOneAndUpdate({_id:ObjectID(req.user._id)},
               {
                 $set:{
                   email:email,
                   brojTelefona:tel,
                   adresa:adresa,
                   password:password
                 }
               },(err,response)=>{
                console.log("inertedpwd")

               if(err)throw err
                 res.redirect(307,'/logout?_method=DELETE')
               })
               }else{
                 
                 res.send("Not matching passwords")
               }
             
 
 
             }
           })
         }else{
db.db(skolskaGodina).collection('users').findOneAndUpdate({_id:ObjectID(req.user._id)},
         {$set:{
           email:email,
           brojTelefona:tel,
           adresa:adresa
         }},(err,response)=>{
           console.log("inerted no pwd")
           if(err)throw err
           res.redirect(307,'/logout?_method=DELETE')
         })

         }
         
         
       })
 
 
     }catch(e){
      if (e) throw e
     }
       
   }

*/

//})

app.get('/predmeti',checkAuthenticated,checkAdmin,(req,res)=>{

if(req.user.role==="admin"){
  if(req.query.del!=undefined){
MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
if(err) throw err;
db.db(skolskaGodina).collection("predmeti").deleteOne({_id:ObjectID(req.query.del)},(err,done)=>{
if(err) throw err

res.redirect("/predmeti")
})


})

  }
if(req.query.action==="dodaj"){
  MongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
    if (err) throw err
    var dbo=db.db(skolskaGodina)
    var col=dbo.collection('users').find({role:"profesor"},{ projection: { password: 0 } }).toArray((err,users)=>{
if (err) throw err
var usersfromDB=users
var col=dbo.collection('smjerovi').find({}).toArray((err,smjerovi)=>{
if(err) throw err
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

//settings
//--------------------------------------------------------------------------------------------------------------------
app.get('/settings',checkAuthenticated,(req,res)=>{
if(req.user.role==="admin"){
  res.render('./settings/adminsettings.ejs',{
    ime:req.user.ime,
    tel:req.user.brojTelefona,
    prezime:req.user.prezime,
    tel:req.user.brojTelefona,
    adresa:req.user.adresa,
    email:req.user.email
  })
}
if(req.user.role==="profesor"){
  res.render('./settings/profesorsettings.ejs',{
    ime:req.user.ime,
    tel:req.user.brojTelefona,
    prezime:req.user.prezime,
    odjeljenje:req.user.razrednoOdjeljenje,
    tel:req.user.brojTelefona,
    adresa:req.user.adresa,
    email:req.user.email
  })
}
if(req.user.role==="ucenik"){
  
 res.render('./settings/uceniksettings.ejs',{
   ime:req.user.ime,
   prezime:req.user.prezime,
   odjeljenje:req.user.odjeljenje,
   tel:req.user.brojTelefona,
   tel1:req.user.telefonroditelj1,
   tel2:req.user.telefonroditelj2,
   rod1:req.user.imeroditelj1,
   rod2:req.user.imeroditelj2,
   jmbg:req.user.jmbg,
   smjer:req.user.smjer,
   adresa:req.user.adresa,
   email:req.user.email
 })
}
})
app.post('/settings',checkAuthenticated,async(req,res)=>{
 if(req.user.role==="ucenik"){
 
    try{
const {oldpwd,newpwd,newpwd2,email,tel,p1tel,p2tel,adresa}=req.body
      MongoClient.connect(url,{useUnifiedTopology:true},async(err,db)=>{
        if(err)throw err
        
        if(oldpwd!=''){
         
         
          await bcrypt.compare(oldpwd,req.user.password,async(err,match)=>{
            if(err) throw err
            if(match){
             
              if (newpwd===newpwd2){
                
                
var password=await bcrypt.hash(newpwd,10)
                db.db(skolskaGodina).collection('users').findOneAndUpdate({_id:ObjectID(req.user._id)},
              {
                $set:{
                  email:email,
                  brojTelefona:tel,
                  telefonroditelj2:p2tel,
                  telefonroditelj1:p1tel,
                  password:password,
                  adresa:adresa
                }
              },(err,response)=>{
              if(err)throw err
                res.redirect('/logout?_method=DELETE',307)
              
              })
              }else{
                
              }
            


            }
          })
        }
        
        db.db(skolskaGodina).collection('users').findOneAndUpdate({_id:ObjectID(req.user._id)},
        {$set:{
          email:email,
          brojTelefona:tel,
          telefonroditelj2:p2tel,
          telefonroditelj1:p1tel,
          adresa:adresa
        }},(err,response)=>{
          if(err)throw err
          res.redirect(307,'/logout?_method=DELETE')
        })
      })


    }catch(e){
      if (e) throw e
      
    }
      
  }
  if(req.user.role==="profesor"){
    const {oldpwd,newpwd,newpwd2,email,tel,clas,adresa}=req.body
    console.log("body:"+req.body)
     try{
       MongoClient.connect(url,{useUnifiedTopology:true},async(err,db)=>{
         if(err)throw err
         console.log("oldpwd"+oldpwd)
         if(oldpwd!=''){
            
  
         
           await bcrypt.compare(oldpwd,req.user.password,async(err,match)=>{
             if(match){
              console.log("match")
              

               if (newpwd===newpwd2){
                console.log("new"+newpwd)
                console.log("new2"+newpwd2)

                 
 var password=await bcrypt.hash(newpwd,10)
                 db.db(skolskaGodina).collection('users').findOneAndUpdate({_id:ObjectID(req.user._id)},
               {
                 $set:{
                   email:email,
                   adresa:adresa,
                   brojTelefona:tel,
                   password:password,
                   razrednoOdjeljenje:clas
                 }
               },(err,response)=>{
               if(err)throw err
                 res.redirect(307,'/logout?_method=DELETE')
               })
               }else{
                 
                 res.send("Not matching passwords")
               }
             
 
 
             }
           })
         }
         
         db.db(skolskaGodina).collection('users').findOneAndUpdate({_id:ObjectID(req.user._id)},
         {$set:{
           email:email,
           brojTelefona:tel,
           adresa:adresa,
           razrednoOdjeljenje:clas
         }},(err,response)=>{
           if(err)throw err
           res.redirect(307,'/logout?_method=DELETE')
         })
       })
 
 
     }catch(e){
      if (e) throw e
     }
       
   }if(req.user.role==="admin"){
     const {oldpwd,newpwd,newpwd2,email,tel,adresa}=req.body
     console.log(req.body)

     try{
       MongoClient.connect(url,{useUnifiedTopology:true},async(err,db)=>{
         if(err)throw err
                   console.log("oldpwd"+oldpwd)

         if(oldpwd!=''){

          
           await bcrypt.compare(oldpwd,req.user.password,async(err,match)=>{
             if(match){
              console.log("match")

               if (newpwd===newpwd2){
                 
                console.log("new"+newpwd)
                console.log("new2"+newpwd2)
 var password=await bcrypt.hash(newpwd,10)
                 db.db(skolskaGodina).collection('users').findOneAndUpdate({_id:ObjectID(req.user._id)},
               {
                 $set:{
                   email:email,
                   brojTelefona:tel,
                   adresa:adresa,
                   password:password
                 }
               },(err,response)=>{
                console.log("inertedpwd")

               if(err)throw err
                 res.redirect(307,'/logout?_method=DELETE')
               })
               }else{
                 
                 res.send("Not matching passwords")
               }
             
 
 
             }
           })
         }else{
db.db(skolskaGodina).collection('users').findOneAndUpdate({_id:ObjectID(req.user._id)},
         {$set:{
           email:email,
           brojTelefona:tel,
           adresa:adresa
         }},(err,response)=>{
           console.log("inerted no pwd")
           if(err)throw err
           res.redirect(307,'/logout?_method=DELETE')
         })

         }
         
         
       })
 
 
     }catch(e){
      if (e) throw e
     }
       
   }


})
//first time login password change-----------------------------------------------------------------------------------------------
app.get('/firstlogin',checkAuthenticated,(req,res)=>{
  res.render('firstlogin.ejs',
  {
    name:req.user.ime,
    surname:req.user.prezime
  
  })
})
app.post('/firstlogin',checkAuthenticated,async(req,res)=>{
  if(req.body.newpassword1===req.body.newpassword2){
  var newpassword=await bcrypt.hash(req.body.newpassword1,10)
  MongoClient.connect(url,{useUnifiedTopology:true},(err,db)=>{
  if(err) throw err
  db.db(skolskaGodina).collection('users').findOneAndUpdate({_id:ObjectID(req.user._id)},{$set:{password:newpassword,firstlogin:false}},(err,response)=>{
    if(err) throw err
    res.redirect(307,'/logout?_method=DELETE')
  })
})

}else{
    res.redirect(307,'/logout?_method=DELETE')
  }

})
//-----------------------------------------------------------------------------------------------------------------------------------
//logout
app.delete('/logout',checkAuthenticated, (req, res) => {
 
  req.logOut()
  res.redirect('/login')
})

//middleware-----------------------------------------------------------------------------------------

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
  if (req.user.role==="profesor" || req.user.role==="admin") {
   return next()
  }
 else {
   return res.render('noauth.ejs')
 }
}
 function checkFirstTimeLogin(req,res,next){
   if(req.user.firstlogin===true){
     return res.redirect('/firstlogin')
   }
   next()
   
 }




//port
app.listen(3000)