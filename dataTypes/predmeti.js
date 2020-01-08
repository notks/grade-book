class Predmet{
    constructor(ime,razred,profesor,brojModula,smjer,{opis}={}){
        this.ime=ime,
        this.smjer=smjer,
        this.razred=razred,
        this.brojModula=brojModula,
        this.profesor=profesor
        this.opis=opis
        }


}

module.exports=Predmet