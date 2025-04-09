import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useNavigate,useParams } from 'react-router-dom';
import 'react-international-phone/style.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { ClipLoader } from 'react-spinners';
import './ApplicantBasicDetails.css';
import './ApplicantBasicDetails1.css';
import Logo from '../../images/artboard.svg';
import 'react-bootstrap-typeahead/css/Typeahead.css'; 
import ModalComponent from './ModalComponent';
import ModalWrapper1 from './ModalWrapper1';
import ResumeBuilder from './ResumeBuilder';
import Snackbar from '../common/Snackbar';

const ApplicantBasicDetails = () => {
  const { user } = useUserContext();
  let { number } = useParams();
  
  number = parseInt(number, 10);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState(number);
  const [snackbars, setSnackbars] = useState([]);
  const [error, setError] = useState('');
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
  const[imageSrc, setImageSrc]= useState();
  const [shouldBeHidden, setShouldBeHidden] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [applicant, setApplicant] = useState({
    firstName: '',
    lastName: '',
    email: user.email || "",
    mobilenumber: user.mobilenumber || "",
  });
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const basicDetails = {
    firstName: applicant.firstName,
    lastName: applicant.lastName,
    alternatePhoneNumber: applicant.mobilenumber,
    email: applicant.email,
  };
  const applicantProfileDTO = {
    basicDetails: basicDetails,
  };
  const [errors, setErrors] = useState({});


  const handleQualificationChange = (selected) => {
    setQualification(selected[0] || null);
    setSpecialization(null);
    if (errors.qualification) {
      setErrors((prevErrors) => ({ ...prevErrors, qualification: '' }));
    }
  };

  const handleSpecializationChange = (selected) => {
    setSpecialization(selected[0] || null);
    if (errors.specialization) {
      setErrors((prevErrors) => ({ ...prevErrors, specialization: '' }));
    }
  };

  const validateInput = (name, value) => {
    let error = '';

    if (name === 'firstName' || name === 'lastName') {
      if (value.length < 3) {
          error = `${name === 'firstName' ? 'First' : 'Last'} name should be at least 3 characters long.`;
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = `${name === 'firstName' ? 'First' : 'Last'} name should contain only letters and spaces without special characters and numbers.`;
      }
  
  
    } else if (name === 'mobilenumber') {
        if (!/^[6789]\d{9}$/.test(value)) {
            error = 'Should be 10 digits and start with 6, 7, 8, or 9.';
        }
    }

    setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
    }));

    return !error; 
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setApplicant((prevApplicant) => ({
      ...prevApplicant,
      [name]: value,
  }));

  
};

const handleBlur = (e) => {
  const { name, value } = e.target;
  validateInput(name, value);
 
  
};

const handleSkillsChange = (selected) => {
  const selectedSkills = selected.map(skillName => ({ skillName }));
  setSkillsRequired(selectedSkills);
  if (errors.skillsRequired) {
    setErrors((prevErrors) => ({ ...prevErrors, skillsRequired: '' }));
  }
};

const handlePreferredJobLocationsChange = (selected) => {
  setPreferredJobLocations(selected);
  if (errors.preferredJobLocations) {
    setErrors((prevErrors) => ({ ...prevErrors, preferredJobLocations: '' }));
  }
};


  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [preferredJobLocations, setPreferredJobLocations] = useState([]);
  const [skillsRequired, setSkillsRequired] = useState([]);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [loginUrl, setLoginUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const steps = ['Personal Information', 'Professional Details', 'Upload Resume'];
  const yearsOptions = Array.from({ length: 16 }, (_, i) => ({ label: `${i} ` }));

  const qualificationsOptions = ['B.Tech', 'MCA', 'Degree', 'Intermediate', 'Diploma'];
  const skillsOptions = ['Java', 'C', 'C++', 'C Sharp', 'Python', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Angular', 'React', 'Vue', 'JSP', 'Servlets', 'Spring', 'Spring Boot', 'Hibernate', '.Net', 'Django', 'Flask', 'SQL', 'MySQL', 'SQL-Server', 'Mongo DB', 'Selenium', 'Regression Testing', 'Manual Testing'];
  const cities = ['Chennai', 'Thiruvananthapuram', 'Bangalore', 'Hyderabad', 'Coimbatore', 'Kochi', 'Madurai', 'Mysore', 'Thanjavur', 'Pondicherry', 'Vijayawada', 'Pune', 'Gurgaon'];

  useEffect(() => {
    setLoading(false);
  }, []);
  
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/applicant/getApplicantById/${user.id}`);
        const newData = {
          identifier: response.data.email,
          password: response.data.password,
        };
        setRequestData(newData);

      
       
      } catch (error) {
        console.error('Error fetching applicant data:', error);
      }
    };
    fetchData();
  }, [user.id]);

  useEffect(() => {
    console.log(isFormValid);
}, [isFormValid]);

const validateForm1 = () => {
  const newErrors = {};
  const validFirstName = validateInput('firstName', applicant.firstName);
  const validLastName = validateInput('lastName', applicant.lastName);
  const validMobileNumber = validateInput('mobilenumber', applicant.mobilenumber);

  if (!applicant.firstName) {
    newErrors.firstName = "First name is required";
} else {
    if (!validateInput('firstName', applicant.firstName)) {
        newErrors.firstName = errors.firstName;
    }
}

if (!applicant.lastName) {
    newErrors.lastName = "Last name is required";
} else {
    if (!validateInput('lastName', applicant.lastName)) {
        newErrors.lastName = errors.lastName;
    }
}

if (!applicant.mobilenumber) {
    newErrors.mobilenumber = "Mobile number is required";
} else {
    if (!validateInput('mobilenumber', applicant.mobilenumber)) {
        newErrors.mobilenumber = errors.mobilenumber;
    }
}

  setErrors(newErrors);
  return validFirstName && validLastName && validMobileNumber && 
         applicant.firstName && applicant.lastName && applicant.mobilenumber;
};


  const makeApiCall1 = async () => {
    if (!validateForm1()) {
      console.log(" returned in validation");
      return false;
    }
   
  };

 
  
  const makeApiCall2 = async () => {
   
 
    const applicantProfileDTO={
      basicDetails: basicDetails,
      skillsRequired: skillsRequired,
      experience,
      qualification,
      specialization,
      preferredJobLocations,
    }
 
    if (!validateForm1()) {
      console.log(" returned in validation");
      return false;
    }
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      console.log(" returned during api call");
     
      // const putProfileResponse = await axiosInstance.post(
      //   `${apiUrl}/applicantprofile/createprofile/${user.id}`,
      //   applicantProfileDTO,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${jwtToken}`,
      //     },
      //   }
      // );
      // console.log(" returned after api call");
 
     // Transform the payload
 
     const putProfileResponse = await axios.post(
      `${apiUrl}/applicantprofile/createprofile/${user.id}`,
      applicantProfileDTO,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
 
    console.log("Profile successfully created in the system.");
 
 
  const MAX_RETRIES = 50; // Maximum retry attempts
let retryCount = 0;
 
async function updateZohoCRM() {
  const zohoUpdateData = {
    data: [
      {
        Owner: { id: "4569859000019865042" },
        Last_Name: basicDetails.lastName,
        First_Name: basicDetails.firstName,
        Email: basicDetails.email,
        Phone: basicDetails.alternatePhoneNumber,
        Lead_Status: "completed profile",
        Status_TS: "Completed Profile",
        Industry: "Software",
        Technical_Skills: applicantProfileDTO.skillsRequired
        .map(skill => skill.skillName.toLowerCase()),
        Specialization: applicantProfileDTO.specialization,
        Education_Qualifications: applicantProfileDTO.qualification,
        Degree_level: applicantProfileDTO.qualification,
        Total_work_experience_in_years: applicantProfileDTO.experience,
        Preferred_Job_Locations: applicantProfileDTO.preferredJobLocations.join(", "),
      },
    ],
  };
  const zohoUserId = sessionStorage.getItem('zohoUserId');
 
  while (retryCount < MAX_RETRIES) {
    try {
      const response = await axios.put(
        `${apiUrl}/zoho/update/${zohoUserId}`,
        zohoUpdateData
      );
 
      if (response.status === 200 || response.status === 201) {
        console.log("✅ Lead successfully updated in Zoho CRM.");
        return response; // Exit function on success
      }
 
    } catch (error) {
      const status = error.response?.status;
 
      if (status === 401) {
        console.error("🔴 Unauthorized (401). Stopping retries.");
        break; // Stop retrying on 401
      }
 
      if (status === 403 || status === 500) {
        console.warn(`⚠️ Error ${status}. Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait before retrying
      } else {
        console.error(`🚨 Unexpected Error: ${status}`, error);
        break; // Stop retrying on any other error
      }
    }
  }
 
  console.error("❌ Max retries reached. Could not update Zoho CRM.");
}
 
// Call the function
await updateZohoCRM();
 
 
     const transformedApplicantProfileDTO = {
  ...applicantProfileDTO,
  locations: applicantProfileDTO.preferredJobLocations.join(','),
  skills: applicantProfileDTO.skillsRequired.map(skill => skill.skillName).join(','),
};
 
delete transformedApplicantProfileDTO.preferredJobLocations;
delete transformedApplicantProfileDTO.skillsRequired;
 
// const webhookUrl = 'https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjUwNTY1MDYzMjA0MzI1MjZjNTUzYzUxMzQi_pc';
// const webhookPayload = {
//   userId: user.id,
//   profileData: transformedApplicantProfileDTO,
// };
 
// const webhookResponse = await fetch(webhookUrl, {
//   method: 'POST',
//   headers: {
//       'Content-Type': 'application/json',
//   },
//   body: JSON.stringify(webhookPayload),
// });
 
//     if (!webhookResponse.ok) {
//       throw new Error('Failed to send data to the webhook');
//     }
 
//     console.log('Webhook response:', await webhookResponse.json());
 
   
    } catch (error) {
      console.error('Error submitting form data:', error);
    }
  };


  const handleResumeSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileSizeLimit = 1 * 1024 * 1024; 
      const allowedTypes = ['application/pdf'];
  
      if (file.size > fileSizeLimit) {
        
        addSnackbar({ message: 'File size should be less than 1MB and Only PDF allowed.', type: 'error' });
        setErrorMessage('File size should be less than 1MB and Only PDF allowed.');
        setSelectedFile(null);
        return;
      }
  
      if (!allowedTypes.includes(file.type)) {
        
        addSnackbar({ message: 'Only PDF file types are allowed.', type: 'error' });
        setErrorMessage('Only PDF file types are allowed.');
        setSelectedFile(null);
        return;
      }
  
      setErrorMessage('');
      setResumeFile(file);
      setSelectedFile(file);
    }
  };
  
  
  
  const triggerFileInputClick = () => {
    document.getElementById('tf-upload-img').click();
  };
  
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  
    const file = event.dataTransfer.files[0];
    if (file) {
      const fileSizeLimit = 1 * 1024 * 1024; 
      const allowedTypes = ['application/pdf'];
  
      if (file.size > fileSizeLimit) {
        addSnackbar({ message: 'File size should be less than 1MB and Only PDF allowed.', type: 'error' });
        setErrorMessage('File size should be less than 1MB and Only PDF allowed.');
        setSelectedFile(null);
        return;
      }
  
      if (!allowedTypes.includes(file.type)) {
        addSnackbar({ message: 'Only PDF file types are allowed.', type: 'error' });
        setErrorMessage('Only PDF file types are allowed.');
        setSelectedFile(null);
        return;
      }
  
      setErrorMessage('');
      setSelectedFile(file);
      setResumeFile(file);
      document.getElementById('tf-upload-img').files = event.dataTransfer.files;
    }
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

  const handleResumeBuilder = async () => {
    const apiUrl1 = 'https://resume.bitlabs.in:5173/api/auth/login';
    if (requestData) {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      };
      fetch(apiUrl1, requestOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          const loginUrl = `https://resume.bitlabs.in:5173/auth/login?identifier=${encodeURIComponent(requestData.identifier)}&password=${encodeURIComponent(requestData.password)}`;
          setLoginUrl(loginUrl);
          
          setIsModalOpen(true);
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
    }
  };

  const validateFields = () => {
    const newErrors = {};
    
    if (!qualification) newErrors.qualification = 'Qualification is required';
    if (!specialization) newErrors.specialization = 'Specialization is required';
    if (skillsRequired.length === 0) newErrors.skillsRequired = 'Skills are required';
    if (!experience) newErrors.experience = 'Experience is required';
    if (preferredJobLocations.length === 0) newErrors.preferredJobLocations = 'Preferred Job Locations are required';
    
    setErrors(newErrors);
  

    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = async () => {
  
    try {
     
      switch (currentStage) {
        case 1:
          if (!validateForm1()) {
            console.log(" returned in validation");
            return false;
          }
          
          console.log('API call 1 response:');
          break;
        case 2:

        if (validateFields()) {
          const response2 = await makeApiCall2(); 
          console.log('API call 2 response:');
        } else {
          return false;
        }
          break;
        default:
          console.warn('Unexpected stage:');
          
          break;
      }
  
      
      setCurrentStage((prevStage) => Math.min(prevStage + 1, steps.length));
    } catch (error) {
      console.error('Error during API call:', error);
     
    }
  };

  const addSnackbar = (snackbar) => {
    setSnackbars((prevSnackbars) => [...prevSnackbars, snackbar]);
  };

  const handleCloseSnackbar = (index) => {
    setSnackbars((prevSnackbars) => prevSnackbars.filter((_, i) => i !== index));
     
  };

  const handleBack = () => {
    setCurrentStage((prevStage) => Math.max(prevStage - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please upload a valid file.');
      return;
    }
   
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
      
      addSnackbar({ message: 'Profile saved successfully.', type: 'success' });

      
    setTimeout(() => {
      navigate('/applicanthome');
    }, 3000); 
      
    } catch (error) {
      console.error('Error uploading resume:', error);
      
      addSnackbar({ message: 'Error uploading resume. Please try again.', type: 'error' });
    }
    resetForm();
   
   
  };

  const validateForm = () => {
    const newErrors = {};
    if (currentStage === 1) {
      if (!applicant.name) newErrors.name = 'Name is required';
      if (!applicant.email) newErrors.email = 'Email is required';
      if (!applicant.mobilenumber) newErrors.mobilenumber = 'Mobile number is required';
      if (!experience) newErrors.experience = 'Experience is required';
    } else if (currentStage === 2) {
      if (!qualification) newErrors.qualification = 'Qualification is required';
      if (!specialization) newErrors.specialization = 'Specialization is required';
      if (!preferredJobLocations.length) newErrors.preferredJobLocations = 'At least one job location is required';
      if (!skillsRequired.length) newErrors.skillsRequired = 'At least one skill is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setApplicant({ name: '', email: '', mobilenumber: '' });
    setExperience('');
    setSkills([]);
    setCity('');
    setState('');
    setQualification('');
    setSpecialization('');
    setSelectedCities([]);
    setSelectedSkills([]);
    setPreferredJobLocations([]);
    setSkillsRequired([]);
    setResumeFile(null);
    setRequestData(null);
    setLoginUrl('');
    setSelectedFile(null);
  };

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
                 'Radiology and Imaging Technology'],  
  };

  const renderStageFields = () => {
    switch (currentStage) {
      case 1:
        return (
          <div className="input-container">
      <div className="input-wrapper">
        <input
          type="text"
          name="firstName"
          placeholder="*First Name"
          value={applicant.firstName}
          className="input-form"
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
        {errors.firstName && <div className="error-message">{errors.firstName}</div>}
      </div>

      <div className="input-wrapper">
        <input
          type="text"
          name="lastName"
          placeholder="*Last Name"
          value={applicant.lastName}
          className="input-form"
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
        {errors.lastName && <div className="error-message">{errors.lastName}</div>}
      </div>

      <div className="input-wrapper">
        <input
          type="email"
          placeholder="*Email"
          value={applicant.email}
          className="input-form"
          readOnly
          style={{ color: '#ccc' }} 
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>

      <div className="input-wrapper">
        <input
          type="tel"
          name="mobilenumber"
          placeholder="*WhatsApp Number"
          value={applicant.mobilenumber}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="input-form"
          required
        />
        {errors.mobilenumber && <div className="error-message">{errors.mobilenumber}</div>}
      </div>
    </div>
        );
      case 2:
        return (
          <div className="input-container">
           <div className="input-wrapper">
        <Typeahead
          id="qualification"
          options={qualificationsOptions}
          placeholder="*Qualification"
          onChange={handleQualificationChange}
          selected={qualification ? [qualification] : []}
          className="input-form typeahead"
        />
        {errors.qualification && <div className="error-message">{errors.qualification}</div>}
      </div>

      <div className="input-wrapper">
        <Typeahead
          id="specialization"
          options={qualification ? specializationsByQualification[qualification] : []}
          placeholder="*Specialization"
          onChange={handleSpecializationChange}
          selected={specialization ? [specialization] : []}
          className="input-form typeahead"
        />
        {errors.specialization && <div className="error-message">{errors.specialization}</div>}
      </div>
  
      <div className="input-wrapper">
        <Typeahead
          id="skillsRequired"
          multiple
          options={skillsOptions}
          placeholder="*Skills Required"
          onChange={handleSkillsChange}
          selected={skillsRequired.map(skill => skill.skillName)}
          className="input-form typeahead"
        />
        {errors.skillsRequired && <div className="error-message">{errors.skillsRequired}</div>}
      </div>


            <div className="input-wrapper">
      <Typeahead
        id="experience"
        options={yearsOptions}
        placeholder="*Experience in Years"
        onChange={(selected) => setExperience(selected[0] ? selected[0].label : '')}
        selected={yearsOptions.filter(option => option.label === experience)}
        className="input-form typeahead"
        single
      />
      {!experience && errors.experience && (
        <div className="error-message">{errors.experience}</div>
      )}
    </div>
 
    <div className="input-wrapper">
        <Typeahead
          id="preferredJobLocations"
          multiple
          options={cities}
          placeholder="*Preferred Job Locations"
          onChange={handlePreferredJobLocationsChange}
          selected={preferredJobLocations}
          className="input-form typeahead"
        />
        {errors.preferredJobLocations && <div className="error-message">{errors.preferredJobLocations}</div>}
      </div>
  
            <div className="input-wrapper" ></div>
          </div>
        );
      case 3:
        return (
          <div className="col-lg-12 col-md-12">
            <div className="post-new profile-setting bg-white" >
              <div className="wrap-img flex2" >
                <p><strong>Resume</strong></p>
                <div id="upload-profile" style={{ display: 'flex', alignItems: 'center' }}>
      <input
        className="up-file"
        id="tf-upload-img"
        type="file"
        name="profile"
        required
        onChange={handleResumeSelect}
        style={{ display: 'none' }}
      />
      <div
        id="resume-text-input-container"
        onClick={triggerFileInputClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '318.25px',
          height: '47px',
          borderRadius: '8px',
          border: dragActive ? '2px dashed #000' : '1px solid #E5E5E5',
          backgroundSize: '16px 16px',
          paddingLeft: '40px',
          padding: '10px',
          marginRight: '20px',
          boxSizing: 'border-box',
          cursor: 'pointer',
        }}
      > 
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
<path d="M13.75 2H6.75C6.21957 2 5.71086 2.21071 5.33579 2.58579C4.96071 2.96086 4.75 3.46957 4.75 4V20C4.75 20.5304 4.96071 21.0391 5.33579 21.4142C5.71086 21.7893 6.21957 22 6.75 22H18.75C19.2804 22 19.7891 21.7893 20.1642 21.4142C20.5393 21.0391 20.75 20.5304 20.75 20V9L13.75 2Z" stroke="#9E9E9E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.75 2V9H20.75" stroke="#9E9E9E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
        <input
          id="resume-text-input"
          type="text"
          
          placeholder="Upload your resume"
          value={selectedFile ? selectedFile.name : ''}
          readOnly
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: 'transparent',
            paddingLeft: '40px',
            boxSizing: 'border-box',
            cursor: 'pointer',
          }}
        />
      </div>
      <button
        type="button"
        onClick={triggerFileInputClick}
        className="btn-3"
        style={{
          backgroundColor: '#7E7E7E',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          textTransform: 'none',
        }}
      >
        Browse
      </button>

    </div>
 {errorMessage && (
    <div style={{ color: 'red', marginTop: '10px' }}>
      {errorMessage}
    </div>
  )}
              </div>
              <br></br>
              <p style={{ marginRight: '5px' }}><strong>Or</strong></p>
              <br></br>
              <ModalWrapper1 isOpen={isModalOpen} onClose={closeModal} title="Build Your Resume">
        <ResumeBuilder />
      </ModalWrapper1>
      {error && <div className="error-message">{error}</div>}
              <div id="item_2" className="col-lg-6 col-md-12" style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={openModal}
                  className="btn-3"
                  style={{
                    backgroundColor: '#7E7E7E',
                    color: 'white',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '5px',
                    textTransform:'none',
                  }}
                >
                  Build Your Resume
                </button>
              </div>

              
              <ModalComponent
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          loginUrl={loginUrl}
        />
            </div>
          </div>
        );
    }
  };
  
  
  

  const Stepper = ({ currentStage }) => {
    return (
      <div className="stepper">
        {steps.map((step, i) => (
          <div key={i} className="step-item">
            {i !== 0 && (
              <div
                className={`step-line ${
                  currentStage > i  ? 'completed' : ''
                }`}
              ></div>
            )}
            <div
              className={`step-circle ${
                currentStage === i + 1 ? 'active' : ''
              } ${currentStage > i + 1 ? 'completed' : ''}`}
            >
              {currentStage > i + 1 ? '✔' : i + 1}
            </div>
            <p className="step-label">{step}</p>
          </div>
        ))}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="spinner-container">
        <ClipLoader color="#0d6efd" loading={loading} size={50} />
      </div>
    );
  }


  return (
    <div class="component">
       
      <img className="top-left-svg" src={Logo} alt="Image" usemap="#image-map" />

    
    <div className="card-container">
    <div className="card1">
      <div className="header">
        <p className="form-title">Complete Your Profile</p>
        <p>Fill the form fields to go to the next step</p>
      </div>
      <div className="stepper-container">
        <Stepper currentStage={currentStage} />
      </div>
      <div className="form-container">
        <form onSubmit={handleSubmit} className="applicant-details-form">
          <div className="row">
            {renderStageFields()}
          </div>
          <div className="button-container">
            {(currentStage > 1 && currentStage < 3) && (
              <button type="button" onClick={handleBack} className="form-button1">Back</button>
            )}
            {currentStage < 3 && (
              <button type="button" onClick={handleNext} className="form-button" >Next</button>
            )}
            {currentStage === 3 && (
              <button type="submit" className="form-button">Submit</button>
            )}
          </div>
        </form>
      </div>
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

export default ApplicantBasicDetails;
