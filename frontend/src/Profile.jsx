import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  LogOut,
  ArrowLeft,
  Key,
  ShieldCheck,
  CheckCircle,
  Edit3,
} from "lucide-react";
import { BASE_URL } from "./config/api";
import { mapPlant } from "./utils/plantMapper";

const FALLBACK_IMG = "/placeholder.png";

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [adminPlants, setAdminPlants] = useState([]);

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const localUser = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  const buildImageUrl = (value) => {
    if (!value) return FALLBACK_IMG;
    const v = String(value).trim();
    if (/^https?:\/\//i.test(v)) return v;
    if (v.startsWith("/images/")) return `${BASE_URL}${v}`;
    return `${BASE_URL}/images/${encodeURIComponent(v)}`;
  };

  useEffect(() => {
    if (!localUser || !token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${BASE_URL}/api/auth/user/${localUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUserData(res.data))
      .catch((err) => {
        console.error("Profile fetch error:", err);
        handleLogout();
      });

    if (localUser.role === "admin") {
      axios
        .get(`${BASE_URL}/api/auth/admin/approved-plants`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const mapped = (res.data || []).map(mapPlant);
          setAdminPlants(mapped);
        })
        .catch((err) => console.error("Admin Plants Fetch Error", err));
    }

  }, []);

  if (!userData)
    return (
      <div className="flex justify-center items-center h-screen bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );

  const PlantCard = ({ plant }) => (
    <div
      onClick={() => navigate(`/plant/${plant.id}`)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 overflow-hidden flex items-center p-2 gap-3"
    >
      <img
        src={buildImageUrl(plant?.images?.[0])}
        alt={plant?.name || "Plant"}
        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
        onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
      />
      <div>
        <h4 className="font-bold text-green-900">{plant?.name}</h4>
        <p className="text-xs text-gray-500">{plant?.uses || "General"}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50 p-4 md:p-8 font-sans">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-green-800 mb-6 font-bold hover:underline"
      >
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-green-100 mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-700 shadow-inner">
            <User size={48} />
          </div>

          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h1 className="text-3xl font-bold text-green-900">{userData.name}</h1>

              {userData.role === "admin" && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-yellow-200">
                  <ShieldCheck size={14} /> SUPER ADMIN
                </span>
              )}
            </div>

            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 mt-1">
              <Mail size={16} /> <span>{userData.email}</span>
            </div>

            <div className="mt-4 flex gap-3 justify-center md:justify-start flex-wrap">
              <button
                onClick={() => navigate("/forgot-password")}
                className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 border border-blue-200 transition"
              >
                <Key size={14} /> Change Password
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 border border-red-200 transition"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </div>
        {userData.role === "admin" && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} className="text-yellow-600" />
              <h2 className="text-xl font-bold text-yellow-700">
                My Approved Plants
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminPlants.length > 0 ? (
                adminPlants.map((p) => <PlantCard key={p.id} plant={p} />)
              ) : (
                <div className="col-span-3 text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                  <CheckCircle size={40} className="mx-auto mb-2 opacity-20" />
                  <p>No approved plants found.</p>
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-12 bg-white p-6 rounded-2xl border border-green-100 shadow-sm text-center">
          <h3 className="font-bold text-green-800 text-lg mb-2">
            More Features Coming Soon
          </h3>
          <p className="text-sm text-gray-500">
            You can add account settings, activity logs, badges, plant
            contributions history, and more here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;