import { NextApiRequest, NextApiResponse } from 'next';
import { ApplicationRepository } from '../../../lib/db';
import { createSuccessResponse, createErrorResponse, handleApiError } from '../../../lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const applicationRepo = new ApplicationRepository();

  try {
    if (req.method === 'GET') {
      const { applications, total } = await applicationRepo.getApplications({
        status: 'draft',
        page: 1,
        limit: 50,
      });
      
      return res.status(200).json(
        createSuccessResponse(applications, 'Draft applications retrieved successfully')
      );
    }
    
    return res.status(405).json(createErrorResponse('Method not allowed'));
  } catch (error) {
    return res.status(500).json(handleApiError(error));
  }
}
