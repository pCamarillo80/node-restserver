const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload({ useTempFiles: true }));


app.put('/upload/:tipo/:id', function(req, res) {


    let tipo = req.params.tipo;
    let id = req.params.id;

    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son: ' + tiposValidos.join(', ')
            }
        });

    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado algún archivo'
            }
        });
    }

    let archivo = req.files.archivo;

    let nombreArchivo = archivo.name.split('.');
    let extension = nombreArchivo[nombreArchivo.length - 1];
    let extensionesValidas = ['png', 'jpg', 'gif']

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'La extensión extensiones permitidas son: ' + extensionesValidas.join(', ')
            }
        });

    }

    // renombrar el archivo
    let nuevoNombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${nuevoNombreArchivo}`, (err) => {
        if (err)
            return res.status(500).send(err);

        if (tipo === 'usuarios') {
            guardaImagenUsuario(id, res, nuevoNombreArchivo)
        } else {
            guardaImagenProducto(id, res, nuevoNombreArchivo)
        }



    });

});

function guardaImagenUsuario(id, res, nuevoNombreArchivo) {

    Usuario.findById({ _id: id })
        .exec((err, usuarioDB) => {
            if (err) {
                borraImagen(nuevoNombreArchivo, 'usuarios');
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            if (!usuarioDB) {
                borraImagen(nuevoNombreArchivo, 'usuarios');
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El usuario no existe'
                    }
                })
            }

            borraImagen(usuarioDB.img, 'usuarios');

            usuarioDB.img = nuevoNombreArchivo;

            usuarioDB.save((err, usuarioActualizado) => {
                res.json({
                    ok: true,
                    usuario: usuarioActualizado,
                    img: nuevoNombreArchivo
                });
            });

        });


};

function guardaImagenProducto(id, res, nuevoNombreArchivo) {

    Producto.findById({ _id: id })
        .exec((err, productoDB) => {
            if (err) {
                borraImagen(nuevoNombreArchivo, 'productos');
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            if (!productoDB) {
                borraImagen(nuevoNombreArchivo, 'productos');
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El producto no existe'
                    }
                })
            }

            borraImagen(productoDB.img, 'productos');

            productoDB.img = nuevoNombreArchivo;

            productoDB.save((err, productoActualizado) => {
                res.json({
                    ok: true,
                    producto: productoActualizado
                });
            });

        });


};

function borraImagen(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;