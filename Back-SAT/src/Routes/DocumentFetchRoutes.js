const express = require('express');
const Router = express.Router();
const DocumentFetchController = require('../Controllers/DocumentFetchController');
const middleware = require('../Middleware/AuthJwt');


Router.get('/obtenerRelaciones', middleware.tokenAdmin, DocumentFetchController.GetRelations);
Router.post('/crear', middleware.tokenAdmin, DocumentFetchController.CreateRelations);
Router.delete('/Delete', middleware.tokenAdmin, DocumentFetchController.DeleteRelations);


module.exports = Router;