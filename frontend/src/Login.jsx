import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const BASE_URL = 'http://192.168.1.7:5000';
      const res = await axios.post(`${BASE_URL}/api/auth/login`, formData);
      
      // Token aur User info save karein (Browser mein)
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      alert(`Welcome back, ${res.data.user.name}!`);
      navigate('/'); // Home page par bhejein
      window.location.reload(); // Page refresh karein taaki navbar update ho
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-green-100">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-6">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="email" placeholder="Email Address" required 
              className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="password" placeholder="Password" required 
              className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <button className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
            Login
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">
          Don't have an account? <Link to="/signup" className="text-green-700 font-bold hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
export default Login;