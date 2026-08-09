import { useEffect, useState } from "react";

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login first");
      }

      const response = await fetch("http://localhost:5000/api/v1/interviews", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch interviews");
      }

      setInterviews(data.data || []);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Defer calling fetchInterviews to avoid synchronous setState within the effect
    const t = setTimeout(() => {
      fetchInterviews();
    }, 0);

    return () => clearTimeout(t);
  }, []);

  const getScoreStyle = (score) => {
    if (score === null || score === undefined) {
      return {
        background: "#eee",
        color: "#555",
      };
    }

    if (score >= 7) {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (score >= 5) {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  };

  const formatDate = (date) => {
    if (!date) return "Not started";

    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Loading interviews...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "40px",
      }}
    >
      <h1>📋 Interview History</h1>

      <p>View your previous MockMate AI interviews and performance.</p>

      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "8px",
          }}
        >
          {error}
        </div>
      )}

      {!error && interviews.length === 0 && (
        <div
          style={{
            marginTop: "30px",
            padding: "30px",
            textAlign: "center",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <h2>No interviews yet</h2>

          <p>Start your first AI mock interview.</p>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        {interviews.map((interview) => (
          <div
            key={interview._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "25px",
              background: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  {interview.interviewType?.charAt(0).toUpperCase() +
                    interview.interviewType?.slice(1)}{" "}
                  Interview
                </h2>

                <p>Resume: {interview.resume?.fileName || "Resume"}</p>
              </div>

              <div
                style={{
                  padding: "10px 15px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  ...getScoreStyle(interview.overallScore),
                }}
              >
                {interview.overallScore !== null
                  ? `${interview.overallScore}/10`
                  : "Not scored"}
              </div>
            </div>

            <hr />

            <div
              style={{
                display: "flex",
                gap: "30px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <strong>Difficulty</strong>
                <p>{interview.difficulty}</p>
              </div>

              <div>
                <strong>Questions</strong>
                <p>{interview.numberOfQuestions}</p>
              </div>

              <div>
                <strong>Status</strong>
                <p>{interview.status}</p>
              </div>

              <div>
                <strong>Created</strong>
                <p>{formatDate(interview.createdAt)}</p>
              </div>
            </div>

            <button
              onClick={() => console.log("Interview:", interview._id)}
              style={{
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewHistory;
