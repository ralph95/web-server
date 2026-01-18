import express from "express";
import { getImage } from "../controllers/image.controller.js";

const router = express.Router();

router.get("/*imageKey", getImage);

export default router;
