class Predmet{
    constructor(ime,razred,brojModula,smjer,{opis}={},procenti){
        this.ime=ime,
        this.smjer=smjer,
        this.razred=razred,
        this.brojModula=brojModula,
      
        this.opis=opis
        this.procenti=procenti
        }


}

module.exports=Predmet