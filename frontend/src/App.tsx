import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Leaderboard from "./pages/Leaderboard"
import Resources from "./pages/Resources"
import AILab from "./pages/AILab"
import Navbar from "./components/Navbar"
import Wrapped from "./pages/Wrapped"
import WingPage from "./pages/WingPage"

import { AuthProvider } from "./context/AuthContext"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="dark min-h-screen bg-[#030014] text-foreground font-sans antialiased flex flex-col">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/ai-lab" element={<AILab />} />
            <Route path="/wrapped" element={<Wrapped />} />
            <Route path="/wings/:wing_id" element={<WingPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
