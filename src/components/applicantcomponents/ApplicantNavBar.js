import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import $ from 'jquery';
import 'jquery.cookie';
import 'metismenu';
import { useState, useEffect, useReducer } from "react";
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import ResumeBuilder from './ResumeBuilder';
import clearJWTToken from '../common/clearJWTToken';
import ModalLogout from '../common/ModalLogout';
import axios from "axios";
import { Switch } from 'antd';
import logos from '../../images/profileIcon.svg';
import ApplicantTakeTest from './ApplicantTakeTest';

function ApplicantNavBar() {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1302
  );
  const { user } = useUserContext();
  const [imageSrc, setImageSrc] = useState('');
  const [alertCount, setAlertCount] = useState(0);

  const location = useLocation();
  const [url, setUrl] = useState('');
  const [loginUrl, setLoginUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubAccountVisible, setIsSubAccountVisible] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const id = user.id;
  const [hamburgerClass, setHamburgerClass] = useState('fa fa-bars');
  const navigate = useNavigate();
  const frompath = location.state?.from;

  const [showTestPopup, setShowTestPopup] = useState(false);
  const [testName, setTestName] = useState('');

  const toggleSubAccount = () => {
    setIsSubAccountVisible(!isSubAccountVisible);
  };


  const handleOutsideClick = (event) => {
    const accountElement = document.querySelector(".account");

    if (accountElement && !accountElement.contains(event.target)) {

      setIsSubAccountVisible(false);
    }
  };


  document.addEventListener("click", handleOutsideClick);



  const [requestData, setRequestData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const response = await axios.get(`${apiUrl}/applicant/getApplicantById/${user.id}`);


        const newData = {
          identifier: response.data.email,
          password: response.data.password
        };

        setRequestData(newData);
      } catch (error) {
        console.error('Error updating profile status:', error);
      }
    };
    fetchData();
  }, []);


  const handleClick = () => {

    const apiUrl = 'http://localhost:5173/api/auth/login';

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'

      },
      body: JSON.stringify(requestData)
    };


    fetch(apiUrl, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {

        const loginUrl = `http://localhost:5173/auth/login?identifier=${encodeURIComponent(requestData.identifier)}&password=${encodeURIComponent(requestData.password)}`;
        window.open(loginUrl, '_blank');

        setLoginUrl(loginUrl);
      })
      .catch(error => {

        console.error('There was a problem with the fetch operation:', error);
      });
  };


  const handleToggleMenu = e => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    if (hamburgerClass === 'fa fa-bars') {
      setHamburgerClass('fa fa-arrow-left');
    } else {
      setHamburgerClass('fa fa-bars');
    }
  };


  const hideMenu = e => {
    e.stopPropagation();
    setIsOpen(window.innerWidth >= 1302);
    setHamburgerClass('fa fa-bars');
  };

  useEffect(() => {
    const handleResize = () => {
      setHamburgerClass('fa fa-bars');
      setIsOpen(window.innerWidth >= 1302);
    };
    window.addEventListener('resize', handleResize);
    $("#left-menu-btn").on("click", function (e) {
      e.preventDefault();
      if ($("body").hasClass("sidebar-enable") == true) {
        $("body").removeClass("sidebar-enable");
        $.cookie("isButtonActive", "0");
      } else {
        $("body").addClass("sidebar-enable");
        $.cookie("isButtonActive", "1");
      }
      1400 <= $(window).width()
        ? $("body").toggleClass("show-job")
        : $("body").removeClass("show-job");
      var width = $(window).width();
      if (width < 1400) {
        $.cookie('isButtonActive', null);
      }
    });
    if ($.cookie("isButtonActive") == 1) {
      $("body").addClass("sidebar-enable show-job");
    }
    fetch(`${apiUrl}/applicant-image/getphoto/${user.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
    })
      .then(response => response.blob())
      .then(blob => {
        const imageUrl = URL.createObjectURL(blob);
        setImageSrc(imageUrl);
      })
      .catch(error => {
        console.error('Error fetching image URL:', error);
        setImageSrc(null);
      });
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [user.id]);


  const handleLogout = () => {
    console.log('Logout button clicked');
    try {

      localStorage.removeItem('jwtToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      window.location.href = "https://www.bitlabs.in/jobs";
    } catch (error) {
      console.error('Logout failed', error);
    }
  };




  useEffect(() => {
    fetchAlertCount();
  }, []);

  const fetchAlertCount = async () => {
    try {
      const response = await axios.get(`${apiUrl}/applyjob/applicants/${user.id}/unread-alert-count`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      setAlertCount(response.data);
    } catch (error) {
      console.error('Error fetching alert count:', error);
    }
  };

  const handleBellClick = () => {

    setAlertCount(0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await axios.get(`${apiUrl}/applicantprofile/${id}/profile-view`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        });
        setProfileData(profileResponse.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchData();
  }, []);

  const nameStyle = {
    marginRight: '5px',
    whiteSpace: 'nowrap',
  };

  const linkStyle = {
    textDecoration: 'none',
    color: 'inherit',
    transition: 'color 0.3s',
  };

  const handleResumeClick = () => {
    navigate('/applicant-resume-builder');
  };


  return (
    <div>
      <div className="menu-mobile-popup">
        <div className="modal-menu__backdrop" />
        <div className="widget-filter">
          <div className="mobile-header">
            <div id="logo" className="logo">
              <a href="/applicanthome">
                <img src={imageSrc || '../images/user/avatar/image-01.jpg'} alt="Profile" onError={() => setImageSrc('../images/user/avatar/image-01.jpg')} />
              </a>
            </div>
            <a className="title-button-group">
              <i className="icon-close" />
            </a>
          </div>
          <div className="header-customize-item button">
            <a href="/applicant-update-profile">Upload Resume</a>
          </div>
        </div>
      </div>
      <header id="header" className="header header-default ">
        <div className="tf-container ct2">
          <div className="row">
            <div className="col-md-12">
              <div className="sticky-area-wrap">
                <div className="header-ct-left">
                  {window.innerWidth < 1400 && (
                    <span id="hamburger" className={hamburgerClass} onClick={handleToggleMenu}></span>

                  )}
                  <span style={{ width: '20px', height: '2px' }}></span>
                  <div id="logo" className="logo">
                    <a href="/applicanthome">
                      <img
                        className="site-logo"

                        src={logos}
                        alt="Image"
                      />
                    </a>

                  </div>
                </div>
                <div className="header-ct-center"></div>
                <div className="header-ct-right">
                  <div style={{ position: 'relative', display: 'inline-block', marginTop: '10px', marginRight: '22px' }}>
                    <Link to="/applicant-job-alerts" className={location.pathname === "/applicant-job-alerts" ? "tf-effect active" : ""}>

                      <span className="fa fa-bell notify-bell" onClick={handleBellClick}>
                        {alertCount > 0 && (
                          <span class="notify-count position-absolute top-0 start-100 translate-middle badge rounded-pill">
                            {alertCount}
                            <span class="visually-hidden">unread messages</span>
                          </span>
                        )}
                      </span>


                    </Link>
                  </div>


                  <div id="specificDiv" className="header-customize-item account">

                    {/* <h4 className="username-text" >{(profileData && profileData.basicDetails && profileData.basicDetails.firstName !== null) ? profileData.basicDetails.firstName : ''}</h4> */}
                    <div className="profile-icon"><img width="32px" height="32px" src={imageSrc || '../images/user/avatar/image-01.jpg'} alt="Profile" onClick={toggleSubAccount} onError={() => setImageSrc('../images/user/avatar/image-01.jpg')} /></div>

                    <div className="toggle-subaccount-icon" onClick={toggleSubAccount}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M11.9998 14.6038C11.8844 14.6038 11.7769 14.5833 11.6773 14.5423C11.5776 14.5013 11.4851 14.4365 11.3998 14.348L6.96602 9.91451C6.82769 9.77918 6.75894 9.61601 6.75977 9.42501C6.76077 9.23401 6.83211 9.07026 6.97377 8.93376C7.11544 8.79709 7.27894 8.72876 7.46427 8.72876C7.64944 8.72876 7.81027 8.79709 7.94677 8.93376L11.9998 12.9865L16.0528 8.93376C16.1828 8.80359 16.342 8.73693 16.5305 8.73376C16.719 8.73043 16.8841 8.79709 17.0258 8.93376C17.1674 9.07026 17.2404 9.23243 17.2445 9.42026C17.2487 9.60809 17.1799 9.77284 17.0383 9.91451L12.6045 14.348C12.516 14.4365 12.4219 14.5013 12.3223 14.5423C12.2226 14.5833 12.1151 14.6038 11.9998 14.6038Z"
                          fill="#5F6368"
                        />
                      </svg>
                    </div>

                    <div className={`sub-account ${isSubAccountVisible ? 'show' : ''}`}>


                      <div className="sub-account-item">
                        <a href="/applicant-view-profile">
                          <span className="icon-profile" />View Profile
                        </a>
                      </div>
                      <div className="sub-account-item">
                        <a href="/applicant-change-password">
                          <span className="icon-change-passwords" /> Change Password
                        </a>
                      </div>
                      <div className="sub-account-item">

                        <a onClick={() => setShowModal(true)}><span className="icon-log-out" /> Log Out </a>


                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </header>
      {(
        <div className={`left-menu ${isOpen ? 'open' : ''}`}>
          <div id="sidebar-menu">
            <ul className="downmenu list-unstyled" id="side-menu">

              <li>
                <Link onClick={hideMenu} to="/applicanthome" className={location.pathname === "/applicanthome" ? "tf-effect active" : ""}>
                  <span className="dash-icon" style={{ marginRight: "15px" }} >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
                      <path d="M10.725 7.20456C10.463 7.20456 10.2433 7.1081 10.066 6.91518C9.88867 6.72226 9.8 6.48328 9.8 6.19825V1.87386C9.8 1.58883 9.88867 1.34986 10.066 1.15694C10.2433 0.964014 10.463 0.867554 10.725 0.867554H16.625C16.887 0.867554 17.1067 0.964014 17.284 1.15694C17.4613 1.34986 17.55 1.58883 17.55 1.87386V6.19825C17.55 6.48328 17.4613 6.72226 17.284 6.91518C17.1067 7.1081 16.887 7.20456 16.625 7.20456H10.725ZM0.925 11.393C0.662833 11.393 0.443167 11.2965 0.266 11.1036C0.0886667 10.9108 0 10.6719 0 10.3867V1.87386C0 1.58883 0.0886667 1.34986 0.266 1.15694C0.443167 0.964014 0.662833 0.867554 0.925 0.867554H6.825C7.08717 0.867554 7.30683 0.964014 7.484 1.15694C7.66133 1.34986 7.75 1.58883 7.75 1.87386V10.3867C7.75 10.6719 7.66133 10.9108 7.484 11.1036C7.30683 11.2965 7.08717 11.393 6.825 11.393H0.925ZM10.725 19.9602C10.463 19.9602 10.2433 19.8637 10.066 19.6708C9.88867 19.478 9.8 19.2391 9.8 18.9539V10.4411C9.8 10.1558 9.88867 9.91687 10.066 9.72413C10.2433 9.53121 10.463 9.43475 10.725 9.43475H16.625C16.887 9.43475 17.1067 9.53121 17.284 9.72413C17.4613 9.91687 17.55 10.1558 17.55 10.4411V18.9539C17.55 19.2391 17.4613 19.478 17.284 19.6708C17.1067 19.8637 16.887 19.9602 16.625 19.9602H10.725ZM0.925 19.9602C0.662833 19.9602 0.443167 19.8637 0.266 19.6708C0.0886667 19.478 0 19.2391 0 18.9539V14.6295C0 14.3443 0.0886667 14.1053 0.266 13.9125C0.443167 13.7196 0.662833 13.6232 0.925 13.6232H6.825C7.08717 13.6232 7.30683 13.7196 7.484 13.9125C7.66133 14.1053 7.75 14.3443 7.75 14.6295V18.9539C7.75 19.2391 7.66133 19.478 7.484 19.6708C7.30683 19.8637 7.08717 19.9602 6.825 19.9602H0.925Z" />
                    </svg>
                  </span>
                  <span className="dash-titles">DashBoard</span>
                </Link>
              </li>

              <li>
                <Link onClick={hideMenu} to="/applicant-find-jobs" className={location.pathname === "/applicant-find-jobs" || frompath === "/applicant-find-jobs" ? "tf-effect active" : ""}>
                  <span className="dash-icon" >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M4.125 20.75C3.60933 20.75 3.16792 20.5664 2.80075 20.1992C2.43358 19.8321 2.25 19.3907 2.25 18.875V7.875C2.25 7.35933 2.43358 6.91792 2.80075 6.55075C3.16792 6.18358 3.60933 6 4.125 6H8.15V4.124C8.15 3.608 8.33358 3.16667 8.70075 2.8C9.06792 2.43333 9.50933 2.25 10.025 2.25H13.975C14.4907 2.25 14.9321 2.43358 15.2992 2.80075C15.6664 3.16792 15.85 3.60933 15.85 4.125V6H19.875C20.3907 6 20.8321 6.18358 21.1992 6.55075C21.5664 6.91792 21.75 7.35933 21.75 7.875V18.875C21.75 19.3907 21.5664 19.8321 21.1992 20.1992C20.8321 20.5664 20.3907 20.75 19.875 20.75H4.125ZM10.025 6H13.975V4.125H10.025V6Z" />
                    </svg>
                  </span>
                  <span className="dash-titles" >Recommended Jobs</span>
                </Link>
              </li>
              <li>
                <Link onClick={hideMenu} to="/applicant-applied-jobs" className={location.pathname === "/applicant-applied-jobs" || frompath === "/applicant-interview-status" || location.pathname.includes("/applicant-interview-status") ? "tf-effect active" : ""}>
                  <span className="dash-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M18.0002 13.2C15.3002 13.2 13.2002 15.4 13.2002 18C13.2002 20.6 15.4002 22.8 18.0002 22.8C20.6002 22.8 22.8002 20.6 22.8002 18C22.8002 15.4 20.6002 13.2 18.0002 13.2ZM21.0002 16.9L17.6002 20.3C17.5002 20.4 17.3002 20.5 17.1002 20.5C16.9002 20.5 16.7002 20.5 16.6002 20.3L15.0002 18.6C14.9002 18.5 14.8002 18.3 14.8002 18.2C14.8002 18 14.8002 17.9 15.0002 17.7C15.1002 17.6 15.3002 17.5 15.4002 17.5C15.5002 17.5 15.7002 17.5 15.8002 17.7L17.1002 19L20.1002 16C20.2002 15.9 20.4002 15.8 20.5002 15.8C20.7002 15.8 20.8002 15.8 20.9002 16C21.0002 16.2 21.1002 16.3 21.1002 16.4C21.1002 16.5 21.1002 16.7 20.9002 16.8L21.0002 16.9Z" fill="#929698" />
                      <path d="M10.0002 5.99995H14.0002V4.09995H10.0002V5.99995ZM4.1002 20.7C3.6002 20.7 3.1002 20.5 2.8002 20.1C2.5002 19.7 2.2002 19.2999 2.2002 18.7999V7.89995C2.2002 7.39995 2.4002 6.89995 2.8002 6.59995C3.2002 6.19995 3.6002 5.99995 4.1002 5.99995H8.1002V4.09995C8.1002 3.59995 8.3002 3.09995 8.7002 2.79995C9.1002 2.39995 9.5002 2.19995 10.0002 2.19995H14.0002C14.5002 2.19995 15.0002 2.39995 15.3002 2.79995C15.7002 3.19995 15.9002 3.59995 15.9002 4.09995V5.99995H19.9002C20.4002 5.99995 20.9002 6.19995 21.2002 6.59995C21.6002 6.99995 21.8002 7.39995 21.8002 7.89995V11.2C21.8002 11.5 21.7002 11.7 21.4002 11.8C21.1002 11.9 20.9002 12 20.6002 11.8C20.2002 11.6 19.8002 11.5 19.3002 11.4C18.9002 11.4 18.4002 11.3 18.0002 11.3C16.1002 11.3 14.6002 12 13.3002 13.3C12.0002 14.6 11.3002 16.2 11.3002 18C11.3002 19.8 11.3002 18.5 11.3002 18.7999C11.3002 19.0999 11.3002 19.4 11.5002 19.6C11.5002 19.9 11.5002 20.1 11.4002 20.4C11.2002 20.6 11.0002 20.7 10.8002 20.7H4.2002H4.1002Z" />
                    </svg>
                  </span>
                  <span className="dash-titles">Applied Jobs</span>
                </Link>
              </li>
              <li>
                <Link onClick={hideMenu} to="/applicant-saved-jobs" className={location.pathname === "/applicant-saved-jobs" || frompath === "/applicant-saved-jobs" ? "tf-effect active" : ""}>
                  <span className="dash-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M10.3512 19.2188L6.40219 20.91C5.83169 21.1544 5.29078 21.1086 4.77945 20.7728C4.26828 20.4371 4.0127 19.9634 4.0127 19.3515V7.29254C4.0127 6.82004 4.1787 6.41787 4.5107 6.08604C4.84253 5.75404 5.24478 5.58804 5.71745 5.58804H14.9849C15.4574 5.58804 15.8597 5.75404 16.1917 6.08604C16.5237 6.41787 16.6897 6.82004 16.6897 7.29254V19.3515C16.6897 19.9634 16.434 20.4371 15.9227 20.7728C15.4115 21.1086 14.8707 21.1544 14.3002 20.91L10.3512 19.2188ZM19.2882 19.0755C19.0969 19.0755 18.9324 19.0079 18.7949 18.8725C18.6574 18.7374 18.5887 18.5726 18.5887 18.3783V3.99679C18.5887 3.91979 18.5566 3.84921 18.4924 3.78504C18.4283 3.72104 18.3578 3.68904 18.2809 3.68904H7.6137C7.41953 3.68904 7.25395 3.62137 7.11695 3.48604C6.98011 3.35087 6.9117 3.18612 6.9117 2.99179C6.9117 2.79762 6.98011 2.63212 7.11695 2.49529C7.25395 2.35846 7.41953 2.29004 7.6137 2.29004H18.2814C18.7551 2.29004 19.1579 2.45596 19.4897 2.78779C19.8217 3.11979 19.9877 3.52246 19.9877 3.99579V18.3783C19.9877 18.5726 19.9189 18.7374 19.7812 18.8725C19.6437 19.0079 19.4794 19.0755 19.2882 19.0755Z" />
                    </svg>
                  </span>
                  <span className="dash-titles">Saved Jobs</span>
                </Link>
              </li>


              <li>
                <Link onClick={hideMenu} to="/applicant-daily-test" className={location.pathname === "/applicant-daily-test" || frompath === "/applicant-daily-test" ? "tf-effect active" : ""}>
                  <span className="dash-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 4h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1" />
                      <rect x="9" y="2" width="6" height="4" rx="1" ry="1" />
                      <line x1="9" y1="9" x2="15" y2="9" />
                      <line x1="9" y1="13" x2="15" y2="13" />
                      <line x1="9" y1="17" x2="13" y2="17" />
                    </svg>

                  </span>
                  <span className="dash-titles">Daily Test</span>
                </Link>
              </li>


              <li>
                <Link onClick={hideMenu} to="/applicant-resume" className={location.pathname === "/applicant-resume" ? "tf-effect active" : ""}>

                  <span className="dash-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M16.8509 15.5145C16.1272 15.5145 15.512 15.2611 15.0051 14.7543C14.4985 14.2476 14.2451 13.6324 14.2451 12.9088C14.2451 12.1883 14.4985 11.5746 15.0051 11.0678C15.512 10.5611 16.1272 10.3078 16.8509 10.3078C17.5714 10.3078 18.185 10.5611 18.6916 11.0678C19.1985 11.5746 19.4519 12.1883 19.4519 12.9088C19.4519 13.6324 19.1985 14.2476 18.6916 14.7543C18.185 15.2611 17.5714 15.5145 16.8509 15.5145ZM8.96139 19.4605V20.298H5.39289C4.91806 20.298 4.51414 20.1311 4.18114 19.7973C3.84814 19.4634 3.68164 19.0614 3.68164 18.5913V5.38851C3.68164 4.91834 3.84856 4.51635 4.18239 4.18251C4.51622 3.84868 4.91822 3.68176 5.38839 3.68176H18.6114C19.0816 3.68176 19.4836 3.84868 19.8174 4.18251C20.1512 4.51635 20.3181 4.91834 20.3181 5.38851V9.62126C19.8866 9.11993 19.3794 8.73176 18.7964 8.45676C18.2134 8.18176 17.5809 8.03751 16.8989 8.02401C16.8541 8.02401 16.8124 8.0256 16.7739 8.02876C16.7354 8.0321 16.6937 8.03693 16.6489 8.04326V8.01451C16.6086 7.84751 16.5286 7.71443 16.4091 7.61526C16.2898 7.51593 16.1332 7.46626 15.9394 7.46626H8.05289C7.85889 7.46626 7.69339 7.53485 7.55639 7.67201C7.41939 7.80901 7.35089 7.97293 7.35089 8.16376C7.35089 8.35776 7.41939 8.52318 7.55639 8.66001C7.69339 8.79685 7.85889 8.86526 8.05289 8.86526H14.2519C13.7909 9.14026 13.3886 9.4831 13.0451 9.89376C12.7015 10.3043 12.4354 10.7698 12.2469 11.2905H8.05289C7.85889 11.2905 7.69339 11.359 7.55639 11.496C7.41939 11.6332 7.35089 11.7971 7.35089 11.9878C7.35089 12.1818 7.41939 12.3472 7.55639 12.484C7.69339 12.621 7.85889 12.6895 8.05289 12.6895H12.0219C12.0002 13.0882 12.0278 13.4797 12.1046 13.864C12.1816 14.2483 12.3002 14.6171 12.4604 14.9703C12.4027 14.9959 12.3466 15.0199 12.2921 15.0423C12.2376 15.0648 12.1847 15.0888 12.1334 15.1145H8.05289C7.85889 15.1145 7.69339 15.183 7.55639 15.32C7.41939 15.4572 7.35089 15.6211 7.35089 15.8118C7.35089 16.0058 7.41939 16.1713 7.55639 16.3083C7.69339 16.4451 7.85889 16.5135 8.05289 16.5135H10.2969C9.87189 16.8782 9.54306 17.3204 9.31039 17.8403C9.07772 18.3603 8.96139 18.9003 8.96139 19.4605ZM12.1009 21.9663C11.8634 21.9663 11.6614 21.883 11.4949 21.7165C11.3284 21.55 11.2451 21.348 11.2451 21.1105V19.4605C11.2451 19.1793 11.3128 18.9146 11.4481 18.6663C11.5836 18.4179 11.7714 18.2205 12.0114 18.074C12.5012 17.785 12.924 17.5799 13.2796 17.4588C13.6355 17.3376 14.0948 17.2278 14.6576 17.1293C14.8351 17.1008 15.0076 17.1041 15.1749 17.1393C15.3422 17.1746 15.4836 17.2589 15.5989 17.3923L16.8509 18.951L18.0779 17.4048C18.1901 17.2644 18.3318 17.1763 18.5031 17.1405C18.6746 17.1045 18.85 17.1008 19.0291 17.1293C19.5936 17.2278 20.0524 17.3373 20.4054 17.4578C20.7584 17.5783 21.1841 17.7837 21.6826 18.074C21.923 18.2202 22.1096 18.4134 22.2426 18.6538C22.3756 18.8943 22.4454 19.1533 22.4519 19.4308V21.1105C22.4519 21.348 22.3686 21.55 22.2021 21.7165C22.0356 21.883 21.8352 21.9663 21.6009 21.9663H12.1009Z" />
                    </svg>
                  </span>
                  <span className="dash-titles">My Resume</span>
                </Link>

                {/*Verified badges */}
                <Link
                  onClick={hideMenu}
                  to="/applicant-verified-badges"
                  className={location.pathname === "/applicant-verified-badges" ? "tf-effect active" : ""}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    marginTop: '13px'
                  }}
                >
                  <span
                    className="dash-icon"
                    style={{
                      display: 'inline-block',
                      transition: 'fill 0.3s ease',
                      marginRight: '12px',
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="25"
                      viewBox="0 0 24 25"
                      fill="none"
                      style={{
                        fill: location.pathname === "/applicant-verified-badges" ? "#F46F16" : "#888888"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.fill = "#F46F16"}
                      onMouseLeave={(e) => e.currentTarget.style.fill = location.pathname === "/verified-badges" ? "#F46F16" : "#888888"}
                    >
                      <path d="M21.6008 11.2002L20.2008 9.6002C19.9008 9.3002 19.7008 8.7002 19.7008 8.3002V6.70019C19.7008 5.60019 18.8008 4.8002 17.8008 4.8002H16.1008C15.7008 4.8002 15.1008 4.6002 14.8008 4.3002L13.2008 2.9002C12.5008 2.3002 11.4008 2.3002 10.7008 2.9002L9.20078 4.3002C8.90078 4.6002 8.30078 4.8002 7.90078 4.8002H6.20078C5.10078 4.8002 4.30078 5.70019 4.30078 6.70019V8.4002C4.30078 8.8002 4.10078 9.40019 3.80078 9.70019L2.50078 11.3002C1.90078 12.0002 1.90078 13.1002 2.50078 13.8002L3.80078 15.4002C4.10078 15.7002 4.30078 16.3002 4.30078 16.7002V18.4002C4.30078 19.5002 5.20078 20.3002 6.20078 20.3002H7.90078C8.30078 20.3002 8.90078 20.5002 9.20078 20.8002L10.8008 22.2002C11.5008 22.8002 12.6008 22.8002 13.3008 22.2002L14.9008 20.8002C15.2008 20.5002 15.8008 20.3002 16.2008 20.3002H17.9008C19.0008 20.3002 19.8008 19.4002 19.8008 18.4002V16.7002C19.8008 16.3002 20.0008 15.7002 20.3008 15.4002L21.7008 13.8002C22.2008 13.1002 22.2008 11.9002 21.6008 11.2002ZM16.2008 10.6002L11.4008 15.4002C11.3008 15.5002 11.1008 15.6002 10.9008 15.6002C10.7008 15.6002 10.5008 15.5002 10.4008 15.4002L8.00078 13.0002C7.70078 12.7002 7.70078 12.2002 8.00078 11.9002C8.30078 11.6002 8.80078 11.6002 9.10078 11.9002L11.0008 13.8002L15.1008 9.5002C15.4008 9.20019 15.9008 9.20019 16.2008 9.5002C16.5008 9.8002 16.5008 10.3002 16.2008 10.6002Z" />
                    </svg>
                  </span>
                  <span className="dash-titles" style={{ color: '#333', fontSize: '16px' }}>Verified badges</span>
                  <span
                    style={{
                      color: '#F00', // Red text color
                      border: '1px solid var(--Color-2, #F00)', // Red border
                      borderRadius: '13px', // Rounded corners
                      padding: '3px 8px', // Spacing around text
                      marginLeft: '25px', // Space between "Verified badges" and "New"
                      fontSize: '10px', // Adjust font size as needed
                      // fontFamily:'Inter',
                      fontStyle: 'normal',
                      fontWeight: '500',
                      lineHeight: 'normal',
                    }}
                  >
                    New
                  </span>
                </Link>
              </li>


            </ul>

          </div>

        </div>
      )}
      <ModalLogout
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleLogout}
      />

    </div>
  )
}
export default ApplicantNavBar;