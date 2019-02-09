const jwt = require('jsonwebtoken');

//===================
//VERIFICA TOKEN
//======================

let verificaToken = (req, res, next) => {
    let token = req.get('token');

    jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        req.usuario = decoded.usuario;

        next();
    })



};

let verificaRol = (req, res, next) => {


    let usuario = req.usuario;

    //console.log('usuario', usuario);


    if (usuario.role !== 'ADMIN_ROLE') {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Acceso denegado'
            }
        });

    }

    next();



};

module.exports = {
    verificaToken,
    verificaRol
};