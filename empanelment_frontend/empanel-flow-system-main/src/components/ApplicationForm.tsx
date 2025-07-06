
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Save, Send, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    department: '',
    itemCategory: '',
    itemName: '',
    itemDescription: '',
    technicalSpecs: '',
    complianceRequirements: '',
    estimatedValue: '',
    deliveryTimeline: '',
    previousExperience: '',
    certifications: ''
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    
    const files = Array.from(event.target.files);
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    
    if (totalSize > 100 * 1024 * 1024) { // 100MB limit
      toast({
        title: "File Size Limit Exceeded",
        description: "Total file size should not exceed 100MB",
        variant: "destructive"
      });
      return;
    }
    
    setUploadedFiles(prev => [...prev, ...files]);
    toast({
      title: "Files Uploaded",
      description: `${files.length} file(s) uploaded successfully`
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    setIsDraft(true);
    toast({
      title: "Application Saved",
      description: "Your application has been saved as draft"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreementChecked) {
      toast({
        title: "Agreement Required",
        description: "Please accept the terms and conditions before submitting",
        variant: "destructive"
      });
      return;
    }
    
    // Generate application ID
    const appId = 'APP' + Date.now().toString().slice(-6);
    
    toast({
      title: "Application Submitted Successfully",
      description: `Your application has been submitted with ID: ${appId}`
    });
    
    // Reset form
    setFormData({
      department: '',
      itemCategory: '',
      itemName: '',
      itemDescription: '',
      technicalSpecs: '',
      complianceRequirements: '',
      estimatedValue: '',
      deliveryTimeline: '',
      previousExperience: '',
      certifications: ''
    });
    setUploadedFiles([]);
    setAgreementChecked(false);
    setIsDraft(false);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          New Empanelment Application
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Department Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="architecture">Architecture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itemCategory">Item Category *</Label>
              <Select onValueChange={(value) => handleInputChange('itemCategory', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="materials">Construction Materials</SelectItem>
                  <SelectItem value="equipment">Equipment & Machinery</SelectItem>
                  <SelectItem value="services">Professional Services</SelectItem>
                  <SelectItem value="components">Components & Parts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Item Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item/Service Name *</Label>
              <Input
                id="itemName"
                value={formData.itemName}
                onChange={(e) => handleInputChange('itemName', e.target.value)}
                placeholder="Enter item or service name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itemDescription">Detailed Description *</Label>
              <Textarea
                id="itemDescription"
                value={formData.itemDescription}
                onChange={(e) => handleInputChange('itemDescription', e.target.value)}
                placeholder="Provide detailed description of the item/service"
                className="min-h-[100px]"
                required
              />
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="technicalSpecs">Technical Specifications *</Label>
              <Textarea
                id="technicalSpecs"
                value={formData.technicalSpecs}
                onChange={(e) => handleInputChange('technicalSpecs', e.target.value)}
                placeholder="Enter technical specifications and requirements"
                className="min-h-[100px]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="complianceRequirements">Compliance Requirements *</Label>
              <Textarea
                id="complianceRequirements"
                value={formData.complianceRequirements}
                onChange={(e) => handleInputChange('complianceRequirements', e.target.value)}
                placeholder="List all compliance requirements and standards"
                className="min-h-[80px]"
                required
              />
            </div>
          </div>

          {/* Commercial Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedValue">Estimated Value (₹)</Label>
              <Input
                id="estimatedValue"
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                placeholder="Enter estimated value"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deliveryTimeline">Delivery Timeline</Label>
              <Input
                id="deliveryTimeline"
                value={formData.deliveryTimeline}
                onChange={(e) => handleInputChange('deliveryTimeline', e.target.value)}
                placeholder="e.g., 30 days, 2 months"
              />
            </div>
          </div>

          {/* Experience & Certifications */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="previousExperience">Previous Experience</Label>
              <Textarea
                id="previousExperience"
                value={formData.previousExperience}
                onChange={(e) => handleInputChange('previousExperience', e.target.value)}
                placeholder="Describe relevant previous experience with similar projects"
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications & Licenses</Label>
              <Textarea
                id="certifications"
                value={formData.certifications}
                onChange={(e) => handleInputChange('certifications', e.target.value)}
                placeholder="List relevant certifications and licenses"
                className="min-h-[60px]"
              />
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-4">
            <Label>Supporting Documents (Max 100MB total)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Upload supporting documents (PDF format preferred)
                </p>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="max-w-xs mx-auto"
                />
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files:</Label>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Declaration */}
          <Alert>
            <AlertDescription>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreement"
                  checked={agreementChecked}
                  onCheckedChange={(checked) => setAgreementChecked(checked === true)}
                />
                <div className="space-y-2">
                  <label htmlFor="agreement" className="text-sm font-medium cursor-pointer">
                    Declaration and Legal Compliance
                  </label>
                  <p className="text-xs text-gray-600">
                    I hereby declare that all information provided is true and accurate. 
                    I understand that any false information may lead to rejection of application 
                    and/or blacklisting from DMRC vendor panel.
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Form Actions */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            
            <Button type="submit" disabled={!agreementChecked}>
              <Send className="w-4 h-4 mr-2" />
              Submit Application
            </Button>
          </div>

          {isDraft && (
            <Alert>
              <AlertDescription>
                Your application has been saved as draft. You can continue editing and submit later.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ApplicationForm;
