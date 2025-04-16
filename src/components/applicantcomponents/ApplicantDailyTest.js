import React, { useState, useRef, useEffect } from "react";
import "./ApplicantDailyTest.css";
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';
import { Link } from "react-router-dom";
import Chart from "react-apexcharts";

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
    const [selectedDate, setSelectedDate] = useState(null);

    const today = new Date().toISOString().split("T")[0];
    const testDates = ["2025-04-16", "2022-06-22", "2022-06-29", "2022-07-06", "2022-07-13", "2022-07-20"];

    const [testResults] = useState([
        { date: "2022-06-15", score: 7 },
        { date: "2022-06-16", score: 9 },
        { date: "2022-06-17", score: 4 },
        { date: "2022-07-01", score: 0 },
        { date: "2022-07-02", score: 10 },
        { date: "2022-07-03", score: 1 },
        { date: "2022-07-04", score: 8 },
        { date: "2022-07-05", score: 2 },
        { date: "2022-07-06", score: 2 },
        { date: "2022-07-07", score: 10 },
        { date: "2022-07-08", score: 8 },
        { date: "2022-08-09", score: 7 },
        { date: "2022-08-10", score: 9 },
        { date: "2022-08-11", score: 4 }
    ]);

    const chartSeries = [{
        name: "Test Score",
        data: testResults.map(result => ({
            x: result.date,
            y: result.score
        }))
    }];

    const dailyQuestions = {
        "2022-06-22": [
            {
                question: "Which keyword is used to inherit a class in Java?",
                options: ["extends", "implements", "super", "this"],
                answer: "extends"
            },
            {
                question: "Which method is the entry point for a Java program?",
                options: ["main()", "start()", "run()", "init()"],
                answer: "main()"
            },
            {
                question: "Which of the following is not a Java feature?",
                options: ["Object-oriented", "Use of pointers", "Platform Independent", "Secure"],
                answer: "Use of pointers"
            }
        ],
        "2022-06-29": [
            {
                question: "What does JDK stand for?",
                options: ["Java Development Kit", "Java Design Kit", "Java Debug Kit", "Just Develop Kit"],
                answer: "Java Development Kit"
            },
            {
                question: "Which operator is used for comparison?",
                options: ["=", "==", "!=", "<>"],
                answer: "=="
            },
            {
                question: "What is the size of int in Java?",
                options: ["2 bytes", "4 bytes", "8 bytes", "Depends on OS"],
                answer: "4 bytes"
            }
        ]
    };

    const optionRefs = useRef([]);

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
                setSkillBadges(skillBadgesResponse.data);
            } catch (error) {
                console.error("Failed to fetch skill badges:", error);
            }
        };
        fetchSkillBadges();
    }, [user.id]);

    useEffect(() => {
        async function fetchQuestions() {
            if (!skillBadges.skillsRequired || skillBadges.skillsRequired.length === 0) return;

            const savedData = JSON.parse(localStorage.getItem("dailyTestData"));
            if (savedData && savedData.date === today) {
                setRandomQuestions(savedData.questions);
                return;
            }

            try {
                const jwtToken = localStorage.getItem("jwtToken");
                const skills = skillBadges.skillsRequired.map(skill => skill.skillName);
                const res = await fetch("http://localhost:8080/DailyTest/getSkillBasedQuestions", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(skills),
                });

                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                const data = await res.json();
                setRandomQuestions(data);
                localStorage.setItem("dailyTestData", JSON.stringify({ date: today, questions: data }));
            } catch (error) {
                console.error("Failed to fetch questions:", error);
            }
        }

        if (selectedDate === today) {
            fetchQuestions();
        }
    }, [skillBadges.skillsRequired, selectedDate]);

    useEffect(() => {
        if (selectedDate && selectedDate !== today && dailyQuestions[selectedDate]) {
            setRandomQuestions(dailyQuestions[selectedDate]);
            setShowResult(true);
        }
    }, [selectedDate]);

    const incrementCount = () => {
        if (selectedOption === null) {
            setWarning("Please select an option");
            setTimeout(() => setWarning(""), 3000);
            return;
        }

        if (count < randomQuestions.length - 1) {
            optionRefs.current.forEach(ref => ref?.classList.remove("correct", "wrong"));
            setCount(prev => prev + 1);
            setSelectedOption(null);
            setWarning("");
            optionRefs.current = [];
        } else {
            setShowResult(true);
        }
    };

    const checkAns = (e, selectedIndex) => {
        if (selectedOption !== null) return;

        setSelectedOption(selectedIndex);
        const correctAnswer = randomQuestions[count].answer;
        const selectedAnswer = randomQuestions[count].options[selectedIndex];

        if (selectedAnswer === correctAnswer) {
            e.target.classList.add("correct");
            setScore(prev => prev + 1);
        } else {
            e.target.classList.add("wrong");
            const correctIndex = randomQuestions[count].options.findIndex(opt => opt === correctAnswer);
            optionRefs.current[correctIndex]?.classList.add("correct");
        }
    };

    return (
        <div>
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

                        {!testStarted && (
                            <div className="col-12 col-xxl-9 col-xl-12 col-lg-12 col-md-12 col-sm-12 display-flex certificatebox">
                                <div className="card lineChart">
                                    <Chart
                                        type='line'
                                        height="100%"
                                        series={chartSeries}
                                        options={{
                                            chart: { id: "performance-graph", toolbar: { show: false }, zoom: { enabled: false } },
                                            xaxis: { title: { text: "Test Day" } },
                                            yaxis: { max: 10 },
                                            title: { text: "Your Performance Over Time", align: "center" },
                                            colors: ["#f97316"]
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {!testStarted ? (
                            testDates.map((date, index) => (
                                <div key={index} className="col-12 col-xxl-9 col-xl-12 col-lg-12 col-md-12 col-sm-12 display-flex certificatebox">
                                    <div className="card dailytestResult">
                                        <h2 className="heading1">Test date: <span>{date}</span></h2>
                                        <Link className="button-link1" style={linkStyle}>
                                            <span
                                                className="button button-custom"
                                                style={spanStyle}
                                                onClick={() => {
                                                    setSelectedDate(date);
                                                    if (date === today) {
                                                        setTestStarted(true);
                                                    } else {
                                                        setTestStarted(true);
                                                    }
                                                }}
                                            >
                                                {date === today ? "Start Test" : "View Results"}
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            randomQuestions.length > 0 ? (
                                showResult ? (
                                    <div className="viewResult">
                                        {selectedDate !== today ? (
    <>
        <h2>Test Results on {selectedDate}</h2>
        <ul>
            {randomQuestions.map((question, idx) => (
                <li key={idx} style={{ marginBottom: '20px' }}>
                    <h4>{`Q${idx + 1}: ${question.question}`}</h4>
                    <form>
                        {question.options.map((option, optIdx) => {
                            const isCorrect = option === question.answer;
                            return (
                                <label
                                    key={optIdx}
                                    style={{
                                        display: 'block',
                                        margin: '10px 0',
                                        fontWeight: isCorrect ? 'bold' : 'normal',
                                        color: isCorrect ? '#f97316' : 'black',
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${idx}`}
                                        value={option}
                                        disabled
                                        checked={option === question.answer}
                                    />
                                    {option}
                                </label>
                            );
                        })}
                    </form>
                </li>
            ))}
        </ul>
        <button onClick={() => {
            setTestStarted(false);
            setShowResult(false);
            setCount(0);
            setScore(0);
            setSelectedOption(null);
            setSelectedDate(null);
        }}>Back to Tests</button>
    </>
) : 
(
                                            <>
                                                <h2>Test Completed!</h2>
                                                <p>Your Score: <strong>{score}</strong> out of {randomQuestions.length}</p>
                                                <button onClick={() => {
                                                    setTestStarted(false);
                                                    setShowResult(false);
                                                    setCount(0);
                                                    setScore(0);
                                                    setSelectedOption(null);
                                                    setSelectedDate(null);
                                                }}>Back to Tests</button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="questions">
                                        <h4>Question {count + 1}</h4>
                                        <h3>{randomQuestions[count]?.question}</h3>
                                        <div className="choices">
                                            <ul>
                                                {randomQuestions[count].options.map((option, index) => (
                                                    <li
                                                        ref={(el) => (optionRefs.current[index] = el)}
                                                        key={index}
                                                        onClick={(e) => checkAns(e, index)}
                                                    >
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
                                )
                            ) : (
                                <p>Loading questions...</p>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApplicantDailyTest;
