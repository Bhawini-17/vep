import { NextApiRequest, NextApiResponse } from 'next';
import { ApplicationRepository } from '../../../lib/db';
import { validateApplication } from '../../../lib/validation';
import { createSuccessResponse, handleApiError } from '../../../lib/utils';
import { ApplicationData } from '../../../types/application';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const applicationRepo = new ApplicationRepository();

  try {
    if (req.method === 'POST') {
      const validatedData = validateApplication(req.body) as ApplicationData;
      
      const application = await applicationRepo.createApplication(validatedData);
      
      const message = validatedData.is_draft
        ? 'Application saved as draft successfully'
        : 'Application submitted successfully';
      
      return res.status(201).json(
        createSuccessResponse(application, message)
      );
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json(handleApiError(error));
  }
}