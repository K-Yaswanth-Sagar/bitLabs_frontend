import React from "react";
import { useState, useEffect } from 'react';
import axios from "axios";
import { useUserContext } from '../common/UserProvider';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Resume from '../../images/user/avatar/Resume.png';
import Certificate from '../../images/user/avatar/Certificate.png';
import Taketest from '../../images/user/avatar/Taketest.png';
import { useLocation } from "react-router-dom";
import { faL } from "@fortawesome/free-solid-svg-icons";
import ModalWrapper from './ModalWrapper';
import Button from '@mui/material/Button';
import ResumeBuilder from './ResumeBuilder';


const ApplicantDashboard = () => {
  const [token, setToken] = useState('');
  const { user } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [contRecJobs, setCountRecJobs] = useState(0);
  const [contAppliedJob, setAppliedJobs] = useState(0);
  const [contSavedJobs, setSavedJobs] = useState(0);
  const navigate = useNavigate();
  const [profileid1, setprofileid] = useState();
  const userId = user.id;
  const [isHovered, setIsHovered] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [isWideScreen, setIsWideScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 780);
    };

    // Initialize the state on component mount
    handleResize();

    // Add event listener for resize
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const profileIdResponse = await axios.get(`${apiUrl}/applicantprofile/${userId}/profileid`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const profileId = profileIdResponse.data;

       
        if (profileId === 0) {
          navigate('/applicant-basic-details-form'); 
        } else {
          setLoading(false); 
        }
      } catch (error) {
        console.error('Error fetching profile ID:', error);
      }
    };

    checkUserProfile();
  }, [userId, navigate]);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.get(`${apiUrl}/applicantprofile/${user.id}/profile-view`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
    
        const newData = {
          identifier: response.data.applicant.email,
          password: response.data.applicant.password,
          localResume: response.data.applicant.localResume,
          firstName: response.data.basicDetails != null && response.data.basicDetails.firstName != null ? response.data.basicDetails.firstName : ""
        };
  
        // Store newData in local storage
        localStorage.setItem('userData', JSON.stringify(newData));
  
        setUserData(newData);
      } catch (error) {
        console.error('Error updating profile status:', error);
      }
    };
  
    fetchUserData();
  }, []);
  


  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    }
    axios
      .get(`${apiUrl}/recommendedjob/countRecommendedJobsForApplicant/${user.id}`)
      .then((response) => {
        setCountRecJobs(response.data);
      })
      .catch((error) => {
        console.error('Error fetching team members:', error);
      });
  }, [user.id]);
  useEffect(() => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    }
    axios
      .get(`${apiUrl}/applyjob/countAppliedJobs/${user.id}`)
      .then((response) => {
        setAppliedJobs(response.data);
      })
      .catch((error) => {
        console.error('Error fetching team members:', error);
      });
  }, [user.id]);
  useEffect(() => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    }
    axios
      .get(`${apiUrl}/savedjob/countSavedJobs/${user.id}`)
      .then((response) => {
        setSavedJobs(response.data);
      })
      .catch((error) => {
        console.error('Error fetching team members:', error);
      });
  }, [user.id]);

  const [testData, setTestData] = useState([]);
  const [showIcon, setShowIcon] = useState(false);

  {/* tests api */}
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
        setTestData(data);
  
        // Check if both aptitude and technical tests have status "P" or "p"
        const allTestsPassed = data.length >= 2 && data.every(test => test.testStatus.toLowerCase() === 'p');
  
        setShowIcon(allTestsPassed);
  
      } catch (error) {
        console.error('Error fetching test data:', error);
      }
    };
  
    fetchTestData();
  }, [user.id]);

  const handleRedirect = () => {

    navigate("/applicant-find-jobs");
  };

  const handleRedirect1 = () => {

    navigate("/applicant-applied-jobs");
  };

  const handleRedirect2 = () => {

    navigate("/applicant-saved-jobs");
  };

  const Buildresume = () => {
    navigate("/applicant-resume-builder");
  };

  const location = useLocation();
  const linkStyle = {
    backgroundColor: isHovered ? '#ea670c' : '#F97316',
    display: 'inline-block',
  };

  const spanStyle = {
    color: 'white',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: '15px',
    fontWeight: '600',
   
  };
  // const [showIcon, setShowIcon] = useState(false); // Set to true or false to show/hide the SVG

  return (
    <div>
      {loading ? null : (
        <div className="dashboard__content">
          <div className="row mr-0 ml-10">
            <div className="col-lg-12 col-md-12">
              <div className="page-title-dashboard">
                <div className="title-dashboard">
                  
                <div className="userName-title">
      Hi {userData && userData.firstName !== null && userData.firstName !== "" ? userData.firstName : ''}
      {showIcon && (
        <span style={{ marginLeft: '4px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 33 33" fill="none" style={{ marginTop: '0px' }}>
            <path d="M31.8433 14.7899L29.6255 12.2552C29.1503 11.78 28.8334 10.8295 28.8334 10.1958V7.66114C28.8334 5.91856 27.4077 4.65124 25.8235 4.65124H23.1305C22.4968 4.65124 21.5463 4.33441 21.0711 3.85916L18.5364 1.64134C17.4275 0.690843 15.6849 0.690843 14.576 1.64134L12.1998 3.85916C11.7245 4.33441 10.774 4.65124 10.1404 4.65124H7.4473C5.70473 4.65124 4.4374 6.07698 4.4374 7.66114V10.3542C4.4374 10.9879 4.12057 11.9384 3.64532 12.4136L1.58592 14.9483C0.635423 16.0572 0.635423 17.7998 1.58592 18.9087L3.64532 21.4433C4.12057 21.9186 4.4374 22.8691 4.4374 23.5027V26.1958C4.4374 27.9384 5.86315 29.2057 7.4473 29.2057H10.1404C10.774 29.2057 11.7245 29.5225 12.1998 29.9978L14.7344 32.2156C15.8433 33.1661 17.5859 33.1661 18.6948 32.2156L21.2295 29.9978C21.7047 29.5225 22.6552 29.2057 23.2889 29.2057H25.982C27.7245 29.2057 28.9919 27.7799 28.9919 26.1958V23.5027C28.9919 22.8691 29.3087 21.9186 29.7839 21.4433L32.0018 18.9087C32.7938 17.7998 32.7938 15.8988 31.8433 14.7899ZM23.2889 13.8394L15.6849 21.4433C15.5265 21.6017 15.2097 21.7601 14.8928 21.7601C14.576 21.7601 14.2592 21.6017 14.1008 21.4433L10.2988 17.6413C9.82354 17.1661 9.82354 16.374 10.2988 15.8988C10.774 15.4235 11.5661 15.4235 12.0414 15.8988L15.0513 18.9087L21.5463 12.0968C22.0216 11.6215 22.8136 11.6215 23.2889 12.0968C23.7641 12.572 23.7641 13.3641 23.2889 13.8394Z" fill="#F46F16"/>
          </svg>
        </span>
      )}
    </div>

                </div>
              </div>
            </div>
            <div className="col-lg-12 col-md-12">
              <div className="row dash-count">
                <div className="col-12 col-xxl-3 col-xl-4 col-lg-4 col-md-12 col-sm-12 display-flex">
                  <div className="card" onClick={handleRedirect} style={{ cursor: "pointer" }}>
                    <div className="container">
                      <div>
                          <span className="icon-bag color-icon-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="33" viewBox="0 0 32 33" fill="none">
                              <g clip-path="url(#clip0_778_1027)">
                                <path d="M25.3333 5.83333H23.8667C23.5572 4.32855 22.7384 2.97646 21.5483 2.00496C20.3582 1.03345 18.8696 0.501939 17.3333 0.5L14.6667 0.5C13.1304 0.501939 11.6418 1.03345 10.4517 2.00496C9.26157 2.97646 8.4428 4.32855 8.13333 5.83333H6.66667C4.89921 5.83545 3.20474 6.53851 1.95496 7.78829C0.705176 9.03808 0.00211714 10.7325 0 12.5L0 16.5H32V12.5C31.9979 10.7325 31.2948 9.03808 30.045 7.78829C28.7953 6.53851 27.1008 5.83545 25.3333 5.83333ZM10.912 5.83333C11.1868 5.05612 11.695 4.38279 12.3671 3.90545C13.0392 3.42811 13.8423 3.17008 14.6667 3.16667H17.3333C18.1577 3.17008 18.9608 3.42811 19.6329 3.90545C20.305 4.38279 20.8132 5.05612 21.088 5.83333H10.912Z" fill="#2776ED" />
                                <path d="M17.3333 20.5C17.3333 20.8536 17.1929 21.1927 16.9428 21.4428C16.6928 21.6928 16.3536 21.8333 16 21.8333C15.6464 21.8333 15.3072 21.6928 15.0572 21.4428C14.8071 21.1927 14.6667 20.8536 14.6667 20.5V19.1666H0V25.8333C0.00211714 27.6008 0.705176 29.2952 1.95496 30.545C3.20474 31.7948 4.89921 32.4978 6.66667 32.5H25.3333C27.1008 32.4978 28.7953 31.7948 30.045 30.545C31.2948 29.2952 31.9979 27.6008 32 25.8333V19.1666H17.3333V20.5Z" fill="#2776ED" />
                              </g>
                              <defs>
                                <clipPath id="clip0_778_1027">
                                  <rect width="32" height="32" fill="white" transform="translate(0 0.5)" />
                                </clipPath>
                              </defs>
                            </svg>
                          </span>
                      </div>
                        <div className="content">
                          <span
                            className="title-count"
                            onClick={handleRedirect}
                            style={{ cursor: "pointer" }}
                          >
                            Recommended Jobs
                          </span>
                          <h3>{contRecJobs}</h3>

                        </div>
                    </div>

                  </div>
                </div>
                <div className="col-12 col-xxl-3 col-xl-4 col-lg-4 col-md-12 col-sm-12 display-flex">
                  <div className="card" onClick={handleRedirect1} style={{ cursor: "pointer" }}>
                    <div className="container">
                      <div>
                        <div className="box-icon wrap-counter flex" onClick={handleRedirect1}>
                            <span className="icon-bag color-icon-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="33" viewBox="0 0 32 33" fill="none">
                                <g clip-path="url(#clip0_778_1032)">
                                  <path d="M32 23.8333V24.5H16V23.8333C16 21.4893 17.744 19.5613 20 19.2347C20 17.764 21.196 16.5 22.6667 16.5H25.3333C26.804 16.5 28 17.764 28 19.2347C30.256 19.5613 32 21.4893 32 23.8333ZM13.3333 23.8333C13.3333 22.228 13.8813 20.732 14.7907 19.508C13.8933 19.2933 12.9613 19.1667 12 19.1667C5.39067 19.1667 0.0120022 24.5373 2.24782e-06 31.144C-0.00133109 31.8867 0.590669 32.5 1.33334 32.5H15.0147C13.9653 31.2307 13.3333 29.604 13.3333 27.8333V23.8333ZM12 16.5C16.412 16.5 20 12.912 20 8.5C20 4.088 16.412 0.5 12 0.5C7.588 0.5 4 4.088 4 8.5C4 12.912 7.588 16.5 12 16.5ZM24 28.5C23.264 28.5 22.6667 27.9027 22.6667 27.1667H16V27.8333C16 30.4067 18.0933 32.5 20.6667 32.5H27.3333C29.9067 32.5 32 30.4067 32 27.8333V27.1667H25.3333C25.3333 27.9027 24.736 28.5 24 28.5Z" fill="#FF6633" />
                                </g>
                                <defs>
                                  <clipPath id="clip0_778_1032">
                                    <rect width="32" height="32" fill="white" transform="translate(0 0.5)" />
                                  </clipPath>
                                </defs>
                              </svg>
                            </span>
                        </div>
                      </div>
                        <div className="content">
                          <span
                            className="title-count"
                            onClick={handleRedirect1}
                            style={{ cursor: "pointer" }}
                          >
                            Applied Jobs
                          </span>
                          <h3>{contAppliedJob}</h3>
                        </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-xxl-3 col-xl-4 col-lg-4 col-md-12 col-sm-12 display-flex">
                  <div className="card" onClick={handleRedirect2} style={{ cursor: "pointer" }}>
                    <div className="container">
                      <div>
                        <div className="box-icon wrap-counter flex" onClick={handleRedirect2} >
                            <span className="icon-bag color-icon-3">
                              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="37" viewBox="0 0 36 37" fill="none">
                                <path d="M15.5263 29.3289L9.6028 31.8658C8.74705 32.2323 7.93568 32.1637 7.16868 31.6599C6.40193 31.1564 6.01855 30.4458 6.01855 29.528V11.4395C6.01855 10.7308 6.26755 10.1275 6.76555 9.62979C7.2633 9.13179 7.86668 8.88279 8.57568 8.88279H22.4769C23.1857 8.88279 23.7891 9.13179 24.2871 9.62979C24.7851 10.1275 25.0341 10.7308 25.0341 11.4395V29.528C25.0341 30.4458 24.6506 31.1564 23.8836 31.6599C23.1168 32.1637 22.3056 32.2323 21.4498 31.8658L15.5263 29.3289ZM28.9318 29.114C28.6448 29.114 28.3982 29.0125 28.1919 28.8095C27.9857 28.6068 27.8826 28.3597 27.8826 28.0682V6.49592C27.8826 6.38042 27.8344 6.27454 27.7382 6.17829C27.6419 6.08229 27.5362 6.03429 27.4209 6.03429H11.4201C11.1288 6.03429 10.8804 5.93279 10.6749 5.72979C10.4697 5.52704 10.3671 5.27992 10.3671 4.98842C10.3671 4.69717 10.4697 4.44892 10.6749 4.24367C10.8804 4.03842 11.1288 3.93579 11.4201 3.93579H27.4217C28.1322 3.93579 28.7363 4.18467 29.2341 4.68242C29.7321 5.18042 29.9811 5.78442 29.9811 6.49442V28.0682C29.9811 28.3597 29.8778 28.6068 29.6713 28.8095C29.4651 29.0125 29.2186 29.114 28.9318 29.114Z" fill="#FFB321" />
                              </svg>
                            </span>
                        </div>
                      </div>
                        <div className="content">
                          <span
                            className="title-count"
                            onClick={handleRedirect2}
                            style={{ cursor: "pointer" }}
                          >
                            Saved Jobs
                          </span>
                          <h3>{contSavedJobs}</h3>
                        </div>
                    </div>
                  </div>
                </div>
                {userData && userData.localResume == true && (
                <div className="col-12 col-xxl-9 col-xl-12 col-lg-12 col-md-12 col-sm-12 display-flex resumebox">
                  <div className="card" >
                    <div className="resumecard" style={{ cursor: "pointer" }}>
                      <div className="resumecard-content">
                        <div className="resumecard-text">
                          <div className="resumecard-heading">
                            <h2 className="heading1">Build your professional resume for free</h2>
                            <div className="title-count">
                              Land your dream job faster. Build a standout resume that captivates employers and propels you towards unparalleled opportunities.
                            </div>
                          </div>
                          <div className="resumecard-button">
                            <Link
                              onClick={openModal}
                              
                              className={'button-link1'}
                              style={linkStyle}
                              onMouseEnter={() => setIsHovered(true)}
                              onMouseLeave={() => setIsHovered(false)}
                            >
                              <span className="button button-custom" style={spanStyle}>Create Now</span>
                            </Link>
      <ModalWrapper isOpen={isModalOpen} onClose={closeModal} title="Build Your Resume">
        <ResumeBuilder />
      </ModalWrapper>
                          </div>
                        </div>
                        <div className="resumecard-icon">
                          <img
                            src={Resume}
                            alt="Resume"
                            style={{ width: "221px", height: "auto;", objectFit:"contain", marginTop: "10px" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              {/* New one*/}
              {!showIcon && (
        <div className="col-12 col-xxl-9 col-xl-12 col-lg-12 col-md-12 col-sm-12 display-flex certificatebox">
          <div className="card" style={{ cursor: 'pointer', backgroundColor: '#FFF9E3', fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>
            <div className={!isWideScreen ? 'resumecard' : ''}>
              <div className="resumecard-content">
                <div className="resumecard-text">
                  <div className="resumecard-heading">
                    <h2 className="heading1">Earn Pre-Screened Badges
                    <span 
  style={{ 
    color: '#F00', // Red text color
    border: '1px solid var(--Color-2, #F00)', // Red border
    borderRadius: '13px', // Rounded corners
    padding: '3px 8px', // Spacing around text
    marginLeft: '15px', // Space between "Verified badges" and "New"
    fontSize: '10px', // Adjust font size as needed
    // fontFamily:'Inter',
    fontStyle:'normal',
    fontWeight:'500',
    lineHeight:'normal',
  }}
>
  New
</span>
                    </h2>
                    <div className="" style={{ fontSize: '16.8px', color: '#6F6F6F', fontWeight: '500', fontFamily: 'Plus Jakarta Sans', fontStyle: 'normal' }}>
                      Achieve your dream job faster by demonstrating your aptitude and technical skills.
                    </div>
                  </div>
                  <div className="resumecard-button">
                    <Link
                       to="/applicant-verified-badges"
                      className="button-link1"
                      style={linkStyle}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <span className="button button-custom" style={spanStyle}>Take Test</span>
                    </Link>
                  </div>
                </div>
                
                <div className="resumecard-icon" style={{ marginLeft: 'auto' }}>
                  <img
                    src={Taketest}
                    alt="Taketest"
                    style={{ width: '160px', height: 'auto', objectFit: 'contain', marginTop: '10px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
                {/* New one*/}

                <div className="col-12 col-xxl-9 col-xl-12 col-lg-12 col-md-12 col-sm-12 display-flex certificatebox">
                  <div className="card " style={{ cursor: "pointer" }}>
                    <div className="resumecard" > 
                      <div className="resumecard-content">
                        <div className="resumecard-text">
                          <div className="resumecard-heading">
                            <h2 className="heading1">Get Certified on Advanced Technologies </h2>
                            <div className="title-count">
                              Launch your career with confidence. Earn certifications in advanced skills to set yourself apart as a standout candidate in the competitive job market
                            </div>
                          </div>
                          <div className="resumecard-button">
                            <Link
                              to="https://www.bitlabs.in/"
                              className={`button-link1`}
                              style={linkStyle}
                              onMouseEnter={() => setIsHovered(true)}
                              onMouseLeave={() => setIsHovered(false)}
                            >
                              <span className="button button-custom" style={spanStyle}>Start Learning</span>
                            </Link>
                          </div>
                        </div>
                        <div className="resumecard-icon">
                          <img
                            src={Certificate}
                            alt="Certificate"
                            style={{ width: "273px", height: "auto;", objectFit:"contain", marginTop: "10px" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
      }
    </div>
  );
};

export default ApplicantDashboard;
