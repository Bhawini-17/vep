export interface ApplicationData {
  id?: number;
  application_id?: string;
  department: string;
  item_category: string;
  item_name: string;
  item_description: string;
  technical_specs: string;
  compliance_requirements: string;
  estimated_value?: string;
  delivery_timeline?: string;
  previous_experience?: string;
  certifications?: string;
  status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  is_draft?: boolean;
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
}

export interface FileData {
  id?: number;
  application_id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  upload_date?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}