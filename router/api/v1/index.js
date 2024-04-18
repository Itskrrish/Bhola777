import express from "express";
import webrouter from "./web/index.js";

const router = express.Router();
router.use("/", webrouter);
export default router;
