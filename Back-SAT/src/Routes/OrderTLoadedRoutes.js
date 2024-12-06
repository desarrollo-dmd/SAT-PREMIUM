
const OrdenTLoadedController = require('../Controllers/OrdenTLoadedController');
const middleware = require('../Middleware/AuthJwt');

const express = require('express');
const router = express.Router();
// Define las rutas para los usuarios
router.post('/cargar', OrdenTLoadedController.CrateLoadedOrders);
router.post('/modificar', OrdenTLoadedController.UpdateLoadedOrders);
router.delete('/borrar/:id_ot', OrdenTLoadedController.DeleteLoadedOrders);
router.get('/listarOrdenesCargadas', OrdenTLoadedController.ListLoadedOrders);
router.get('/tablaOtCargadas', middleware.tokenAdmin, OrdenTLoadedController.TableOtCargadas);
router.get('/listaColumnas', middleware.tokenAdmin, OrdenTLoadedController.ListColumn);
router.post('/receiveAndCreateOrder', OrdenTLoadedController.ReceiveParamsandCreateLoadedOrders)
router.get('/listarOrdenesPorIdot/:idot', OrdenTLoadedController.ListLoadedOrdersByIdot)
router.get('/limits/:id_parametro_tango/:idequipo', OrdenTLoadedController.getLimits)


module.exports = router;