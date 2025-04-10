import React, { useState } from "react";
import "./ApplicantDailyTest.css";

function ApplicantDailyTest() {

    const questions = [
        "What is the purpose of the main method in Java?",
        "Which of the following is not a Java keyword?",
        "What is the size of an int in Java",
        " How do you create an object of a class in Java?",
        " Which of the following is used to take input from the user?"
    ];

    const options = [
        ["To declare a class", "To define a class", "To execute a program", "To create an object"],
        ["abstract", "Boolean", "case", "catch"],
        ["4 bytes", "2 bytes", "8 bytes", "16 bytes"],
        ["obj = new Object()", "Object = new Object()", "Object obj", "Object obj = new Object()"],
        ["Scanner scanner = new Scanner(System.in)", "String name = input.nextLine()", "String name = input.next()", "System.out.println(name)"]
    ];

    const answers = [3, 2, 1, 4, 1];


    const [count, setCount] = useState(() => 1);
    const [selectedOption, setSelectedOption] = useState(null);


    function incrementCount() {
        if (count < questions.length){
            setCount(nextCount => nextCount + 1);
            setSelectedOption(null);
        }
    }


    const checkAns = (e, ans) => {
        if (selectedOption !== null) return; 

    setSelectedOption(ans); 
        if (ans === answers[count - 1]) {
            e.target.classList.add("correct");
        }
        else {
            e.target.classList.add("wrong");
        }

    }

    return (

        <div className="dailyTest_content">
            <div className="questions">
                <h4>Question {count}</h4>
                <h3>{questions[count - 1]}</h3>

                <div className="choices">
                    <ul>
                        {options[count - 1].map((option, index) => (
                            <li key={index} onClick={(e) => checkAns(e, index + 1)}>
                                {option}
                            </li>
                        ))}
                    </ul>

                </div>

            </div>
            <div className="next">
                <button onClick={incrementCount}>Next</button>
            </div>

        </div>

    )
}


export default ApplicantDailyTest;