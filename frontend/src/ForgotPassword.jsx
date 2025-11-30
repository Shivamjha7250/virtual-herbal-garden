import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Mail, Lock, CheckCircle, Leaf, AlertCircle, ArrowLeft } from 'lucide-react';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email Form, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ IP Address (PC ke liye localhost)
  const BASE_URL = 'http://localhost:5000';

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email });
      // alert(`OTP Sent to ${email}`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${BASE_URL}/api/auth/reset-password`, { 
        email, 
        otp, 
        newPassword 
      });
      alert("✅ Password Changed Successfully! Please Login.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4 font-sans relative overflow-hidden">
      
      {/* --- BACKGROUND DESIGN START (Same as Login/Signup) --- */}
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
      {/* --- BACKGROUND DESIGN END --- */}

      {/* --- MAIN CARD --- */}
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white z-10">
        
        {/* Error Message Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm text-center flex items-center justify-center gap-2 border border-red-200">
            <AlertCircle size={16}/> {error}
          </div>
        )}

        {step === 1 ? (
          /* --- STEP 1: ENTER EMAIL --- */
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Reset Password</h2>
            <p className="text-gray-500 text-center text-sm mb-6">Enter your email to receive a reset code.</p>
            
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-green-600" size={20} />
                <input 
                  type="email" 
                  placeholder="Enter Email Address" 
                  required 
                  className="w-full pl-10 p-3 bg-white border border-green-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  value={email} 
                  onChange={(e)=>setEmail(e.target.value)} 
                />
              </div>
              <button 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex justify-center items-center gap-2"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          </div>
        ) : (
          /* --- STEP 2: VERIFY OTP & NEW PASSWORD --- */
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Create New Password</h2>
            <p className="text-gray-500 text-center text-sm mb-6">Code sent to <span className="font-bold text-green-700">{email}</span></p>
            
            <form onSubmit={handleReset} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 text-green-600" size={20} />
                <input 
                  type="text" 
                  placeholder="Enter OTP" 
                  required 
                  className="w-full pl-10 p-3 bg-white border border-green-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all tracking-widest" 
                  value={otp} 
                  onChange={(e)=>setOtp(e.target.value)} 
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-green-600" size={20} />
                <input 
                  type="password" 
                  placeholder="New Password" 
                  required 
                  className="w-full pl-10 p-3 bg-white border border-green-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all" 
                  value={newPassword} 
                  onChange={(e)=>setNewPassword(e.target.value)} 
                />
              </div>
              <button 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex justify-center items-center gap-2"
              >
                {loading ? "Updating..." : "Change Password"} {!loading && <CheckCircle size={20}/>}
              </button>
            </form>
            <button 
              onClick={() => {setStep(1); setError('');}} 
              className="w-full mt-4 text-gray-400 hover:text-green-700 text-sm transition-colors"
            >
              ← Change Email
            </button>
          </div>
        )}

        {/* Back to Login Link */}
        <div className="mt-6 text-center border-t border-gray-100 pt-4">
           <Link to="/login" className="text-gray-500 hover:text-green-700 flex items-center justify-center gap-2 font-medium transition-colors">
             <ArrowLeft size={16}/> Back to Login
           </Link>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;