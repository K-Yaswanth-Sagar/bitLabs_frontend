import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useLocation, useNavigate } from 'react-router-dom';
import 'react-calendar-timeline/lib/Timeline.css';
import BackButton from '../common/BackButton';

const ApplicantInterviewStatus = ({ selectedJobId, setSelectedJobId }) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [jobStatus, setJobStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUserContext();
  const applicantId = user.id;
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = new URLSearchParams(location.search).get('jobId');
  const applyJobId = new URLSearchParams(location.search).get('applyJobId'); 
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const authToken = localStorage.getItem('jwtToken');
        const response = await axios.get(
          `${apiUrl}/viewjob/applicant/viewjob/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const { body } = response.data;
        setLoading(false);
        if (body) {
          setJobDetails(body);
          localStorage.setItem(`jobDetails_${jobId}`, JSON.stringify(body));
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const fetchJobStatus = async () => {
    try {
      const authToken = localStorage.getItem('jwtToken');
      const response = await axios.get(
        `${apiUrl}/applyjob/recruiters/applyjob-status-history/${applyJobId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const body = response.data;
      setLoading(false);
      if (Array.isArray(body) && body.length > 0) {
        setJobStatus(body);
        localStorage.setItem(`jobStatus_${jobId}`, JSON.stringify(body));
      }
    } catch (error) {
      console.error('Error fetching job status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobStatus();
    }
  }, [jobId]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (jobId) {
        fetchJobStatus();
      }
    }, 5000); // Polling interval set to 5 seconds

    return () => clearInterval(intervalId);
  }, [jobId]);

  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', options);
    return formattedDate;
  }

  const handleApplyNowClick = () => {
    if (jobDetails && jobDetails.id) {
      const apiEndpoint = `${apiUrl}/viewjob/applicant/viewjob/${jobId}/${user.id}`;
      console.log('API Endpoint:', apiEndpoint);

      axios.get(apiEndpoint)
        .then(response => {
          console.log('API Response:', response);
          const { body } = response.data;
          setLoading(false);
          if (body) {
            setJobDetails(body);
          }
        })
        .catch(error => {
          console.error('API Error:', error);
        });
    } else {
      console.error('No job details or jobId available');
    }
  };

  const convertToLakhs = (amountInRupees) => {
    return (amountInRupees * 1).toFixed(2);
  };

  const handleViewJobDetails = () => {
    setSelectedJobId(jobId);
    navigate(`/applicant-view-job`, { state: { from: location.pathname } });
  };

  return (
    <div>
      {loading ? null : (
        <div className="dashboard__content">
          <section className="page-title-dashboard">
            <div className="themes-container">
              <div className="row">
                <div className="col-lg-12 col-md-12">
                  <div className="title-dashboard">
                    <div className="title-dash flex2">
                      <BackButton />
                      Job Status
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="flat-dashboard-setting flat-dashboard-setting2">
            <div className="themes-container">
              <div className="content-tab">
                <div className="inner">
                  <article className="job-article">
                    {jobDetails && (
                      <div className="top-content">
                        <div className="features-job style-2 stc-apply bg-white" onClick={handleViewJobDetails}>
                          <div className="job-archive-header">
                            <div className="inner-box">
                              <div className="box-content">
                                <h4>
                                  <a href="javascript:void(0);">{jobDetails.companyname}</a>
                                </h4>
                                <h3>
                                  <a href="javascript:void(0);">{jobDetails.jobTitle}</a>
                                </h3>
                                <ul>
                                  <li>
                                    <span className="icon-map-pin"></span>
                                    {jobDetails.location}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="job-archive-footer">
                            <div className="job-footer-left">
                              <ul className="job-tag">
                                <li>
                                  <a href="javascript:void(0);">{jobDetails.employeeType}</a>
                                </li>
                                <li>
                                  <a href="javascript:void(0);">{jobDetails.remote ? 'Remote' : 'Office-based'}</a>
                                </li>
                                <li>
                                  <a href="javascript:void(0);"> Exp {jobDetails.minimumExperience} - {jobDetails.maximumExperience} years</a>
                                </li>
                                <li>
                                  <a href="javascript:void(0);">&#x20B9; {convertToLakhs(jobDetails.minSalary)} - &#x20B9; {convertToLakhs(jobDetails.maxSalary)} LPA</a>
                                </li>
                              </ul>
                              <div className="star">
                                {Array.from({ length: jobDetails.starRating }).map((_, index) => (
                                  <span key={index} className="icon-star-full"></span>
                                ))}
                              </div>
                            </div>
                            <div className="job-footer-right">
                              <div className="price">
                                <span>
                                  <span style={{ fontSize: '12px' }}>Posted on {formatDate(jobDetails.creationDate)}</span>
                                </span>
                              </div>
                              <ul className="job-tag">
                                <li>
                                  {jobDetails && (
                                    <button className="button-status">
                                      View Job Details
                                    </button>
                                  )}
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                   <h4>Status History</h4>
  {jobStatus && jobStatus.length > 0 && (
    <ul className="events">
      {jobStatus.slice().map((status, index) => (
        <li key={index}>
          {status && status.changeDate && status.status !== undefined && (
            <>
              <time>Date: {formatDate(status.changeDate)}</time>
              <span>
                <strong>Status: {status.status === 'New' ? 'Job Applied' : status.status}</strong>
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  )}
                  </article>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ApplicantInterviewStatus;
