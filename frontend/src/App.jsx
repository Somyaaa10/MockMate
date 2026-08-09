import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import InterviewPage from "./pages/InterviewPage";
import InterviewHistory from "./pages/InterviewHistory";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/interviews" element={<InterviewHistory />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
