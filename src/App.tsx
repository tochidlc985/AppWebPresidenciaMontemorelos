import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Navigation from './components/Navigation';
import ReportForm from './pages/ReportForm';
import Dashboard from './pages/Dashboard';
import QRGenerator from './pages/QRGenerator';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Logout from './components/Logout';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8"
        >
          <Routes>
            <Route path="/" element={
              localStorage.getItem('token')
                ? <Navigate to="/home" replace />
                : <Navigate to="/login" replace />
            } />
            <Route path="/reporte" element={<ReportForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/qr" element={<QRGenerator />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </motion.main>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e40af',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;