import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import InterviewPage from "./pages/InterviewPage";
import InterviewHistory from "./pages/InterviewHistory";
import PeerInterviewPage from "./pages/PeerInterviewPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/interviews" element={<InterviewHistory />} />
        <Route path="/peer-interview" element={<PeerInterviewPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
