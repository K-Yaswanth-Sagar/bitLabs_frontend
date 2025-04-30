
import * as faceapi from 'face-api.js'; 
import { apiUrl } from '../../../services/ApplicantAPIService';



// Load all models
export const loadModels = async (modelPath = '/models') => {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
    faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
    faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
    faceapi.nets.faceExpressionNet.loadFromUri(modelPath),
  ]);
  console.log('All face-api.js models loaded');
};

// Start webcam stream
export const startVideo = async (videoRef, setWebcamError) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
    setWebcamError(false);
  } catch (error) {
    console.error('Error accessing webcam:', error);
    setWebcamError(true);
  }
};

// Stop webcam stream
export const stopVideo = (videoRef) => {
  if (videoRef.current && videoRef.current.srcObject) {
    videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    videoRef.current.srcObject = null;
  }
};

// Face detection loop
// Load the reference face descriptor from stored image
const loadReferenceFaceDescriptor = async () => {
  try {
    const filename = localStorage.getItem('filename');
    if (!filename) throw new Error('No filename found in localStorage');

    const jwtToken = localStorage.getItem('jwtToken');
    const response = await fetch(`http://localhost:8080/file/${filename}`,{
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

    const blob = await response.blob();
    const image = await faceapi.bufferToImage(blob);

    const detection = await faceapi
      .detectSingleFace(image)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) throw new Error('No face detected in the reference image');

    return detection.descriptor;
  } catch (error) {
    console.error('Error loading reference face descriptor:', error);
    return null;
  }
};

// Main function to start face detection
export const startFaceDetection = async (
  videoRef,
  setDetections,
  setAlertCount,
  userId,
  navigation,
  testName,
  interval = 1000
) => {
  console.log("started face detection");
  const referenceDescriptor = await loadReferenceFaceDescriptor();
  if (!referenceDescriptor) {
    console.warn('Reference face descriptor not available. Face comparison will not start.');
    return;
  }

  let alertCounter = 0;
  const intervalId = setInterval(async () => {
    try {
      if (
        !videoRef.current ||
        videoRef.current.readyState < 2
      ) {
        console.log("Video is not ready for face detection");
        return;
      }

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      setDetections(detection ? [detection] : []);

      if (!detection) return;

      const distance = faceapi.euclideanDistance(detection.descriptor, referenceDescriptor);
      const confidence = 1 - distance;

      if (confidence < 0.70) {
        alertCounter++;
        setAlertCount(alertCounter);
        console.warn(`Face mismatch! Confidence: ${confidence.toFixed(2)} | Alert Count: ${alertCounter}`);
        alert(`Warning ${alertCounter}: Face mismatch detected!`);

        if (alertCounter === 1) {
          clearInterval(intervalId);
          console.log('Face detection stopped due to repeated mismatches.');
          console.log(userId);
          console.log("navigation" ,navigation);
          console.log("test Name" ,testName);
          await submitViolation(userId, navigation, testName);
        }
      }
    } catch (err) {
      console.error('Error during live face detection:', err);
    }
  }, interval);

  return intervalId;
};


// Capture and validate face image
export const captureImage = async (videoRef, userId, onSuccess, onFailure) => {
  console.log("In capture image");
  const video = videoRef.current;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;


  if (!video) {
    console.error("videoRef.current is null");
    onFailure("Camera not initialized. Please try again.");
    return;
  }
  
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    console.error("Video dimensions are zero");
    onFailure("Webcam not ready. Please wait a second and try again.");
    return;
  }

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg');

  const detection = await faceapi
    .detectSingleFace(canvas)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection || detection.detection.score < 0.9) {
    onFailure('Face not clear. Please retake the image.');
    return;
  }

  const blob = await (await fetch(dataUrl)).blob();
  const timestamp = Date.now();
  const filename = `${userId}-${timestamp}.jpg`;
  localStorage.setItem('filename', filename);
  const file = new File([blob], filename, { type: 'image/jpeg' });

  onSuccess({ file, dataUrl });
};

// Upload image to server (e.g., to S3)
export const uploadImage = async (file) => {
  const jwtToken = localStorage.getItem('jwtToken');
  const formData = new FormData();
  formData.append('file', file);
 console.log(jwtToken);
  const response = await fetch('http://localhost:8080/file/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwtToken}` },
    body: formData,
  });
  console.log("Imgage uploaded");

  if (!response.ok) throw new Error('Image upload failed');
  return response.json();
};

// Handle verification
export const verifyImage = (capturedImage) => {
  localStorage.setItem('capturedImage', capturedImage);
  console.log('Image verified and stored!');
};

// Submit test violation
 const submitViolation = async (userId, navigation, testName) => {
  const jwtToken = localStorage.getItem('jwtToken');

  const response = await fetch(`${apiUrl}/skill-badges/save`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      applicantId: userId,
      skillBadgeName: testName,
      status: 'FAILED',
    }),
  });

  const data = await response.json();
  console.log('Violation submitted:', data);
  navigation('/applicant-verified-badges');
};
