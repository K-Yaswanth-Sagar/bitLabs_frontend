
import * as faceapi from 'face-api.js';

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
export const startFaceDetection = (videoRef, setDetections, interval = 1000) => {
  return setInterval(async () => {
    if (videoRef.current) {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      setDetections(detections);
    }
  }, interval);
};

// Capture and validate face image
export const captureImage = async (videoRef, userId, onSuccess, onFailure) => {
  const video = videoRef.current;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

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

  const response = await fetch('http://localhost:8080/file/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwtToken}` },
    body: formData,
  });

  if (!response.ok) throw new Error('Image upload failed');
  return response.json();
};

// Handle verification
export const verifyImage = (capturedImage) => {
  localStorage.setItem('capturedImage', capturedImage);
  console.log('Image verified and stored!');
};

// Submit test violation
export const submitViolation = async (apiUrl, userId, navigate) => {
  const jwtToken = localStorage.getItem('jwtToken');
  const testName = localStorage.getItem('testName') || 'Face Detection Test';

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
  navigate('/applicant-verified-badges');
};
