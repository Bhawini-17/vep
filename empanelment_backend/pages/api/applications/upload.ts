import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { FileUploadService } from '../../../lib/storage';
import { FileRepository } from '../../../lib/db';
import { createSuccessResponse, createErrorResponse, handleApiError } from '../../../lib/utils';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const fileUploadService = new FileUploadService();
  const fileRepo = new FileRepository();

  try {
    if (req.method === 'POST') {
      const form = new IncomingForm({
        maxFileSize: 100 * 1024 * 1024, // 100MB
        multiples: true,
        uploadDir: './temp',
        keepExtensions: true,
      });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(400).json(createErrorResponse('Error parsing form data', err.message));
        }

        const applicationId = Array.isArray(fields.application_id)
          ? fields.application_id[0]
          : fields.application_id;

        if (!applicationId) {
          return res.status(400).json(createErrorResponse('Application ID is required'));
        }

        try {
          const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files];
          const validFiles = uploadedFiles.filter(Boolean);

          const savedFiles = await fileUploadService.saveMultipleFiles(validFiles, applicationId);
          
          // Save file info to database
          const dbFiles = [];
          for (const fileData of savedFiles) {
            const dbFile = await fileRepo.saveFileInfo(fileData);
            dbFiles.push(dbFile);
          }

          return res.status(200).json(
            createSuccessResponse(
              dbFiles,
              `${dbFiles.length} file(s) uploaded successfully`
            )
          );
        } catch (uploadError) {
          return res.status(500).json(handleApiError(uploadError));
        }
      });
    } else {
      return res.status(405).json(createErrorResponse('Method not allowed'));
    }
  } catch (error) {
    return res.status(500).json(handleApiError(error));
  }
}
