import React, { useState, useRef, useEffect } from "react";
import "./ApplicantDailyTest.css";
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';
import { Link } from "react-router-dom";
import Chart from "react-apexcharts";
import Taketest from '../../images/user/avatar/Taketest.png';
import CodeEditor from './CodeEditor';
import { useNavigate } from "react-router-dom";

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
    const [isHovered, setIsHovered] = useState(false);
    const [showIcon, setShowIcon] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [isWideScreen, setIsWideScreen] = useState(false);
    const navigate = useNavigate

    const handleCodeEditor = () => {
        navigate("/solve-questions");
    }

    useEffect(() => {
        const handleResize = () => {
            setIsWideScreen(window.innerWidth > 780);
        };
        // Initialize the state on component mount
        handleResize();
        // Add event listener for resize
        window.addEventListener('resize', handleResize);
        // Cleanup the event listener on component unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Style objects
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
        data: chartShow.map(result => ({
            x: result.testDate,
            y: result.score,
            performance: result.performance // Add the performance to each data point
        }))
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
    // const fetchTestDetailsByDate = async (date) => {
    //     try {
    //         const jwtToken = localStorage.getItem("jwtToken");
    //         const res = await axios.get(`http://localhost:8080/dailyTest/result/testResult/1?date=${date}`, {
    //             headers: { Authorization: `Bearer ${jwtToken}` }
    //         });
    //         console.log(date);
    //         console.log("Raw response data:", res.data)

    //         // Optional: inspect structure in detail
    //         if (Array.isArray(res.data)) {
    //             res.data.forEach((q, idx) => {
    //                 console.log(`Question ${idx + 1}:`);
    //                 console.log("  Question:", q.question);
    //                 console.log("  Options:", q.options);
    //                 console.log("  CorrectAnswer:", q.correctAnswer);
    //                 console.log("  SelectedAnswer:", q.selectedAnswer);
    //             });
    //         } else {
    //             console.warn("Unexpected testResult structure:", res.data);
    //         }
    //         setRandomQuestions(res.data);
    //         const testScoreObj = testResults.find(result => result.testDate === date);
    //         setSelectedResult({ date, score: testScoreObj?.score ?? 0 });
    //         setShowResult(true);
    //     } catch (err) {
    //         console.error("Failed to fetch test details:", err);
    //     }
    // };

    // Handle answering
    const checkAns = (e, selectedIndex) => {
        if (selectedOption !== null && selectedOption === selectedIndex) return;

        setSelectedOption(selectedIndex);

        const updatedQuestions = [...randomQuestions];
        const selected = updatedQuestions[count];
        const selectedAnswer = selected.options[selectedIndex];

        updatedQuestions[count] = {
            ...selected,
            selectedAnswer: selectedAnswer,
        };

        setRandomQuestions(updatedQuestions);

        const updatedSelectedAnswers = [...selectedAnswers];
        updatedSelectedAnswers[count] = selectedAnswer;
        setSelectedAnswers(updatedSelectedAnswers);
    };

    // Handle next question
    const incrementCount = () => {
        if (selectedOption === null) {
            setWarning("Please provide your answer to move to the next question");
            setTimeout(() => setWarning(""), 3000);
            return;
        }

        const newSelectedOptions = [...selectedOptions];
        newSelectedOptions[count] = selectedOption;
        setSelectedOptions(newSelectedOptions);

        if (count < randomQuestions.length - 1) {
            optionRefs.current.forEach(ref => ref?.classList.remove("correct", "wrong"));
            setCount(prev => prev + 1);
            setSelectedOption(newSelectedOptions[count + 1] || null);
        }
    };

    const decrementCount = () => {
        if (count > 0) {
            const newSelectedOptions = [...selectedOptions];
            setSelectedOption(newSelectedOptions[count - 1] || null);
            setCount(prev => prev - 1)
        }
    }

    const submitResult = async () => {

        let tempScore = 0;

        randomQuestions.forEach((question, index) => {
            if (selectedAnswers[index] === question.correctAnswer) {
                tempScore += 1;
            }
        });

        setScore(tempScore);
        console.log(tempScore);
        console.log(score);

        let performance = "";
        if (tempScore >= 8) {
            performance = "Excellent";
        } else if (tempScore >= 5) {
            performance = "Good";
        } else {
            performance = "Poor";
        }
        console.log(performance);

        try {

            const payload = {
                applicantId: 1,
                testDate: today,
                score: tempScore,
                performance: performance,
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
                score: tempScore,
                performance: performance
            };

            const updatedResults = [newResult, ...testResults];
            const sortedResults = updatedResults.sort((a, b) => new Date(b.testDate) - new Date(a.testDate));

            setTestResults(sortedResults);
            setChartShow([...sortedResults].sort((a, b) => new Date(a.testDate) - new Date(b.testDate))); // for chart (ascending)

            localStorage.setItem("testSummaries", JSON.stringify(sortedResults));
            setTestAttempted(true);

            // Update testDates if not already present
            setTestDates(prev => prev.includes(today) ? prev : [today, ...prev]);

            window.location.reload();

        } catch (error) {
            console.error("Error submitting result:", error);
            alert("There was an error submitting your test.");
        }
    };


    // Reset test view
    // const resetTest = () => {
    //     setTestStarted(false);
    //     setShowResult(false);
    //     setCount(0);
    //     setScore(0);
    //     setSelectedOption(null);
    //     setSelectedDate(null);
    //     setSelectedResult(null);
    // };

    return (
        <div>
            {/* // for the main page after loading */}
            <div className="dashboard__content">
                <div className="row mr-0 ml-10">

                    {/* for main page heading name */}
                    <div className="col-lg-12 col-md-12">
                        <div className="page-title-dashboard">
                            <div className="title-dashboard">
                                <div className="userName-title">
                                    Daily Test
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* for the contents  */}
                    <div className="col-lg-12 col-md-12">
                        <div className="row dash-count">

                            {/* take test or view result card*/}
                            {!showIcon && !testStarted && (
                                <>
                                    <div className="col-12 col-xxl-9 col-xl-12 col-lg-12 col-md-12 col-sm-12 display-flex certificatebox">
                                        <div className="card" style={{ cursor: 'pointer', backgroundColor: '#FFF', fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>
                                            <div className={!isWideScreen ? 'resumecard' : ''}>
                                                <div className="resumecard-content">
                                                    <div className="resumecard-text">
                                                        <div className="resumecard-heading">
                                                            <h2 className="heading1">Improve your skills by taking daily test</h2>
                                                            <div className="" style={{ fontSize: '16.8px', color: '#6F6F6F', fontWeight: '500', fontFamily: 'Plus Jakarta Sans', fontStyle: 'normal' }}>
                                                                Take the test not to prove you're perfect, but to prove you're progressing.
                                                            </div>
                                                        </div>
                                                        <div className="resumecard-button">
                                                            {testAttempted ? (
                                                                <Link
                                                                    className="button-link1"
                                                                    style={linkStyle}
                                                                    onClick={() => {
                                                                    }}
                                                                    onMouseEnter={() => setIsHovered(true)}
                                                                    onMouseLeave={() => setIsHovered(false)}
                                                                >
                                                                    <span className="button button-custom" style={spanStyle}>
                                                                        Test Attempted
                                                                    </span>
                                                                </Link>
                                                            ) : (
                                                                <Link
                                                                    className="button-link1"
                                                                    style={linkStyle}
                                                                    onClick={() => {
                                                                        setSelectedDate(today);
                                                                        setTestStarted(true);
                                                                    }}
                                                                    onMouseEnter={() => setIsHovered(true)}
                                                                    onMouseLeave={() => setIsHovered(false)}
                                                                >
                                                                    <span className="button button-custom" style={spanStyle}>
                                                                        Start Test
                                                                    </span>
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="resumecard-icon" style={{ marginLeft: 'auto' }}>
                                                        <img
                                                            src={Taketest}
                                                            alt="Taketest"
                                                            style={{ width: '160px', height: 'auto', objectFit: 'contain', marginTop: '10px' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-xxl-9 col-xl-12 col-lg-12 col-md-12 col-sm-12 display-flex certificatebox">
                                        <div className="card" style={{ cursor: 'pointer', backgroundColor: '#FFF', fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>
                                            <div className={!isWideScreen ? 'resumecard' : ''}>
                                                <div className="resumecard-content">
                                                    <div className="resumecard-text">
                                                        <div className="resumecard-heading">
                                                            <h2 className="heading1">code it</h2>
                                                            <div className="" style={{ fontSize: '16.8px', color: '#6F6F6F', fontWeight: '500', fontFamily: 'Plus Jakarta Sans', fontStyle: 'normal' }}>
                                                                improve your logical strength by coding diffeent scenarios.
                                                            </div>
                                                        </div>
                                                        <div className="resumecard-button">
                                                       <button
                                                                    className="button-link1"
                                                                    style={linkStyle}
                                                                    onClick={handleCodeEditor}
                                                                >
                                                                    <span className="button button-custom" style={spanStyle}>
                                                                        Start coding
                                                                    </span>
                                                                </button>
                                                        </div>

                                                    </div>

                                                    <div className="resumecard-icon" style={{ marginLeft: 'auto' }}>
                                                        <img
                                                            src={Taketest}
                                                            alt="Taketest"
                                                            style={{ width: '160px', height: 'auto', objectFit: 'contain', marginTop: '10px' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {testStarted && randomQuestions.length > 0 && (
                                <>
                                    <div className="col-12 col-xxl-9 col-xl-12 col-lg-12 col-md-12 col-sm-12 display-flex certificatebox">
                                        <div className="card">
                                            <div className="header">
                                                <h3>
                                                    <span className="text-name1">Performance Improvement Test</span>
                                                    <h4 className='test-sub'>
                                                        Question {count + 1} / {randomQuestions.length}
                                                    </h4>
                                                </h3>
                                            </div>
                                            <div className="separator"></div>
                                            <div className="question no-select">
                                                <ul>
                                                    <li>
                                                        <p className="question1 no-select">
                                                            {count + 1}.&nbsp;
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html: randomQuestions[count]?.question
                                                                        .replace(/\n/g, '<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
                                                                        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
                                                                        .replace(/```/g, '') // Remove any Markdown code block delimiters
                                                                }}
                                                            />
                                                        </p>
                                                    </li>
                                                    {randomQuestions[count]?.options.map((option, index) => (
                                                        <li key={index}>
                                                            <label className="question-label no-select">
                                                                <input
                                                                    type="radio"
                                                                    value={option}
                                                                    checked={selectedOption === index}
                                                                    onChange={(e) => checkAns(e, index)}
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
                                                    {warning && <p className="warning">{warning}</p>}
                                                </ul>
                                            </div>
                                            <div className="footer1">
                                                <button
                                                    disabled={count === 0}
                                                    onClick={decrementCount}
                                                    className="second-btn"
                                                >
                                                    Back
                                                </button>
                                                {count < randomQuestions.length - 1 ? (
                                                    <button onClick={incrementCount} className="navigation-btn">
                                                        Next
                                                    </button>
                                                ) : (
                                                    <button onClick={submitResult} className="navigation-btn">
                                                        Submit
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* test progress table formate */}
                            {
                                !testStarted && (
                                    <>
                                        <div className="col-lg-12 col-md-12">
                                            <section className="page-title-dashboard second-heading">
                                                <div className="themes-container">
                                                    <div className="row">
                                                        <div className="col-lg-12 col-md-12 ">
                                                            <div className="title-dashboard">

                                                                <h3>Previous Test Performances</h3>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        <div className="col-12 col-xxl-9 col-xl-12 col-lg-12 col-md-12 col-sm-12 display-flex certificatebox">
                                            <div className="card" >
                                                <table className="performance-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Score</th>
                                                            <th>Performance</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {testResults.slice(0, 5).map((summary, index) => (
                                                            <tr key={index}>
                                                                <td>{summary.testDate}</td>
                                                                <td>{summary.score}</td>
                                                                <td>{summary.performance}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </>
                                )}

                            {/* progress graph  */}
                            {!testStarted && (
                                <>
                                    <div className="col-lg-12 col-md-12">
                                        <section className="page-title-dashboard second-heading">
                                            <div className="themes-container">
                                                <div className="row">
                                                    <div className="col-lg-12 col-md-12 ">
                                                        <div className="title-dashboard">
                                                            <h3 >Progress Graph</h3>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                    <div className="col-12 col-xxl-9 col-xl-12 col-lg-12 col-md-12 col-sm-12 display-flex certificatebox">
                                        <div className="card" >
                                            <div className="col-12 lineChart">
                                                <Chart
                                                    type='line'
                                                    height="100%"
                                                    series={chartSeries}
                                                    options={{
                                                        chart: {
                                                            id: "performance-graph",
                                                            toolbar: { show: false },
                                                            zoom: { enabled: false }
                                                        },
                                                        xaxis: {
                                                            title: { text: "Test Day" }
                                                        },
                                                        yaxis: {
                                                            min: 0,
                                                            max: 10
                                                        },
                                                        title: {
                                                            text: "Your Performance Over Time",
                                                            align: "center"
                                                        },
                                                        colors: ["#f97316"],
                                                        tooltip: {
                                                            shared: true,
                                                            intersect: false,
                                                            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                                                                // Get the performance text corresponding to the hovered data point
                                                                const performance = w.config.series[seriesIndex].data[dataPointIndex].performance;
                                                                const score = w.config.series[seriesIndex].data[dataPointIndex].y;
                                                                let scoreColor;
                                                                if (score >= 8) {
                                                                    scoreColor = 'green'; // Excellent score
                                                                } else if (score >= 5) {
                                                                    scoreColor = 'yellow'; // Good score
                                                                } else {
                                                                    scoreColor = 'red'; // Poor score
                                                                }
                                                                return `
                    <div style="padding: 10px; font-size: 12px;">
                        <span style="color: orange; font-weight: bold;">Score:</span> 
                        <span style="color: ${scoreColor};">${score}</span><br/>
                        <span style="color: orange; font-weight: bold;">Performance:</span> 
                        <span style="color: ${scoreColor};">${performance}</span>
                    </div>
                `;
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApplicantDailyTest;
