import { NextApiRequest, NextApiResponse } from 'next';
import { ApplicationRepository } from '../../../lib/db';
import {
  validateApplication,
  validatePagination,
} from '../../../lib/validation';
import {
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  parseQuery,
} from '../../../lib/utils';

const applicationRepo = new ApplicationRepository();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const query = parseQuery(req.query);
      const { page, limit } = validatePagination(query);

      const filters = {
        department: query.department,
        status: query.status,
        page,
        limit,
      };

      const { applications, total } = await applicationRepo.getApplications(filters);
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        createSuccessResponse(applications, 'Applications retrieved successfully', {
          page,
          limit,
          total,
          totalPages,
        })
      );
    }

    if (req.method === 'POST') {
      console.log('Received request body:', req.body); // Debug incoming body

      const validatedData = validateApplication(req.body);
      console.log('Validated application:', validatedData);

      // Insert the validated application into DB
      const created = await applicationRepo.createApplication(validatedData);

      return res.status(201).json(
        createSuccessResponse(created, 'Application created successfully')
      );
    }

    // Method not allowed
    return res.status(405).json(createErrorResponse('Method not allowed'));
  } catch (error: any) {
    console.error('Error in /api/applications:', error);
    return res.status(500).json(handleApiError(error));
  }
}
