import React, { useState, useRef, useEffect } from "react";
import "./ApplicantDailyTest.css";
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';
import { Link } from "react-router-dom";


function ApplicantDailyTest() {

    const { user } = useUserContext();
    const [count, setCount] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [warning, setWarning] = useState("");
    const [showResult, setShowResult] = useState(false);
    const [skillBadges, setSkillBadges] = useState({ skillsRequired: [] });
    const [randomQuestions, setRandomQuestions] = useState([]);
    const [testStarted, setTestStarted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const today = new Date().toISOString().split("T")[0];


    const linkStyle = {
        backgroundColor: isHovered ? '#ea670c' : '#F97316',
        display: 'inline-block',
    };

    const spanStyle = {
        color: 'white',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: '15px',
        fontWeight: '600',

    };

    useEffect(() => {
        const fetchSkillBadges = async () => {
            try {
                const jwtToken = localStorage.getItem("jwtToken");
                const skillBadgesResponse = await axios.get(`${apiUrl}/skill-badges/${user.id}/skill-badges`, {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                });

                const skillBadgeData = skillBadgesResponse.data;
                setSkillBadges(skillBadgeData);
            }
            catch (error) {
                console.error("Failed to fetch skill badges:", error);
            }


        };
        fetchSkillBadges();

    }, [user.id]);

    useEffect(() => {
        async function fetchQuestions() {

            if (!skillBadges.skillsRequired || skillBadges.skillsRequired.length === 0) {
                console.log("Waiting for skill badges...");
                return;
            }

           
            const savedData = JSON.parse(localStorage.getItem("dailyTestData"));

            if (savedData && savedData.date === today) {
                setRandomQuestions(savedData.questions);
                return;
            }

            try {
                const jwtToken = localStorage.getItem("jwtToken");
                const skills = skillBadges.skillsRequired.map(skill => skill.skillName);
                console.log("skills required:", skills);
                const res = await fetch("http://localhost:8080/DailyTest/getSkillBasedQuestions", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(skills),
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }

                const data = await res.json();

                setRandomQuestions(data);

                localStorage.setItem("dailyTestData", JSON.stringify({
                    date: today,
                    questions: data
                }));
            } catch (error) {
                console.error("Failed to fetch questions:", error);
            }
        }

        fetchQuestions();
    }, [skillBadges.skillsRequired]);




    const optionRefs = useRef([]);



    function incrementCount() {
        if (selectedOption === null) {
            setWarning("Please select an option");

            setTimeout(() => {
                setWarning("");
            }, 3000);
            return;
        }

        if (count < randomQuestions.length - 1) {
            optionRefs.current.forEach(ref => {
                if (ref) {
                    ref.classList.remove("correct");
                    ref.classList.remove("wrong");
                }
            });

            setCount(nextCount => nextCount + 1);
            setSelectedOption(null);
            setWarning("");
            optionRefs.current = [];
        }
        else {
            setShowResult(true);
        }
    }

    function generateSpaces(count) {
        return '\u00A0'.repeat(count); 
      }
    const checkAns = (e, selectedIndex) => {
        if (selectedOption !== null) return;

        setSelectedOption(selectedIndex);
        const correctAnswer = randomQuestions[count].answer;
        const selectedAnswer = randomQuestions[count].options[selectedIndex];

        if (selectedAnswer === correctAnswer) {
            e.target.classList.add("correct");
            setScore(prevScore => prevScore + 1);
        }
        else {
            e.target.classList.add("wrong");
            const correctIndex = randomQuestions[count].options.findIndex(
                (option) => option === correctAnswer
            );
            optionRefs.current[correctIndex]?.classList.add("correct");
        }

    }

    return (
        <div className="dashboard__content">
            <div className="row mr-0 ml-10">
                <div className="col-lg-12 col-md-12">
                    <section className="page-title-dashboard">
                        <div className="themes-container">
                            <div className="title-dashboard">
                                <div className="title-dash flex2">Daily Test</div>
                            </div>
                        </div>
                    </section>
                    {!testStarted ? (

                        <div className="col-12 col-xxl-9 col-xl-12 col-lg-12 col-md-12 col-sm-12 display-flex certificatebox">
                            <div className="card " style={{ cursor: "pointer" }}>
                                <div className="resumecard" >
                                    <div className="resumecard-content">
                                        <div className="resumecard-text">
                                            <div className="resumecard-heading">
                                                <h2 className="heading1">Take your test for the day {today}</h2>
                                                <div className="title-count">
                                                    Click start test button to start your daily test<span>{generateSpaces(250)}</span>
                                                    </div>
                                            </div>
                                            <div className="resumecard-button">
                                                <Link
                                                   
                                                    className={`button-link1`}
                                                    style={linkStyle}

                                                >
                                                    <span className="button button-custom" onClick={() => setTestStarted(true)} style={spanStyle}>Start Test</span>
                                                </Link>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        randomQuestions.length > 0 ? (
                            !showResult ? (
                                <div className="questions">
                                    <h4>Question {count + 1}</h4>
                                    <h3>{randomQuestions[count]?.question}</h3>

                                    <div className="choices">
                                        <ul>
                                            {randomQuestions[count].options.map((option, index) => (
                                                <li ref={(el) => (optionRefs.current[index] = el)} key={index} onClick={(e) => checkAns(e, index)}>
                                                    {option}
                                                </li>
                                            ))}
                                        </ul>
                                        {warning && <p className="warning">{warning}</p>}
                                    </div>
                                    <div className="next">
                                        <button onClick={incrementCount}>Next</button>
                                    </div>


                                </div>
                            ) : (
                                <div className="result">
                                    <h2>Test Completed!</h2>
                                    <p>Your Score: <strong>{score}</strong> out of {randomQuestions.length}</p>
                                    <button onClick={() => window.location.reload()}>Retake Test</button>
                                </div>

                            )
                        ) : (
                            <p>Loading questions...</p>
                        )
                    )}
                </div>
            </div>
        </div>

    )
}

export default ApplicantDailyTest;