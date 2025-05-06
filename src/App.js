
import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import IndexPage from './pages/indexpage/IndexPage';
import AboutPage from './pages/aboutpage/AboutPage';
import ContactPage from './pages/contactpage/ContactPage';
import LoginPage from './pages/loginpage/LoginPage';
import FindJobPage from './pages/loginpage/FindJobPage';
import FindCandidatesPage from './pages/registerpage/FindCandidatesPage';
import RegisterPage from './pages/registerpage/RegisterPage';
import ApplicantHomePage from './pages/applicantpages/ApplicantHomePage';
import UserProvider from './components/common/UserProvider';
import Logout from './components/common/Logout';
import RecruiterLoginPage from './pages/recruiterpages/RecruiterLoginPage';
import RecruiterHomePage from './pages/recruiterpages/RecruiterHomePage';
import ApplicantForgotPasswordPage from './pages/loginpage/ApplicantForgotPasswordPage';
import RecruiterForgotPasswordPage from './pages/recruiterpages/RecruiterForgotPasswordPage';
import PrivacyPolicy from './components/common/PrivacyPolicy';
import CookiePolicy from './components/common/CookiePolicy';
import TermsOfServices from './components/common/TermsOfServices';
import ApplicantBasicDetails from './components/applicantcomponents/ApplicantBasicDetails';
import JobWidget from './components/jobWidget';
import ApplicantTakeTestGuard from './components/applicantcomponents/proctoring/ApplicantTakeTestGuard'
import CodeEditor from './components/applicantcomponents/CodeEditor';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const handleLogin = () => {
    setIsLoggedIn(true);
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    window.location.href = '/';
  };
  useEffect(() => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      delete axios.defaults.headers.common['Authorization'];
      setIsLoggedIn(true);
    }
    setCheckingAuth(false);
  }, []);


  return (
    <div>
      <UserProvider>
        {checkingAuth ? (
          <p>Loading...</p>
        ) : (
          <Router>
            <ApplicantTakeTestGuard />
            <Routes>
              <Route path="/" element={<IndexPage />} />
              <Route path="/find-jobs" element={<IndexPage />} />
              <Route path="/find-jobs-login" element={<FindJobPage onLogin={handleLogin} />} />
              <Route path="/find-candidates-login" element={<FindCandidatesPage onLogin={handleLogin} />} />
              <Route path="/find-candidates" element={<IndexPage />} />
              <Route path="/aboutus" element={<AboutPage />} />
              <Route path="/contactus" element={<ContactPage />} />
              <Route path="/candidate" element={<LoginPage onLogin={handleLogin} />} />
              <Route path="/applicant-forgot-password" element={<ApplicantForgotPasswordPage />} />
              <Route path="/recruiter-forgot-password" element={<RecruiterForgotPasswordPage />} />
              <Route path="/recruiterlogin" element={<RecruiterLoginPage onLogin={handleLogin} />} />
              <Route path="/recruiter" element={<RegisterPage onLogin={handleLogin} />}  />
              <Route path="/privacypolicy" element={<PrivacyPolicy />} />
              <Route path="/cookiepolicy" element={<CookiePolicy />} />
              <Route path="/termsofservices" element={<TermsOfServices />} />
              
  <Route path="/widget" element={<JobWidget />} />
              {isLoggedIn ? (
                <>
                <Route path="/applicanthome" element={<ApplicantHomePage />} />
                <Route path="/applicant-update-profile" element={<ApplicantHomePage />} />
                <Route path="/applicant-view-profile" element={<ApplicantHomePage />} />
                <Route path="/applicant-find-jobs" element={<ApplicantHomePage />} />
                <Route path="/applicant-overview" element={<ApplicantHomePage />} />
                <Route path="/applicant-view-job" element={<ApplicantHomePage />} />
                <Route path="/applicant-edit-profile" element={<ApplicantHomePage />} />
                <Route path="/applicant-applied-jobs" element={<ApplicantHomePage />} />
                <Route path="/applicant-saved-jobs" element={<ApplicantHomePage />} />
                <Route path="/applicant-interview-status" element={<ApplicantHomePage />} />
                <Route path="/applicant-change-password" element={<ApplicantHomePage />} />
                <Route path="/applicant-delete-profile" element={<ApplicantHomePage />} />
                <Route path="/applicant-job-alerts" element={<ApplicantHomePage />} />
                <Route path="/applicant-take-test" element={<ApplicantHomePage />} />
                <Route path="/applicant-resume" element={<ApplicantHomePage />} />
                <Route path="/applicant-daily-test" element={<ApplicantHomePage />} />
                {/* <Route path="/verified-badges" component={VerifiedBadges} /> */}
                <Route path="/applicant-verified-badges" element={<ApplicantHomePage />} />
                <Route path="/applicant-resume-builder" element={<ApplicantHomePage />} />
                <Route path="/applicant-basic-details-form/:number" element={<ApplicantBasicDetails />} />
                <Route path="/recruiterhome" element={<RecruiterHomePage />} />
                <Route path="/recruiter-my-organization" element={<RecruiterHomePage />} />
                <Route path="/recruiter-postjob" element={<RecruiterHomePage />} />
                <Route path="/recruiter-postjob2" element={<RecruiterHomePage />} />
                <Route path="/recruiter-jobopenings" element={<RecruiterHomePage />} />
                <Route path="/recruiter-allapplicants" element={<RecruiterHomePage />} />
                <Route path="/recruiter-appliedapplicants" element={<RecruiterHomePage />} />
                <Route path="/recruiter-applicantinterviews" element={<RecruiterHomePage />} />
                <Route path="/recruiter-change-password" element={<RecruiterHomePage />} />
                <Route path="/recruiter-team-member" element={<RecruiterHomePage />} />
                <Route path= "/recruiter-edit-job/:id" element={<RecruiterHomePage />} />
                <Route path="/job-applicant-alerts" element={<RecruiterHomePage />} />
                <Route path="/viewapplicant/:id" element={<RecruiterHomePage />} />
                <Route path="/appliedapplicantsbasedonjob/:id" element={<RecruiterHomePage />} />
                <Route path="/view-resume/:id" element={<RecruiterHomePage />} />
                <Route path="/recruiter-view-job" element={<RecruiterHomePage />} />
                <Route path="/recruiter-repost-job/:id" element={<RecruiterHomePage />} />
                <Route path="/recruiter-view-organization" element={<RecruiterHomePage />} />
                <Route path="/recruiter-edit-organization" element={<RecruiterHomePage />} />
                <Route path="/solve-questions" element={<CodeEditor />} />
              
                </>
              ) : (
                <Route path="/login" element={<Navigate to="/login" />} />
              )}
              <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
            </Routes>
          </Router>
        )}
      </UserProvider>
    </div>
  );
}
export default App;
