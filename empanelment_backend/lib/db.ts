import mysql from 'mysql2/promise';
import { ApplicationData, FileData } from '../types/application';

class DatabaseConnection {
  private connection: mysql.Connection | null = null;

  async getConnection(): Promise<mysql.Connection> {
    if (!this.connection) {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '3306'),
      });
    }
    return this.connection;
  }

  async closeConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }
}

export class ApplicationRepository {
  private db = new DatabaseConnection();

  async createApplication(data: ApplicationData): Promise<ApplicationData> {
    const conn = await this.db.getConnection();
    
    try {
      const applicationId = this.generateApplicationId();
      
      const [result] = await conn.execute(
        `INSERT INTO applications 
         (application_id, department, item_category, item_name, item_description, 
          technical_specs, compliance_requirements, estimated_value, delivery_timeline, 
          previous_experience, certifications, status, is_draft, submitted_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          applicationId,
          data.department,
          data.item_category,
          data.item_name,
          data.item_description,
          data.technical_specs,
          data.compliance_requirements,
          data.estimated_value || null,
          data.delivery_timeline || null,
          data.previous_experience || null,
          data.certifications || null,
          data.is_draft ? 'draft' : 'submitted',
          data.is_draft || false,
          data.is_draft ? null : new Date()
        ]
      );

      // Log the action
      await this.logApplicationHistory(applicationId, 'created', null, data.is_draft ? 'draft' : 'submitted');

      return await this.getApplicationById(applicationId);
    } catch (error) {
      throw new Error(`Failed to create application: ${error}`);
    }
  }

  async getApplicationById(applicationId: string): Promise<ApplicationData> {
    const conn = await this.db.getConnection();
    
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM applications WHERE application_id = ?',
        [applicationId]
      );
      
      const applications = rows as ApplicationData[];
      if (applications.length === 0) {
        throw new Error('Application not found');
      }
      
      return applications[0];
    } catch (error) {
      throw new Error(`Failed to get application: ${error}`);
    }
  }

  async updateApplication(applicationId: string, data: Partial<ApplicationData>): Promise<ApplicationData> {
    const conn = await this.db.getConnection();
    
    try {
      const currentApp = await this.getApplicationById(applicationId);
      
      const fields = [];
      const values = [];
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'application_id') {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });
      
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }
      
      values.push(applicationId);
      
      await conn.execute(
        `UPDATE applications SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE application_id = ?`,
        values
      );

      // Log the action
      await this.logApplicationHistory(applicationId, 'updated', currentApp.status, data.status || currentApp.status);

      return await this.getApplicationById(applicationId);
    } catch (error) {
      throw new Error(`Failed to update application: ${error}`);
    }
  }

  async getApplications(filters: {
    department?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ applications: ApplicationData[]; total: number }> {
    const conn = await this.db.getConnection();
    
    try {
      const { department, status, page = 1, limit = 10 } = filters;
      const offset = (page - 1) * limit;
      
      let whereClause = '';
      const params: any[] = [];
      
      if (department || status) {
        const conditions = [];
        if (department) {
          conditions.push('department = ?');
          params.push(department);
        }
        if (status) {
          conditions.push('status = ?');
          params.push(status);
        }
        whereClause = `WHERE ${conditions.join(' AND ')}`;
      }
      
      // Get total count
      const [countResult] = await conn.execute(
        `SELECT COUNT(*) as total FROM applications ${whereClause}`,
        params
      );
      const total = (countResult as any[])[0].total;
      
      // Get applications
      const [rows] = await conn.execute(
        `SELECT * FROM applications ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
      
      return {
        applications: rows as ApplicationData[],
        total
      };
    } catch (error) {
      throw new Error(`Failed to get applications: ${error}`);
    }
  }

  async deleteApplication(applicationId: string): Promise<void> {
    const conn = await this.db.getConnection();
    
    try {
      await conn.execute('DELETE FROM applications WHERE application_id = ?', [applicationId]);
      await this.logApplicationHistory(applicationId, 'deleted', 'draft', 'deleted');
    } catch (error) {
      throw new Error(`Failed to delete application: ${error}`);
    }
  }

  private generateApplicationId(): string {
    return 'APP' + Date.now().toString().slice(-6);
  }

  private async logApplicationHistory(
    applicationId: string,
    action: string,
    oldStatus: string | null,
    newStatus: string,
    remarks?: string
  ): Promise<void> {
    const conn = await this.db.getConnection();
    
    try {
      await conn.execute(
        'INSERT INTO application_history (application_id, action, old_status, new_status, remarks) VALUES (?, ?, ?, ?, ?)',
        [applicationId, action, oldStatus, newStatus, remarks || null]
      );
    } catch (error) {
      console.error('Failed to log application history:', error);
    }
  }
}

export class FileRepository {
  private db = new DatabaseConnection();

  async saveFileInfo(fileData: FileData): Promise<FileData> {
    const conn = await this.db.getConnection();
    
    try {
      const [result] = await conn.execute(
        `INSERT INTO application_files 
         (application_id, file_name, original_name, file_path, file_size, file_type) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          fileData.application_id,
          fileData.file_name,
          fileData.original_name,
          fileData.file_path,
          fileData.file_size,
          fileData.file_type
        ]
      );

      const insertId = (result as any).insertId;
      return await this.getFileById(insertId);
    } catch (error) {
      throw new Error(`Failed to save file info: ${error}`);
    }
  }

  async getFileById(id: number): Promise<FileData> {
    const conn = await this.db.getConnection();
    
    try {
      const [rows] = await conn.execute('SELECT * FROM application_files WHERE id = ?', [id]);
      const files = rows as FileData[];
      
      if (files.length === 0) {
        throw new Error('File not found');
      }
      
      return files[0];
    } catch (error) {
      throw new Error(`Failed to get file: ${error}`);
    }
  }

  async getFilesByApplicationId(applicationId: string): Promise<FileData[]> {
    const conn = await this.db.getConnection();
    
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM application_files WHERE application_id = ? ORDER BY upload_date DESC',
        [applicationId]
      );
      
      return rows as FileData[];
    } catch (error) {
      throw new Error(`Failed to get files: ${error}`);
    }
  }

  async deleteFile(id: number): Promise<void> {
    const conn = await this.db.getConnection();
    
    try {
      await conn.execute('DELETE FROM application_files WHERE id = ?', [id]);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }
}
