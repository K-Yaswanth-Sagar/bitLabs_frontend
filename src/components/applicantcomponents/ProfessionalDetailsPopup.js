import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import Snackbar from '../common/Snackbar';
import { Typeahead } from 'react-bootstrap-typeahead';
 
const ProfessionalDetailsPopup = ({ applicantDetails }) => {
  
  const [qualification, setQualification] = useState('');
  
  const [formValues, setFormValues] = useState({
    qualification: applicantDetails&&applicantDetails.qualification|| '',
     specialization: applicantDetails&&applicantDetails.specialization || '',
    experience: applicantDetails&&applicantDetails.experience || '',
    preferredJobLocations: applicantDetails&&applicantDetails.preferredJobLocations || [],
    skillsRequired : [
      ...(applicantDetails.skillsRequired || []),
      ...(applicantDetails.applicant.applicantSkillBadges || [])
        .filter(badge => badge.flag === 'added') // Filter out badges with flag 'removed'
        .map(badge => ({
          skillName: badge.skillBadge.name,
          experience: 0 // Assuming applicantSkillBadges doesn't have experience data
        }))
    ],
    
   
  });
  const [errors, setErrors] = useState({});
  const [snackbars, setSnackbars] = useState([]);
  const user1 = useUserContext();
  const user = user1.user;
  useEffect(() => {
    if (applicantDetails) {
      setFormValues({
        qualification: applicantDetails.qualification || '',
        specialization: applicantDetails.specialization || '',
        experience: applicantDetails.experience || '',
        preferredJobLocations: applicantDetails.preferredJobLocations || [],
        skillsRequired : [
          ...(applicantDetails.skillsRequired || []),
          ...(applicantDetails.applicant.applicantSkillBadges || [])
            .filter(badge => badge.flag === 'added') // Filter out badges with flag 'removed'
            .map(badge => ({
              skillName: badge.skillBadge.name,
              experience: 0 // Assuming applicantSkillBadges doesn't have experience data
            }))
        ],
      });
    }
  }, [applicantDetails]);

  const handleQualificationChange = (selected) => {
    const qualification = selected.length > 0 ? selected[0] : '';
    setFormValues({ ...formValues, qualification, specialization: '' });
    setErrors({ ...errors, qualification: validateInput('qualification', qualification) });
  };

  const handleSpecializationChange = (selected) => {
    const specialization = selected.length > 0 ? selected[0] : '';
    setFormValues({ ...formValues, specialization });
    setErrors({ ...errors, specialization: validateInput('specialization', specialization) });
  };
  const validateInput = (name, value) => {
    let error = '';
    if (!value || (Array.isArray(value) && value.length === 0)) {
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1').trim();
      error = `${formattedName} is required.`;
    }
    return error;
  };

  const addSnackbar = (snackbar) => {
    setSnackbars((prevSnackbars) => [...prevSnackbars, snackbar]);
  };

  const handleCloseSnackbar = (index) => {
    setSnackbars((prevSnackbars) => prevSnackbars.filter((_, i) => i !== index));
  };
 
  const handleInputChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value });
    setErrors({ ...errors, [name]: validateInput(name, value) });
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
        const response = await axios.put(
        `${apiUrl}/applicantprofile/${user.id}/professional-details`,
          formValues,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
 
        if (response.status === 200) {
        
         addSnackbar({ message: 'Professional details updated successfully', type: 'success' });
          window.location.reload(); 
        } else {
          console.error('An error occurred:', response.status, response.statusText);
        
          addSnackbar({ message: 'Failed to update professional details.', type: 'error' });
        }
      } catch (error) {
        console.error('An error occurred:', error);
       
        addSnackbar({ message: 'Failed to update professional details due to an error.', type: 'error' });
      }
    }
  };
  const yearsOptions = Array.from({ length: 16 }, (_, i) => ({ label: `${i}` }));
  const qualificationsOptions = ['B.Tech', 'MCA', 'Degree', 'Intermediate', 'Diploma'];
  const skillsOptions = ['Java', 'C', 'C++', 'C Sharp', 'Python', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Angular', 'React', 'Vue', 'JSP', 'Servlets', 'Spring', 'Spring Boot', 'Hibernate', '.Net', 'Django', 'Flask', 'SQL', 'MySQL', 'SQL-Server', 'Mongo DB', 'Selenium', 'Regression Testing', 'Manual Testing'];
  const cities = ['Chennai', 'Thiruvananthapuram', 'Bangalore', 'Hyderabad', 'Coimbatore', 'Kochi', 'Madurai', 'Mysore', 'Thanjavur', 'Pondicherry', 'Vijayawada', 'Pune', 'Gurgaon'];
  const specializationsByQualification = {
    'B.Tech': ['Computer Science and Engineering (CSE)',
                'Electronics and Communication Engineering (ECE)',
                'Electrical and Electronics Engineering (EEE)',
                'Mechanical Engineering (ME)',
                'Civil Engineering (CE)',
                'Aerospace Engineering',
                'Information Technology(IT)',
                 'Chemical Engineering',
                 'Biotechnology Engineering'],
    'MCA': ['Software Engineering', 'Data Science','Artificial Intelligence','Machine Learning','Information Security',
             'Cloud Computing','Mobile Application Development','Web Development','Database Management','Network Administration',
            'Cyber Security','IT Project Management'],
    'Degree': ['Bachelor of Science (B.Sc) Physics','Bachelor of Science (B.Sc) Mathematics','Bachelor of Science (B.Sc) Statistics',
               'Bachelor of Science (B.Sc) Computer Science','Bachelor of Science (B.Sc) Electronics','Bachelor of Science (B.Sc) Chemistry',
               'Bachelor of Commerce (B.Com)'],
    'Intermediate': ['MPC','BiPC','CEC','HEC'],
    'Diploma': ['Mechanical Engineering','Civil Engineering','Electrical Engineering','Electronics and Communication Engineering',
                'Computer Engineering','Automobile Engineering','Chemical Engineering','Information Technology','Instrumentation Engineering',
                 'Mining Engineering','Metallurgical Engineering','Agricultural Engineering','Textile Technology','Architecture',
                  'Interior Designing','Fashion Designing','Hotel Management and Catering Technology','Pharmacy','Medical Laboratory Technology',
                 'Radiology and Imaging Technology'],     };
  console.log('Qualification Options:', qualificationsOptions);
  console.log('Qualification Selected:', qualification);
 
  return (
    <div className="basic-details-edit-popup">
      <div className="popup-heading">Details</div>
      <div className="input-container-basicdetails">
        <div className="input-wrapper1">
          <Typeahead
            id="qualification"
            options={qualificationsOptions}
            placeholder="*Qualification"
            onChange={handleQualificationChange}
            selected={formValues.qualification ? [formValues.qualification] : []}
            className="custom-typeahead"
          />
          {errors.qualification && <div className="error-message">{errors.qualification}</div>}
        </div>
 
        <div className="input-wrapper1">
          <Typeahead
            id="specialization"
            options={specializationsByQualification[formValues.qualification] || []}
            placeholder="*Specialization"
            onChange={handleSpecializationChange}
            selected={formValues.specialization ? [formValues.specialization] : []}
            className="custom-typeahead"
          />
          {errors.specialization && <div className="error-message">{errors.specialization}</div>}
        </div>
 
        <div className="input-wrapper1">
          <Typeahead
            id="skillsRequired"
            multiple
            options={skillsOptions.map((skill) => ({ label: skill, value: skill }))}
            placeholder="*Skills Required"
            onChange={(selected) =>
              handleInputChange(
                'skillsRequired',
                selected.map((option) => ({ id: option.valueOf, skillName: option.label, experience: 0 }))
              )
            }
           // Display combined list of skillsRequired and applicantSkillBadges
              selected={formValues.skillsRequired.map((skill) => ({
                label: skill.skillName,
                value: skill.skillName
              }))}
            className="custom-typeahead2"
          />
          {errors.skillsRequired && <div className="error-message">{errors.skillsRequired}</div>}
        </div>
 
        <div className="input-wrapper1">
  <Typeahead
    id="experience"
    options={yearsOptions}
    placeholder="*Experience in Years"
    onChange={(selected) => {
      const experienceValue = selected.length > 0 ? selected[0].label.split(' ')[0] : '';
      handleInputChange('experience', experienceValue);
    }}
    selected={
      formValues.experience
        ? [{ label: `${formValues.experience}`, value: formValues.experience }]
        : []
    }
    className="custom-typeahead"
    labelKey="label"
    single
  />
  {errors.experience && <div className="error-message">{errors.experience}</div>}
</div>
<div className="input-wrapper1">
  <Typeahead
    id="preferredJobLocations"
    multiple
    options={cities.map((city) => ({ label: city, value: city }))}
    placeholder="*Preferred Job Locations"
    onChange={(selected) =>
      handleInputChange('preferredJobLocations', selected.map((option) => option.value))
    }
    selected={formValues.preferredJobLocations.map((city) => ({ label: city, value: city }))}
    className="custom-typeahead2"
    labelKey="label"
  />
  {errors.preferredJobLocations && (
    <div className="error-message">{errors.preferredJobLocations}</div>
  )}
</div>

      </div>
 
      <div className="savebut">
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
            textTransform: 'capitalize',
            height: '48px',
          }}
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
 
export default ProfessionalDetailsPopup;