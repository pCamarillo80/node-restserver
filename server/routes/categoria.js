const express = require('express');
const { verificaToken, verificaRol } = require('../middlewares/autenticacion');
const Categoria = require('../models/categoria');


const _ = require('underscore');

const app = express();

app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find()
        .populate('usuario', 'nombre email')
        .sort('descripcion')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.count({}, (err, cuantos) => {

                res.json({
                    ok: true,
                    categorias,
                    numRegistros: cuantos
                });

            });

        });


});

app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById({ _id: id })
        .exec((err, categoriaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El id no existe'
                    }
                });
            }

            res.json({
                ok: true,
                categoria: categoriaDB
            });



        });


})

app.post('/categoria', verificaToken, (req, res) => {


    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //console.log(categoriaDB);

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});


app.put('/categoria/:id', verificaToken, (req, res) => {

    let _id = req.params.id;
    let body = _.pick(req.body, ['descripcion']);

    console.log(body);

    Categoria.findByIdAndUpdate(_id, body, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

app.delete('/categoria/:id', [verificaToken, verificaRol], (req, res) => {

    let _id = req.params.id;

    Categoria.findByIdAndDelete({ _id }, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria eliminada correctamente'
        });


    });

});


module.exports = app;