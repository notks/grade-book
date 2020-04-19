            function showsettings(){
           
            var settings = document.getElementById("settings");
        var body=document.getElementById("body");
            var settingsbtn=document.getElementById("settingsbtn");
                var main=document.getElementById("main");
          if(settings.style.display=="block"){
              
                  settings.style.display = "none";
        
          }else{
              
                  settings.style.display="block";
        
          }
        
            window.onclick = function(event) {
            if (event.target == settings ||event.target == body  ||event.target == main ) {
            settings.style.display = "none";
            
            
                }
            }
        }
            
        function show (o){
var x=JSON.parse(o)

var modal = document.getElementById("myModal");

var ocjena=document.getElementById('modal-content')
modal.style.display="block";

ocjena.innerHTML="<table class=ocjenatable >"+
"<tr>"+
"<td rowspan=2 style=font-size:130px;>"+x.ocjena+"</td>"+
"<td style=text-align:start;font-size:50px; >"+x.profesor+"</td>"+
"<td rowspan=2 style=width:40%;font-size:50px; >"+ x.opis+"</td></tr>"+

"<tr><td style=text-align:left;font-size:30px; >"+x.datum+"</td></tr></table>"

 
window.onclick = function(event) {
if (event.target == modal) {
modal.style.display = "none";
}
}



}    
function checkprocent(){
var f2=document.getElementById("procenat")



}

function checkzakljucna(o){

console.log(o)
var btn=document.getElementById("zakljucna")
if(Number(o)<2.1){
btn.style.backgroundColor="#c94b4b"
}

}
function changecolor(o){
var x=JSON.parse(o)
var btn =document.getElementById("ocjena")
if(x.opis=="Test modula"){
  console.log("modul")
btn.style.backgroundColor="red"
}

}

