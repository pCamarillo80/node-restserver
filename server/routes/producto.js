const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');
const Producto = require('../models/producto');
const _ = require('underscore');
const app = express();


app.get('/productos', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 10;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .limit(limite)
        .skip(desde)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .sort('nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.count({ disponible: true }, (err, cuantos) => {

                res.json({
                    ok: true,
                    productos,
                    numRegistros: cuantos
                });

            });

        });


});

app.get('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById({ _id: id })
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El id no existe'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });



        });


});

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .sort('nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }


            res.json({
                ok: true,
                producto: productos
            });



        });


})

app.post('/productos', verificaToken, (req, res) => {


    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //console.log(categoriaDB);

        res.json({
            ok: true,
            producto: productoDB
        });
    });

});



app.put('/productos/:id', verificaToken, (req, res) => {

    let _id = req.params.id;
    let body = req.body;

    let productoDesc = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id,
        disponible: body.disponible
    }



    Producto.findByIdAndUpdate(_id, productoDesc, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            categoria: productoDB
        });
    });
});

app.delete('/productos/:id', verificaToken, (req, res) => {

    let _id = req.params.id;

    Producto.findByIdAndUpdate(_id, { disponible: false }, { new: true }, (err, productoDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Producto eliminado correctamente'
        });

    });


});



module.exports = app;