import { Router } from 'express';
import { AdminUserController } from '../../controllers/admin/user.controller';
import { authorizedMiddleware, adminMiddleware } from '../../middleware/unauthorized.middleware';

const adminUserRouter = Router();
const adminUserController = new AdminUserController();

adminUserRouter.post(
    '/create',  
    authorizedMiddleware,
    adminUserController.createUser
);

export default adminUserRouter;