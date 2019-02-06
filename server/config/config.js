//======================
// PUERTO
//========================

process.env.PORT = process.env.PORT || 3000;

//======================
// ENTORNO
//========================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//======================
// ENTORNO
//========================

let urlDB;

if (process.env.NODE_ENV === 'dev') {

    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb://userAdmin:Alito.2019@ds225375.mlab.com:25375/commic';
}


process.env.URLDB = urlDB;