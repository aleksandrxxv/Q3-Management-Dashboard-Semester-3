import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import StatusPage from "./pages/StatusPage";
import MoldHealthPage from "./pages/MoldHealthPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <StatusPage />
            </Layout>
          }
        />
        <Route
          path="/molds"
          element={
            <Layout>
              <MoldHealthPage />
            </Layout>
          }
        />
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
