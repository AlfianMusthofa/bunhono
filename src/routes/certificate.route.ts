import { Hono } from "hono";
import {
  downloadCertificate,
  getCertificateTemplate,
  updateCertificate,
  uploadCertificateTemplate,
} from "../controllers/certificate.controllers";
import { downloadParticipantsReport } from "../controllers/report.controllers";
import { authMiddleware } from "../middleware/auth.middleware";

const route = new Hono();

route.get("/:id/get", getCertificateTemplate);
route.get("/:id/participants/report", downloadParticipantsReport);
route.get("/:id/download", authMiddleware, downloadCertificate);
route.post("/:id/upload", uploadCertificateTemplate);
route.put("/:id/update", updateCertificate);

export default route;
