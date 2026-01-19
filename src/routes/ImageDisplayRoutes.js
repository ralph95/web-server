import express from "express";
import { getAllImages } from "../controllers/ImageController.js";

const router = express.Router();

// Only one route to return all images
router.get("/", getAllImages);

export default router;
