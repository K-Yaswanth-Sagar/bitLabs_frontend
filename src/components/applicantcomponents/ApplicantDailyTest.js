import React, { useState, useRef, useEffect } from "react";
import "./ApplicantDailyTest.css";
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';
import { Link } from "react-router-dom";
import Chart from "react-apexcharts";

function ApplicantDailyTest() {
    const { user } = useUserContext();
    const today = new Date().toISOString().split("T")[0];

    const [testStarted, setTestStarted] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [count, setCount] = useState(0);
    const [score, setScore] = useState(0);
    const [warning, setWarning] = useState("");
    const [showResult, setShowResult] = useState(false);
    const [skillBadges, setSkillBadges] = useState({ skillsRequired: [] });
    const [randomQuestions, setRandomQuestions] = useState([]);
    const [testResults, setTestResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const [testDates, setTestDates] = useState([]);
    const optionRefs = useRef([]);

    // Style objects
    const linkStyle = {
        backgroundColor: '#F97316',
        display: 'inline-block',
    };

    const spanStyle = {
        color: 'white',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: '15px',
        fontWeight: '600',
    };

    // Fetch all test summaries
    useEffect(() => {
        const fetchTestSummaries = async () => {
            try {
                const jwtToken = localStorage.getItem("jwtToken");
                const res = await axios.get("http://localhost:8080/dailyTest/result/summary/1", {
                    headers: { Authorization: `Bearer ${jwtToken}` }
                });
                console.log("Test summaries:", res.data);
                setTestResults(res.data);
                const dates = res.data.map(result => result.testDate);
                if (!dates.includes(today)) dates.push(today);
                setTestDates(dates.sort().reverse()); 
            } catch (err) {
                console.error("Error fetching test summaries:", err);
            }
        };

        fetchTestSummaries();
    }, []);

    // Chart series for score trend
    const chartSeries = [{
        name: "Test Score",
        data: testResults.map(result => ({ x: result.testDate, y: result.score }))
    }];

    // Fetch skill badges
    useEffect(() => {
        const fetchSkillBadges = async () => {
            try {
                const jwtToken = localStorage.getItem("jwtToken");
                const response = await axios.get(`${apiUrl}/skill-badges/${user.id}/skill-badges`, {
                    headers: { Authorization: `Bearer ${jwtToken}` }
                });
                setSkillBadges(response.data);
            } catch (error) {
                console.error("Failed to fetch skill badges:", error);
            }
        };
        fetchSkillBadges();
    }, [user.id]);

    // Fetch today's questions or use cache
    useEffect(() => {
        const fetchTodayQuestions = async () => {
            const saved = JSON.parse(localStorage.getItem("dailyTestData"));
            if (saved && saved.date === today) {
                setRandomQuestions(saved.questions);
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
                const data = await res.json();
                setRandomQuestions(data);
                localStorage.setItem("dailyTestData", JSON.stringify({ date: today, questions: data }));
            } catch (err) {
                console.error("Failed to fetch today’s questions:", err);
            }
        };

        if (selectedDate === today && skillBadges.skillsRequired.length > 0) {
            fetchTodayQuestions();
        }
    }, [selectedDate, skillBadges.skillsRequired]);

    // Fetch past test details
    const fetchTestDetailsByDate = async (date) => {
        try {
            const jwtToken = localStorage.getItem("jwtToken");
            const res = await axios.get(`http://localhost:8080/dailyTest/result/testResult/1?date=${date}`, {
                headers: { Authorization: `Bearer ${jwtToken}` }
            });
            console.log(date);
            console.log("Test details for date:", date, ":", res.data);
            setRandomQuestions(res.data.testResult);
            setSelectedResult({ date, score: res.data.score });
            setShowResult(true);
        } catch (err) {
            console.error("Failed to fetch test details:", err);
        }
    };

    // Handle answering
    const checkAns = (e, selectedIndex) => {
        if (selectedOption !== null) return;

        setSelectedOption(selectedIndex);
        const current = randomQuestions[count];
        const correctAnswer = current.answer;
        const selectedAnswer = current.options[selectedIndex];

        if (selectedAnswer === correctAnswer) {
            e.target.classList.add("correct");
            setScore(prev => prev + 1);
        } else {
            e.target.classList.add("wrong");
            const correctIndex = current.options.findIndex(opt => opt === correctAnswer);
            optionRefs.current[correctIndex]?.classList.add("correct");
        }
    };

    // Handle next question
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
        } else {
            setShowResult(true);
        }
    };

    // Reset test view
    const resetTest = () => {
        setTestStarted(false);
        setShowResult(false);
        setCount(0);
        setScore(0);
        setSelectedOption(null);
        setSelectedDate(null);
        setSelectedResult(null);
    };

    return (
        <div className="dashboard__content">
            <div className="row mr-0 ml-10">
                <div className="col-lg-12">
                    <section className="page-title-dashboard">
                        <div className="themes-container">
                            <div className="title-dashboard">
                                <div className="title-dash flex2">Daily Test</div>
                            </div>
                        </div>
                    </section>

                    {!testStarted && (
                        <div className="col-12 card lineChart">
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
                    )}

                    {!testStarted ? (
                        testDates.map((date, idx) => (
                            <div key={idx} className="col-12 card dailytestResult">
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
                                                fetchTestDetailsByDate(date);
                                                setTestStarted(true);
                                            }
                                        }}
                                    >
                                        {date === today ? "Start Test" : "View Results"}
                                    </span>
                                </Link>
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
                                                {randomQuestions.map((q, idx) => (
                                                    <li key={idx}>
                                                        <h4>{`Q${idx + 1}: ${q.question}`}</h4>
                                                        {q.options.map((option, optIdx) => (
                                                            <label key={optIdx} style={{
                                                                display: 'block',
                                                                margin: '10px 0',
                                                                fontWeight: option === q.answer ? 'bold' : 'normal',
                                                                color: option === q.answer ? '#f97316' : 'black'
                                                            }}>
                                                                <input type="radio" disabled checked={option === q.answer} />
                                                                {option}
                                                            </label>
                                                        ))}
                                                    </li>
                                                ))}
                                            </ul>
                                            <button>Your Score: {selectedResult?.score}</button>
                                            <button onClick={resetTest}>Back to Tests</button>
                                        </>
                                    ) : (
                                        <>
                                            <h2>Test Completed!</h2>
                                            <p>Your Score: <strong>{score}</strong> / {randomQuestions.length}</p>
                                            <button onClick={resetTest}>Back to Tests</button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="questions">
                                    <h4>Question {count + 1}</h4>
                                    <h3>{randomQuestions[count]?.question}</h3>
                                    <ul className="choices">
                                        {randomQuestions[count].options.map((option, index) => (
                                            <li
                                                key={index}
                                                ref={el => optionRefs.current[index] = el}
                                                onClick={(e) => checkAns(e, index)}
                                            >
                                                {option}
                                            </li>
                                        ))}
                                    </ul>
                                    {warning && <p className="warning">{warning}</p>}
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
    );
}

export default ApplicantDailyTest;
