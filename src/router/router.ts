import { Router } from "express";
import * as AccountController from "../controller/account-controller.js";
import * as HealthController from "../controller/health-controller.js";

const router = Router();
// bussiness
router.post("/accounts", AccountController.createAccount);
router.get("/accounts", AccountController.findAllAccounts);

// monitoring
router.get("/health", HealthController.health);

export default router;
