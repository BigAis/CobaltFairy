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
  const [uploadMethod, setUploadMethod] = useState('direct'); // 'direct' or 'manual'
  const [uploadProgress, setUploadProgress] = useState(0);
  
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
  
  // Direct upload using the working example provided
  const directUpload = async () => {
    try {
      // Find the actual group ID from the selected group
      const selectedGroupObj = groups.find(g => g.udid === selectedGroup.value);
      if (!selectedGroupObj || !selectedGroupObj.id) {
        throw new Error('Could not find the group ID');
      }
      
      // Create form data exactly as shown in the working example
      const formData = new FormData();
      formData.append('file', file);
      
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
        throw new Error('Authentication required');
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
      
      return response;
    } catch (error) {
      console.error('Error in directUpload:', error);
      throw error;
    }
  };
  
  // Manual processing of the CSV file on the client
  const manualProcessing = async () => {
    try {
      // Get the user's JWT
      const userData = User.get();
      if (!userData || !userData.jwt) {
        throw new Error('Authentication required');
      }
      
      // Find the selected group
      const selectedGroupObj = groups.find(g => g.udid === selectedGroup.value);
      if (!selectedGroupObj) {
        throw new Error('Selected group not found');
      }
      
      // Parse the entire CSV file using PapaParse
      const csvResults = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: resolve,
          error: reject
        });
      });
      
      if (!csvResults.data || csvResults.data.length === 0) {
        throw new Error('No data found in CSV file');
      }
      
      console.log(`Processing ${csvResults.data.length} subscribers from CSV manually`);
      
      // Process in batches
      const batchSize = 5;
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < csvResults.data.length; i += batchSize) {
        const batch = csvResults.data.slice(i, i + batchSize);
        
        // Process each row in the batch
        const promises = batch.map(async (row) => {
          try {
            if (!row[mapping.email]) {
              console.warn('Skipping row with no email');
              return { success: false };
            }
            
            // Create subscriber
            const subscriberData = {
              email: row[mapping.email],
              name: row[mapping.name] || '',
              active: true
            };
            
            // Create the subscriber using regular JSON
            const response = await ApiService.post(
              'subscribers', 
              { data: subscriberData },
              userData.jwt
            );
            
            if (!response?.data?.data?.id) {
              return { success: false };
            }
            
            const subscriberId = response.data.data.id;
            
            // Add to group using PUT request only - we know the link endpoint doesn't work
            try {
              // Try different payload formats until one works
              const formats = [
                // Format 1: Strapi connect format
                {
                  data: {
                    subscribers: {
                      connect: [subscriberId]
                    }
                  }
                },
                // Format 2: Direct array format
                {
                  data: {
                    subscribers: [subscriberId]
                  }
                },
                // Format 3: Simple array append format
                {
                  subscribers: [subscriberId]
                }
              ];
              
              // Try each format until one works
              let success = false;
              
              for (const format of formats) {
                try {
                  await ApiService.put(
                    'groups/' + selectedGroupObj.id, 
                    format,
                    userData.jwt
                  );
                  
                  success = true;
                  break; // Break the loop if successful
                } catch (formatError) {
                  console.warn(`Group update failed with format:`, format, formatError);
                }
              }
              
              if (!success) {
                throw new Error('All group update formats failed');
              }
            } catch (updateError) {
              console.error('Error updating group:', updateError);
              throw updateError;
            }
            
            return { success: true };
          } catch (error) {
            console.warn(`Error processing row: ${error.message}`);
            return { success: false };
          }
        });
        
        // Wait for all promises in this batch
        const batchResults = await Promise.allSettled(promises);
        
        // Count successes and failures
        batchResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value.success) {
            successCount++;
          } else {
            failCount++;
          }
        });
        
        // Update progress indicator
        const progress = Math.round((i + batch.length) / csvResults.data.length * 100);
        setUploadProgress(progress);
        
        // Update UI periodically but not for every batch
        if (i % (batchSize * 2) === 0 || i + batch.length >= csvResults.data.length) {
          console.log(`Processing... ${progress}% complete`);
        }
      }
      
      return { successCount, failCount, total: csvResults.data.length };
    } catch (error) {
      console.error('Error in manualProcessing:', error);
      throw error;
    }
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
    setUploadProgress(0);
    
    try {
      let result;
      
      // Use the selected upload method
      if (uploadMethod === 'direct') {
        try {
          result = await directUpload();
          console.log('Direct upload succeeded:', result);
          
          PopupText.fire({
            text: 'Subscribers imported successfully!',
            icon: 'success'
          });
        } catch (directError) {
          console.error('Direct upload failed, switching to manual processing:', directError);
          
          // If direct method fails, try manual processing
          try {
            PopupText.fire({
              text: 'Server upload failed. Processing subscribers manually...',
              icon: 'info',
              showConfirmButton: false,
              timer: 2000
            });
            
            setUploadMethod('manual');
            
            const manualResult = await manualProcessing();
            
            PopupText.fire({
              text: `Import complete: ${manualResult.successCount} subscribers added successfully. ${manualResult.failCount} failed.`,
              icon: manualResult.successCount > 0 ? 'success' : 'warning'
            });
          } catch (manualError) {
            console.error('Manual processing also failed:', manualError);
            throw manualError;
          }
        }
      } else {
        // Direct manual processing if that was selected
        const manualResult = await manualProcessing();
        
        PopupText.fire({
          text: `Import complete: ${manualResult.successCount} subscribers added successfully. ${manualResult.failCount} failed.`,
          icon: manualResult.successCount > 0 ? 'success' : 'warning'
        });
      }
      
      // Notify parent and reset form
      onImportComplete();
      setFile(null);
      setHeaders([]);
      setPreviewData([]);
      setMapping({ email: '', name: '' });
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
      setUploadProgress(0);
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
  
  // Add progress bar styling to CSS
  const progressBarStyle = {
    width: '100%',
    height: '20px',
    backgroundColor: '#f0f0f0',
    borderRadius: '10px',
    margin: '20px 0',
    overflow: 'hidden'
  };
  
  const progressFillStyle = {
    height: '100%',
    backgroundColor: '#FF635D',
    width: `${uploadProgress}%`,
    transition: 'width 0.3s ease'
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
          
          <div className="upload-method-toggle">
            <label>Upload Method:</label>
            <div className="upload-method-options">
              <label>
                <input
                  type="radio"
                  name="uploadMethod"
                  checked={uploadMethod === 'direct'}
                  onChange={() => setUploadMethod('direct')}
                />
                Server Processing (Faster)
              </label>
              <label>
                <input
                  type="radio"
                  name="uploadMethod"
                  checked={uploadMethod === 'manual'}
                  onChange={() => setUploadMethod('manual')}
                />
                Client Processing (More Reliable)
              </label>
            </div>
          </div>
          
          {renderPreview()}
          
          {isUploading && (
            <div className="progress-container">
              <div style={progressBarStyle}>
                <div style={progressFillStyle}></div>
              </div>
              <div className="progress-text">{uploadProgress}% Complete</div>
            </div>
          )}
          
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