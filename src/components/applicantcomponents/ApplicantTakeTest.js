import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import aptitudeQuestions from './questions/aptitude_questions.json';
import technicalQuestions from './questions/technical_questions.json';
import './css/ApplicantTakeTest.css';
import Logo from '../../images/artboard.svg';
import TestExitPopup from './TestExitPopup';
import TestTimeUp from './TestTimeUp';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import TestPassAcknowledgment from './TestPassAcknowledgment';
import TestFailAcknowledgment from './TestFailAcknowledgment';
import SpringBootTset from './questions/Spring Boot.json';
import ReactTest from './questions/React.json';
import SQLTest from './questions/SQL.json';
import PaythonTest from './questions/Paython.json';
import HTMLTest from './questions/HTML.json';
import JavaScriptTest from './questions/Javascript.json';
import JavaTest from './questions/Java.json';
import CppTest from './questions/Cpp.json';
import DjangoTest from './questions/Django.json';
import HibernateTest from './questions/Hibernate.json';
import SeleniumTest from './questions/Selenium.json';
import CSharpTest from './questions/CSharp.json';
import CTest from './questions/C.json';
import DotNetTest from './questions/DotNet.json';
import RegressionTest from './questions/Regression Testing.json';
import SpringTest from './questions/Spring.json';
import MonogoTest from './questions/MongoDB.json';
import FlaskTest from './questions/Flask.json';
import ServletsTest from './questions/Servlets.json';
import JspTest from './questions/Jsp.json';
import TSTest from './questions/TS.json';
import CSSTest from './questions/CSS.json';
import AngularTest from './questions/Angular.json';
import ManualTestingTest from './questions/ManualTesting.json';
import VueTest from './questions/Vue.json';
import Snackbar from "../common/Snackbar";
import {
  startVideo,
  stopVideo,
  startFaceDetection,
  captureImage,
  uploadImage,
  verifyImage,
  loadModels,
} from './proctoring/faceUtils';


const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const ApplicantTakeTest = () => {
  const [currentPage, setCurrentPage] = useState('instructions');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [remainingTime, setRemainingTime] = useState(3600);
  const [testStarted, setTestStarted] = useState(false);
  const [timer, setTimer] = useState(3600); // Assuming 1 hour (3600 seconds)
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState({ questions: [], duration: 0, numberOfQuestions: 0, topicsCovered: [] });
  const [acknowledgmentVisible, setAcknowledgmentVisible] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [showGoBackButton, setShowGoBackButton] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const navigate = useNavigate();
  const navigation = useNavigate();
  const location = useLocation();
  const { testName } = location.state || {};
  const { user } = useUserContext();
  const userId = user.id;
  const [filename, setFilename] = useState(null);
  const [alertCount, setAlertCount] = useState(0);
  const [detections, setDetections] = useState([]);
  const [hasFilename, setHasFilename] = useState(!!localStorage.getItem('filename'));
  const [webcamAllowed, setWebcamAllowed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [customAlertMessage, setCustomAlertMessage] = useState('');
const [showCustomAlert, setShowCustomAlert] = useState(false);
const [shouldExitFullScreen, setShouldExitFullScreen] = useState(false);
 const [snackbars, setSnackbars] = useState([]);
 const [imageSrc, setImageSrc] = useState(null);
 const [isImageUploaded, setIsImageUploaded] = useState(false);

 
 useEffect(() => {
  const fetchImage = async () => {
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await fetch(`${apiUrl}/applicant-image/getphoto/${userId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      if (!response.ok) {
        throw new Error('Image fetch failed');
      }

      const arrayBuffer = await response.arrayBuffer(); 

      const base64Image = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      const contentType = response.headers.get('content-type'); 
      setImageSrc(`data:${contentType};base64,${base64Image}`);
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  fetchImage();
}, [userId, apiUrl]);


const addSnackbar = (snackbar) => {
  setSnackbars((prevSnackbars) => [...prevSnackbars, snackbar]);
};


  useEffect(() => {
    const checkWebcamPermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' });

        setWebcamAllowed(permissionStatus.state === 'granted');

        // Listen for changes in permission
        permissionStatus.onchange = () => {
          setWebcamAllowed(permissionStatus.state === 'granted');
        };
      } catch (err) {
        console.warn('Permission check not supported:', err);
        // Fallback: assume allowed to avoid blocking
        setWebcamAllowed(true);
      }
    };

    checkWebcamPermission();
  }, []);

  useEffect(() => {
    const storedFilename = localStorage.getItem('filename');
    if (storedFilename && storedFilename !== filename) {
      setFilename(storedFilename);
    }
  }, [filename]);

  useEffect(() => {
    const checkFilename = () => {
      const exists = !!localStorage.getItem('filename');
      setHasFilename(exists);
    };

    const intervalId = setInterval(checkFilename, 500); // check every 500ms

    return () => clearInterval(intervalId);
  }, []);



  const [webcamError, setWebcamError] = useState(false);
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);




  // Disable right-click and copy-paste
  const disableUserActions = () => {

    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('copy', preventDefault);
    document.addEventListener('cut', preventDefault);
    document.addEventListener('paste', preventDefault);
  };

  // Enable right-click and copy-paste again
  const enableUserActions = () => {
    document.removeEventListener('contextmenu', preventDefault);
    document.removeEventListener('copy', preventDefault);
    document.removeEventListener('cut', preventDefault);
    document.removeEventListener('paste', preventDefault);
  };

  // Helper function
  const preventDefault = (e) => {
    e.preventDefault();
  };


  useEffect(() => {
    // Load questions and set timer based on the test name

    console.log(testName);
    if (testName === 'General Aptitude Test') {
      setQuestions(aptitudeQuestions);
      setTimer(60 * 60); // 60 minutes for General Aptitude Test
      setRemainingTime(60 * 60);
    } else if (testName === 'Technical Test') {
      setQuestions(technicalQuestions);
      setTimer(30 * 60); // 30 minutes for Technical Test
      setRemainingTime(3 * 60);
    } else if (testName === 'Spring Boot') {
      setQuestions(SpringBootTset);
      setTimer(1 * 60);
      setRemainingTime(1 * 60);
    } else if (testName === 'React') {
      setQuestions(ReactTest);
      setTimer(1 * 60);
      setRemainingTime(1 * 60);
    } else if (testName === 'SQL') {
      setQuestions(SQLTest);
      setTimer(1 * 60);
      setRemainingTime(1 * 60);
    } else if (testName === 'MySQL') {
      setQuestions(SQLTest);
      setTimer(1 * 60);
      setRemainingTime(1 * 60);
    } else if (testName === 'SQL-Server') {
      setQuestions(SQLTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName === 'Python') {
      setQuestions(PaythonTest);
      setTimer(1 * 60);
      setRemainingTime(1 * 60);
    } else if (testName === 'HTML') {
      setQuestions(HTMLTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName === 'JavaScript') {
      setQuestions(JavaScriptTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName === 'Java') {
      setQuestions(JavaTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName === 'C++') {
      setQuestions(CppTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName === 'Django') {
      setQuestions(DjangoTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName === 'Hibernate') {
      setQuestions(HibernateTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName === 'Selenium') {
      setQuestions(SeleniumTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName === 'C Sharp') {
      setQuestions(CSharpTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName === 'C') {
      setQuestions(CTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName == '.Net') {
      setQuestions(DotNetTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName == 'Regression Testing') {
      setQuestions(RegressionTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName == 'Spring') {
      setQuestions(SpringTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName == 'Mongo DB') {
      setQuestions(MonogoTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName == 'Flask') {
      setQuestions(FlaskTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName == 'Servlets') {
      setQuestions(ServletsTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName == 'JSP') {
      setQuestions(JspTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName == 'TypeScript') {
      setQuestions(TSTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName == 'CSS') {
      setQuestions(CSSTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName == 'Angular') {
      setQuestions(AngularTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName == 'Manual Testing') {
      setQuestions(ManualTestingTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    } else if (testName == 'Vue') {
      setQuestions(VueTest);
      setTimer(30 * 60);
      setRemainingTime(30 * 60);
    }
  }, [testName]);

  useEffect(() => {
    // Shuffle the questions array when the component mounts
    const shuffled = shuffleArray(questions.questions);
    setShuffledQuestions(shuffled);
  }, [questions.questions]);


  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const enterFullScreen = () => {
    const elem = document.documentElement; // Make the entire document full screen
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
    setIsFullScreen(true);
    setShowGoBackButton(false); // Hide the "Go Back to Test" button when entering full screen
  };

  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullScreen(false);
    setShowGoBackButton(true); // Show the "Go Back to Test" button when exiting full screen
  };

  const handleTestCompletion = () => {
    setIsTestCompleted(true);
    document.exitFullscreen();
  };

  useEffect(() => {
    const onFullScreenChange = () => {
      if (!document.fullscreenElement && !isTestCompleted) {
        //setIsFullScreen(false);
        setShowGoBackButton(true); // Show the "Go Back to Test" button when user exits full screen
      } else {
        //setIsFullScreen(true);
        setShowGoBackButton(false); // Hide the button when full screen is active
      }
    };

    document.addEventListener('fullscreenchange', onFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullScreenChange);
    };
  }, []);

  const handleGoBackToTest = () => {
    enterFullScreen();
    setShowGoBackButton(false); // Hide the button when user goes back to full screen
  };

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      handleTestInterruption(); // Handle the case when the user loses connection
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (testStarted && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            handleTestCompletion();
            setShowGoBackButton(false);
            handleTimesUp();
            return 0; // Ensure the timer doesn't go below 0
          }
          return prevTime - 1; // Decrease by 1 second
        });
      }, 1000);
    }
    return () => clearInterval(interval); // Cleanup on unmount or test stop
  }, [testStarted, remainingTime]);

  const handleTestInterruption = () => {
    console.log("Test interrupted");
    setTestStarted(false);
    setCurrentPage('interrupted'); // Show a page or message indicating test interruption
    // Optionally save the current state or handle submission logic here
  };

  const captureImage1 = () => {
    setCurrentPage('captureImage');
  }

  const startTest = () => {
    setCurrentPage('test');
    setTestStarted(true);
    enterFullScreen();
    disableUserActions();
  };

  const handleNextQuestion = () => {
    if (!selectedOptions[currentQuestionIndex]) {
      setValidationMessage('Please provide your answer to move to the next question');
      return;
    }
    setValidationMessage('');
    if (currentQuestionIndex < questions.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBackQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setValidationMessage('');
    }
  };


  const handleOptionChange = (event) => {
    const selectedOption = event.target.value;
    setSelectedOptions({
      ...selectedOptions,
      [currentQuestionIndex]: selectedOption,
    });
  };



  const calculateScore = () => {
    let correctAnswers = 0;
    questions.questions.forEach((question, index) => {
      if (selectedOptions[index] === question.answer) {
        correctAnswers += 1;
      }
    });
    const calculatedScore = (correctAnswers / questions.questions.length) * 100;
    setScore(calculatedScore);
    return calculatedScore;
  };


  const handleSubmitTest = () => {
    if (!selectedOptions[currentQuestionIndex]) {
      setValidationMessage('Please provide your answer to submit the test.');
      return;
    }
    setValidationMessage('');
    enableUserActions();
    const calculatedScore = calculateScore();
    const testStatus = calculatedScore >= 70 ? 'P' : 'F';
    const jwtToken = localStorage.getItem('jwtToken');

    if (isOnline) {

      if (testName === 'General Aptitude Test' || testName === 'Technical Test') {
        // Submit the test result to the API
        fetch(`${apiUrl}/applicant1/saveTest/${userId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            testName,
            testScore: calculatedScore,
            testStatus,
            applicant: {
              id: userId,
            },
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Test submitted successfully:', data);
          })
          .catch((error) => {
            console.error('Error submitting the test:', error);
          });
      } else {

        const skillBadgeStatus = calculatedScore >= 70 ? 'PASSED' : 'FAILED';
        // Submit the skill badge information to the API
        fetch(`${apiUrl}/skill-badges/save`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jwtToken}`, // Add jwtToken for authorization
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicantId: userId, // Use the applicant's ID
            skillBadgeName: testName, // Use the test name as the skill badge name
            status: skillBadgeStatus, // Use PASS or FAILED based on score
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Skill badge saved successfully:', data);
          })
          .catch((error) => {
            console.error('Error saving the skill badge:', error);
          });
      }
    }
    else {
      // Notify the user about the loss of connection
      setValidationMessage('No internet connection. Please check your connection and try again.');
    }

    handleTestCompletion();
    setShowGoBackButton(false);
    // Show the acknowledgment popup based on the test result
    if (testStatus === 'P') {

      setCurrentPage('passAcknowledgment');
    } else {

      setCurrentPage('failAcknowledgment');
    }
  };




  const handleExit = () => {
    setShowExitPopup(true); // Show exit confirmation popup
  };

  const handleConfirmExit = () => {
    setShowExitPopup(false);
    enableUserActions();
    if (testStarted && testName !== 'General Aptitude Test' && testName !== 'Technical Test') {
      handleTestCompletion();
      setShowGoBackButton(false);
      const jwtToken = localStorage.getItem('jwtToken');
      // Submit the skill badge information to the API
      fetch(`${apiUrl}/skill-badges/save`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`, // Add jwtToken for authorization
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicantId: userId, // Use the applicant's ID
          skillBadgeName: testName, // Use the test name as the skill badge name
          status: 'FAILED', // Use PASS or FAILED based on score
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Skill badge saved successfully:', data);
        })
        .catch((error) => {
          console.error('Error saving the skill badge:', error);
        });
    }
    else if (testStarted) { // Ensure test has started
      handleTestCompletion();
      setShowGoBackButton(false);
      const calculatedScore = 0; // Calculate the test score
      const testStatus = calculatedScore >= 70 ? 'P' : 'F'; // Determine pass/fail status
      const jwtToken = localStorage.getItem('jwtToken');
      // Submit the test result to the API
      fetch(`${apiUrl}/applicant1/saveTest/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testName,
          testScore: calculatedScore,
          testStatus,
          applicant: {
            id: userId,
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Test result submitted successfully:', data);
        })
        .catch((error) => {
          console.error('Error submitting test result:', error);
        });
    }

    // Navigate to the next page after the API call
    localStorage.removeItem('filename');

    navigate("/applicant-verified-badges");

  };


  const handleCancelExit = () => {
    setShowExitPopup(false); // Close the exit popup without navigating
  };

  const handleTimesUp = () => {
    enableUserActions();
    setCurrentPage('timesup');
  };

  const handleTimesUpClose = () => {
    setCurrentPage(false);
  };

  const handleClosePopup = () => {
    localStorage.removeItem('filename');
    setCurrentPage('instructions'); // Or navigate to a different page if needed
  };

  const handleTakeTest = (testName) => {
    setAcknowledgmentVisible(false); // Hide the acknowledgment component
    localStorage.removeItem('filename');
    window.location.reload();

    navigate('/applicant-take-test', { state: { testName } }); // Then navigate to the test
  };

  const handleViewResults = () => {

    const calculatedScore = calculateScore();
    const testStatus = calculatedScore >= 70 ? 'P' : 'F';
    const jwtToken = localStorage.getItem('jwtToken');

    if (testStarted && testName !== 'General Aptitude Test' && testName !== 'Technical Test') {
      const jwtToken = localStorage.getItem('jwtToken');
      const testStatus = calculatedScore >= 70 ? 'PASSED' : 'FAILED';
      // Submit the skill badge information to the API
      fetch(`${apiUrl}/skill-badges/save`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`, // Add jwtToken for authorization
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicantId: userId, // Use the applicant's ID
          skillBadgeName: testName, // Use the test name as the skill badge name
          status: testStatus, // Use PASS or FAILED based on score
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Skill badge saved successfully:', data);
        })
        .catch((error) => {
          console.error('Error saving the skill badge:', error);
        });
    }
    else if (testStarted) { // Ensure test has started
      const calculatedScore = calculateScore(); // Calculate the test score
      const testStatus = calculatedScore >= 70 ? 'P' : 'F'; // Determine pass/fail status
      const jwtToken = localStorage.getItem('jwtToken');
      // Submit the test result to the API
      fetch(`${apiUrl}/applicant1/saveTest/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testName,
          testScore: calculatedScore,
          testStatus,
          applicant: {
            id: userId,
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Test result submitted successfully:', data);
        })
        .catch((error) => {
          console.error('Error submitting test result:', error);
        });
    }
    // Show the acknowledgment popup based on the test result
    if (testStatus === 'P') {
      setCurrentPage('passAcknowledgment');
    } else {
      setCurrentPage('failAcknowledgment');
    }
  };

  const webcamStreamRef = useRef(null);

  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath !== '/applicant-take-test') {
      localStorage.removeItem('filename');
      console.log('Removed filename from localStorage because path changed:', currentPath);
    }
  }, [location.pathname]);

  useEffect(() => {
    const initialize = async () => {
      if (currentPage === 'captureImage' || currentPage === 'test' || currentPage === 'instructions') {
        await loadModels();
        startVideo(videoRef, setWebcamError, webcamStreamRef);
      }
    };

    initialize();
    return () => {
      stopVideo(videoRef, webcamStreamRef);
    };
  }, [currentPage]);



  useEffect(() => {
    const initModels = async () => {
      await loadModels(process.env.PUBLIC_URL + '/models');
      setModelsLoaded(true);
    };

    initModels();
  }, []);

  const handleCapture = () => {
    console.log("entered handle capture");
    console.log(videoRef);
    console.log(userId);

    setLoading(true); // Start loading

    captureImage(
      imageSrc,
      videoRef,
      userId,
      async ({ file, dataUrl, filename }) => {
        try {
          const response = await uploadImage(file);
         
          console.log('Uploaded to server:', response);
          setCapturedImage(dataUrl);

          // const updatedFilename = localStorage.getItem('filename');
          // console.log("Updated filename:", updatedFilename);
        
            setFilename(filename);
            setIsImageUploaded(true); 
        
        } catch (err) {
          console.error(err);
          setIsImageUploaded(false); 
        } finally {
          setLoading(false); // Stop loading
        }
      },
     
      (errMsg) => {
        alert(errMsg);
        setLoading(false); // Stop loading on error
      }
    );
  };


  useEffect(() => {
    let intervalId;

    const handleVideoReady = async () => {
      console.log('Video is ready, starting face detection...');
      console.log("navigate", navigation);
      console.log("testName", testName);
      intervalId = await startFaceDetection(
        setDetections,
        setAlertCount,
        videoRef,
        userId,
        navigation,
        testName);

    };


    if (currentPage === 'test' && videoRef.current) {
      const video = videoRef.current;

      const onLoadedData = () => {
        handleVideoReady();
      };

      video.addEventListener('loadeddata', onLoadedData);

      clearInterval(intervalId);
    }

  }, [currentPage, videoRef]);

  useEffect(() => {
    window.alert = (message) => {
      addSnackbar({
        message,
        type: 'error', 
      });
    };
  }, [addSnackbar]);
  
  useEffect(() => {
    if (alertCount === 5) {
      setCustomAlertMessage("Your test will be auto submitted in 5 seconds due to multiple face mismatches try again after 7 days");
      setShowCustomAlert(true);
      setShouldExitFullScreen(true); 
    }
  }, [alertCount]);
  

  const handleCloseSnackbar = (index) => {
    setSnackbars((prevSnackbars) => prevSnackbars.filter((_, i) => i !== index));
  };

  useEffect(() => {
    console.log("Upload state changed:", isImageUploaded);
  }, [isImageUploaded]);
  

  return (
    <div className="test-container">
      <header className="test-header">
        <img className="logo1" src={Logo} alt="Logo" />
        <button className="exit-btn" onClick={handleExit}>
          Exit&nbsp;
          <svg
            className='exit-svg'
            style={{ marginTop: '-3px' }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 25 25"
            fill="none"
          >
            <path
              d="M9.58398 21.5H5.58398C5.05355 21.5 4.54484 21.2893 4.16977 20.9142C3.7947 20.5391 3.58398 20.0304 3.58398 19.5V5.5C3.58398 4.96957 3.7947 4.46086 4.16977 4.08579C4.54484 3.71071 5.05355 3.5 5.58398 3.5H9.58398"
              stroke="#7F7F7F"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.584 17.5L21.584 12.5L16.584 7.5"
              stroke="#7F7F7F"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21.584 12.5H9.58398"
              stroke="#7F7F7F"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      {showExitPopup && (
        <TestExitPopup
          onConfirm={handleConfirmExit}
          onCancel={handleCancelExit}
          exitMessage={!testStarted ? undefined : "Exiting will erase your progress and prevent retaking the test for 7 days. Proceed?"}
        />
      )}
      {currentPage === 'instructions' && (
        <div className="instructions-page">
          <div className="instructions-header">
            <div style={{ marginLeft: '2%' }}>
              <h2 className="text-name">{testName}</h2>
              <div className="duration-container">
                <div className="duration-box">
                  Duration
                  <span className="duration-value">{questions.duration}</span>
                </div>
                <div className="duration-box">
                  Questions
                  <span className="duration-value">{questions.numberOfQuestions}</span>
                </div>
              </div>
              <br />
              <div
                style={{
                  color: '#797979',
                  fontSize: '14px',
                  fontFamily: 'Plus Jakarta Sans',
                  fontWeight: '400',
                }}
              >
                Topics Covered <br />
                <span className="topics-covered">{questions.topicsCovered.join(', ')}</span>
              </div>
            </div>
          </div>
          <br />
          <div className="instructions" style={{ paddingLeft: '2%' }}>
            <span className="instructions-title">Instructions</span>
            <ul className="instructions-list">
              <li>You need to score at least 70% to pass the exam.</li>
              <li>Once started, the test cannot be paused or reattempted during the same session.</li>
              <li>Do not refresh the page during the test.</li>
              <li>If you score below 70%, you can retake the exam after 7 days.</li>
              <li>Ensure all questions are answered before submitting, as your first submission will be final.</li>
              <li>All the questions are mandatory.</li>
              <li>Please complete the test independently. External help is prohibited.</li>
              <li>
                Make sure your device is fully charged and has a stable internet connection before starting the test.
              </li>
              <li>
                To avoid interruptions, take the test on a PC, as calls may disrupt it on mobile.
              </li>
            </ul>
          </div>
          <div align="right">
            <button className="start-btn" onClick={captureImage1}>
              Next
            </button>
          </div>
        </div>
      )}

      {currentPage === 'captureImage' && (
        <div className="instructions-page">

          <br />
          <div className="instructions" style={{ paddingLeft: '2%' }}>
         
          {imageSrc ? <img src={imageSrc} alt="Profile" /> : <p>Loading image...</p>}

      
            <span className="instructions-title">Take image before starting the test</span>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                width="320"
                height="260"
                style={{ borderRadius: '10px', border: '2px solid #ccc' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <button
                className="start-btn"
                disabled={!imageSrc || webcamError || loading || hasFilename}
                onClick={handleCapture}
              >
                {loading ? 'Capturing...' : 'Capture Image'}
              </button>
            </div>

            {loading && (
              <p style={{ textAlign: 'center', color: '#888', marginTop: '10px' }}>
                Please wait, processing image...
              </p>
            )}
            {webcamError && (
              <p style={{ display: 'flex', justifyContent: 'center', color: 'red', marginTop: '8px' }}>
                Please check camera permissions or hardware issues and refresh the page to continue the test.
              </p>
            )}
          </div>
          <div align="right">

            {(webcamError || !webcamAllowed || !hasFilename  || !isImageUploaded ) ? (
              <button className="start-btn" disabled>
                Start
              </button>
            ) : (
              <button className="start-btn" onClick={startTest}>
                Start
              </button>
            )}


          </div>
        </div>
      )}



      {currentPage === 'test' && (
        <div className={`test-page ${showGoBackButton ? 'blur-background' : ''}`}>
          <div style={{
            opacity: 0,
            position: 'absolute',
            left: '-9999px'
          }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              width="320"
              height="260"
            />
          </div>
          <div className="header">
            <h3>
              <span className="text-name1">{testName}</span>
              <h4 className='test-sub'>
                Question {currentQuestionIndex + 1} / {questions.numberOfQuestions}
              </h4>
            </h3>
            <div className="right-content">
              <div className="timer">
                <svg className='timer-svg' style={{ marginBottom: '3px' }} xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
                  <g clip-path="url(#clip0_2734_1347)">
                    <path d="M9 17.375C13.1421 17.375 16.5 14.0171 16.5 9.875C16.5 5.73286 13.1421 2.375 9 2.375C4.85786 2.375 1.5 5.73286 1.5 9.875C1.5 14.0171 4.85786 17.375 9 17.375Z" stroke="#F46F16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M9 5.375V9.875L12 11.375" stroke="#F46F16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_2734_1347">
                      <rect width="18" height="18" fill="white" transform="translate(0 0.875)" />
                    </clipPath>
                  </defs>
                </svg>&nbsp;&nbsp;
                <span>
                  {/* {new Date(timer * 1000).toISOString().substr(14, 5)} */}
                  {formatTime(remainingTime)}
                </span>

              </div>
            </div>
          </div>
          <div className="separator"></div>
          <div className="question no-select">
            <ul>
              <li>
                <p className="question1 no-select">
                  {currentQuestionIndex + 1}.&nbsp;
                  <span
                    dangerouslySetInnerHTML={{
                      __html: shuffledQuestions[currentQuestionIndex]?.question
                        .replace(/\n/g, '<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;') // Replace newlines with <br/>
                        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;') // Replace tabs with four non-breaking spaces
                        .replace(/```/g, '') // Remove any Markdown code block delimiters
                    }}
                  />
                </p>
              </li>
              {shuffledQuestions[currentQuestionIndex]?.options.map((option, index) => (
                <li key={index}>

                  <label className="question-label no-select">
                    <input
                      type="radio"
                      value={option}
                      checked={selectedOptions[currentQuestionIndex] === option}
                      onChange={handleOptionChange}
                      className="question-radio"
                    />
                    <span
                      className="no-select"
                      dangerouslySetInnerHTML={{
                        __html: option.replace(/\n/g, '<br/>').replace(/```/g, ''),
                      }}
                    />
                  </label>

                </li>
              ))}
              {validationMessage && <p className="validation">{validationMessage}</p>}
            </ul>
          </div>

          <br /><br /><br /><br /><br /><br /><br /><br />
          <div className="footer1">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={handleBackQuestion}
              className="second-btn"
            >
              Back
            </button>
            {currentQuestionIndex < questions.questions.length - 1 ? (
              <button onClick={handleNextQuestion} className="navigation-btn">
                Next
              </button>
            ) : (
              <button onClick={handleSubmitTest} className="navigation-btn">
                Submit
              </button>
            )}
          </div>
        </div>
      )}

{showCustomAlert && (
  <div className="go-back-button-overlay">
    <p><strong>{customAlertMessage}</strong></p>
    <br />
    <button
      className="exit-popup-btn exit-popup-confirm-btn"
      onClick={() => {
        setShowCustomAlert(false);
        if (shouldExitFullScreen && document.fullscreenElement) {
          document.exitFullscreen().catch((err) =>
            console.error('Error exiting fullscreen:', err)
          );
          setShouldExitFullScreen(false);
          
        }
      }}
    >
      OK
    </button>
  </div>
)}


      {currentPage === 'passAcknowledgment' && (
        <TestPassAcknowledgment onClose={handleClosePopup} score={score} testName={testName} handleTakeTest={handleTakeTest} setTestStarted={setTestStarted} />

      )}
      {currentPage === 'failAcknowledgment' && (

        <TestFailAcknowledgment onClose={handleClosePopup} setTestStarted={setTestStarted} setShowGoBackButton={setShowGoBackButton} />
      )}


      {currentPage === 'timesup' && (
        <TestTimeUp onViewResults={handleViewResults} onCancel={handleViewResults} />
      )}

      {!isTestCompleted && showGoBackButton && alertCount < 5  && (
        <div className="go-back-button-overlay">

          <p><strong>You won’t be able to continue the test and you’ll be ineligible to take this until 7 days. To avoid,</strong></p>
          <br></br>
          <button className="exit-popup-btn exit-popup-confirm-btn" onClick={handleGoBackToTest}>
            Go Back to Test
          </button>
        </div>
      )}



      {currentPage === 'interrupted' && (
        <div className="go-back-button-overlay">
          <p>Your test has been interrupted. Kindly try again later.</p>
          <br />
        </div>
      )}

      {currentPage === 'exitConfirmed' && (
        <div className="exit-confirmation">
          <p>You can retake the test in 7 days.</p>
        </div>
      )}

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

export default ApplicantTakeTest;