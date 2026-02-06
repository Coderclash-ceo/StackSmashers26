import streamlit as st
import requests
from PIL import Image
import json

# CONFIG
BACKEND_URL = "http://localhost:8000"

st.set_page_config(page_title="NutriSnap AI", layout="wide")

st.title("🍎 NutriSnap: AI Food Analyzer")
st.markdown("Upload a photo of your meal to get instant nutrition insights.")

# Sidebar
with st.sidebar:
    st.header("Project Info")
    st.info("Team: 4 Devs\nStack: FastAPI + Streamlit + Firebase + Gemini")
    st.checkbox("Simulate Fitness Sync", value=True, key="sync_enabled")

# Main Content
col1, col2 = st.columns(2)

uploaded_file = None

with col1:
    st.subheader("1. Capture Food")
    option = st.radio("Input Method", ["Upload Image", "Camera"])
    
    if option == "Upload Image":
        uploaded_file = st.file_uploader("Choose a food image...", type=["jpg", "jpeg", "png"])
    else:
        uploaded_file = st.camera_input("Take a picture")

    if uploaded_file:
        st.image(uploaded_file, caption="Uploaded Image", use_column_width=True)

with col2:
    st.subheader("2. Analysis Results")
    
    if uploaded_file:
        if st.button("Analyze Nutrition 🚀", type="primary"):
            with st.spinner("Asking AI Chef..."):
                try:
                    # Prepare file for API
                    files = {"file": (uploaded_file.name, uploaded_file.getvalue(), uploaded_file.type)}
                    user_id = "hackathon_judge_1"
                    
                    response = requests.post(f"{BACKEND_URL}/analyze", files=files, params={"user_id": user_id})
                    
                    if response.status_code == 200:
                        data = response.json()
                        nutrition = data["nutrition"]
                        
                        # Display Cards
                        c1, c2, c3, c4 = st.columns(4)
                        c1.metric("Calories", f"{nutrition['calories']} kcal")
                        c2.metric("Protein", f"{nutrition['protein_g']}g")
                        c3.metric("Carbs", f"{nutrition['carbs_g']}g")
                        c4.metric("Fats", f"{nutrition['fats_g']}g")
                        
                        st.success(f"Identified: **{nutrition['food_name']}**")
                        
                        with st.expander("debug raw response"):
                             st.json(data)
                             
                        if data.get("fitness_sync_status"):
                            st.toast("✅ Synced with Fitness Platform!", icon="🏃")
                            
                    else:
                        st.error(f"Error {response.status_code}: {response.text}")
                        
                except Exception as e:
                    st.error(f"Connection Error: {e}")
                    st.warning("Make sure Backend is running on port 8000")
