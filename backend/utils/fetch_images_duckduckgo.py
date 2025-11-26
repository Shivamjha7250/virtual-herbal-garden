import json
import os
import requests
import shutil
import time

# --- Configuration ---
JSON_IN = r"D:/virtual-herbal-garden/backend/data/AYUSH_top50.json"
JSON_OUT = r"D:/virtual-herbal-garden/backend/data/AYUSH_top50_with_images.json"
IMAGE_DIR = r"D:/virtual-herbal-garden/backend/public/images"

# Wikipedia requires a User-Agent to identify the script
HEADERS = {
    "User-Agent": "HerbalGardenProject/1.0 (educational-project; contact@example.com)"
}

os.makedirs(IMAGE_DIR, exist_ok=True)

def get_wikipedia_image_url(query):
    """
    Fetches the main image URL from a Wikipedia page.
    """
    session = requests.Session()
    api_url = "https://en.wikipedia.org/w/api.php"

    params = {
        "action": "query",
        "format": "json",
        "titles": query,
        "prop": "pageimages",
        "pithumbsize": 1000  # Get high-quality image (1000px wide)
    }

    try:
        response = session.get(api_url, params=params, headers=HEADERS)
        data = response.json()
        
        pages = data.get("query", {}).get("pages", {})
        
        for page_id, page_data in pages.items():
            if page_id == "-1":  # Page not found
                return None
            
            if "thumbnail" in page_data:
                return page_data["thumbnail"]["source"]
                
    except Exception as e:
        print(f"  ⚠ API Error for {query}: {e}")
        return None
    
    return None

def download_image(url, filename):
    try:
        r = requests.get(url, stream=True, headers=HEADERS, timeout=15)
        if r.status_code == 200:
            with open(filename, 'wb') as f:
                r.raw.decode_content = True
                shutil.copyfileobj(r.raw, f)
            return True
    except Exception as e:
        print(f"  ⚠ Download Failed: {e}")
        return False
    return False

def main():
    print("🚀 Starting Image Download via Wikipedia API...\n")

    if not os.path.exists(JSON_IN):
        print(f"❌ Error: File not found at {JSON_IN}")
        return

    with open(JSON_IN, "r", encoding="utf-8") as f:
        plants = json.load(f)

    count = 0
    success_count = 0

    for p in plants:
        count += 1
        name = p["name"]
        botanical_name = p["botanicalName"]
        file_name_clean = name.replace(" ", "_")
        
        print(f"[{count}/{len(plants)}] Processing: {name} ({botanical_name})")

        # STRATEGY: Try Botanical Name first (Most accurate), then Common Name
        img_url = get_wikipedia_image_url(botanical_name)
        
        if not img_url:
            print(f"  Trying common name for: {name}...")
            img_url = get_wikipedia_image_url(name)

        if img_url:
            save_path = os.path.join(IMAGE_DIR, f"{file_name_clean}.jpg")
            
            if download_image(img_url, save_path):
                # Save path for Frontend
                p["imageURL"] = f"/images/{file_name_clean}.jpg"
                print(f"  ✅ Downloaded")
                success_count += 1
            else:
                print("  ❌ Download failed")
                # Keep placeholder if download fails
        else:
            print("  ❌ No image found on Wikipedia")
            # Keep placeholder
        
        # Wikipedia is lenient, but a tiny delay is good practice
        time.sleep(0.5)

    # Save Updated JSON
    with open(JSON_OUT, "w", encoding="utf-8") as f:
        json.dump(plants, f, indent=2, ensure_ascii=False)

    print(f"\n🎉 Process Complete!")
    print(f"Total Plants: {len(plants)}")
    print(f"Images Downloaded: {success_count}")
    print(f"Updated File: {JSON_OUT}")

if __name__ == "__main__":
    main()