import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dishesRouter from "./dishes";
import chefRouter from "./chef";
import ordersRouter from "./orders";
import subscriptionsRouter from "./subscriptions";
import homeRouter from "./home";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dishesRouter);
router.use(chefRouter);
router.use(ordersRouter);
router.use(subscriptionsRouter);
router.use(homeRouter);

export default router;
