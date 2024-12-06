const express = require('express');
const Router = express.Router();
const TypeEquipmentController = require('../Controllers/TypeEquipmentController');
const middleware = require('../Middleware/AuthJwt');


Router.get('/obtenerTipoEquipo', middleware.tokenAdmin, TypeEquipmentController.GetEquipmentsTypes);
Router.post('/crear', middleware.tokenAdmin, TypeEquipmentController.CreateEquipment);
Router.put('/modificar/:id_tipo_equipo', middleware.tokenAdmin, TypeEquipmentController.UpdateEquipment);
Router.delete('/borrar/:id_tipo_equipo', middleware.tokenAdmin, TypeEquipmentController.DeleteEquipment);

module.exports = Router;