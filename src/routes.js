import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import DeliverymanController from './app/controllers/DeliverymanController';
import DeliverymanOrdersController from './app/controllers/DelivermanOrdersController';
import IssueController from './app/controllers/IssueController';
import OrderController from './app/controllers/OrderController';
import OrderIssueController from './app/controllers/OrderIssueController';
import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';
import UploadController from './app/controllers/UploadController';
import UserController from './app/controllers/UserController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

/* All routes below requires a valid session */
routes.put('/users', UserController.update);

routes.post('/recipients', RecipientController.store);
routes.get('/recipients/:id', RecipientController.show);
routes.put('/recipients/:id', RecipientController.update);
routes.get('/recipients', RecipientController.index);
routes.delete('/recipients/:id', RecipientController.delete);

routes.post('/deliverymen', DeliverymanController.store);
routes.put('/deliverymen/:id', DeliverymanController.update);
routes.get('/deliverymen/:id', DeliverymanController.show);
routes.get('/deliverymen', DeliverymanController.index);
routes.delete('/deliverymen/:id', DeliverymanController.delete);

routes.get(
  '/deliveryman/:deliveryman_id/orders',
  DeliverymanOrdersController.show
);
routes.put(
  '/deliveryman/:deliveryman_id/orders/:order_id',
  DeliverymanOrdersController.update
);

routes.post('/orders', OrderController.store);
routes.put('/orders/:id', OrderController.update);
routes.get('/orders/:id', OrderController.show);
routes.get('/orders', OrderController.index);
routes.delete('/orders/:id', OrderController.delete);

routes.post('/order/:order_id/issues', OrderIssueController.store);
routes.get('/order/:order_id/issues', OrderIssueController.show);
routes.get('/issues', OrderIssueController.index);

routes.delete('/issue/:id/cancel-order', IssueController.delete);

routes.post('/upload', upload.single('file'), UploadController.store);

export default routes;
