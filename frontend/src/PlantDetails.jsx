import { useEffect, useMemo, useState } from "react";
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
  X,
  ZoomIn,
  BadgeCheck,
  Save,
} from "lucide-react";
import { BASE_URL } from "./config/api";
import { mapPlant } from "./utils/plantMapper";
import Plant3D from "./Plant3D";

const FALLBACK_IMG = "/placeholder.png";

function PlantDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [plant, setPlant] = useState(location.state || null);
  const [show3D, setShow3D] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [zoomOpen, setZoomOpen] = useState(false);

  const [editingMeta, setEditingMeta] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const categoriesList = ["General", "Immunity", "Skin Care", "Digestion", "Respiratory"];

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const buildImageUrl = (value, plantId) => {
    if (!value) return "";
    const v = String(value).trim();
    if (/^https?:\/\//i.test(v)) return v;
    return `${BASE_URL}/images/${encodeURIComponent(v)}?v=${plantId || Date.now()}`;
  };

  const getImagesFromPlant = (p) => {
    if (!p?.images) return [];
    return p.images.map((img) => buildImageUrl(img, p.id));
  };

  const fetchPlant = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/plants/${id}`);
      const mapped = mapPlant(res.data);
      setPlant(mapped);

      if (mapped.images?.length) {
        setActiveImage(buildImageUrl(mapped.images[0], mapped.id));
      } else {
        setActiveImage(FALLBACK_IMG);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlant();
  }, [id]);

  useEffect(() => {
    if (!plant || !user) return;

    axios
      .put(`${BASE_URL}/api/auth/history`, {
        userId: user.id || user._id,
        plantId: plant.id,
      })
      .catch((err) => console.error("History save failed:", err));
  }, [plant, user]);

  const images = useMemo(() => getImagesFromPlant(plant), [plant]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${plant?.name}? This cannot be undone.`)) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not authorized! Please login.");
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/api/plants/${plant.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(" Plant Deleted Successfully!");
      navigate("/");
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete plant. Check console.");
    }
  };


  const goEditField = (field) => {
    navigate(`/admin/plants/${plant.id}/edit?field=${encodeURIComponent(field)}`);
  };

  const EditIcon = ({ field }) => {
    if (!user || user.role !== "admin") return null;
    return (
      <button
        type="button"
        onClick={() => goEditField(field)}
        className="p-2 rounded-xl hover:bg-black/5 transition"
        title={`Edit ${field}`}
      >
        <Pencil size={18} className="text-gray-600 hover:text-blue-600" />
      </button>
    );
  };

  const currentCategory = useMemo(() => {
    return plant?.raw?.["Category"] || plant?.category || "General";
  }, [plant]);

  const currentRegion = useMemo(() => {
    return plant?.raw?.["Region"] || plant?.region || "";
  }, [plant]);

  const [meta, setMeta] = useState({ category: "General", region: "" });

  useEffect(() => {
    setMeta({
      category: currentCategory || "General",
      region: currentRegion || "",
    });
  }, [currentCategory, currentRegion]);

  const saveCategoryRegion = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login again");

    try {
      setSavingMeta(true);
      await axios.put(
        `${BASE_URL}/api/plants/admin/category/${plant.id}`,
        { category: meta.category, region: meta.region },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(" Category/Region Updated");
      setEditingMeta(false);

      await fetchPlant();
    } catch (err) {
      console.error("Category save error:", err);
      alert(err?.response?.data?.message || "Failed to update category/region");
    } finally {
      setSavingMeta(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setZoomOpen(false);
    };
    if (zoomOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOpen]);

  const imageFor3D = activeImage || FALLBACK_IMG;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-xl font-bold text-green-800 animate-pulse">Loading Plant Details...</div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-2xl font-bold text-red-600">Plant Not Found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white font-sans">
     
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-2xl bg-green-700 text-white px-4 py-2 shadow-sm hover:bg-green-800 transition"
          >
            <ArrowLeft size={20} /> Back
          </button>

          {user && user.role === "admin" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/admin/plants/${plant.id}/edit`)}
                className="flex items-center gap-2 rounded-2xl bg-blue-600 text-white px-4 py-2 shadow-sm hover:bg-blue-700 transition"
              >
                <Pencil size={18} /> Edit Plant
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-2xl bg-red-600 text-white px-4 py-2 shadow-sm hover:bg-red-700 transition"
              >
                <Trash2 size={18} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-green-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 bg-gray-50 p-6 border-r border-gray-100">
              <div className="relative w-full h-[420px] md:h-[560px] rounded-2xl overflow-hidden border bg-white shadow-sm group">
                {show3D ? (
                  <Plant3D image={imageFor3D} />
                ) : (
                  <button type="button" onClick={() => setZoomOpen(true)} className="w-full h-full relative">
                    <img
                      src={imageFor3D}
                      alt={plant?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                    />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                      <span className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/90 border border-gray-200 shadow-sm text-sm font-semibold text-gray-800">
                        <ZoomIn size={16} /> Zoom
                      </span>
                    </div>
                  </button>
                )}

                <div className="absolute inset-x-0 bottom-4 flex justify-center">
                  <button
                    onClick={() => setShow3D(!show3D)}
                    className="bg-white/90 text-green-900 px-5 py-3 rounded-2xl font-semibold shadow-lg border border-green-200 flex items-center gap-2 hover:bg-white transition"
                  >
                    {show3D ? (
                      <>
                        <Leaf size={18} /> Show Photo
                      </>
                    ) : (
                      <>
                        <Box size={18} /> View in 3D Space
                      </>
                    )}
                  </button>
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setActiveImage(img);
                        setShow3D(false);
                      }}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                        activeImage === img ? "border-green-600 ring-4 ring-green-100" : "border-white"
                      }`}
                      title={`Image ${index + 1}`}
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt="thumb"
                        onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold border border-green-200">
                  <Leaf size={14} /> Herbal
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold border border-purple-200">
                  <Leaf size={14} /> {currentCategory || "General"}
                </span>

                {currentRegion ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold border border-blue-200">
                    <MapPin size={14} /> {currentRegion}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold border border-blue-200">
                    <MapPin size={14} /> Details
                  </span>
                )}

                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold border border-orange-200">
                  <Sprout size={14} /> Benefits
                </span>

                {plant?.scientificName && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold border border-gray-200">
                    <BadgeCheck size={14} /> Identified
                  </span>
                )}
              </div>

              {user?.role === "admin" && (
                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                      <MapPin size={18} /> Category / Region
                    </h3>

                    <button
                      type="button"
                      onClick={() => setEditingMeta((v) => !v)}
                      className="px-3 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 font-bold text-sm"
                    >
                      {editingMeta ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500">Category</label>
                      <select
                        disabled={!editingMeta}
                        value={meta.category}
                        onChange={(e) => setMeta({ ...meta, category: e.target.value })}
                        className={`w-full mt-1 border rounded-xl p-3 bg-white ${
                          !editingMeta ? "opacity-70" : ""
                        }`}
                      >
                        {categoriesList.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500">Region</label>
                      <input
                        disabled={!editingMeta}
                        value={meta.region}
                        onChange={(e) => setMeta({ ...meta, region: e.target.value })}
                        className={`w-full mt-1 border rounded-xl p-3 ${!editingMeta ? "opacity-70" : ""}`}
                        placeholder="e.g. India"
                      />
                    </div>
                  </div>

                  {editingMeta && (
                    <button
                      type="button"
                      onClick={saveCategoryRegion}
                      disabled={savingMeta}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition disabled:opacity-60"
                    >
                      <Save size={18} /> {savingMeta ? "Saving..." : "Save"}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-7 p-8 md:p-10">
              <h1 className="text-4xl md:text-5xl font-black text-green-950">{plant?.name}</h1>
              <p className="mt-2 text-xl text-green-700 italic font-medium">
                {plant?.scientificName || "Not specified"}
              </p>

              <div className="mt-8 space-y-6">
               
                <div className="rounded-2xl border border-green-100 bg-green-50 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-green-900 flex items-center gap-2 text-lg">
                      <Activity size={20} /> Medicinal Uses
                    </h3>
                    <EditIcon field="Uses" />
                  </div>
                  <p className="mt-3 text-green-900 leading-relaxed">{plant?.uses || "Not specified"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-blue-900 flex gap-2 items-center text-lg">
                        <MapPin size={20} /> Related Plants
                      </h3>
                      <EditIcon field="Related Plants" />
                    </div>
                    <p className="mt-2 text-blue-900">{plant?.raw?.["Related Plants"] || "Not specified"}</p>
                  </div>

                  <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-orange-900 flex gap-2 items-center text-lg">
                        <Sprout size={20} /> Advantages
                      </h3>
                      <EditIcon field="Advantages" />
                    </div>
                    <p className="mt-2 text-orange-900">{plant?.advantages || "Not specified"}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-red-900 flex gap-2 items-center text-lg">
                      <ShieldAlert size={20} /> Side Effects / Caution
                    </h3>
                    <EditIcon field="Side Effects" />
                  </div>
                  <p className="mt-2 text-red-900">{plant?.sideEffects || "Not specified"}</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex gap-2 items-center text-lg">
                      <Info size={20} /> Description
                    </h3>
                    <EditIcon field="Description" />
                  </div>
                  <p className="mt-2 text-gray-700 text-justify">{plant?.description || "Not specified"}</p>

                  <div className="mt-6 border-t pt-5 border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 text-lg">Disadvantages</h3>
                      <EditIcon field="Disadvantages" />
                    </div>
                    <p className="mt-2 text-gray-700 text-justify">{plant?.disadvantages || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {zoomOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden border border-white/20 bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              className="absolute top-3 right-3 z-10 inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/90 border border-gray-200 shadow-sm text-sm font-semibold"
            >
              <X size={16} /> Close
            </button>

            <img
              src={imageFor3D}
              alt="Zoom"
              className="w-full h-full object-contain"
              onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PlantDetails;