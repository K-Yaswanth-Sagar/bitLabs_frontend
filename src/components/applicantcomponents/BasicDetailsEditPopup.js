import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import Snackbar from '../common/Snackbar';

const BasicDetailsEditPopup = ({ applicantDetails }) => {
  const [formValues, setFormValues] = useState({
    firstName: applicantDetails&&applicantDetails.firstName || '',
    lastName: applicantDetails&&applicantDetails.lastName || '',
    email: applicantDetails&&applicantDetails.email || '',
    alternatePhoneNumber: applicantDetails&&applicantDetails.alternatePhoneNumber || '',
  });
  const [errors, setErrors] = useState({});
  const [snackbars, setSnackbars] = useState([]);
  const navigate = useNavigate();
  const user1 = useUserContext();
  const user = user1.user;

  const validateInput = (name, value) => {
    let error = '';
    if (!value.trim()) { // Check if value is empty or contains only spaces
        let formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        if (name === 'alternatePhoneNumber') {
            formattedName = 'Mobile Number';
        }
        error = `${formattedName} is required.`;
    } else {
        if (name === 'firstName' || name === 'lastName') {
            if (!/^[a-zA-Z\s]*$/.test(value.trim())) {
                error = `${name === 'firstName' ? 'First' : 'Last'}name should contain only letters and spaces.`;
            }
        } else if (name === 'alternatePhoneNumber') {
            if (!/^[6789]\d{9}$/.test(value)) {
                error = 'Mobile number should be 10 digits, starting with 6, 7, 8, or 9.';
            }
        } 
    }
    return error;
};
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    setErrors({ ...errors, [name]: validateInput(name, value) });
  };

  const addSnackbar = (snackbar) => {
    setSnackbars((prevSnackbars) => [...prevSnackbars, snackbar]);
  };

  const handleCloseSnackbar = (index) => {
    setSnackbars((prevSnackbars) => prevSnackbars.filter((_, i) => i !== index));
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formValues).forEach((key) => {
      const error = validateInput(key, formValues[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.put(`${apiUrl}/applicantprofile/${user.id}/basic-details`, formValues, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (response.status === 200) {
         
          addSnackbar({ message: 'Personal details updated successfully!', type: 'success' });
          window.location.reload();
        } else {
          console.error('An error occurred:', response.status, response.statusText);

          addSnackbar({ message: 'Failed to update personal details.', type: 'error' });
        }
      } catch (error) {
        console.error('An error occurred:', error);
       
        addSnackbar({ message: 'Failed to update personal details due to an error', type: 'error' });
      }
    }
  };

  return (
    <div className="basic-details-edit-popup">
       <div className='popup-heading'>Personal Details
      
      </div>
      <div className="input-container-basicdetails">
        <div className="input-wrapper">
       
          <input
            type="text"
            name="firstName"
            placeholder="*Firstname"
            value={formValues &&formValues.firstName}
            onChange={handleInputChange}
            className="input-form"
            required
          />
          {errors.firstName && <div className="error-message">{errors.firstName}</div>}
        </div>

        <div className="input-wrapper">
          <input
            type="text"
            name="lastName"
            placeholder="*Lastname"
            value={formValues &&formValues.lastName}
            onChange={handleInputChange}
            className="input-form"
            required
          />
          {errors.lastName && <div className="error-message">{errors.lastName}</div>}
        </div>

        <div className="input-wrapper">
          <input
            type="email"
            placeholder="*Email"
            value={formValues.email}
            
           className="input-form disabled-input"
            disabled
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="input-wrapper">
          <input
            type="tel"
            name="alternatePhoneNumber"
            placeholder="*Mobilenumber"
            value={formValues &&formValues.alternatePhoneNumber}
            onChange={handleInputChange}
            className="input-form"
            required
          />
          {errors.alternatePhoneNumber && <div className="error-message">{errors.alternatePhoneNumber}</div>}
        </div>
     <div >
        <button
        type="button"
        onClick={handleSubmit}
        className="btn-3"
        style={{
          backgroundColor: '#F97316',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '5px',
          textTransform:'capitalize',
          height: '48px',
         
          
          
        }}
      >
        Save Changes
      </button>
      </div>
      
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

export default BasicDetailsEditPopup;
