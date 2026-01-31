import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Leaf,
  ShieldAlert,
  Activity,
  Box,
  Trash2,
  Sprout,
  Info,
  Pencil,
} from "lucide-react";
import Plant3D from "./Plant3D";

const FALLBACK_IMG = "/placeholder.png";
const BASE_URL = "http://localhost:5000";

function PlantDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [plant, setPlant] = useState(location.state || null);
  const [show3D, setShow3D] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  const buildImageUrl = (value, plantId) => {
    if (!value) return "";
    const v = String(value).trim();
    if (/^https?:\/\//i.test(v)) return v;
    // ✅ cache-bust by updated time/id to force latest image
    return `${BASE_URL}/images/${encodeURIComponent(v)}?v=${plantId || Date.now()}`;
  };

  const getImagesFromPlant = (p) => {
    if (!p) return [];
    const plantId = p?._id;
    return [
      buildImageUrl(p?.["Image 1"], plantId),
      buildImageUrl(p?.["Image 2"], plantId),
      buildImageUrl(p?.["Image 3"], plantId),
      buildImageUrl(p?.["Image 4"], plantId),
    ].filter(Boolean);
  };

  // ✅ ALWAYS FETCH LATEST FROM API (fix)
  useEffect(() => {
    const fetchPlant = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/plants/${id}`);
        setPlant(res.data);

        const imgs = getImagesFromPlant(res.data);
        setActiveImage(imgs[0] || "");
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ✅ history (same)
  useEffect(() => {
    if (!plant || !user) return;

    axios
      .put(`${BASE_URL}/api/auth/history`, {
        userId: user.id,
        plantId: plant._id,
      })
      .catch((err) => console.error("History save failed:", err));
  }, [plant, user]);

  const images = getImagesFromPlant(plant);

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${plant?.["Common Name"]}? This cannot be undone.`
      )
    )
      return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not authorized! Please login.");
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/api/plants/${plant._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("🗑️ Plant Deleted Successfully!");
      navigate("/");
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete plant. Check console.");
    }
  };

  const goEditField = (field) => {
    // ✅ IMPORTANT: do not rely on state for latest values
    navigate(`/admin/plants/${plant._id}/edit?field=${encodeURIComponent(field)}`);
  };

  const EditIcon = ({ field }) => {
    if (!user || user.role !== "admin") return null;

    return (
      <button
        type="button"
        onClick={() => goEditField(field)}
        className="p-1 rounded-md hover:bg-white/60 transition"
        title={`Edit ${field}`}
      >
        <Pencil size={18} className="text-gray-600 hover:text-blue-600" />
      </button>
    );
  };

  if (loading)
    return (
      <div className="text-center mt-20 text-xl font-bold text-green-800 animate-pulse">
        Loading Plant Details...
      </div>
    );

  if (!plant)
    return <div className="text-center mt-20 text-xl font-semibold text-red-600">Plant Not Found.</div>;

  const imageFor3D = plant?.["3D Model Link"] || activeImage || FALLBACK_IMG;

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition shadow-md font-medium"
        >
          <ArrowLeft size={20} /> Back
        </button>

        {user && user.role === "admin" && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/admin/plants/${plant._id}/edit`)}
              className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition font-bold border border-blue-200"
            >
              <Pencil size={20} /> Edit Plant
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition font-bold border border-red-200"
            >
              <Trash2 size={20} /> Delete Plant
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-green-100">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* LEFT: IMAGES */}
          <div className="lg:w-1/2 bg-gray-100 p-6 flex flex-col gap-4">
            <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-sm bg-white relative flex items-center justify-center border border-gray-200">
              {show3D ? (
                <Plant3D image={imageFor3D} />
              ) : (
                <img
                  src={activeImage || FALLBACK_IMG}
                  alt={plant?.["Common Name"] || "Plant"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />
              )}

              <button
                onClick={() => setShow3D(!show3D)}
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 text-green-800 px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-white transition-all z-10 border border-green-200 backdrop-blur-md"
              >
                {show3D ? (
                  <>
                    <Leaf size={20} /> Show Photo
                  </>
                ) : (
                  <>
                    <Box size={20} /> View in 3D Space
                  </>
                )}
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide">
                {images.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setActiveImage(img);
                      setShow3D(false);
                    }}
                    className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all shadow-sm ${
                      activeImage === img
                        ? "border-green-600 scale-105 ring-2 ring-green-200"
                        : "border-white opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt="thumb"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMG;
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS */}
          <div className="lg:w-1/2 p-8 md:p-12 flex flex-col gap-6 bg-white">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-2">
                {plant?.["Common Name"]}
              </h1>
              <p className="text-xl text-green-600 italic font-medium">{plant?.["Scientific Name"]}</p>

              <span className="inline-block mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                Uses: {plant?.["Uses"] || "General"}
              </span>
            </div>

            {/* Medicinal Uses */}
            <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-green-800 flex items-center gap-2 text-lg">
                  <Activity size={20} className="text-green-600" /> Medicinal Uses
                </h3>
                <EditIcon field="Uses" />
              </div>

              <p className="text-green-800 leading-relaxed">{plant?.["Uses"] || "Not specified"}</p>
            </div>

            {/* Related + Advantages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-blue-800 flex items-center gap-2 text-lg">
                    <MapPin size={20} className="text-blue-600" /> Related Plants
                  </h3>
                  <EditIcon field="Related Plants" />
                </div>

                <p className="text-blue-900 font-medium text-lg">
                  {plant?.["Related Plants"] || "Not specified"}
                </p>
              </div>

              <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-orange-800 flex items-center gap-2 text-lg">
                    <Sprout size={20} className="text-orange-600" /> Advantages
                  </h3>
                  <EditIcon field="Advantages" />
                </div>

                <p className="text-orange-900 font-medium text-lg">
                  {plant?.["Advantages"] || "Not specified"}
                </p>
              </div>
            </div>

            {/* Side Effects */}
            <div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex items-start gap-3">
              <ShieldAlert className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-red-800 mb-1 text-lg">Side Effects / Caution</h3>
                  <EditIcon field="Side Effects" />
                </div>
                <p className="text-red-900 leading-relaxed">{plant?.["Side Effects"] || "Not specified"}</p>
              </div>
            </div>

            {/* Description + Disadvantages */}
            <div className="mt-2 border-t pt-6 border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                  <Info size={20} className="text-gray-600" /> Description
                </h3>
                <EditIcon field="Description" />
              </div>

              <p className="text-gray-700 leading-relaxed text-lg text-justify">
                {plant?.["Description"] || "Not specified"}
              </p>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800 text-lg">Disadvantages</h3>
                  <EditIcon field="Disadvantages" />
                </div>

                <p className="text-gray-700 leading-relaxed text-lg text-justify">
                  {plant?.["Disadvantages"] || "Not specified"}
                </p>
              </div>
            </div>
          </div>
          {/* RIGHT END */}
        </div>
      </div>
    </div>
  );
}

export default PlantDetails;
