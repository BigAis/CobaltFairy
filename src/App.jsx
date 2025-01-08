import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/dashboard/dashboard';
import LogIn from './pages/login/login';
import User from './pages/register/register';
import Desing from './desing';
function App() {
  return (
    <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/register" element={<User />} />
		  <Route path="/desing" element={<Desing />} />
        </Routes>
    </div>
  );
}

export default App;
