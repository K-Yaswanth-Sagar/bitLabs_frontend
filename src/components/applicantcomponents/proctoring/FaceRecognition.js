import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  startVideo,
  stopVideo,
  startFaceDetection,
  captureImage,
  uploadImage,
  verifyImage,
} from './faceUtils';

function FaceRecognition({ videoRef, setDetections, detections, apiUrl, userId }) {
  const [capturedImage, setCapturedImage] = useState(null);
  const [webcamError, setWebcamError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    startVideo(videoRef, setWebcamError);
    const detectionInterval = startFaceDetection(videoRef, setDetections, 1000);

    return () => {
      stopVideo(videoRef);
      clearInterval(detectionInterval);
    };
  }, [videoRef, setDetections]);

  const handleCapture = () => {
    captureImage(
      videoRef,
      userId,
      async ({ file, dataUrl }) => {
        const response = await uploadImage(file);
        console.log('Uploaded to server:', response);
        setCapturedImage(dataUrl);
      },
      (errMsg) => alert(errMsg)
    );
  };

  const handleVerify = () => {
    if (capturedImage) {
      verifyImage(capturedImage);
      navigate('/daily-test');
    } else {
      alert('Please capture an image first');
    }
  };

  

  return (
    <div className="camera">
      {webcamError ? (
        <p>Unable to access webcam. Please allow webcam access and refresh the page.</p>
      ) : (
        <>
          <video ref={videoRef} autoPlay muted playsInline width="500" height="350" />

          <div className="button-group">
            <button onClick={handleCapture}>Capture</button>
            <button onClick={handleVerify}>Verify</button>
            
          </div>

          {capturedImage && (
            <div>
              <h4>Captured Image Preview:</h4>
              <img src={capturedImage} alt="Captured" width="300" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FaceRecognition;
