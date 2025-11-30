import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Leaf, Upload, Save, ArrowLeft, CheckCircle, AlertCircle, MapPin, Activity, Layers } from 'lucide-react';

function AddPlant() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // States
  const [formData, setFormData] = useState({
    name: '', botanicalName: '', description: '', region: '',
    uses: '', advantages: '', disadvantages: '', sideEffects: '',
    partsUsed: '', category: 'General' // ✅ Added new fields
  });
  
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [previews, setPreviews] = useState([]); 
  const [selectedIndex, setSelectedIndex] = useState(0); 

  // ✅ IP Address (PC Testing)
  const BASE_URL = 'http://localhost:5000'; 

  const categories = ["General", "Immunity", "Skin Care", "Digestion", "Respiratory", "Heart Health"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("Max 5 images allowed!");
      return;
    }
    setSelectedFiles(files);
    previews.forEach(url => URL.revokeObjectURL(url));
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  // ✅ CRASH PROOF SUBMIT FUNCTION
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Token Check (Fix for 401 Error)
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please Login First!");
        navigate('/login');
        return;
    }

    try {
      // 2. User Data nikaalo
      const storedUser = localStorage.getItem('user');
      const userObj = storedUser ? JSON.parse(storedUser) : null; 
      const userRole = userObj ? userObj.role : 'user';

      // 3. Data Prepare karo
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      
      selectedFiles.forEach(file => {
        data.append('images', file);
      });
      
      data.append('selected3DIndex', selectedIndex);
      data.append('role', userRole);

      // 4. Server ko bhejo (With Headers)
      await axios.post(`${BASE_URL}/api/plants`, data, {
        headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}` // ✅ TOKEN ADDED HERE
        }
      });
      
      if (userObj && userObj.role === 'admin') {
        alert('🌱 Plant Added & Approved! (Admin Mode)');
      } else {
        alert('📩 Request Sent to Admin!');
      }
      
      navigate('/');

    } catch (error) {
      console.error("Upload Error:", error);
      alert('❌ Failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-8 font-sans flex justify-center">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl w-full max-w-4xl border border-green-100">
        
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <button onClick={() => navigate('/')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <ArrowLeft size={20} className="text-gray-700"/>
          </button>
          <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
            <Leaf className="text-green-600" /> Add Plant
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plant Name</label>
              <input required name="name" onChange={handleChange} placeholder="e.g. Tulsi" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Botanical Name</label>
              <input required name="botanicalName" onChange={handleChange} placeholder="e.g. Ocimum sanctum" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          {/* Row 2: Category & Region */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
               <select name="category" onChange={handleChange} className="w-full p-3 border rounded-xl outline-none bg-white">
                 {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
               </select>
             </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <input required name="region" onChange={handleChange} placeholder="e.g. India" className="w-full p-3 border rounded-xl outline-none" />
            </div>
          </div>

          {/* Row 3: Uses & Parts Used */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Parts Used</label>
               <input required name="partsUsed" onChange={handleChange} placeholder="e.g. Leaves, Roots" className="w-full p-3 border rounded-xl outline-none" />
             </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uses (Comma Separated)</label>
              <input required name="uses" onChange={handleChange} placeholder="Cough, Cold" className="w-full p-3 border rounded-xl outline-none" />
            </div>
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea required name="description" rows="3" onChange={handleChange} className="w-full p-3 border rounded-xl outline-none"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <textarea name="advantages" onChange={handleChange} placeholder="Advantages (Comma Separated)" className="w-full p-3 border border-green-200 bg-green-50 rounded-xl outline-none"></textarea>
            <textarea name="disadvantages" onChange={handleChange} placeholder="Disadvantages (Comma Separated)" className="w-full p-3 border border-red-200 bg-red-50 rounded-xl outline-none"></textarea>
          </div>

          <input name="sideEffects" onChange={handleChange} placeholder="Side Effects" className="w-full p-3 border border-orange-200 rounded-xl outline-none" />

          {/* Image Upload */}
          <div className="border-2 border-dashed border-blue-300 rounded-2xl p-6 bg-blue-50 text-center cursor-pointer relative">
            <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            <span className="text-blue-700 font-bold">Click to Upload Images (Max 5)</span>
          </div>

          {/* Previews */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {previews.map((src, index) => (
              <img key={index} src={src} onClick={() => setSelectedIndex(index)} 
                className={`w-20 h-20 object-cover rounded-lg border-4 cursor-pointer ${selectedIndex === index ? 'border-green-500' : 'border-transparent'}`} 
              />
            ))}
          </div>

          <button type="submit" disabled={loading} 
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-blue-700 transition shadow-lg flex justify-center items-center gap-2">
            {loading ? "Saving..." : <><Save size={24} /> Submit</>}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddPlant;