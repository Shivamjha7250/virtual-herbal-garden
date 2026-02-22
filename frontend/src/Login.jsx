import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, KeyRound, Leaf, CheckCircle, AlertCircle } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const BASE_URL = 'http://localhost:5000'; 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, formData);
      
      if (res.data.requiresOtp) {
      
        setStep(2); 
      } 

      else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        alert(`Welcome back, ${res.data.user.name}!`);
        navigate('/');
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login-verify`, {
        email: formData.email,
        otp: otp
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      alert(`Login Successful! Welcome ${res.data.user.name}`);
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4 font-sans relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="text-center mb-8 z-10">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-full shadow-lg">
            <Leaf size={48} className="text-green-600" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-800 tracking-tight drop-shadow-sm">
          Welcome to <br />
          <span className="text-green-600">Herbal Garden</span>
        </h1>
        <p className="text-green-700 mt-2 font-medium">Nature's Best Healing</p>
      </div>
     
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white z-10">
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm text-center flex items-center justify-center gap-2 border border-red-200">
            <AlertCircle size={16}/> {error}
          </div>
        )}

        {step === 1 ? (
  
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign In to Your Account</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-green-600" size={20} />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email Address" 
                  required 
                  className="w-full pl-10 p-3 bg-white border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  onChange={handleChange} 
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-green-600" size={20} />
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Password" 
                  required 
                  className="w-full pl-10 p-3 bg-white border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  onChange={handleChange} 
                />
              </div>
              <button 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Checking..." : "Login"} {!loading && <LogIn size={20}/>}
              </button>
            </form>
            
            <div className="mt-6 flex flex-col gap-2 text-center">
               <p className="text-gray-600">
                 Don't have an account? <Link to="/signup" className="text-green-700 font-bold hover:underline">Sign Up</Link>
               </p>
               <Link to="/forgot-password" class="text-sm text-gray-500 hover:text-green-700">Forgot Password?</Link>
            </div>
          </>
        ) : (
          
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-green-800 mb-2">Verify OTP</h2>
              <p className="text-gray-600 text-sm">
                We sent a 6-digit code to <br/> <span className="font-bold text-green-700">{formData.email}</span>
              </p>
            </div>
            
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 text-green-600" size={20} />
                <input 
                  type="text" 
                  placeholder="Enter 6-digit OTP" 
                  required 
                  maxLength="6"
                  className="w-full pl-10 p-3 bg-white border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-center text-xl tracking-widest font-bold text-gray-800"
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              
              <button 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex justify-center items-center gap-2"
              >
                {loading ? "Verifying..." : "Verify & Login"} {!loading && <CheckCircle size={20}/>}
              </button>
            </form>
            
            <button 
              onClick={() => {setStep(1); setError('');}} 
              className="w-full mt-6 text-gray-400 hover:text-green-700 text-sm font-medium transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default Login;