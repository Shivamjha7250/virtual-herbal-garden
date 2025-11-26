import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  // ✅ localhost for PC
  const BASE_URL = 'http://localhost:5000'; 

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/plants/pending`);
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/plants/approve/${id}`);
      alert("✅ Plant Approved & Added to Home Page!");
      fetchPendingRequests(); // List refresh karo
    } catch (error) { alert("Error approving plant"); }
  };

  const handleReject = async (id) => {
    if(confirm("Are you sure you want to reject and delete this request?")) {
      try {
        await axios.delete(`${BASE_URL}/api/plants/${id}`);
        alert("❌ Request Rejected.");
        fetchPendingRequests();
      } catch (error) { alert("Error rejecting plant"); }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-black font-medium">
        <ArrowLeft size={20} /> Back to Home
      </button>

      <h1 className="text-3xl font-bold text-green-900 mb-8 border-b pb-4">
        🛡️ Admin Dashboard - Pending Approvals
      </h1>

      {requests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
          <p className="text-gray-500 text-lg">No pending requests from users. All clear! ✅</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((plant) => (
            <div key={plant._id} className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center border border-gray-200 hover:shadow-lg transition">
              
              <div className="flex items-center gap-4">
                {/* Image Preview */}
                <img 
                  src={`${BASE_URL}${plant.images[0]}`} 
                  alt={plant.name} 
                  className="w-24 h-24 rounded-lg object-cover bg-gray-100 border"
                  onError={(e) => e.target.src="https://via.placeholder.com/150"}
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{plant.name}</h3>
                  <p className="text-sm text-gray-500 italic">{plant.botanicalName}</p>
                  <span className="text-xs text-blue-700 mt-2 bg-blue-50 inline-block px-2 py-1 rounded-full font-semibold border border-blue-100">
                    Suggested by User
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6 md:mt-0">
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