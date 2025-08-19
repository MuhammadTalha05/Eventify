import { Router } from "express";
import * as ctrl from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();
 
// SignUp and Verify Signup
router.post("/signup", ctrl.signup);
// router.post("/signup/verify", ctrl.signupVerify);

// Login 
router.post("/signin", ctrl.signin);
router.post("/login/verify", ctrl.verifyLogin);

// Reset Password and Verify Password
router.post("/password/reset", ctrl.resetPassword);
router.post("/password/verify", ctrl.verifyReset);


// Refeshing Access Token With Refresh Token
router.post("/token/refresh", ctrl.refreshAccessToken);


// Log Out With Access Token
router.post("/logout", requireAuth, ctrl.logout);

export default router;
