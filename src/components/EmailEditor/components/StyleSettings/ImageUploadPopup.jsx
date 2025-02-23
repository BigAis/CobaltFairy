import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import '../../assets/ImagePicker.scss'

const ImageUploadPopup = ({shown = false, setShown = ()=>{}, selectImage=(src)=>{}}) => {
    const [files, setFiles] = useState([]);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [activeTab, setActiveTab] = useState('upload'); // State to manage active tab

    useEffect(() => {
        // Load images from local storage on component mount
        const images = JSON.parse(localStorage.getItem('recentImages')) || [];
        setUploadedImages(images);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        onDrop: acceptedFiles => {
            // Process each file here
            acceptedFiles.forEach(file => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('fairymail_version', true);

                axios.post(`https://cdn.cobaltfairy.online/controller.php?user=${'debug_user'}&cmp=${btoa('debug_cmp')}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                .then(response => {
                    // Handle response here
                    if(response.data?.data && response.data?.data.length>0){
                        setUploadedImages(prev => [...prev, response.data.data[0]]);
                        updateLocalStorage(response.data.data[0]);
                        setActiveTab('mediaLibrary')
                    }
                })
                .catch(err => {
                    // Handle error here
                    console.error(err);
                });
            });
        }
    });

    const updateLocalStorage = (newImage) => {
        const updatedImages = [...uploadedImages, newImage];
        localStorage.setItem('recentImages', JSON.stringify(updatedImages));
    };

    return (
        shown && (
            <div className='fairyamil-imagepicker-backdrop' onClick={()=>{setShown(false)}}>
                <div className='fairyamil-imagepicker' onClick={(e)=>{e.stopPropagation()}}>
                    <div className='imagepicker-tabs' onClick={(e)=>{e.stopPropagation()}}>
                        <a onClick={() => setActiveTab('upload')} style={{ marginRight: '1px' }} className={activeTab === 'upload' ? 'active' : ''}>
                            Upload
                        </a>
                        <a onClick={() => setActiveTab('mediaLibrary')} className={activeTab === 'mediaLibrary' ? 'active' : ''}>
                            Media Library
                        </a>
                    </div>
                    <div className='tabContent'>
                        {activeTab === 'upload' && (
                            <div {...getRootProps()} style={{ border: '2px dashed black', padding: '20px', textAlign: 'center' }} className='dropzone'>
                                <input {...getInputProps()} />
                                <p>Drag 'n' drop some files here, or click to select files</p>
                            </div>
                        )}
                        {activeTab === 'mediaLibrary' && (
                            <div className='media-library'>
                                <h2>Recently Uploaded Images</h2>
                                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                    {uploadedImages.map((img, index) => {
                                        return (<div className="img-preview" onClick={()=>{selectImage(img);setShown(false)}} key={index} data-test={img} style={{backgroundImage:`url('${img}')`}}/>)
                                    }
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    );
};

export default ImageUploadPopup;
