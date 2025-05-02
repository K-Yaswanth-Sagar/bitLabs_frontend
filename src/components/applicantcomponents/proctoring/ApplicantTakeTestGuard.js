import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ApplicantTakeTestGuard() {
  const location = useLocation();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'hidden' &&
        location.pathname === '/applicant-take-test'
      ) {
        alert('Tab switching is not allowed during the test!');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname]);

  return null; 
}

export default ApplicantTakeTestGuard;
