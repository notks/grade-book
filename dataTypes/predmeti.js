class Predmet{
    constructor(ime,razred,brojModula,smjer,{opis}={}){
        this.ime=ime,
        this.smjer=smjer,
        this.razred=razred,
        this.brojModula=brojModula,
      
        this.opis=opis
        }


}

module.exports=Predmet