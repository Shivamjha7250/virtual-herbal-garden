import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

const FIELD_LABELS = {
  commonName: "Common Name",
  scientificName: "Scientific Name",
  description: "Description",
  uses: "Medicinal Uses",
  advantages: "Advantages",
  disadvantages: "Disadvantages",
  sideEffects: "Side Effects / Caution",
  relatedPlants: "Related Plants",
  threeDModelLink: "3D Model Link",
};

const normalizeField = (f) => {
  const x = (f || "").trim();
  const map = {
    "Common Name": "commonName",
    "Scientific Name": "scientificName",
    "Description": "description",
    "Uses": "uses",
    "Advantages": "advantages",
    "Disadvantages": "disadvantages",
    "Side Effects": "sideEffects",
    "Related Plants": "relatedPlants",
    "3D Model Link": "threeDModelLink",
  };
  return map[x] || x;
};

const NEW_TO_OLD = {
  commonName: "Common Name",
  scientificName: "Scientific Name",
  description: "Description",
  uses: "Uses",
  advantages: "Advantages",
  disadvantages: "Disadvantages",
  sideEffects: "Side Effects",
  relatedPlants: "Related Plants",
  threeDModelLink: "3D Model Link",
};

export default function PlantEdit() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const queryField = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return normalizeField(params.get("field") || "");
  }, [location.search]);

  const [plant, setPlant] = useState(location.state || null);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      alert("Not authorized (Admin only).");
      navigate(-1);
    }

  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/plants/${id}`);
        setPlant(res.data);
      } catch (e) {
        console.error(e);
        alert("Failed to load plant");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  useEffect(() => {
    if (!plant) return;

    const fieldToEdit = queryField || "description";
    const legacyKey = NEW_TO_OLD[fieldToEdit];

    const currentValue =
      plant?.[fieldToEdit] ??
      (legacyKey ? plant?.[legacyKey] : "") ??
      "";

    setValue(currentValue);
  }, [plant, queryField]);

  const handleSave = async () => {
    if (!token) {
      alert("Token missing. Please login again.");
      return;
    }
    if (!plant) return;

    const allowedFields = new Set([
      "commonName",
      "scientificName",
      "description",
      "uses",
      "advantages",
      "disadvantages",
      "sideEffects",
      "relatedPlants",
      "threeDModelLink",
    ]);

    const fieldToUpdate = queryField || "description";

    if (!allowedFields.has(fieldToUpdate)) {
      alert("Invalid field. Please edit using allowed fields only.");
      return;
    }

    setSaving(true);
    try {
      await axios.put(
        `${BASE_URL}/api/plants/admin/update/${plant._id}`,
        { [fieldToUpdate]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(" Updated successfully!");

      navigate(`/plant/${plant._id}`);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || " Update failed. Check console / backend PUT route.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-lg font-bold">Loading...</div>;
  if (!plant) return <div className="p-6 text-lg font-bold text-red-600">Plant not found</div>;

  const fieldToShow = queryField || "description";
  const label = FIELD_LABELS[fieldToShow] || "Edit Plant";

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-green-100 p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-green-900">{label}</h1>
            <p className="text-gray-600 mt-1">
              {(plant?.commonName || plant?.["Common Name"] || "")}{" "}
              {(plant?.scientificName || plant?.["Scientific Name"])
                ? `(${plant?.scientificName || plant?.["Scientific Name"]})`
                : ""}
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg border font-semibold hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        <label className="block font-semibold text-gray-800 mb-2">{label}</label>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={10}
          className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-200"
          placeholder="Type here..."
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-700 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-lg border font-bold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        {!queryField && (
          <p className="text-sm text-gray-500 mt-4">
            Tip: URL example: <b>?field=Description</b> (old) or <b>?field=description</b> (new)
          </p>
        )}
      </div>
    </div>
  );
}
