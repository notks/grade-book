class Ocjena{
constructor(id,ocjena,opis,datum,profesor,modul,predmet,{slika}={}){
    this.id=id,
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