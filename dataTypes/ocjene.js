class Ocjena{
constructor(ocjena,opis,datum,profesor,modul,predmet,{slika}={}){
this.ocjena=ocjena,
this.opis=opis,
this.datum=datum,
this.profesor=profesor,
this.modul=modul,
this.predmet=predmet,
this.slika=slika
}
}
module.exports=Ocjena