import express from "express";
import apiv1 from "./api/v1/index.js";

const router = express.Router();
router.use("/", apiv1);
export default router;
