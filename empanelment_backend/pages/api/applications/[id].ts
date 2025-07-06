import { NextApiRequest, NextApiResponse } from 'next';
import { ApplicationRepository, FileRepository } from '../../../lib/db';
import { validateUpdateApplication } from '../../../lib/validation';
import { createSuccessResponse, createErrorResponse, handleApiError } from '../../../lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const applicationRepo = new ApplicationRepository();
  const fileRepo = new FileRepository();

  try {
    const { id } = req.query;

    if (typeof id !== 'string') {
      return res.status(400).json(createErrorResponse('Invalid application ID'));
    }

    if (req.method === 'GET') {
      const application = await applicationRepo.getApplicationById(id);
      const files = await fileRepo.getFilesByApplicationId(id);
      
      return res.status(200).json(
        createSuccessResponse(
          { ...application, files },
          'Application retrieved successfully'
        )
      );
    }

    if (req.method === 'PUT') {
      const validatedData = validateUpdateApplication(req.body);
      
      const updatedApplication = await applicationRepo.updateApplication(id, {
  ...validatedData,
  updated_at: new Date().toISOString(), 
});
      
      return res.status(200).json(
        createSuccessResponse(updatedApplication, 'Application updated successfully')
      );
    }

    if (req.method === 'DELETE') {
      await applicationRepo.deleteApplication(id);
      
      return res.status(200).json(
        createSuccessResponse(null, 'Application deleted successfully')
      );
    }

    return res.status(405).json(createErrorResponse('Method not allowed'));
  } catch (error) {
    return res.status(500).json(handleApiError(error));
  }
}