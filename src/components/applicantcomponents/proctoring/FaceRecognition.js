
import React, { useEffect, useState } from 'react';
import './FaceRecognition.css';
import { useNavigate } from 'react-router-dom';


const FaceRecognition = ({ videoRef, handleVideoOnPlay, detections, apiUrl, userId }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [verified, setVerified] = useState(false);
  const [warningCount, setWarningCount] = useState(0);

  const navigate = useNavigate();

  // Start webcam video
  useEffect(() => {
    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error('Error accessing webcam:', err));
    };

    startVideo();

    // Stop video and clean up on unmount
    return () => {
      stopVideo();
      localStorage.removeItem('capturedImage'); // Remove captured image if any
    };
  }, [videoRef]);

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Handle face detection warnings
  useEffect(() => {
    if (verified) {
      if (detections.length !== 1) {
        setWarningCount((prev) => {
          const newCount = prev + 1;
          console.warn(`Warning ${newCount}: Invalid face detected!`);
          alert(`Warning ${newCount}: Invalid face detected!`);

          if (newCount >= 5) {
            stopVideo(); // Stop video immediately
            handleViolationSubmit();
          }
          return newCount;
        });
      }
    }
  }, [detections, verified]);

  const captureImage = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
    }
  };

  const handleVerify = () => {
    if (capturedImage) {
      localStorage.setItem('capturedImage', capturedImage);
      console.log('Image verified and stored!');
      setVerified(true);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleViolationSubmit = () => {
    const jwtToken = localStorage.getItem('jwtToken');
    const testName = localStorage.getItem('testName') || 'Face Detection Test';
    // const violationSubject = 'Face detection violation';
    const failStatus = 'F'; // or 'FAILED' based on your API
    const testname="failed exam"

    fetch(`${apiUrl}/skill-badges/save`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicantId: userId, // Use the applicant's ID
        skillBadgeName: testname, // Use the test name as the skill badge name
        status: "FAILED", // Use PASS or
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Violation submitted successfully:', data);
        navigate('/applicant-verified-badges');
      })
      .catch((error) => {
        console.error('Error submitting violation:', error);
        navigate('/applicant-verified-badges');
      });
  };

  return (
    <div className="face-recognition-container">
      <video
        ref={videoRef}
        autoPlay
        muted
        onPlay={handleVideoOnPlay}
        width="320"
        height="260"
        className="video-stream"
      />

      {!capturedImage && !verified && (
        <button onClick={captureImage} className="capture-button">
          Capture Image
        </button>
      )}

      {capturedImage && !verified && (
        <div className="verification-buttons">
          <img src={capturedImage} alt="Captured" className="captured-image" />
          <button onClick={handleVerify} className="verify-button">Verify</button>
          <button onClick={handleRetake} className="retake-button">Retake</button>
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;
