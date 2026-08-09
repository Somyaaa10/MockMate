import { useRef, useState } from "react";

const InterviewPage = () => {
  //
  // INTERVIEW STATE
  //

  const [question, setQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // AI EVALUATION
  // =====================================================

  const [evaluation, setEvaluation] = useState(null);
  const [overallScore, setOverallScore] = useState(null);

  // =====================================================
  // VOICE STATE
  // =====================================================

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // =====================================================
  // SPEECH RECOGNITION
  // =====================================================

  const recognitionRef = useRef(null);

  // Temporary existing interview
  const interviewId = "6a7881722375c5049c9769c2";

  // =====================================================
  // GET JWT TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // TEXT TO SPEECH
  // =====================================================

  const speakQuestion = (text) => {
    if (!text) return;

    if (!window.speechSynthesis) {
      setError("Text-to-speech is not supported in this browser.");
      return;
    }

    // Stop previous speech
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onstart = () => {
      setIsSpeaking(true);
    };

    speech.onend = () => {
      setIsSpeaking(false);
    };

    speech.onerror = (event) => {
      console.error("Speech error:", event);

      setIsSpeaking(false);
      setError("Unable to speak the question.");
    };

    window.speechSynthesis.speak(speech);
  };

  // =====================================================
  // STOP AI SPEAKING
  // =====================================================

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  };

  // =====================================================
  // START SPEECH RECOGNITION
  // =====================================================

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser. Please use Google Chrome.",
      );

      return;
    }

    setError("");

    // Stop AI voice
    stopSpeaking();

    // If already listening, don't create another instance
    if (recognitionRef.current) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    // Keep listening until user presses stop
    recognition.continuous = true;

    // Show partial speech
    recognition.interimResults = true;

    recognition.onstart = () => {
      console.log("🎤 Speech recognition started");

      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += text;
        }
      }

      if (finalText.trim()) {
        setAnswer((previousAnswer) => {
          const updatedAnswer = previousAnswer
            ? `${previousAnswer} ${finalText.trim()}`
            : finalText.trim();

          return updatedAnswer;
        });
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      setIsListening(false);
      recognitionRef.current = null;

      if (event.error === "not-allowed") {
        setError(
          "Microphone permission was denied. Please allow microphone access.",
        );
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please try speaking again.");
      } else if (event.error === "network") {
        setError(
          "Speech recognition network error. Please check your internet connection.",
        );
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log("🎤 Speech recognition ended");

      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(error);

      recognitionRef.current = null;
      setIsListening(false);
    }
  };

  // =====================================================
  // STOP SPEECH RECOGNITION
  // =====================================================

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();

      recognitionRef.current = null;
    }

    setIsListening(false);
  };

  // =====================================================
  // START / CONTINUE INTERVIEW
  // =====================================================

  const startInterview = async () => {
    try {
      setLoading(true);
      setError("");
      setEvaluation(null);

      const token = getToken();

      if (!token) {
        throw new Error("Please login first");
      }

      // =================================================
      // GET INTERVIEW
      // =================================================

      const getResponse = await fetch(
        `http://localhost:5000/api/v1/interviews/${interviewId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const getText = await getResponse.text();

      let interviewData;

      try {
        interviewData = JSON.parse(getText);
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!getResponse.ok) {
        throw new Error(interviewData.message || "Failed to fetch interview");
      }

      const interview = interviewData.data;

      // =================================================
      // COMPLETED
      // =================================================

      if (interview.status === "completed") {
        setCompleted(true);
        setOverallScore(interview.overallScore);

        return;
      }

      // =================================================
      // ALREADY IN PROGRESS
      // =================================================

      if (interview.status === "in_progress") {
        const currentIndex = interview.currentQuestionIndex;

        const currentQuestion = interview.questions[currentIndex];

        if (!currentQuestion) {
          throw new Error("Current question not found");
        }

        setQuestion(currentQuestion.question);

        setQuestionNumber(currentIndex + 1);

        setTotalQuestions(interview.questions.length);

        setStarted(true);

        // 🔊 Speak question
        speakQuestion(currentQuestion.question);

        return;
      }

      // =================================================
      // CREATED → START INTERVIEW
      // =================================================

      if (interview.status === "created") {
        const startResponse = await fetch(
          `http://localhost:5000/api/v1/interviews/${interviewId}/start`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const startText = await startResponse.text();

        let startData;

        try {
          startData = JSON.parse(startText);
        } catch {
          throw new Error("Invalid response from server");
        }

        if (!startResponse.ok) {
          throw new Error(startData.message || "Failed to start interview");
        }

        setQuestion(startData.data.question);

        setQuestionNumber(startData.data.questionNumber);

        setTotalQuestions(startData.data.totalQuestions);

        setStarted(true);

        // 🔊 Speak first question
        speakQuestion(startData.data.question);
      }
    } catch (error) {
      console.error(error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SUBMIT ANSWER
  // =====================================================

  const submitAnswer = async () => {
    try {
      setLoading(true);
      setError("");
      setEvaluation(null);

      // Stop voice
      stopSpeaking();
      stopListening();

      const token = getToken();

      if (!token) {
        throw new Error("Please login first");
      }

      if (!answer.trim()) {
        throw new Error("Please enter your answer");
      }

      // =================================================
      // API REQUEST
      // =================================================

      const response = await fetch(
        `http://localhost:5000/api/v1/interviews/${interviewId}/answer`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            answer: answer.trim(),
          }),
        },
      );

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit answer");
      }

      console.log("Answer evaluation:", data);

      // =================================================
      // SAVE EVALUATION
      // =================================================

      setEvaluation(data.data.evaluation);

      // =================================================
      // INTERVIEW COMPLETED
      // =================================================

      if (data.data.completed) {
        setCompleted(true);

        setOverallScore(data.data.overallScore);

        setStarted(false);

        setAnswer("");

        return;
      }

      // =================================================
      // NEXT QUESTION
      // =================================================

      setQuestion(data.data.nextQuestion);

      setQuestionNumber(data.data.questionNumber);

      setAnswer("");

      // 🔊 Speak next question
      speakQuestion(data.data.nextQuestion);
    } catch (error) {
      console.error(error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* ================================================= */}
      {/* TITLE */}
      {/* ================================================= */}

      <h1>🎤 AI Mock Interview</h1>

      {/* ================================================= */}
      {/* START BUTTON */}
      {/* ================================================= */}

      {!started && !completed && (
        <button
          onClick={startInterview}
          disabled={loading}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading..." : "Start Interview"}
        </button>
      )}

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#ffe5e5",
            color: "#c00",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}

      {/* ================================================= */}
      {/* INTERVIEW */}
      {/* ================================================= */}

      {started && !completed && (
        <div style={{ marginTop: "30px" }}>
          {/* QUESTION NUMBER */}

          <h3>
            Question {questionNumber} of {totalQuestions}
          </h3>

          {/* ================================================= */}
          {/* QUESTION */}
          {/* ================================================= */}

          <div
            style={{
              padding: "25px",
              marginTop: "20px",
              border: "1px solid #ddd",
              borderRadius: "10px",
            }}
          >
            <h2>{question}</h2>

            {/* ================================================= */}
            {/* AI VOICE */}
            {/* ================================================= */}

            <div
              style={{
                marginTop: "20px",
              }}
            >
              {!isSpeaking ? (
                <button
                  onClick={() => speakQuestion(question)}
                  disabled={loading}
                  style={{
                    padding: "10px 20px",
                    marginRight: "10px",
                  }}
                >
                  🔊 Speak Question
                </button>
              ) : (
                <button
                  onClick={stopSpeaking}
                  style={{
                    padding: "10px 20px",
                    marginRight: "10px",
                  }}
                >
                  🔇 Stop Speaking
                </button>
              )}

              {isSpeaking && <span>🔊 AI is speaking...</span>}
            </div>
          </div>

          {/* ================================================= */}
          {/* ANSWER */}
          {/* ================================================= */}

          <div
            style={{
              marginTop: "30px",
            }}
          >
            <h3>Your Answer</h3>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer or use the microphone..."
              rows="8"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
              disabled={loading}
            />

            {/* ================================================= */}
            {/* MICROPHONE */}
            {/* ================================================= */}

            <div
              style={{
                marginTop: "15px",
              }}
            >
              {!isListening ? (
                <button
                  onClick={startListening}
                  disabled={loading}
                  style={{
                    padding: "10px 20px",
                    marginRight: "10px",
                  }}
                >
                  🎤 Start Speaking
                </button>
              ) : (
                <button
                  onClick={stopListening}
                  style={{
                    padding: "10px 20px",
                    marginRight: "10px",
                  }}
                >
                  🛑 Stop Listening
                </button>
              )}

              {isListening && <span>🎤 Listening...</span>}
            </div>

            {/* ================================================= */}
            {/* SUBMIT */}
            {/* ================================================= */}

            <div
              style={{
                marginTop: "20px",
              }}
            >
              <button
                onClick={submitAnswer}
                disabled={loading || !answer.trim()}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  cursor: loading || !answer.trim() ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "🤖 Evaluating..." : "Submit Answer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* AI EVALUATION */}
      {/* ================================================= */}

      {evaluation && !completed && (
        <div
          style={{
            marginTop: "40px",
            padding: "25px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <h2>🤖 AI Evaluation</h2>

          <h3>Score: {evaluation.score} / 10</h3>

          {/* FEEDBACK */}

          <h3>Feedback</h3>

          <p>{evaluation.feedback}</p>

          {/* STRENGTHS */}

          <h3>Strengths</h3>

          {evaluation.strengths?.length > 0 ? (
            <ul>
              {evaluation.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          ) : (
            <p>No strengths provided.</p>
          )}

          {/* IMPROVEMENTS */}

          <h3>Improvements</h3>

          {evaluation.improvements?.length > 0 ? (
            <ul>
              {evaluation.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
          ) : (
            <p>No improvements provided.</p>
          )}
        </div>
      )}

      {/* ================================================= */}
      {/* FINAL RESULT */}
      {/* ================================================= */}

      {completed && (
        <div
          style={{
            marginTop: "40px",
            padding: "30px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <h2>🎉 Interview Completed</h2>

          <h1>Overall Score: {overallScore} / 10</h1>

          <p>You have completed all {totalQuestions} questions.</p>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
