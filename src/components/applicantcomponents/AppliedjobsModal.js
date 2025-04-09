import React, { useEffect, useState } from 'react';
import ModalWrapper from './ModalWrapper'; 
import ResumeBuilder from './ResumeBuilder'; 

const Modal = ({ onClose }) => {
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    // Retrieve user data from local storage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  return (
<div className="modal-overlay">
  <div className="modal-text">
    <div className="button-container" style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={onClose}
        style={{
          border: 'none',
          position: 'absolute',
          top: '-1px',
          right: '0px',
          background: 'transparent',
          padding:'1px'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
          <path d="M15.5 5L5.5 15" stroke="#6C6C6C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.5 5L15.5 15" stroke="#6C6C6C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>

    <div className="modal-body">
      <div className="icon-check">
        <svg width="60" height="60" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="checked 1" clipPath="url(#clip0_2068_324)">
            <path
              id="Vector"
              d="M31.3713 61.123C48.216 61.123 61.8713 47.4677 61.8713 30.623C61.8713 13.7784 48.216 0.123047 31.3713 0.123047C14.5267 0.123047 0.871338 13.7784 0.871338 30.623C0.871338 47.4677 14.5267 61.123 31.3713 61.123Z"
              fill="#32BA7C"
            />
            <path
              id="Vector_2"
              d="M23.5779 44.3812L39.2608 60.0642C52.2498 56.6005 61.8713 44.7661 61.8713 30.6226C61.8713 30.3339 61.8713 30.0453 61.8713 29.7566L49.5558 18.4033L23.5779 44.3812Z"
              fill="#0AA06E"
            />
            <g id="Group">
              <path
                id="Vector_3"
                d="M32.141 37.4546C33.488 38.8016 33.488 41.1108 32.141 42.4578L29.3508 45.248C28.0038 46.595 25.6947 46.595 24.3477 45.248L12.1284 32.9325C10.7814 31.5855 10.7814 29.2764 12.1284 27.9294L14.9186 25.1392C16.2656 23.7922 18.5748 23.7922 19.9218 25.1392L32.141 37.4546Z"
                fill="white"
              />
              <path
                id="Vector_4"
                d="M42.8208 16.1909C44.1678 14.8439 46.4769 14.8439 47.8239 16.1909L50.6141 18.9811C51.9611 20.3281 51.9611 22.6373 50.6141 23.9843L29.4469 45.0553C28.0999 46.4023 25.7908 46.4023 24.4438 45.0553L21.6536 42.265C20.3066 40.918 20.3066 38.6089 21.6536 37.2619L42.8208 16.1909Z"
                fill="white"
              />
            </g>
          </g>
          <defs>
            <clipPath id="clip0_2068_324">
              <rect width="61" height="61" fill="white" transform="translate(0.871338 0.123047)" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <h3 style={{ fontSize: '20px', textAlign: 'center', marginBottom: '35px' }}>Job Applied Successfully</h3>
      {userData &&
        (userData.localResume ? (
          <div className="enhance-section">
            <p className="enhanced-paragraph" style={{ fontSize: '17px', marginBottom: '10px', fontWeight: '600' }}>Build your resume</p>
            <div className="horizontal-align">
              <p style={{ fontSize: '12px', lineHeight: '1.5', fontWeight: '400' }}>Build a professional resume to stand out of the crowd</p>
              <div className="responsive-margin">
                <button
                  className="Create-Resume"
                  style={{
                    fontSize: '11px',
                    height: '30px',
                    width: '120px',
                    fontFamily: 'Plus Jakarta Sans',
                    fontWeight: '100',
                  }}
                  onClick={openModal}
                >
                  Create Resume
                </button>

                {isModalOpen && (
                  <ModalWrapper isOpen={isModalOpen} onClose={closeModal} title="Build Your Resume">
                    <ResumeBuilder />
                  </ModalWrapper>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="enhance-section">
            <p className="enhanced-paragraph" style={{ fontSize: '17px', marginBottom: '10px', fontWeight: '600' }}>Enhance your skills</p>
            <div className="horizontal-align">
              <p style={{ fontSize: '10.2px', lineHeight: '1.5', fontWeight: '400' }}>The more your skills are, more will be the chances to get hired</p>
              <div className="responsive-margin">
                <button
                  className="upskill-button"
                  style={{
                    fontSize: '11px',
                    height: '30px',
                    width: '120px',
                    fontFamily: 'Plus Jakarta Sans',
                    fontWeight: '100',
                  }}
                  onClick={() => window.open("https://www.bitlabs.in/", "_blank")}
                >
                  Upskill
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  </div>
</div>

  );
};

export default Modal;