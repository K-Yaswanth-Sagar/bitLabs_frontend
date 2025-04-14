import React, { useState, useRef, useEffect } from "react";
import "./ApplicantDailyTest.css";

function ApplicantDailyTest() {

    const [count, setCount] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [warning, setWarning] = useState("");
    const [showResult, setShowResult] = useState(false);



    useEffect(() => {
        async function fetchQuestions() {
            const today = new Date().toISOString().split("T")[0];
            const savedData = JSON.parse(localStorage.getItem("dailyTestData"));

            if (savedData && savedData.date === today) {
                setRandomQuestions(savedData.questions);
                return;
            }

            try {
                const jwtToken = localStorage.getItem("jwtToken");
                const res = await fetch("http://localhost:8080/DailyTest/dailyQuestion", {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                        'Content-Type': 'application/json',
                    },
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
    }, []);



    const [randomQuestions, setRandomQuestions] = useState([]);
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

                    {randomQuestions.length > 0 ? (
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

                                </div>
                                <div className="next">
                                    <button onClick={incrementCount}>Next</button>
                                </div>
                                {warning && <p className="snackbar error">{warning}</p>}

                            </div>
                        ) : (
                            <div className="result">
                                <h2>Test Completed!</h2>
                                <p>Your Score: <strong>{score}</strong> out of {5}</p>
                                <button onClick={() => window.location.reload()}>Retake Test</button>
                            </div>

                        )
                    ) : (
                        <p>Loading questions...</p>
                    )}
                </div>
            </div>
        </div>

    )
}

export default ApplicantDailyTest;