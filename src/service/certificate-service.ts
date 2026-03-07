import { Certificate } from "../models/certificate.model";
import { EventParticipantModel } from "../models/eventParticipant.model";
import { User } from "../models/user.model";
import { generateCertificate } from "../utils/generateCertificate";
import { saveImage } from "../utils/upload";

type UploadTemplateInput = {
  eventId: number;
  file: File;
};

export const uploadCertificateTemplateService = async (
  input: UploadTemplateInput,
) => {
  const { eventId, file } = input;
  const uploadResult = await saveImage(file);
  const certificate = await Certificate.create({
    eventId,
    participantId: null,
    templatePath: uploadResult.secure_url,
  });
  return certificate;
};

export const getCertificateTemplateService = async (eventId: number) => {
  const certificate = await Certificate.findOne({
    where: {
      eventId,
      participantId: null,
    },
  });

  return certificate;
};

type DownloadCertificateInput = {
  userId: number;
  eventId: number;
};

export const downloadCertificateService = async (
  input: DownloadCertificateInput,
) => {
  const { userId, eventId } = input;

  const participant = await EventParticipantModel.findOne({
    include: [
      {
        model: User,
        attributes: ["name"],
      },
    ],
    where: { userId, eventId },
  });

  if (!participant) return null;

  const template = await Certificate.findOne({
    where: {
      eventId,
      participantId: null,
    },
  });

  if (!template) return null;

  const pdfBuffer = await generateCertificate({
    templateUrl: template.templatePath,
    participantName: participant.User?.name ?? "Participant",
  });

  return pdfBuffer;
};

type UpdateCertificateInput = {
  eventId: number;
  file: File;
};

export const updateCertificateService = async (
  input: UpdateCertificateInput,
) => {
  const { eventId, file } = input;

  const existingTemplate = await Certificate.findOne({
    where: {
      eventId,
      participantId: null,
    },
  });

  if (!file) {
    throw new Error("IMAGE_REQUIRED");
  }

  const uploadResult = await saveImage(file);

  if (!existingTemplate) {
    const newCertificate = await Certificate.create({
      eventId,
      participantId: null,
      templatePath: uploadResult.secure_url,
    });
    return newCertificate;
  }

  if (file) {
    const uploadResult = await saveImage(file);
    existingTemplate.certificatePath = uploadResult.secure_url;
  }

  await existingTemplate.save();
  return existingTemplate;
};
