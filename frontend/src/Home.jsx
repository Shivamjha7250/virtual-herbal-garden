import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Leaf,
  Heart,
  PlusCircle,
  LogOut,
  LayoutGrid,
  ArrowRight,
  ShieldCheck,
  User,
  Shield,
  Sparkles,
  Activity,
  Wind,
  Clock,
  AlertTriangle,
  SlidersHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "./config/api";
import { mapPlant } from "./utils/plantMapper";

const FALLBACK_IMG = "/placeholder.png";

function Home() {
  const navigate = useNavigate();

  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const [history, setHistory] = useState([]); 
  const [activeTab, setActiveTab] = useState("explore"); 

  const categories = [
    { name: "All", icon: <LayoutGrid size={18} /> },
    { name: "General", icon: <Leaf size={18} /> }, 
    { name: "Immunity", icon: <Shield size={18} /> },
    { name: "Skin Care", icon: <Sparkles size={18} /> },
    { name: "Digestion", icon: <Activity size={18} /> },
    { name: "Respiratory", icon: <Wind size={18} /> },
  ];

  const buildImageUrl = (value, plantId) => {
    if (!value) return FALLBACK_IMG;
    const v = String(value).trim();
    if (/^https?:\/\//i.test(v)) return v;
    if (v.startsWith("/images/")) return `${BASE_URL}${v}`;
    return `${BASE_URL}/images/${encodeURIComponent(v)}?v=${plantId || Date.now()}`;
  };

  const getHistoryKey = (u) => {
    const id = u?.id || u?._id || "guest";
    return `searchHistory_${id}`;
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser) setUser(storedUser);

    fetchPlants();

    if (storedUser) {
      fetchUserData(storedUser.id || storedUser._id);
    } else {

      const guestHistory = JSON.parse(localStorage.getItem("searchHistory_guest") || "[]");
      setHistory(guestHistory);
    }
  }, []);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/plants`);
      const mapped = (response.data || []).map(mapPlant);
      setPlants(mapped);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/user/${userId}`);
      setFavorites((res.data.favorites || []).map((f) => f._id || f));

      const dbHistoryIds = (res.data.history || []).map((h) => h?._id || h?.id || h).filter(Boolean);

      const localKey = getHistoryKey({ id: userId });
      const localHistory = JSON.parse(localStorage.getItem(localKey) || "[]");

      const merged = [...new Set([...dbHistoryIds, ...localHistory])].slice(0, 12);

      setHistory(merged);
      localStorage.setItem(localKey, JSON.stringify(merged));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = async (e, plantId) => {
    e.stopPropagation();
    if (!user) return navigate("/login");
    try {
      const res = await axios.put(`${BASE_URL}/api/auth/favorite`, {
        userId: user.id || user._id,
        plantId,
      });
      setFavorites(res.data.favorites || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePlantClick = async (plant) => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");

    const key = currentUser ? getHistoryKey(currentUser) : "searchHistory_guest";
    let currentHistory = JSON.parse(localStorage.getItem(key) || "[]");
    const filtered = currentHistory.filter((pid) => pid !== plant.id);
    const newHistory = [plant.id, ...filtered].slice(0, 12);

    localStorage.setItem(key, JSON.stringify(newHistory));
    setHistory(newHistory);

    try {
      const token = localStorage.getItem("token");
      if (token && currentUser?.id && plant?.id) {
        await axios.put(
          `${BASE_URL}/api/auth/history`,
          { userId: currentUser.id, plantId: plant.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      
      console.log("History DB save failed:", err?.response?.data || err?.message);
    }

    navigate(`/plant/${plant.id}`);
  };

  const filteredPlants = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const matchesTerm = (p) => {
      if (!term) return true;
      const name = (p?.name || "").toLowerCase();
      const sci = (p?.scientificName || "").toLowerCase();
      const uses = (p?.uses || "").toLowerCase();
      return name.includes(term) || sci.includes(term) || uses.includes(term);
    };

    const matchesCategory = (p) => {
      if (activeTab !== "explore") return true;

      if (selectedCategory === "All") return true;

      if (selectedCategory === "General") return true;

      const c = String(p?.category || "General").trim().toLowerCase();
      return c === selectedCategory.toLowerCase();
    };

    if (activeTab === "explore") return plants.filter((p) => matchesTerm(p) && matchesCategory(p));

    if (activeTab === "favorites") return plants.filter((p) => matchesTerm(p) && favorites.includes(p.id));

    if (activeTab === "history") {
      const mapById = new Map(plants.map((p) => [p.id, p]));
      const ordered = history.map((pid) => mapById.get(pid)).filter(Boolean);
      return ordered.filter((p) => matchesTerm(p));
    }

    return plants.filter((p) => matchesTerm(p));
  }, [activeTab, favorites, history, plants, searchTerm, selectedCategory]);

  const pageTitle =
    activeTab === "explore" ? "Botanical Archive" : activeTab === "favorites" ? "Your Favorites" : "Recent History";

  const handleLogout = () => {
  
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50 flex flex-col md:flex-row font-sans">
    
      <style>{`
        .grass-area{
          position: relative;
          border-radius: 30px;
          overflow: hidden;
          padding: 36px;
          border: 1px solid rgba(15,23,42,.10);
          box-shadow: 0 24px 70px rgba(15,23,42,.10);

          background-image: url('/grass-bg.jpg');
          background-repeat: repeat;
          background-size: 520px 520px;
          background-position: center;
        }

        .grass-area::before{
          content:"";
          position:absolute;
          left:0; right:0; top:0;
          height: 135px;

          background-image: url('/grass-edge.png');
          background-repeat: repeat-x;
          background-size: auto 135px;
          background-position: top center;

          pointer-events:none;
          z-index: 1;
          opacity: .98;
        }

        .grass-area::after{
          content:"";
          position:absolute;
          left:0; right:0; bottom:0;
          height: 135px;

          background-image: url('/grass-edge.png');
          background-repeat: repeat-x;
          background-size: auto 135px;
          background-position: bottom center;

          transform: scaleY(-1);
          transform-origin: center;

          pointer-events:none;
          z-index: 1;
          opacity: .98;
        }

        .grass-content{
          position: relative;
          z-index: 2;
        }

        @media (max-width: 640px){
          .grass-area{
            padding: 18px;
            border-radius: 22px;
          }
          .grass-area::before,
          .grass-area::after{
            height: 90px;
            background-size: auto 90px;
          }
        }
      `}</style>

      <aside className="w-full md:w-72 bg-white/80 backdrop-blur border-r border-slate-200 p-6 flex flex-col gap-8 md:sticky md:top-0 md:h-screen z-50">
        <div
          className="flex items-center gap-3 px-2 cursor-pointer"
          onClick={() => {
            setActiveTab("explore");
            setSelectedCategory("All");
          }}
        >
          <div className="bg-green-700 p-2 rounded-xl text-white shadow-lg">
            <Leaf size={24} />
          </div>
          <div>
            <h1 className="font-black text-lg text-slate-900 tracking-tighter uppercase leading-none">Virtual Garden</h1>
            <p className="text-xs text-slate-500 font-semibold">Explore • Save • Learn</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-grow overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Library</p>

          <NavItem
            icon={<LayoutGrid size={18} />}
            label="All Specimens"
            active={activeTab === "explore"}
            onClick={() => {
              setActiveTab("explore");
              setSearchTerm("");
            }}
          />

          {user && (
            <>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mt-6 mb-2">Personal</p>

              <NavItem
                icon={<Heart size={18} />}
                label="My Favorites"
                active={activeTab === "favorites"}
                onClick={() => {
                  setActiveTab("favorites");
                  setSearchTerm("");
                }}
              />

              <NavItem
                icon={<Clock size={18} />}
                label="History"
                active={activeTab === "history"}
                onClick={() => {
                  setActiveTab("history");
                  setSearchTerm("");
                }}
              />

              <NavItem icon={<User size={18} />} label="Profile Settings" onClick={() => navigate("/profile")} />

              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mt-6 mb-2">
                Admin/users
              </p>
              <NavItem icon={<PlusCircle size={18} />} label="Add your Plant" onClick={() => navigate("/add")} />
              {user.role === "admin" && (
                <NavItem
                  icon={<ShieldCheck size={18} />}
                  label="Admin Panel"
                  onClick={() => navigate("/admin")}
                  highlight
                />
              )}
            </>
          )}
        </nav>

        <div className="pt-4 border-t border-slate-100">
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-all w-full"
            >
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg hover:opacity-95 transition"
            >
              Login
            </button>
          )}
        </div>
      </aside>

      <main className="flex-grow p-6 md:p-10 overflow-y-auto">
        <div className="sticky top-0 z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-4 bg-white/70 backdrop-blur border-b border-slate-200">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-950 uppercase tracking-tight">{pageTitle}</h2>
              <p className="text-sm text-slate-500 font-semibold mt-1">
                {activeTab === "explore"
                  ? "Search plants by name, scientific name, or uses."
                  : activeTab === "favorites"
                  ? "Your saved plants in one place."
                  : "Recently viewed plants (latest first)."}
              </p>
            </div>

            {activeTab === "explore" && (
              <div className="hidden md:flex items-center gap-2 text-slate-500 font-bold">
                <SlidersHorizontal size={18} />
                <span className="text-sm">Filters</span>
              </div>
            )}
          </div>

          <div className="relative mt-5 max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-300 font-semibold text-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {activeTab === "explore" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 mt-5">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all border ${
                    selectedCategory === cat.name
                      ? "bg-green-700 text-white border-green-700 shadow-md"
                      : "bg-white text-slate-700 border-slate-200 hover:border-green-200"
                  }`}
                >
                  {cat.icon} <span className="text-sm">{cat.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <div className="pt-8">
          <div className="grass-area">
            <div className="grass-content">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-80 bg-white/70 rounded-[2.5rem] animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  <AnimatePresence mode="popLayout">
                    {filteredPlants.length > 0 ? (
                      filteredPlants.map((plant) => (
                        <PlantCard
                          key={plant.id}
                          plant={plant}
                          onClick={() => handlePlantClick(plant)}
                          isFav={favorites.includes(plant.id)}
                          onFav={toggleFavorite}
                          imageUrl={buildImageUrl(plant?.images?.[0], plant?.id)}
                        />
                      ))
                    ) : (
                      <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-16 text-center bg-white/90 rounded-[3rem] border border-dashed border-white/60"
                      >
                        <AlertTriangle className="mx-auto text-amber-400 mb-4" size={48} />
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Empty Section</h3>
                        <p className="text-slate-600 font-semibold">
                          No specimens found in your <span className="font-black">{activeTab}</span>.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ icon, label, onClick, active, highlight }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all w-full text-left ${
      active
        ? "bg-green-700 text-white shadow-md"
        : highlight
        ? "bg-amber-50 text-amber-700 border border-amber-200"
        : "text-slate-600 hover:bg-slate-50"
    }`}
  >
    {icon} <span className="text-sm">{label}</span>
  </button>
);

const PlantCard = ({ plant, onClick, isFav, onFav, imageUrl }) => {
  const uses = (plant?.uses || "").trim();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      onClick={onClick}
      className="bg-white group p-4 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all cursor-pointer relative border border-white/70"
    >
      <button
        onClick={(e) => onFav(e, plant.id)}
        className="absolute top-6 right-6 z-20 p-3 rounded-full backdrop-blur-md bg-white/80 border border-white shadow-lg hover:scale-110 transition-transform"
        title={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart size={20} className={isFav ? "fill-red-500 text-red-500" : "text-slate-400"} />
      </button>

      <div className="h-52 rounded-[2rem] overflow-hidden mb-5 bg-slate-100">
        <img
          src={imageUrl || FALLBACK_IMG}
          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
          alt={plant?.name || "Plant"}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMG;
          }}
        />
      </div>

      <div className="px-2">
        <h4 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight line-clamp-1">
          {plant?.name}
        </h4>

        <p className="text-green-700 text-[10px] font-black italic mb-3 uppercase tracking-widest truncate">
          {plant?.scientificName || "Not specified"}
        </p>

        {uses && (
          <p className="text-xs text-slate-600 font-semibold line-clamp-2">
            {uses.length > 90 ? uses.slice(0, 90) + "..." : uses}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
            {plant?.advantages ? "Benefits" : "Herbarium"}
          </span>
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:bg-green-700 transition-all shadow-md">
            <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;