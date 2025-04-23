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
    const [chartShow, setChartShow] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const [testDates, setTestDates] = useState([]);
    const optionRefs = useRef([]);
    const [testAttempted, setTestAttempted] = useState(false);
    const [loadingTestDetails, setLoadingTestDetails] = useState(false);


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

    useEffect(() => {
        const attemptedToday = testResults.some(result => result.testDate === today);
        setTestAttempted(attemptedToday);
    }, [testResults]);

    // Fetch all test summaries
    useEffect(() => {
        const fetchTestSummaries = async () => {
            try {
                const jwtToken = localStorage.getItem("jwtToken");
                const res = await axios.get("http://localhost:8080/dailyTest/result/summary/1", {
                    headers: { Authorization: `Bearer ${jwtToken}` }
                });
    
                console.log("Test summaries:", res.data);
                const sortedResults = [...res.data].sort((a, b) => new Date(a.testDate) - new Date(b.testDate));
                
                setChartShow(sortedResults);
                setTestResults(res.data);
    
                // Store in localStorage
                localStorage.setItem("testSummaries", JSON.stringify(res.data));
    
                // Manage test dates
                const dates = res.data.map(result => result.testDate);
                if (!dates.includes(today)) dates.push(today);
                setTestDates(dates.sort().reverse());
    
            } catch (err) {
                console.error("Error fetching test summaries:", err);
            }
        };
    
        // Check if we already have it in localStorage
        const cachedSummaries = localStorage.getItem("testSummaries");
        if (cachedSummaries) {
            const parsedData = JSON.parse(cachedSummaries);
            const sortedResults = [...parsedData].sort((a, b) => new Date(a.testDate) - new Date(b.testDate));
            
            setChartShow(sortedResults);
            setTestResults(parsedData);
    
            const dates = parsedData.map(result => result.testDate);
            if (!dates.includes(today)) dates.push(today);
            setTestDates(dates.sort().reverse());
        } else {
            fetchTestSummaries();
        }
    }, []);
    


    

    // Chart series for score trend
    const chartSeries = [{
        name: "Test Score",
        data: chartShow.map(result => ({ x: result.testDate, y: result.score }))
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
                console.log("Fetched from API:", data);
    
                // Save to localStorage
                localStorage.setItem(`dailyQuestions-${today}`, JSON.stringify(data));
            } catch (err) {
                console.error("Failed to fetch today’s questions:", err);
            }
        };
    
        if (selectedDate === today && skillBadges.skillsRequired.length > 0) {
            // Check localStorage first
            const cached = localStorage.getItem(`dailyQuestions-${today}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                setRandomQuestions(parsed);
                console.log("Loaded from localStorage:", parsed);
            } else {
                fetchTodayQuestions();
            }
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
            console.log("Raw response data:", res.data)

            // Optional: inspect structure in detail
            if (Array.isArray(res.data)) {
                res.data.forEach((q, idx) => {
                    console.log(`Question ${idx + 1}:`);
                    console.log("  Question:", q.question);
                    console.log("  Options:", q.options);
                    console.log("  CorrectAnswer:", q.correctAnswer);
                    console.log("  SelectedAnswer:", q.selectedAnswer);
                });
            } else {
                console.warn("Unexpected testResult structure:", res.data);
            }
            setRandomQuestions(res.data);
            const testScoreObj = testResults.find(result => result.testDate === date);
            setSelectedResult({ date, score: testScoreObj?.score ?? 0 });
            setShowResult(true);
        } catch (err) {
            console.error("Failed to fetch test details:", err);
        }
    };

    // Handle answering
    const checkAns = (e, selectedIndex) => {
        if (selectedOption !== null && selectedOption === selectedIndex) return;
    
        setSelectedOption(selectedIndex);
    
        const updatedQuestions = [...randomQuestions];
        const selected = updatedQuestions[count];
        console.log(selected);
        const selectedAnswer = selected.options[selectedIndex];
        console.log(selected.correctAnswer);

        updatedQuestions[count] = {
            ...selected,
            selectedAnswer: selectedAnswer,
        };
    
        setRandomQuestions(updatedQuestions);
    
        if (selectedAnswer === selected.correctAnswer) {
            
            setScore(prev => prev + 1);
            
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
            submitResult();
        }
    };

    const submitResult = async () => {
        try {
            const payload = {
                applicantId: 1,
                testDate: today,
                score: score,
                testResult: randomQuestions.map(q => ({
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    selectedAnswer: q.selectedAnswer || "",
                })),
            };
            const jwtToken = localStorage.getItem("jwtToken");
            const response = await axios.post(
                "http://localhost:8080/dailyTest/result/submit",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`
                    }
                }
            );
            
           

            const newResult = {
                testDate: today,
                score: score
            };

            const updatedResults = [...testResults, newResult];
            setTestResults(updatedResults);
            setChartShow(updatedResults.sort((a, b) => new Date(a.testDate) - new Date(b.testDate)));
            localStorage.setItem("testSummaries", JSON.stringify(updatedResults)); 
            
            setTestAttempted(true);

            // Update testDates if not already present
            setTestDates(prev => prev.includes(today) ? prev : [...prev, today]);

        } catch (error) {
            console.error("Error submitting result:", error);
            alert("There was an error submitting your test.");
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
                                            setLoadingTestDetails(true);
                                            setTestStarted(true);
                                            if (date === today && testAttempted) {
                                                fetchTestDetailsByDate(today).finally(() => setLoadingTestDetails(false));
                                            } else {
                                                fetchTestDetailsByDate(date).finally(() => setLoadingTestDetails(false));
                                            }
                                        }}
                                    >
                                        {date === today && !testAttempted ? "Start Test" : "View Results"}
                                    </span>
                                </Link>
                            </div>
                        ))
                    ) : (
                        !loadingTestDetails && randomQuestions.length > 0 ? (
                            showResult ? (
                                <div className="viewResult">
                                    
    <>
        <h2>Test Results on {selectedDate}</h2>
        <ul>
            {randomQuestions.map((q, idx) => (
                <li key={idx}>
                    <h4>{`Q${idx + 1}: ${q.question}`}</h4>
                    {q.options.map((option, optIdx) => {
                        const isCorrect = option === q.correctAnswer;
                        const isSelected = option === q.selectedAnswer;

                        let backgroundColor = 'white';
                        let color = 'black';

                        if (isCorrect && isSelected) {
                            backgroundColor = '#f97316';
                            color = 'white';
                        } else if (isCorrect) {
                            backgroundColor = '#f97316';
                            color = 'white';
                        } else if (isSelected) {
                            backgroundColor = '#e5e7eb';
                            color = 'black';
                        }

                        return (
                            <label
                                key={optIdx}
                                className="optionRadio"
                                style={{
                                    display: 'block',
                                    margin: '10px 0',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    backgroundColor,
                                    color,
                                    fontWeight: isCorrect ? 'bold' : 'normal',
                                }}
                            >
                                <input
                                     type="radio"
                                     name={`question-${count}`}
                                     value={option}
                                     onChange={(e) => checkAns(e, optIdx)}
                                     checked={selectedOption === optIdx}
                                     style={{ marginRight: '10px' }}
                                />
                                {option}
                            </label>
                        );
                    })}
                </li>
            ))}
        </ul>
        <button>Your Score: {selectedDate === today && !selectedResult ? score : selectedResult?.score}</button>
        <button onClick={resetTest}>Back to Tests</button>
    </>


                                </div>
                            ) : (
                                <div className="questions">
                                    <h4>Question {count + 1}</h4>
                                    <h3>{randomQuestions[count]?.question}</h3>

                                    <form className="choices" style={{ marginTop: '20px' }}>
                                        {randomQuestions[count]?.options.map((option, index) => (
                                            <label
                                                key={index}
                                                style={{
                                                    display: 'block',
                                                    marginBottom: '12px',
                                                    padding: '10px 15px',
                                                    cursor: 'pointer',
                                                    transition: '0.2s ease-in-out',
                                                }}
                                            >
                                               
                                                <input
                                                className="custom-radio"
                                                    type="radio"
                                                    name={`question-${count}`}
                                                    value={option}
                                                    onChange={(e) => checkAns(e, index)}
                                                    checked={selectedOption === index}
                                                    style={{ marginRight: '10px' }}
                                                    
                                                />
                                    
                                                {option}
                                            </label>
                                        ))}
                                    </form>

                                    {warning && <p className="warning">{warning}</p>}

                                    <div className="next">
                                        <button onClick={incrementCount}>Next</button>
                                    </div>
                                </div>

                            )
                        ) : (
                            <p>Loading...</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default ApplicantDailyTest;
