class Ucenik{
    constructor(ime,prezime,email,password,brojTelefona,adresa,razred,odjeljenje,role){
        this.ime=ime,
        this.prezime=prezime,
        this.email=email,
        this.password=password,
        this.razred=razred,
        this.odjeljenje=odjeljenje,
        this.brojTelefona=brojTelefona,
        this.adresa=adresa,
        this.role=role
        }

}
class Profesor{
    constructor(ime,prezime,email,password,predmet,brojTelefona,adresa,role,{razrednoOdjeljenje}={}){
        this.ime=ime,
        this.prezime=prezime,
        this.email=email,
        this.password=password,
        this.brojTelefona=brojTelefona,
        this.adresa=adresa,
        this.predmet=predmet,
        this.razrednoOdjeljenje=razrednoOdjeljenje,
        this.role=role
        }

}
class Admin{
    constructor(ime,prezime,email,password,brojTelefona,adresa,role){
        this.ime=ime,
        this.prezime=prezime,
        this.email=email,
        this.password=password,
        this.brojTelefona=brojTelefona,
        this.adresa=adresa,
        this.role=role
        }
}
module.exports={
    Ucenik:Ucenik,
    Profesor:Profesor,
    Admin:Admin
}
