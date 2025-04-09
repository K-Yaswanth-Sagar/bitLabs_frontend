import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Phone from '../../images/icons/phone.png';
import Mail from '../../images/icons/mail.png';
import Edit from '../../images/icons/edit.png';
import Camera from '../../images/icons/camera.png';
import Resume from '../../images/icons/resume.png';
import mortarboard1 from '../../images/icons/mortarboard1.png';

import pencil1 from '../../images/icons/pencil1.png';
import UploadImageComponent from './UploadImageComponent';
import BasicDetailsEditPopup from './BasicDetailsEditPopup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import './modalpopup.css'; 
import ProfessionalDetailsPopup from './ProfessionalDetailsPopup';
import ResumeEditPopup from './ResumeEditPopup';
import Snackbar from '../common/Snackbar';
import Certified from '../../images/Certified.svg';
import Profile_Certified from '../../images/Profile_Certified.svg';


const ApplicantViewProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [profileid1, setprofileid] = useState(0);
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertShown, setAlertShown] = useState(false);
  const [experience, setExperience] = useState();
  const [basicDetails, setBasicDetails] = useState();
  const [qualification, setQualification] = useState();
  const [specialization, setSpecialization] = useState();
  const [preferredJobLocations, setpreferredJobLocations] = useState([]);
  const [cameraModalIsOpen, setCameraModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [edit1ModalIsOpen, setEdit1ModalIsOpen] = useState(false);
  const [resumeModalIsOpen, setResumeModalIsOpen] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');
  const [snackbars, setSnackbars] = useState([]);
  const navigate = useNavigate();
  const { user } = useUserContext();
  const id = user.id;
  const userId = user.id;
  const [flag, setFlag] = useState(false);
  
  const checkAndShowAlert = (message) => {
    const alertShownBefore = localStorage.getItem('alertShown');
    if (!alertShownBefore && !loading) {
      const userResponse = window.confirm(message);
      if (userResponse) {
        localStorage.setItem('alertShown', 'true');
        setAlertShown(true);
      }
    }
  };
  const fetchResumeFileName = async (id) => {
    try {
      const resumeResponse = await axios.get(`${apiUrl}/applicant/getResumeId/${id}`);
      console.log('resumeResponse:', resumeResponse.data);
  
      if (resumeResponse.data) {
        const resumeId = resumeResponse.data;
        return resumeId;
      } else {
        console.error('No resume ID found:', resumeResponse.data);
        return null;
      }
    } catch (error) {
      console.error('Error fetching resume ID:', error);
      return null;
    }
  };

  const addSnackbar = (snackbar) => {
    setSnackbars((prevSnackbars) => [...prevSnackbars, snackbar]);
  };

  const handleCloseSnackbar = (index) => {
    setSnackbars((prevSnackbars) => prevSnackbars.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.get(`${apiUrl}/applicant1/tests/${user.id}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
  
        const data = response.data;
       
  
        // Check if both aptitude and technical tests have status "P" or "p"
        const allTestsPassed = data.length >= 2 && data.every(test => test.testStatus.toLowerCase() === 'p');
        console.log(allTestsPassed);
        setFlag(allTestsPassed);
  
      } catch (error) {
        console.error('Error fetching test data:', error);
      }
    };
  
    fetchTestData();
  }, [user.id]);

  useEffect(() => {
    let count = 0;
    let profileResponse = null;
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const profileResponse = await axios.get(`${apiUrl}/applicantprofile/${id}/profile-view`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`, // Add the JWT token in the Authorization header
          },
        });
        setProfileData(profileResponse.data);
        setBasicDetails(profileResponse.data.basicDetails);
        setExperience(profileResponse.data.experience);
        setQualification(profileResponse.data.qualification);
        setSpecialization(profileResponse.data.specialization);
        setpreferredJobLocations(profileResponse.data.preferredJobLocations);
        const profileId = profileResponse.data;
        setprofileid(profileId);
        console.log('profileData:', profileData);
        count = 1;
        const imageResponse = await axios.get(`${apiUrl}/applicant-image/getphoto/${id}`, { responseType: 'arraybuffer' });
        const base64Image = btoa(
          new Uint8Array(imageResponse.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        setImageSrc(`data:${imageResponse.headers['content-type']};base64,${base64Image}`);
        
        
  
        setLoading(false);
        
      } catch (error) {
        setLoading(false);
        if (count === -1 && isMounted) {
          
          addSnackbar({ message: 'Profile not found. Please fill in your profile.', type: 'error' });
          window.location.href = '/applicant-update-profile';
        }
        
      }
    };
  
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [user]);  
  useEffect(() => {
    let isMounted = true;

    const fetchResume = async () => {
      try {
        console.log('Making resume API call...');
        const resumeResponse = await axios.get(`${apiUrl}/applicant/getResumeId/${id}`);
        console.log('Resume API call response:', resumeResponse);

        if (resumeResponse.data) {
          const firstName = profileData?.basicDetails?.firstName || '';
          const lastName = profileData?.basicDetails?.lastName || '';
          const fileName = `${firstName}_${lastName}.pdf`;
          setResumeFileName(fileName);
        } else {
          console.error('No resume fileName found:', resumeResponse.data);
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
      }
    };

      fetchResume();
    

    return () => {
      isMounted = false;
    };
  }, [id, profileData]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!profileData ||  alertShown) {
    return (
      <div>
        {(!profileData ) && <p>Please fill in your bio data and upload a profile pic.</p>}
        {alertShown && <p>Alert already shown.</p>}
      </div>
    );
  }
  
  const handleResumeClick1 = async () => {
    try {
      const response = await axios.get(`${apiUrl}/resume/pdf/${id}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error fetching resume:', error);
    }
  };
  const handleCameraClick = () => {
    setCameraModalIsOpen(true);
  };

  const handleEditClick = () => {
    setEditModalIsOpen(true);
  };
  const handleResumeClick = () => {
    setResumeModalIsOpen(true);
  };

  
  const handleEdit1Click = () => {
    setEdit1ModalIsOpen(true);
  };

  const closeCameraModal = () => {
    setCameraModalIsOpen(false);
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
  };
  const closeResumeModal = () => {
    setResumeModalIsOpen(false);
  };
  const closeEdit1Modal = () => {
    setEdit1ModalIsOpen(false);
  };

  return (
    <div className="dashboard__content">
      <section className="page-title-dashboard">
   
      <div className="features-job-view">
        <div className="wd-author-page-title">
          <div className="author-archive-header">
            <div className="profile-picture-container">
              <img
                width="100px"
                height="100px"
                src={imageSrc || '../images/user/avatar/profile-pic.png'}
                alt="Profile"
                onError={() => setImageSrc('../images/user/avatar/profile-pic.png')}
                style={{ borderRadius: '100%', position: 'relative',width:'100px',height:'100px' }}
              />
              <Link>
              <img
                src={Camera}
                alt="Upload Profile Picture"
                onClick={handleCameraClick}
                className="camera-icon"
              />
              </Link>
              <Modal
                isOpen={cameraModalIsOpen}
                onRequestClose={closeCameraModal}
                contentLabel="Upload Photo"
                className="modal-content1"
                overlayClassName="modal-overlay"
              >
                <div style={{ position: 'absolute', top: '10px', right: '20px' }}>
                  <FontAwesomeIcon icon={faTimes} onClick={closeCameraModal} style={{ cursor: 'pointer', color: '#333' }} />
                </div>
                <UploadImageComponent id={id}/>
              </Modal>  
            </div>
            <Link><img src={Edit} alt="Edit" className="edit-icon" onClick={handleEditClick} /></Link>
            <Modal
              isOpen={editModalIsOpen}
              onRequestClose={closeEditModal}
              contentLabel="Edit Details"
              className="modal-content2"
              overlayClassName="modal-overlay"
            >
              <div style={{ position: 'absolute', top: '10px', right: '20px' }}>
                <FontAwesomeIcon icon={faTimes} onClick={closeEditModal} style={{ cursor: 'pointer', color: '#333' }} />
              </div>
              <BasicDetailsEditPopup applicantDetails={profileData.basicDetails} />
            </Modal>
            <div style={{ textAlign: 'left' }}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <h3 style={{ color: 'white', fontWeight: 'bold', margin: 0 }}>
      {(profileData.basicDetails && profileData.basicDetails.firstName) || ''}{' '}
      {(profileData.basicDetails && profileData.basicDetails.lastName) || ''}
      {flag && (
      <img
        src={Profile_Certified}
        alt="Profile_Certified Badge"
        style={{
          width: '28px',
          height: '28px',
          marginLeft: '10px',
          verticalAlign: 'middle',
          marginBottom: '8px'
        }}
      />
    )}
      
    </h3>
        

  </div>

  <div style={{ color: 'white', display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
    <img
      src={Mail}
      alt="Email"
      style={{ marginRight: '8px' }}
    />
    <span>{profileData.basicDetails && profileData.basicDetails.email || ''}</span>
  </div>
  <div style={{ color: 'white', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
    <img
      src={Phone}
      alt="Phone"
      style={{ marginRight: '8px' }}
    />
    <span>{profileData.basicDetails && profileData.basicDetails.alternatePhoneNumber || ''}</span>
  </div>
</div>



          </div>
        </div>
      </div>
      </section> 
      <div className="features-job-view1">
        
          <div className='prof-container'>
           <div class="professional-details-container">
    <span > <img src={mortarboard1} alt="mortarboard1" class="icon-prof"  /></span> 
    <span class="text">Professional Details</span>
    </div>
     <div className='icon-prof'>
      <Link>
     <img src={pencil1} alt="pencil1"  onClick={handleEdit1Click} /></Link>
     </div>
    <Modal
              isOpen={edit1ModalIsOpen}
              onRequestClose={closeEdit1Modal}
              contentLabel="Edit Details"
              className="modal-content"
              overlayClassName="modal-overlay"
            >
              <div style={{ position: 'absolute', top: '10px', right: '20px' }}>
                <FontAwesomeIcon icon={faTimes} onClick={closeEdit1Modal} style={{ cursor: 'pointer', color: '#333' }} />
              </div>
              <ProfessionalDetailsPopup applicantDetails={profileData} />
            </Modal>
            </div>

          <div className="content-tab-prof">
                  <div className="inner-content">
                  
                    <div className="inner-profdata">
                   
                      <div className="inner">
                
                        <div className="text-heading-profdata">Qualification</div>
                          
                       <div >
                        <p style={{
                          color:'black',
                          fontWeight:'bold'
                          }}> {profileData.qualification} </p></div>
                        
                      </div>
                      <div className="inner">
                
                <div className="text-heading-profdata">Specialization</div>
                  
                <p style={{
                          color:'black',
                          fontWeight:'bold'
                          }}> {profileData.specialization}</p>
                
              </div>
              <div className="inner">
                  <div className="text-heading-profdata">Skills</div>

                  <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap' }}>
  
  {/* Applicant's Skill Badges */}
  {profileData.applicant.applicantSkillBadges && 
    profileData.applicant.applicantSkillBadges
      .filter(badge => badge.flag === 'added') // Filter badges based on flag
      .sort((a, b) => {
        // Sorting logic: PASSED badges come first
        if (a.status === 'PASSED' && b.status !== 'PASSED') return -1;
        if (a.status !== 'PASSED' && b.status === 'PASSED') return 1;
        return 0; // If both have the same status, keep their original order
      })
      .map((badge, index) => (
        <React.Fragment key={badge.id}>
          <span>
            <a>
              <ul className="skill-but" style={{ backgroundColor: badge.flag === 'removed' ? '#D9534F' : '#498C07', display: 'inline-flex', marginRight: '2px' }}>
                {/* Display Applicant Skill Badges with different colors based on flag */}
                <li style={{ display: 'flex', alignItems: 'center' }}>
                  {/* Conditionally render the Certified Badge image when status is PASSED */}
                  {badge.status === 'PASSED' && (
                    <img
                      src={Certified}
                      alt="Certified Badge"
                      style={{
                        width: '24px',
                        height: '24px',
                        marginRight: '5px',
                        marginLeft: '-8px'
                      }}
                    />
                  )}
                  {badge.skillBadge.name}
                </li>
              </ul>
            </a>
          </span>
        </React.Fragment>
      ))
  }

  {/* Skills Required */}
  {profileData.skillsRequired && profileData.skillsRequired.map((skillReq, index) => (
    <React.Fragment key={skillReq.id}>
      <span>
        <a>
          <ul className="skill-but" style={{ backgroundColor: '#498C07', display: 'inline-flex', marginRight: '2px' }}>
            {/* Display Skills Required in Blue */}
            <li>{skillReq.skillName}</li>
          </ul>
        </a>
      </span>
    </React.Fragment>
  ))}

</div>

                </div>

              
              <div className="inner">
                
                <div className="text-heading-profdata">Experience in Years</div>
                  
                <p style={{
                          color:'black',
                          fontWeight:'bold'
                          }}> {profileData.experience}</p>
                
              </div>
              <div className="inner">
                
                <div className="text-heading-profdata">Preferred Job Locations</div>
                  
                <p style={{
                          color:'black',
                          fontWeight:'bold'
                          }}> {profileData.preferredJobLocations.join(', ')}</p>
                
              </div>
                    
                    </div>
                    
                  </div> 
                </div>
          </div>
          
      <div className="features-job-view2">
      <div className='prof-container'>
           <div class="professional-details-container">
    <span > <img src={Resume} alt="mortarboard1" class="icon-prof"  /></span> 
    <span class="text">Resume</span>
    
        
    </div>
     <div className='icon-prof'>
      <Link>
     <img src={pencil1} alt="pencil1"  onClick={handleResumeClick} /></Link>
     </div>
     <Modal
              isOpen={resumeModalIsOpen}
              onRequestClose={closeResumeModal}
              contentLabel="Edit Details"
              className="modal-content3"
              overlayClassName="modal-overlay"
            >
              <div style={{ position: 'absolute', top: '10px', right: '20px' }}>
                <FontAwesomeIcon icon={faTimes} onClick={closeResumeModal} style={{ cursor: 'pointer', color: '#333' }} />
              </div>
              <ResumeEditPopup  id={id} resumeFileName={resumeFileName} />
            </Modal> 
            </div>
            <div > <span style={{ cursor: 'pointer' }}  className="file-name-input-resume1" onClick={handleResumeClick1}>{resumeFileName}</span></div>
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

export default ApplicantViewProfile;