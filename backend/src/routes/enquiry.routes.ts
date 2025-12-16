import { Router } from "express";
import { listEnquiries, requestOtp, submitEnquiry, verifyOtp } from "../controllers/enquiry.controller";

const router = Router();

router.post("/otp/request", requestOtp);
router.post("/otp/verify", verifyOtp);
router.post("/", submitEnquiry);
router.get("/", listEnquiries);

export default router;
