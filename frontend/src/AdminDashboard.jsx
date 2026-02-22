import { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, XCircle, ArrowLeft, Loader, ShieldAlert, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = "http://localhost:5000";

  const categoryOptions = ["General", "Immunity", "Skin Care", "Digestion", "Respiratory"];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token || !user || user.role !== "admin") {
      alert("Access Denied! Admins only.");
      navigate("/");
      return;
    }

    fetchPendingRequests();
  }, [navigate]);

  const getCommonName = (p) => p?.["Common Name"] || p?.commonName || p?.name || "Unknown";
  const getScientificName = (p) => p?.["Scientific Name"] || p?.scientificName || p?.botanicalName || "";
  const getCategory = (p) => p?.["Category"] || p?.category || "General";

  const buildImage = (p) => {
    const img1 = p?.["Image 1"];
    if (img1 && /^https?:\/\//i.test(String(img1))) return img1;
    if (img1 && String(img1).startsWith("/images/")) return `${BASE_URL}${img1}`;
    if (img1) return `${BASE_URL}/images/${encodeURIComponent(img1)}`;
    return "https://via.placeholder.com/150";
  };

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/api/plants/admin/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = (res.data || []).map((p) => ({
        ...p,
        editableCategory: getCategory(p),
      }));

      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert("Session expired / Not allowed. Please login again.");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/api/plants/admin/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Plant Approved & Added to Home Page!");
      setRequests((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Approve Error:", error);
      alert(error?.response?.data?.message || "Error approving plant");
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Are you sure you want to reject and delete this request?")) {
      try {
        const token = localStorage.getItem("token");

        await axios.delete(`${BASE_URL}/api/plants/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        alert(" Request Rejected.");
        setRequests((prev) => prev.filter((p) => p._id !== id));
      } catch (error) {
        console.error("Reject Error:", error);
        alert(error?.response?.data?.message || "Error rejecting plant");
      }
    }
  };

  const handleSaveCategory = async (plantId, categoryValue) => {
    try {
      setSavingId(plantId);
      const token = localStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/api/plants/admin/category/${plantId}`,
        { category: categoryValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(" Category Updated in Database!");

      setRequests((prev) =>
        prev.map((p) =>
          p._id === plantId
            ? { ...p, Category: categoryValue, editableCategory: categoryValue }
            : p
        )
      );
    } catch (error) {
      console.error("Category Save Error:", error);
      alert(error?.response?.data?.message || " Category update failed");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loader className="animate-spin text-green-700" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-600 mb-6 hover:text-black font-medium transition"
      >
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        <ShieldAlert className="text-yellow-600" size={32} />
        <h1 className="text-3xl font-bold text-green-900">Admin Dashboard - Pending Approvals</h1>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4 opacity-50" />
          <p className="text-gray-500 text-lg">No pending requests from users. All clear! </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((plant) => (
            <div
              key={plant._id}
              className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <img
                  src={buildImage(plant)}
                  alt={getCommonName(plant)}
                  className="w-24 h-24 rounded-lg object-cover bg-gray-100 border flex-shrink-0"
                  onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150")}
                />

                <div className="min-w-[260px]">
                  <h3 className="text-xl font-bold text-gray-800">{getCommonName(plant)}</h3>
                  <p className="text-sm text-gray-500 italic">{getScientificName(plant)}</p>

                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full font-semibold border border-blue-100">
                      Suggested by User
                    </span>

                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                      Category: {getCategory(plant)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <select
                      value={plant.editableCategory || "General"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRequests((prev) =>
                          prev.map((p) => (p._id === plant._id ? { ...p, editableCategory: val } : p))
                        );
                      }}
                      className="border px-3 py-2 rounded-lg text-sm outline-none"
                    >
                      {categoryOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleSaveCategory(plant._id, plant.editableCategory || "General")}
                      disabled={savingId === plant._id}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg hover:opacity-90 transition text-sm font-bold disabled:opacity-60"
                    >
                      <Save size={16} />
                      {savingId === plant._id ? "Saving..." : "Save Category"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 md:mt-0 w-full md:w-auto justify-end flex-wrap">
                <button
                  onClick={() => navigate(`/plant/${plant._id}`, { state: plant })}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  View Details
                </button>

                <button
                  onClick={() => handleReject(plant._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 font-medium transition"
                >
                  <XCircle size={18} /> Reject
                </button>

                <button
                  onClick={() => handleApprove(plant._id)}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md font-bold transition"
                >
                  <CheckCircle size={18} /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;