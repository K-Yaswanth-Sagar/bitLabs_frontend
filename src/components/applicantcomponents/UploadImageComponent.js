import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { apiUrl } from '../../services/ApplicantAPIService';
import Snackbar from '../common/Snackbar';

Modal.setAppElement('#root'); 

const UploadImageComponent = ({ id}) => {
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');
  const [snackbars, setSnackbars] = useState([]);  

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'jpeg' || fileExtension === 'jpg' || fileExtension === 'png') {
      if (file.size < 1048576) { 
        setPhotoFile(file);
        setError('');
      } else {
        setError('File size must be less than 1 MB.');
        setPhotoFile(null);
      }
    } else {
      setError('Only JPEG and PNG files are allowed.');
      setPhotoFile(null);
    }
  };

  const addSnackbar = (snackbar) => {
    setSnackbars((prevSnackbars) => [...prevSnackbars, snackbar]);
  };

  const handleCloseSnackbar = (index) => {
    setSnackbars((prevSnackbars) => prevSnackbars.filter((_, i) => i !== index));
  };

  const uploadPhoto = async () => {
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const formData = new FormData();
      formData.append('photo', photoFile);

      const response = await axios.post(
        `${apiUrl}/applicant-image/${id}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      console.log('Photo uploaded successfully:', response.data);
      
      addSnackbar({ message: 'Photo uploaded successfully', type: 'success' });
      window.location.reload();
  

    } catch (error) {
      console.error('Error uploading photo:', error);
      
    }
  };

  return (
    <div id="upload-profile">
      <div className='popup-heading'>Upload your profile picture:JPG or PNG
      
      </div>
    
      <input
        className="up-file-edit"
        id="tf-upload-img"
        type="file"
        name="profile"
        accept="image/jpeg, image/png" 
        required=""
        onChange={handleFileSelect}
      />
      <button
        type="button"
        onClick={uploadPhoto}
        className="btn-3"
        style={{
          backgroundColor: '#F97316',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginLeft:'auto',
          marginRight:'0',
          marginTop: '15px',

          textTransform:'capitalize',
          
        }}
      >
        Upload Photo
      </button>
      {error && <div className="error-message">{error}</div>}
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={index}
          index={index}
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
          link={snackbar.link}
          linkText={snackbar.linkText}
        />
      ))}
    </div>
  );
};

export default UploadImageComponent;
