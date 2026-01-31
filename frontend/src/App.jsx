import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import PlantDetails from './PlantDetails';
import PlantEdit from "./PlantEdit";
import AddPlant from './AddPlant';
import Login from './Login'; 
import Signup from './Signup'; 
import ForgotPassword from './ForgotPassword';
import Profile from './Profile'; // ✅ Added Import
import AdminDashboard from './AdminDashboard'; // ✅ Added Import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plant/:id" element={<PlantDetails />} />
        <Route path="/admin/plants/:id/edit" element={<PlantEdit />} />
        <Route path="/add" element={<AddPlant />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* ✅ Missing Routes Added Here */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;