import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Dropdown from '../../components/Dropdown';
import { ApiService } from '../../service/api-service';
import User from '../../service/User';
import PopupText from '../../components/PopupText/PopupText';
import './ImportCSV.scss';

const ImportCSV = ({ groups = [], onImportComplete = () => {} }) => {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({
    email: '',
    name: '',
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  
  // Auto-select first group if only one exists
  useEffect(() => {
    if (groups.length === 1 && !selectedGroup) {
      setSelectedGroup({
        value: groups[0].udid,
        label: groups[0].name
      });
    }
  }, [groups, selectedGroup]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => handleFileDrop(acceptedFiles),
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: false
  });
  
  const handleFileDrop = (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setFile(file);
    
    // Parse CSV to get headers and preview data
    Papa.parse(file, {
      header: true,
      preview: 5,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          // Get headers from CSV
          const headers = results.meta.fields || [];
          setHeaders(headers);
          
          // Try to find email and name columns automatically
          const emailColumn = headers.find(h => 
            ['email', 'e-mail', 'email address'].includes(h.toLowerCase())
          ) || '';
          
          const nameColumn = headers.find(h => 
            ['name', 'full name', 'first_name', 'firstname'].includes(h.toLowerCase())
          ) || '';
          
          setMapping({
            email: emailColumn,
            name: nameColumn
          });
          
          // Set preview data
          setPreviewData(results.data.slice(0, 5));
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        PopupText.fire({
          text: `Error parsing CSV: ${error.message}`,
          icon: 'error'
        });
      }
    });
  };
  
  const handleGroupSelect = (option) => {
    setSelectedGroup(option);
  };
  
  const handleMappingChange = (field, value) => {
    setMapping({
      ...mapping,
      [field]: value
    });
  };
  
  // Server-only upload using the exact format from the working example
  const uploadCSV = async () => {
    if (!file || !mapping.email || !selectedGroup) {
      PopupText.fire({
        text: 'Please select a file, map the email field, and select a group',
        icon: 'warning'
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Find the actual group ID from the selected group
      const selectedGroupObj = groups.find(g => g.udid === selectedGroup.value);
      if (!selectedGroupObj || !selectedGroupObj.id) {
        throw new Error('Could not find the group ID');
      }
      
      // Create form data exactly as shown in the working example
      const formData = new FormData();
      
      // Use file[0] if it's an array, otherwise use file directly
      if (Array.isArray(file)) {
        formData.append('file', file[0]);
      } else {
        formData.append('file', file);
      }
      
      // Create metadata using the exact format expected by server
      const metadata = {
        email: mapping.email,           // header value for subscriber email
        name: mapping.name || '',       // header value for subscriber name
        group: selectedGroupObj.id,     // numeric id of the group
      };
      
      // Log what we're sending
      console.log('Uploading CSV with metadata:', metadata);
      
      formData.append('meta', JSON.stringify(metadata));
      
      // Get the user's JWT
      const userData = User.get();
      if (!userData || !userData.jwt) {
        throw new Error("Authentication required");
      }
      
      // Follow the exact pattern from the working example
      const response = await ApiService.post(
        'fairymailer/upload-csv',
        formData,
        userData.jwt,
        {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + userData.jwt
        }
      );
      
      console.log('CSV upload response:', response);
      
      PopupText.fire({
        text: 'Subscribers imported successfully!',
        icon: 'success'
      });
      
      // Notify parent and reset form
      onImportComplete();
      setFile(null);
      setHeaders([]);
      setPreviewData([]);
      setMapping({ email: '', name: '' });
      
    } catch (error) {
      console.error('Error uploading CSV:', error);
      
      let errorMessage = 'Error uploading CSV to server';
      
      if (error.response?.data?.error?.message) {
        errorMessage += `: ${error.response.data.error.message}`;
      } else if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      PopupText.fire({
        text: errorMessage,
        icon: 'error'
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const groupOptions = groups.map(group => ({
    value: group.udid,
    label: group.name
  }));
  
  // Format to help debug the preview data
  const renderPreview = () => {
    if (!file || previewData.length === 0) return null;
    
    return (
      <div className="preview-container">
        <h4>Preview (first 5 rows)</h4>
        <div className="preview-table-wrapper">
          <table className="preview-table">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className={
                    mapping.email === header ? 'mapped-email' : 
                    mapping.name === header ? 'mapped-name' : ''
                  }>
                    {header}
                    {mapping.email === header && <span className="mapping-tag email-tag">Email</span>}
                    {mapping.name === header && <span className="mapping-tag name-tag">Name</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((header, colIndex) => (
                    <td key={colIndex}>{String(row[header] || '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="import-csv-card">
      <h3>Import Subscribers from CSV</h3>
      
      <div className="dropzone-container" {...getRootProps()}>
        <input {...getInputProps()} />
        {
          file ? (
            <div className="file-info">
              <div className="file-name">{file.name}</div>
              <div className="file-size">({(file.size / 1024).toFixed(2)} KB)</div>
              <Button 
                type="secondary" 
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setHeaders([]);
                  setPreviewData([]);
                }}
              >
                Change File
              </Button>
            </div>
          ) : (
            <div className="dropzone-content">
              {isDragActive ? (
                <p>Drop the CSV file here...</p>
              ) : (
                <>
                  <div className="upload-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p>Drag 'n' drop some files here, or click to select files</p>
                  <div className="file-format-hint">
                    <small>
                      Your CSV file should include columns for email and name.
                    </small>
                  </div>
                </>
              )}
            </div>
          )
        }
      </div>
      
      {file && headers.length > 0 && (
        <div className="mapping-container">
          <h4>Map CSV Columns</h4>
          
          <div className="mapping-fields">
            <div className="mapping-field">
              <label>Email Column (required)</label>
              <Dropdown
                options={headers.map(header => ({ value: header, label: header }))}
                selectedValue={mapping.email ? { value: mapping.email, label: mapping.email } : null}
                onOptionSelect={(option) => handleMappingChange('email', option.value)}
              >
                Select Email Column
              </Dropdown>
            </div>
            
            <div className="mapping-field">
              <label>Name Column (optional)</label>
              <Dropdown
                options={headers.map(header => ({ value: header, label: header }))}
                selectedValue={mapping.name ? { value: mapping.name, label: mapping.name } : null}
                onOptionSelect={(option) => handleMappingChange('name', option.value)}
              >
                Select Name Column
              </Dropdown>
            </div>
            
            <div className="mapping-field">
              <label>Target Group (required)</label>
              <Dropdown
                options={groupOptions}
                selectedValue={selectedGroup}
                onOptionSelect={handleGroupSelect}
              >
                Select Group
              </Dropdown>
            </div>
          </div>
          
          {renderPreview()}
          
          <div className="submit-container">
            <Button 
              onClick={uploadCSV} 
              disabled={isUploading || !mapping.email || !selectedGroup}
              loading={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Import Subscribers'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ImportCSV;