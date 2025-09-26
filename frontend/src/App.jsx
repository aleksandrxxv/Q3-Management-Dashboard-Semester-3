import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import StatusPage from "./pages/StatusPage";
import MoldDetailPage from "./pages/MoldDetailPage";

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
          path="/molds/:moldId"
          element={
            <Layout>
              <MoldDetailPage />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
