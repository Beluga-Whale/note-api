import express from "express";
import {
  signUp,
  login,
  logout,
  getAuthenticatedUser,
} from "../controllers/users.controller";
const router = express.Router();

router.get("/", getAuthenticatedUser);
router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);

export default router;
