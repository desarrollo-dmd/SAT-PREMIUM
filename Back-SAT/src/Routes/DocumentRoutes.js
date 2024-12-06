const express = require('express');
const Router = express.Router();
const DocumentController = require('../Controllers/DocumentController');
const middleware = require('../Middleware/AuthJwt');


Router.get('/obtenerDocumentos', middleware.tokenAdmin, DocumentController.GetDocumentsNames);
Router.post('/crear', middleware.tokenAdmin, DocumentController.CreateDocument);
Router.delete('/borrar/:id_documento', middleware.tokenAdmin, DocumentController.DeleteDocument);
Router.put('/modificar/:id_documento', middleware.tokenAdmin, DocumentController.UpdateDocument);


module.exports = Router;