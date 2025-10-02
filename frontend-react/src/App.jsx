import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import StatusPage from "./pages/StatusPage";
import MoldHealthPage from "./pages/MoldHealthPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Status Page */}
        <Route
          path="/"
          element={
            <Layout>
              <StatusPage />
            </Layout>
          }
        />

        {/* Mold Health - list view */}
        <Route
          path="/molds"
          element={
            <Layout>
              <MoldHealthPage />
            </Layout>
          }
        />

        {/* Mold Health - with moldId param */}
        <Route
          path="/molds/:moldId"
          element={
            <Layout>
              <MoldHealthPage />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
