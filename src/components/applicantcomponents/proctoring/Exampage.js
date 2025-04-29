import React, { useEffect, useRef, useState } from 'react';
import FaceRecognition from './FaceRecognition';
import './Exampage.css';
import { apiUrl } from '../../../services/ApplicantAPIService';
import { useUserContext } from '../../common/UserProvider';
import { loadModels } from './faceUtils';

function Exampage() {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detections, setDetections] = useState([]);
  const { user } = useUserContext();
  const userId = user.id;

  useEffect(() => {
    const initModels = async () => {
      await loadModels(process.env.PUBLIC_URL + '/models');
      setModelsLoaded(true);
    };

    initModels();
  }, []);

  return (
    <div className="App">
      {modelsLoaded ? (
        <FaceRecognition
          videoRef={videoRef}
          setDetections={setDetections}
          detections={detections}
          apiUrl={apiUrl}
          userId={userId}
        />
      ) : (
        <p>Loading models...</p>
      )}
    </div>
  );
}

export default Exampage;
