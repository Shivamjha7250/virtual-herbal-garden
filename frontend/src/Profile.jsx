import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Heart, LogOut, ArrowLeft, Clock, Key } from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("favorites");
  const BASE_URL = 'http://localhost:5000'; 

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    const user = JSON.parse(storedUser);
    
    axios.get(`${BASE_URL}/api/auth/user/${user.id}`)
      .then(res => setUserData(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    navigate('/'); window.location.reload();
  };

  if (!userData) return <div className="text-center mt-20">Loading...</div>;

  const PlantCard = ({ plant }) => (
    <div onClick={() => navigate(`/plant/${plant._id}`, { state: plant })} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 overflow-hidden flex items-center p-2 gap-3">
      <img src={`${BASE_URL}${plant.images[0]}`} alt={plant.name} className="w-16 h-16 rounded-lg object-cover" onError={(e) => e.target.src="https://via.placeholder.com/100"} />
      <div><h4 className="font-bold text-green-900">{plant.name}</h4><p className="text-xs text-gray-500">{plant.category}</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-8 font-sans">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-green-800 mb-6 font-bold hover:underline"><ArrowLeft size={20} /> Back</button>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-green-100 mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-700"><User size={48} /></div>
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl font-bold text-green-900">{userData.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 mt-1"><Mail size={16} /> <span>{userData.email}</span></div>
            <div className="mt-4 flex gap-3 justify-center md:justify-start">
                <button onClick={() => navigate('/forgot-password')} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 border border-blue-200"><Key size={14}/> Change Password</button>
                <button onClick={handleLogout} className="flex items-center gap-1 text-sm bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 border border-red-200"><LogOut size={14}/> Logout</button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6 border-b border-gray-200 pb-2">
            <button onClick={() => setActiveTab("favorites")} className={`flex items-center gap-2 pb-2 text-lg font-bold transition ${activeTab === "favorites" ? "text-green-700 border-b-4 border-green-700" : "text-gray-400"}`}><Heart size={20}/> Favorites</button>
            <button onClick={() => setActiveTab("history")} className={`flex items-center gap-2 pb-2 text-lg font-bold transition ${activeTab === "history" ? "text-blue-700 border-b-4 border-blue-700" : "text-gray-400"}`}><Clock size={20}/> History</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTab === "favorites" ? (
                userData.favorites.length > 0 ? userData.favorites.map(p => <PlantCard key={p._id} plant={p} />) : <p className="col-span-3 text-center text-gray-500">No favorites yet.</p>
            ) : (
                userData.history.length > 0 ? userData.history.map(p => <PlantCard key={p._id} plant={p} />) : <p className="col-span-3 text-center text-gray-500">No history yet.</p>
            )}
        </div>
      </div>
    </div>
  );
}
export default Profile;