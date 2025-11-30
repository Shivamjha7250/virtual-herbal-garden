import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Heart, LogOut, ArrowLeft, Clock, Key, ShieldCheck, CheckCircle } from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("favorites");
  
  // ✅ New State for Admin Plants
  const [adminPlants, setAdminPlants] = useState([]); 
  
  const BASE_URL = 'http://localhost:5000'; 

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login'); 
    window.location.reload();
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) { 
        navigate('/login'); 
        return; 
    }

    const user = JSON.parse(storedUser);
    
    // 1. Fetch User Profile
    axios.get(`${BASE_URL}/api/auth/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUserData(res.data))
      .catch(err => {
        if (err.response && (err.response.status === 400 || err.response.status === 404)) {
            handleLogout();
        }
      });

    // 2. ✅ Fetch Admin Approved Plants (Only if Admin)
    if (user.role === 'admin') {
      axios.get(`${BASE_URL}/api/auth/admin/approved-plants`) // Naya Route Call
        .then(res => setAdminPlants(res.data))
        .catch(err => console.error("Admin Plants Fetch Error", err));
    }

  }, []);

  if (!userData) return (
    <div className="flex justify-center items-center h-screen bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
    </div>
  );

  const PlantCard = ({ plant }) => {
    if (!plant || typeof plant !== 'object') return null;

    return (
        <div onClick={() => navigate(`/plant/${plant._id}`, { state: plant })} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 overflow-hidden flex items-center p-2 gap-3">
        <img 
            src={plant.images?.[0] ? `${BASE_URL}${plant.images[0]}` : "https://via.placeholder.com/100"} 
            alt={plant.name} 
            className="w-16 h-16 rounded-lg object-cover bg-gray-100" 
            onError={(e) => e.target.src="https://via.placeholder.com/100"} 
        />
        <div>
            <h4 className="font-bold text-green-900">{plant.name || "Unknown Plant"}</h4>
            <p className="text-xs text-gray-500">{plant.category || "General"}</p>
        </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-8 font-sans">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-green-800 mb-6 font-bold hover:underline">
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-green-100 mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-700 shadow-inner">
            <User size={48} />
          </div>
          
          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
                <h1 className="text-3xl font-bold text-green-900">{userData.name}</h1>
                {userData.role === 'admin' && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-yellow-200">
                        <ShieldCheck size={14} /> SUPER ADMIN
                    </span>
                )}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 mt-1">
                <Mail size={16} /> <span>{userData.email}</span>
            </div>
            <div className="mt-4 flex gap-3 justify-center md:justify-start">
                <button onClick={() => navigate('/forgot-password')} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 border border-blue-200 transition">
                    <Key size={14}/> Change Password
                </button>
                <button onClick={handleLogout} className="flex items-center gap-1 text-sm bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 border border-red-200 transition">
                    <LogOut size={14}/> Logout
                </button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="flex gap-6 mb-6 border-b border-gray-200 overflow-x-auto">
            {/* Tab 1: Favorites */}
            <button 
                onClick={() => setActiveTab("favorites")} 
                className={`flex items-center gap-2 pb-3 text-lg font-bold transition-all relative whitespace-nowrap ${activeTab === "favorites" ? "text-green-700" : "text-gray-400 hover:text-green-600"}`}
            >
                <Heart size={20} className={activeTab === "favorites" ? "fill-current" : ""}/> Favorites
                {activeTab === "favorites" && <span className="absolute bottom-0 left-0 w-full h-1 bg-green-700 rounded-t-md"></span>}
            </button>
            
            {/* Tab 2: History */}
            <button 
                onClick={() => setActiveTab("history")} 
                className={`flex items-center gap-2 pb-3 text-lg font-bold transition-all relative whitespace-nowrap ${activeTab === "history" ? "text-blue-700" : "text-gray-400 hover:text-blue-600"}`}
            >
                <Clock size={20}/> History
                {activeTab === "history" && <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-700 rounded-t-md"></span>}
            </button>

            {/* ✅ Tab 3: Approved Plants (Only Visible to Admin) */}
            {userData.role === 'admin' && (
                <button 
                    onClick={() => setActiveTab("approvals")} 
                    className={`flex items-center gap-2 pb-3 text-lg font-bold transition-all relative whitespace-nowrap ${activeTab === "approvals" ? "text-yellow-600" : "text-gray-400 hover:text-yellow-600"}`}
                >
                    <CheckCircle size={20}/> My Approved Plants
                    {activeTab === "approvals" && <span className="absolute bottom-0 left-0 w-full h-1 bg-yellow-600 rounded-t-md"></span>}
                </button>
            )}
        </div>

        {/* Grid Content based on Active Tab */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Case 1: Favorites */}
            {activeTab === "favorites" && (
                userData.favorites && userData.favorites.length > 0 ? (
                    userData.favorites.map((p, i) => <PlantCard key={p?._id || i} plant={p} />)
                ) : (
                    <div className="col-span-3 text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                        <Heart size={40} className="mx-auto mb-2 opacity-20" />
                        <p>No favorites yet.</p>
                    </div>
                )
            )}

            {/* Case 2: History */}
            {activeTab === "history" && (
                userData.history && userData.history.length > 0 ? (
                    userData.history.map((p, i) => <PlantCard key={p?._id || i} plant={p} />)
                ) : (
                    <div className="col-span-3 text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                        <Clock size={40} className="mx-auto mb-2 opacity-20" />
                        <p>No recently viewed plants.</p>
                    </div>
                )
            )}

            {/* ✅ Case 3: Admin Approved Plants */}
            {activeTab === "approvals" && (
                adminPlants.length > 0 ? (
                    adminPlants.map((p, i) => <PlantCard key={p?._id || i} plant={p} />)
                ) : (
                    <div className="col-span-3 text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                        <CheckCircle size={40} className="mx-auto mb-2 opacity-20" />
                        <p>No approved plants found.</p>
                    </div>
                )
            )}

        </div>
      </div>
    </div>
  );
}

export default Profile;