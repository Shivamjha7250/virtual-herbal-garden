import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, KeyRound, ArrowRight, Timer, Leaf, AlertCircle, CheckCircle } from 'lucide-react';

function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');

  const BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      console.log("Sending Data:", formData); 

      const res = await axios.post(`${BASE_URL}/api/auth/register-step1`, formData);
      
      setStep(2);
      setTimeLeft(120);
    } catch (err) {
      console.error("Signup Error:", err.response);
      setError(err.response?.data?.message || "Registration Failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError("Enter valid 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        email: formData.email,
        otp: otp
      });
      alert(res.data.message || " Verified! Login now.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${BASE_URL}/api/auth/register-step1`, formData);
      alert("OTP Resent!");
      setTimeLeft(120);
    } catch (err) {
      setError("Failed to resend OTP");
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
        
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-green-600" size={20} />
                <input 
                  type="text" 
                  name="name"
                  placeholder="Full Name" 
                  required 
                  className="w-full pl-10 p-3 bg-white border border-green-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  onChange={handleChange} 
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-green-600" size={20} />
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email Address" 
                  required 
                  className="w-full pl-10 p-3 bg-white border border-green-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  onChange={handleChange} 
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-green-600" size={20} />
                <input 
                  type="password" 
                  name="password"
                  placeholder="Password (Min 6 chars)" 
                  required 
                  minLength="6"
                  className="w-full pl-10 p-3 bg-white border border-green-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  onChange={handleChange} 
                />
              </div>
              <button 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {loading ? "Sending..." : <>Sign Up <ArrowRight size={20} /></>}
              </button>
            </form>
            <p className="text-center mt-6 text-gray-600">
              Already have an account? <Link to="/login" className="text-green-700 font-bold hover:underline">Login</Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-green-800 mb-2">Verify Email</h2>
              <p className="text-gray-600 text-sm">
                Enter 6-digit code sent to <br/><span className="font-bold text-green-700">{formData.email}</span>
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
                  className="w-full pl-10 p-3 bg-white border border-green-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-center text-xl tracking-widest font-bold text-gray-800"
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                />
              </div>
              <button 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex justify-center items-center gap-2"
              >
                {loading ? "Verifying..." : "Verify & Register"} {!loading && <CheckCircle size={20}/>}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              {timeLeft > 0 ? (
                <p className="text-gray-500 flex items-center justify-center gap-1 text-sm">
                  <Timer size={16}/> Resend OTP in <span className="font-bold text-green-700">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <button onClick={handleResend} className="text-green-700 font-bold hover:underline text-sm">Resend OTP</button>
              )}
            </div>
            <button 
              onClick={() => {setStep(1); setError('');}} 
              className="w-full mt-4 text-gray-400 hover:text-green-700 text-sm transition-colors"
            >
              ← Change Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default Signup;