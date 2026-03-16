import { Router } from "express";
import { listEnquiries, requestOtp, submitEnquiry, verifyOtp } from "../controllers/enquiry.controller";
import verifyAdmin from "../middleware/verifyAdmin";
import requirePermission from "../middleware/requirePermission";

const router = Router();

router.post("/otp/request", requestOtp);
router.post("/otp/verify", verifyOtp);
router.post("/", submitEnquiry);
router.get("/", verifyAdmin, requirePermission("enquiries"), listEnquiries);

export default router;
