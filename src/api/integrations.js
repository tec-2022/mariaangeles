import { contentClient } from './contentClient';

export const Core = contentClient.integrations.Core;

export const InvokeLLM = contentClient.integrations.Core.InvokeLLM;

export const SendEmail = contentClient.integrations.Core.SendEmail;

export const UploadFile = contentClient.integrations.Core.UploadFile;

export const GenerateImage = contentClient.integrations.Core.GenerateImage;

export const ExtractDataFromUploadedFile = contentClient.integrations.Core.ExtractDataFromUploadedFile;

export const CreateFileSignedUrl = contentClient.integrations.Core.CreateFileSignedUrl;

export const UploadPrivateFile = contentClient.integrations.Core.UploadPrivateFile;
