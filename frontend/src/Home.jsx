import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Leaf, Menu, Shield, Heart, Activity, Wind, Sparkles, Stethoscope, User, LogOut, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // User State
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const navigate = useNavigate();
  
  // ✅ PC Testing ke liye localhost
  const BASE_URL = 'http://localhost:5000'; 

  const categories = [
    { name: "All", icon: <Leaf size={18} /> },
    { name: "General health", icon: <Stethoscope size={18} /> },
    { name: "Immunity", icon: <Shield size={18} /> },
    { name: "Skin Care", icon: <Sparkles size={18} /> },
    { name: "Digestion", icon: <Activity size={18} /> },
    { name: "Respiratory", icon: <Wind size={18} /> },
    { name: "Heart Health", icon: <Heart size={18} /> },
  ];

  useEffect(() => {
    // 1. SAFE LOGIN CHECK (Kachra data saaf karne wala logic)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Agar data sahi hai tabhi set karo, nahi toh logout kar do
        if (userData && userData.name) {
          setUser(userData);
          fetchUserData(userData.id);
        } else {
          localStorage.removeItem('user'); // Bad data clear
        }
      } catch (e) {
        console.error("Login Data Error:", e);
        localStorage.removeItem('user'); // Bad data clear
      }
    }
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/plants`);
      setPlants(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/user/${userId}`);
      const favIds = res.data.favorites.map(f => f._id || f); 
      setFavorites(favIds);
    } catch (error) { console.error(error); }
  };

  const toggleFavorite = async (e, plantId) => {
    e.stopPropagation();
    if (!user) {
      alert("Please Login to add Favorites! ❤️");
      navigate('/login');
      return;
    }
    try {
      const res = await axios.put(`${BASE_URL}/api/auth/favorite`, { userId: user.id, plantId });
      setFavorites(res.data.favorites); 
    } catch (error) { console.error(error); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setFavorites([]);
    window.location.reload();
  };

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          plant.botanicalName.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesCategory = selectedCategory === "All" ? true : 
      (plant.category === selectedCategory || (plant.uses && plant.uses.some(u => u.includes(selectedCategory))));
    return matchesSearch && matchesCategory;
  });

  // Image URL Helper
  const getImageUrl = (plant) => {
    let imgPath = "";
    if (plant.images && plant.images.length > 0) imgPath = plant.images[0];
    else if (plant.imageURL) imgPath = plant.imageURL;
    
    if (!imgPath) return "https://via.placeholder.com/400x300?text=No+Image";
    return imgPath.startsWith('http') ? imgPath : `${BASE_URL}${imgPath}`;
  };

  return (
    <div className="min-h-screen bg-green-50 font-sans">
      
      {/* --- FIXED NAVBAR --- */}
      <nav className="bg-green-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Logo */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 cursor-pointer" onClick={()=>navigate('/')}>
                <Leaf className="text-green-300" /> Virtual Herbal Garden
              </h1>
              {/* Mobile User Icon */}
              <div className="flex md:hidden gap-3 items-center">
                 {user ? <User size={24} onClick={()=>navigate('/profile')}/> : <User size={24} onClick={()=>navigate('/login')}/>}
              </div>
            </div>

            {/* Search & Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              
              {/* Search Bar */}
              <div className="relative flex-grow md:flex-grow-0">
                <input 
                  className="w-full md:w-64 px-4 py-2 pl-4 pr-10 rounded-full text-black outline-none focus:ring-2 focus:ring-green-400" 
                  placeholder="Search..." 
                  value={searchTerm} 
                  onChange={(e)=>setSearchTerm(e.target.value)} 
                />
                <Search className="absolute right-3 top-2.5 text-gray-500" size={18} />
              </div>

              {/* ✅ USER LOGGED IN BUTTONS */}
              {user && user.name ? (
                <div className="flex items-center gap-2">
                  
                  {/* ✅ CHANGE 1: ADD PLANT BUTTON (Ab Sabke liye Visible hai) */}
                  {/* Pehle yahan 'user.role === admin' tha, ab sirf 'user' hai */}
                  {user && (
                    <button onClick={() => navigate('/add')} className="bg-yellow-400 text-yellow-900 p-2 rounded-full hover:bg-yellow-300 shadow-md" title="Add Plant">
                      <PlusCircle size={20}/>
                    </button>
                  )}

                  {/* ✅ Admin Panel Button (Yeh sirf Admin dekhega) */}
                  {user.role === 'admin' && (
                    <button onClick={() => navigate('/admin')} className="bg-white text-green-800 px-3 py-1.5 rounded-full font-bold text-sm hover:bg-gray-100">
                      🛡️ Admin
                    </button>
                  )}

                  {/* Profile Button */}
                  <button onClick={() => navigate('/profile')} className="bg-green-800 px-3 py-1.5 rounded-full text-white hover:bg-green-900 transition text-sm font-medium flex items-center gap-2">
                    <User size={16}/> {user.name.split(' ')[0]}
                  </button>
                  
                  {/* Logout */}
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 p-2 rounded-full text-white transition shadow-sm" title="Logout">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                // ✅ LOGIN BUTTON
                <button 
                  onClick={() => navigate('/login')} 
                  className="bg-white text-green-700 px-5 py-2 rounded-full font-bold hover:bg-gray-100 transition shadow-md whitespace-nowrap"
                >
                  Login
                </button>
              )}
            </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <div className="container mx-auto p-4 md:p-8">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-bold text-green-900 mb-2">Explore Nature's Pharmacy</h2>
          <p className="text-green-600 text-sm md:text-lg">
            {user ? "Welcome back! Check your favorites ❤️" : "Login to save your favorite plants & history."}
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button key={cat.name} onClick={() => setSelectedCategory(cat.name)} 
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium shadow-sm transition-all ${
                selectedCategory === cat.name ? "bg-green-700 text-white scale-105" : "bg-white text-green-800 border border-green-200 hover:bg-green-50"
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Plants Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-700"></div></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlants.length > 0 ? (
              filteredPlants.map((plant) => {
                const isFav = favorites.includes(plant._id);
                return (
                  <div key={plant._id} 
                       onClick={() => navigate(`/plant/${plant._id}`, { state: plant })} 
                       className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100 flex flex-col h-full cursor-pointer group relative overflow-hidden">
                    
                    <button 
                      onClick={(e) => toggleFavorite(e, plant._id)}
                      className="absolute top-3 right-3 z-10 p-2 bg-white/90 rounded-full shadow-md hover:scale-110 transition-all"
                    >
                      <Heart size={22} className={isFav ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"} />
                    </button>

                    <div className="h-52 overflow-hidden bg-gray-100 relative">
                      <img src={getImageUrl(plant)} alt={plant.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display = 'flex'; }} 
                      />
                      <div className="hidden absolute inset-0 items-center justify-center text-gray-400 bg-gray-100"><Leaf size={40} /></div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-green-900 group-hover:text-green-700 transition-colors">{plant.name}</h3>
                        <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full border border-green-100 font-medium">
                          {plant.category || "Medicinal"}
                        </span>
                      </div>
                      <p className="text-sm text-green-600 italic mb-3">{plant.botanicalName}</p>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">{plant.description}</p>
                      <button className="mt-auto w-full bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 active:scale-95 transition-all font-semibold shadow-green-200 shadow-lg">View Details</button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center text-gray-500 mt-10 flex flex-col items-center">
                <Leaf size={48} className="mb-4 text-green-200"/>
                <p className="text-xl">No plants found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;