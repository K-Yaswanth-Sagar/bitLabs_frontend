import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useUserContext } from '../common/UserProvider';
import ModalWrapper from './ModalWrapper';
import ResumeBuilder from './ResumeBuilder';
import { apiUrl } from '../../services/ApplicantAPIService';
import Snackbar from '../common/Snackbar';

Modal.setAppElement('#root'); 

const ResumeEditPopup = ({ id, resumeFileName }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [fileName, setFileName] = useState(resumeFileName || ''); 
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbars, setSnackbars] = useState([]);
  const { user } = useUserContext();

  const openModal = () => setIsModalOpen(true);
 const closeModal = () => {
    setIsModalOpen(false);
    window.location.reload(); 
  };

  const handleInputChange = (event) => {
    setFileName(event.target.value);
  };

  const handleResumeSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are allowed.');
        setResumeFile(null);
        setFileName(''); 
      } else if (file.size > 1048576) { 
        setError('File size should be less than 1MB.');
        setResumeFile(null);
        setFileName(''); 
      } else {
        setResumeFile(file);
        setFileName(file.name); 
        setError('');
      }
    } else {
      setError('Please select a file.');
      setResumeFile(null);
      setFileName(''); 
    }
  };
  const triggerFileInputClick = () => {
    document.getElementById('tf-upload-resume').click();
  };

  const handleResumeUpload = async () => {
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const response = await axios.post(
        `${apiUrl}/resume/upload/${user.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      console.log(response.data);
     
      addSnackbar({ message: response.data, type: 'success' });
      window.location.reload();
    } catch (error) {
      console.error('Error uploading resume:', error);
     
      addSnackbar({ message: 'Error uploading resume. Please try again.', type: 'error' });
    }
  };

  const addSnackbar = (snackbar) => {
    setSnackbars((prevSnackbars) => [...prevSnackbars, snackbar]);
  };

  const handleCloseSnackbar = (index) => {
    setSnackbars((prevSnackbars) => prevSnackbars.filter((_, i) => i !== index));
  };
 
 
  return (
    <div id="upload-resume-editprofile">
      <div className="popup-heading-editprofile1">Resume</div>
      <div className="file-upload">
        <input
          className="up-file"
          id="tf-upload-resume"
          type="file"
          name="resume"
          accept="application/pdf"
          required=""
          onChange={handleResumeSelect}
        />
               
      </div>
      <div className="row-editprofile">
        <i className="file-icon"></i>
        <input
          type="text"
          value={fileName} 
          onChange={handleInputChange}
          className="file-name-input-resume"
          placeholder="No file selected"
        />
        <button
          type="button"
          onClick={triggerFileInputClick}
          className="browse-btn-resume"
        >
          Browse
        </button>
        <span className="separator">Or</span>
        <button
          type="button"
          onClick={openModal}
          className="build-btn-resume"
        >
          Build Your Resume
        </button>
      </div>
      <ModalWrapper isOpen={isModalOpen} onClose={closeModal} title="Build Your Resume">
        <ResumeBuilder />
      </ModalWrapper>
      {error && <div className="error-message">{error}</div>}
      <div className="save-resume">
        <button
          type="button"
          onClick={handleResumeUpload}
          className="save-btn-resume"
        >
          Save Changes
        </button>
      </div>
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

export default ResumeEditPopup;
