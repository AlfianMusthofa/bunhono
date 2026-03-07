import type { Context } from "hono";
import {
  downloadCertificateService,
  getCertificateTemplateService,
  updateCertificateService,
  uploadCertificateTemplateService,
} from "../service/certificate-service";
import { Event } from "../models/event.model";

export const uploadCertificateTemplate = async (c: Context) => {
  const eventId = Number(c.req.param("id"));

  const event = await Event.findByPk(eventId);
  if (!event) {
    return c.json({ message: "Event not found!" }, 404);
  }

  if (Number.isNaN(eventId)) {
    return c.json({ message: "Invalid event id" }, 400);
  }

  const formData = await c.req.formData();
  const file = formData.get("template") as File;

  if (!file) {
    return c.json({ message: "Template file is required" }, 400);
  }

  const result = await uploadCertificateTemplateService({
    eventId,
    file,
  });

  return c.json({
    message: "Template uploaded successfully",
    data: result,
  });
};

export const getCertificateTemplate = async (c: Context) => {
  const eventId = Number(c.req.param("id"));

  if (Number.isNaN(eventId)) {
    return c.json({ message: "Invalid event id" }, 400);
  }

  const result = await getCertificateTemplateService(eventId);

  if (!result) {
    return c.json({ message: "Certificate template not found" }, 404);
  }

  return c.json({
    message: "Success",
    data: result,
  });
};

export const downloadCertificate = async (c: Context) => {
  const authUser = c.get("user") as { id: number };
  const userId = authUser.id;

  const eventId = Number(c.req.param("id"));

  if (Number.isNaN(eventId)) {
    return c.json({ message: "Invalid event id" }, 400);
  }

  const result = await downloadCertificateService({
    userId,
    eventId,
  });

  if (!result) {
    return c.json({ message: "Certificate not available" }, 404);
  }

  c.header("Content-Type", "application/pdf");
  c.header(
    "Content-Disposition",
    `attachment; filename="certificate-${eventId}.pdf"`,
  );

  return c.body(new Uint8Array(result));
};

export const updateCertificate = async (c: Context) => {
  const eventId = Number(c.req.param("id"));
  const formData = await c.req.formData();
  const file = formData.get("imageCertificate") as File;

  if (!eventId) {
    return c.json({ message: "Event not found" }, 404);
  }

  try {
    const result = await updateCertificateService({ file, eventId });
    return c.json({
      data: result,
    });
  } catch (error: any) {
    if (error.message === "CERTIF_NOT_FOUND") {
      return c.json({ message: "Certif nof found" }, 404);
    }
    if (error.message === "IMAGE_REQUIRED") {
      return c.json({ message: "Image is required" }, 404);
    }
    console.log(error);
    return c.json(
      {
        message: "Internal Server Error",
      },
      500,
    );
  }
};
