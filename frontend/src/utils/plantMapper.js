export const mapPlant = (plant) => {
  const imagesFromSpaceKeys = [
    plant["Image 1"],
    plant["Image 2"],
    plant["Image 3"],
    plant["Image 4"],
    plant["Image 5"],
  ].filter(Boolean);

  const imagesFromArray = Array.isArray(plant.images) ? plant.images : [];

  return {
    id: plant._id || plant.id || "",
    name: plant["Common Name"] || plant.name || plant.plantName || "",
    scientificName:
      plant["Scientific Name"] || plant.botanicalName || plant.scientificName || "",
    description: plant["Description"] || plant.description || "",
    uses: plant["Uses"] || plant.uses || "",
    advantages: plant["Advantages"] || plant.advantages || "",
    disadvantages: plant["Disadvantages"] || plant.disadvantages || "",
    sideEffects: plant["Side Effects"] || plant.sideEffects || "",
    region: plant["Region"] || plant.region || "",
    category: plant["Category"] || plant.category || "General",
    model3D: plant["3D Model Link"] || plant.model3D || "",
    images: imagesFromSpaceKeys.length ? imagesFromSpaceKeys : imagesFromArray,
    raw: plant,
  };
};
