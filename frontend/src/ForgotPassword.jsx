import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, Lock, CheckCircle } from 'lucide-react';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const BASE_URL = 'http://localhost:5000';

  const handleSendOtp = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email });
      alert(`OTP Sent to ${email}`); setStep(2);
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/reset-password`, { email, otp, newPassword });
      alert("✅ Password Changed! Please Login."); navigate('/login');
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-green-100">
        <h2 className="text-2xl font-bold text-center text-green-900 mb-6">Reset Password</h2>
        
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="email" placeholder="Enter Email" required className="w-full pl-10 p-3 border rounded-xl outline-none" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
            <button disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">{loading ? "Sending..." : "Send OTP"}</button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="relative"><KeyRound className="absolute left-3 top-3 text-gray-400" size={20} /><input type="text" placeholder="Enter OTP" required className="w-full pl-10 p-3 border rounded-xl outline-none" value={otp} onChange={(e)=>setOtp(e.target.value)} /></div>
            <div className="relative"><Lock className="absolute left-3 top-3 text-gray-400" size={20} /><input type="password" placeholder="New Password" required className="w-full pl-10 p-3 border rounded-xl outline-none" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} /></div>
            <button disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">{loading ? "Updating..." : "Change Password"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
export default ForgotPassword;