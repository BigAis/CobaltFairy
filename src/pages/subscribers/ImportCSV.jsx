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
  const [runAutomations, setRunAutomations] = useState(false);
  
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
      preview: 5, // Show only first 5 rows in preview
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
          
          // Set preview data - only include rows with valid data
          const validRows = results.data.filter(row => {
            // Check if row has at least some data and isn't just empty fields
            return Object.values(row).some(val => val !== null && val !== '');
          });
          setPreviewData(validRows.slice(0, 5));
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
      // Parse the entire CSV file to determine the number of rows
      const csvData = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: resolve,
          error: reject
        });
      });
      
      const rowCount = csvData.data.length;
      
      // Authentication
      const userData = JSON.parse(decodeURIComponent(localStorage.getItem('fairymail_session')));
      if (!userData || !userData.jwt) {
        throw new Error("Authentication required");
      }
      
      if (rowCount <= 10) {
        // Small file - process directly
        for (const row of csvData.data) {
          if (!row[mapping.email]) {
            console.warn('Skipping row with no email');
            continue;
          }
          
          const subscriberData = {
            email: row[mapping.email],
            name: row[mapping.name] || '',
            group: selectedGroup.value, // Using UDID directly
            automations: runAutomations
          };
          
          await ApiService.post(
            'fairymailer/insert-subscriber',
            subscriberData,
            userData.jwt
          );
        }
        
        PopupText.fire({
          text: `${rowCount} subscribers imported successfully!`,
          icon: 'success'
        });
        
      } else {
        // Large file - use the server endpoint for batch processing
        const formData = new FormData();
        formData.append('file', file);
        
        // Create metadata for the upload
        const metadata = {
          email: mapping.email,
          name: mapping.name || '',
          group: selectedGroup.value, // Using UDID directly
          automations: runAutomations
        };
        
        console.log('Uploading CSV with metadata:', metadata);
        
        formData.append('meta', JSON.stringify(metadata));
        
        // Send the CSV file to server for processing
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
        
        // Check the response
        if (response.data && response.data.code === 200) {
          const isFinished = response.data.finished === true;
          
          if (isFinished) {
            PopupText.fire({
              text: 'All subscribers imported successfully!',
              icon: 'success'
            });
          } else {
            PopupText.fire({
              text: 'Your CSV file is being processed in the background. You will receive an email when it\'s complete.',
              icon: 'info'
            });
          }
        } else {
          throw new Error('Unexpected response from server');
        }
      }
      
      // Notify parent and reset form
      onImportComplete();
      setFile(null);
      setHeaders([]);
      setPreviewData([]);
      setMapping({ email: '', name: '' });
      setRunAutomations(false);
      
    } catch (error) {
      console.error('Error uploading CSV:', error);
      
      let errorMessage = 'Error uploading CSV';
      
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
  
  // Improved renderPreview function
  const renderPreview = () => {
    if (!file || previewData.length === 0) return null;
    
    // Determine if we need scrolling based on the number of rows
    const needsScrolling = previewData.length > 10;
    
    return (
      <div className="preview-section">
        <h4>Preview {previewData.length > 0 ? `(${previewData.length} rows)` : ''}</h4>
        <div className={`preview-table-wrapper ${needsScrolling ? 'preview-table-scrollable' : ''}`}>
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
          
          <div className="automation-toggle">
            <label className="switch">
              <input 
                type="checkbox" 
                checked={runAutomations}
                onChange={() => setRunAutomations(!runAutomations)}
              />
              <span className="slider round"></span>
            </label>
            <span className="toggle-label">Run automations for these subscribers</span>
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