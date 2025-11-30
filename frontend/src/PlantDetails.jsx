import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom'; // useParams add kiya
import axios from 'axios';
import { ArrowLeft, MapPin, Leaf, ShieldAlert, Activity, Box, Trash2, Sprout, Info } from 'lucide-react';
import Plant3D from './Plant3D';

function PlantDetails() {
  const { id } = useParams(); // URL se ID nikalo (Refresh fix)
  const location = useLocation();
  const navigate = useNavigate();
  
  // State initialization
  const [plant, setPlant] = useState(location.state || null);
  const [show3D, setShow3D] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(!location.state);

  // User Check
  const user = JSON.parse(localStorage.getItem('user'));
  const BASE_URL = 'http://localhost:5000'; 

  // ✅ 1. DATA FETCH EFFECT (Refresh Handling)
  useEffect(() => {
    // Agar plant pehle se state mein hai (Navigation se aaya hai)
    if (plant) {
        if (plant.images?.length > 0) setActiveImage(plant.images[0]);
        setLoading(false);
        return;
    }

    // Agar Refresh kiya hai, to API se fetch karo
    axios.get(`${BASE_URL}/api/plants/${id}`)
      .then(res => {
        setPlant(res.data);
        if (res.data.images?.length > 0) setActiveImage(res.data.images[0]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  }, [id, plant]);

  // ✅ 2. HISTORY UPDATE EFFECT
  useEffect(() => {
    if (!plant || !user) return;

    // History API call
    axios.put(`${BASE_URL}/api/auth/history`, {
        userId: user.id,
        plantId: plant._id
    }).catch(err => console.error("History save failed:", err));
    
  }, [plant, user]); // Dependency array fix

  // ✅ 3. DELETE FUNCTION (FIXED: Added Token)
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${plant.name}? This cannot be undone.`)) return;

    const token = localStorage.getItem('token'); // 🔑 Token nikalo

    if (!token) {
        alert("You are not authorized! Please login.");
        return;
    }

    try {
      await axios.delete(`${BASE_URL}/api/plants/${plant._id}`, {
        headers: { Authorization: `Bearer ${token}` } // 👈 YE LINE ZAROORI HAI
      });

      alert("🗑️ Plant Deleted Successfully!");
      navigate('/');
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete plant. Check console.");
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl font-bold text-green-800 animate-pulse">Loading Plant Details...</div>;
  if (!plant) return <div className="text-center mt-20 text-xl font-semibold text-red-600">Plant Not Found.</div>;

  // 3D Logic
  const selected3DIndex = plant.selected3DImageIndex || 0;
  const imageFor3D = plant.images && plant.images[selected3DIndex] 
    ? `${BASE_URL}${plant.images[selected3DIndex]}`
    : `${BASE_URL}${activeImage}`;

  const getFullUrl = (path) => path?.startsWith('http') ? path : `${BASE_URL}${path}`;

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-8 font-sans">
      
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition shadow-md font-medium"
        >
          <ArrowLeft size={20} /> Back
        </button>

        {/* ✅ DELETE BUTTON (Admin Only) */}
        {user && user.role === 'admin' && (
          <button onClick={handleDelete} className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition font-bold border border-red-200">
            <Trash2 size={20} /> Delete Plant
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-green-100">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          
          {/* --- LEFT: IMAGES & 3D --- */}
          <div className="lg:w-1/2 bg-gray-100 p-6 flex flex-col gap-4">
            <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-sm bg-white relative flex items-center justify-center border border-gray-200">
              {show3D ? (
                <Plant3D image={imageFor3D} />
              ) : (
                <img 
                  src={getFullUrl(activeImage)} 
                  alt={plant.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/600x600?text=No+Image"; }}
                />
              )}

              <button 
                onClick={() => setShow3D(!show3D)}
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 text-green-800 px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-white transition-all z-10 border border-green-200 backdrop-blur-md"
              >
                {show3D ? <><Leaf size={20}/> Show Photo</> : <><Box size={20}/> View in 3D Space</>}
              </button>
            </div>

            {/* Thumbnails */}
            {plant.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide">
                {plant.images.map((img, index) => (
                  <div 
                    key={index}
                    onClick={() => { setActiveImage(img); setShow3D(false); }}
                    className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all shadow-sm ${
                      activeImage === img ? "border-green-600 scale-105 ring-2 ring-green-200" : "border-white opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={getFullUrl(img)} className="w-full h-full object-cover" alt="thumb" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- RIGHT: DETAILS --- */}
          <div className="lg:w-1/2 p-8 md:p-12 flex flex-col gap-6 bg-white">
            
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-2">{plant.name}</h1>
              <p className="text-xl text-green-600 italic font-medium">{plant.botanicalName}</p>
              
              {/* Category Badge */}
              <span className="inline-block mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                 Category: {plant.category || "General"}
              </span>
            </div>

            {/* Uses */}
            <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
              <h3 className="font-bold text-green-800 flex items-center gap-2 mb-3 text-lg">
                <Activity size={20} className="text-green-600" /> Medicinal Uses
              </h3>
              <div className="flex flex-wrap gap-2">
                {plant.uses?.length > 0 ? (
                  plant.uses.map((use, index) => (
                    <span key={index} className="bg-white text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200 shadow-sm">
                      {use}
                    </span>
                  ))
                ) : <span className="text-green-600 italic">Not specified</span>}
              </div>
            </div>

            {/* Region & Parts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-2 text-lg">
                  <MapPin size={20} className="text-blue-600" /> Region
                </h3>
                <p className="text-blue-900 font-medium text-lg">{plant.region || "Not specified"}</p>
              </div>

              <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-2 text-lg">
                  <Sprout size={20} className="text-orange-600" /> Part Used
                </h3>
                <p className="text-orange-900 font-medium text-lg">
                  {plant.partsUsed || "Whole Plant"}
                </p>
              </div>
            </div>

            {/* Side Effects */}
            {plant.sideEffects && (
              <div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex items-start gap-3">
                <ShieldAlert className="text-red-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-red-800 mb-1 text-lg">Side Effects / Caution</h3>
                  <p className="text-red-900 leading-relaxed">{plant.sideEffects}</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-2 border-t pt-6 border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2 text-lg">
                <Info size={20} className="text-gray-600" /> Description
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg text-justify">{plant.description}</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default PlantDetails;