import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// All major Indian cities with fixed coordinates + International option
const INDIA_CITIES = [
    { label: "Delhi", lat: 28.6139, lng: 77.2090 },
    { label: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { label: "Bengaluru", lat: 12.9716, lng: 77.5946 },
    { label: "Hyderabad", lat: 17.3850, lng: 78.4867 },
    { label: "Chennai", lat: 13.0827, lng: 80.2707 },
    { label: "Kolkata", lat: 22.5726, lng: 88.3639 },
    { label: "Pune", lat: 18.5204, lng: 73.8567 },
    { label: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
    { label: "Jaipur", lat: 26.9124, lng: 75.7873 },
    { label: "Surat", lat: 21.1702, lng: 72.8311 },
    { label: "Lucknow", lat: 26.8467, lng: 80.9462 },
    { label: "Kanpur", lat: 26.4499, lng: 80.3319 },
    { label: "Nagpur", lat: 21.1458, lng: 79.0882 },
    { label: "Indore", lat: 22.7196, lng: 75.8577 },
    { label: "Thane", lat: 19.2183, lng: 72.9781 },
    { label: "Bhopal", lat: 23.2599, lng: 77.4126 },
    { label: "Visakhapatnam", lat: 17.6868, lng: 83.2185 },
    { label: "Pimpri-Chinchwad", lat: 18.6279, lng: 73.8009 },
    { label: "Patna", lat: 25.5941, lng: 85.1376 },
    { label: "Vadodara", lat: 22.3072, lng: 73.1812 },
    { label: "Ghaziabad", lat: 28.6692, lng: 77.4538 },
    { label: "Ludhiana", lat: 30.9010, lng: 75.8573 },
    { label: "Agra", lat: 27.1767, lng: 78.0081 },
    { label: "Nashik", lat: 19.9975, lng: 73.7898 },
    { label: "Faridabad", lat: 28.4089, lng: 77.3178 },
    { label: "Meerut", lat: 28.9845, lng: 77.7064 },
    { label: "Rajkot", lat: 22.3039, lng: 70.8022 },
    { label: "Varanasi", lat: 25.3176, lng: 82.9739 },
    { label: "Srinagar", lat: 34.0837, lng: 74.7973 },
    { label: "Aurangabad", lat: 19.8762, lng: 75.3433 },
    { label: "Amritsar", lat: 31.6340, lng: 74.8723 },
    { label: "Prayagraj (Allahabad)", lat: 25.4358, lng: 81.8463 },
    { label: "Coimbatore", lat: 11.0168, lng: 76.9558 },
    { label: "Vijayawada", lat: 16.5062, lng: 80.6480 },
    { label: "Madurai", lat: 9.9252, lng: 78.1198 },
    { label: "Gwalior", lat: 26.2183, lng: 78.1828 },
    { label: "Chandigarh", lat: 30.7333, lng: 76.7794 },
    { label: "Hubli-Dharwad", lat: 15.3647, lng: 75.1240 },
    { label: "Mysuru", lat: 12.2958, lng: 76.6394 },
    { label: "Kochi", lat: 9.9312, lng: 76.2673 },
    { label: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
    { label: "Dehradun", lat: 30.3165, lng: 78.0322 },
    { label: "Jodhpur", lat: 26.2389, lng: 73.0243 },
    { label: "Raipur", lat: 21.2514, lng: 81.6296 },
    { label: "Kota", lat: 25.2138, lng: 75.8648 },
    { label: "Guwahati", lat: 26.1445, lng: 91.7362 },
    { label: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366 },
    { label: "Solapur", lat: 17.6805, lng: 75.9064 },
    { label: "Tiruchirappalli", lat: 10.7905, lng: 78.7047 },
    { label: "Bareilly", lat: 28.3670, lng: 79.4304 },
    { label: "Aligarh", lat: 27.8974, lng: 78.0880 },
    { label: "Moradabad", lat: 28.8386, lng: 78.7733 },
    { label: "Jalandhar", lat: 31.3260, lng: 75.5762 },
    // International option — all international users share one room
    { label: "🌍 International (Outside India)", lat: 0.0, lng: 0.0 },
];

export function PublicLogin() {
    const [username, setusername] = useState("");
    const [loadingLocation, setLoadingLocation] = useState(false);

    // Toggle: false = use real GPS, true = select city from dropdown
    const [useCitySelect, setUseCitySelect] = useState(false);
    const [selectedCity, setSelectedCity] = useState("");

    const navigate = useNavigate();

    async function handleJoin(e) {
        e.preventDefault();

        if (!username) {
            toast.error("Username is required");
            return;
        }

        // --- City dropdown mode ---
        if (useCitySelect) {
            if (!selectedCity) {
                toast.error("Please select a city");
                return;
            }
            const city = INDIA_CITIES.find((c) => c.label === selectedCity);
            if (!city) {
                toast.error("Invalid city selected");
                return;
            }
            navigate("/public-dashboard", {
                state: { username, lat: city.lat, lng: city.lng, city: city.label }
            });
            toast.success(`Joined Public Room — ${city.label}`);
            return;
        }

        // --- Real GPS / Geolocation mode ---
        setLoadingLocation(true);

        if (!navigator.geolocation) {
            setLoadingLocation(false);
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                navigate("/public-dashboard", {
                    state: { username, lat, lng }
                });
                toast.success("Joined Public Room using your live location");
                setLoadingLocation(false);
            },
            (error) => {
                console.error("Geo error:", error);
                setLoadingLocation(false);
                toast.error("Unable to retrieve your location. Please allow location access or select a city.");
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
    }

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
             style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <div className="row w-100 justify-content-center">
                <div className="col-12 col-md-5 col-lg-4">
                    <div className="glass-morphism p-4 p-md-5 rounded-4 shadow-lg text-center" style={{ borderTop: "4px solid #3b82f6" }}>
                        <div className="mb-4">
                            <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                 style={{ width: "60px", height: "60px", background: "rgba(59, 130, 246, 0.2)", border: "2px solid #3b82f6" }}>
                                <i className="bi bi-globe-americas text-primary fs-3"></i>
                            </div>
                            <h2 className="text-white fw-bold mb-1">Public Room</h2>
                            <p className="small" style={{ color: '#94a3b8' }}>Connect with developers near you</p>
                        </div>

                        <form onSubmit={handleJoin}>
                            <div className="form-group mb-4 text-start">
                                <label className="d-block small mb-2 ms-1 fw-semibold" style={{ color: '#94a3b8', letterSpacing: '0.5px' }}>USERNAME</label>
                                <input
                                    type="text"
                                    className="form-control border-secondary text-white py-2 px-3"
                                    placeholder="Choose a display name"
                                    value={username}
                                    onChange={(e) => setusername(e.target.value)}
                                    style={{ borderRadius: '10px', background: 'rgba(255,255,255,0.07)', color: '#fff' }}
                                />

                                {/* Location Selection Box */}
                                <div className="p-3 mt-3 rounded-3"
                                     style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px dashed rgba(59,130,246,0.4)" }}>

                                    {/* Toggle Switch */}
                                    <div className="form-check form-switch mb-2 d-flex align-items-center gap-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="citySwitch"
                                            style={{ cursor: 'pointer' }}
                                            checked={useCitySelect}
                                            onChange={(e) => {
                                                setUseCitySelect(e.target.checked);
                                                setSelectedCity("");
                                            }}
                                        />
                                        <label className="form-check-label fw-semibold small" htmlFor="citySwitch"
                                               style={{ color: '#facc15', cursor: 'pointer' }}>
                                            <i className="bi bi-geo-alt me-1"></i>
                                            {useCitySelect ? "Select City (City-based room)" : "Use My Live Location (GPS)"}
                                        </label>
                                    </div>

                                    {/* Description text */}
                                    <p className="small mb-2" style={{ color: '#94a3b8', fontSize: '11px' }}>
                                        {useCitySelect
                                            ? "Select your city — you'll be matched with others in the same city."
                                            : "Allow location permission to find nearby developers in real-time."}
                                    </p>

                                    {/* City Dropdown — only when toggle is ON */}
                                    {useCitySelect && (
                                        <select
                                            className="form-select border-secondary small"
                                            value={selectedCity}
                                            onChange={(e) => setSelectedCity(e.target.value)}
                                            style={{
                                                background: 'rgba(15, 23, 42, 0.9)',
                                                color: '#fff',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                borderColor: 'rgba(59,130,246,0.5)'
                                            }}
                                        >
                                            <option value="" disabled style={{ color: '#94a3b8' }}>
                                                🏙️ Select your city...
                                            </option>
                                            <optgroup label="── Indian Cities ──" style={{ color: '#94a3b8', background: '#0f172a' }}>
                                                {INDIA_CITIES.filter(c => !c.label.startsWith("🌍")).map((city, i) => (
                                                    <option key={i} value={city.label} style={{ background: '#1e293b', color: '#fff' }}>
                                                        {city.label}
                                                    </option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="── International ──" style={{ color: '#94a3b8', background: '#0f172a' }}>
                                                {INDIA_CITIES.filter(c => c.label.startsWith("🌍")).map((city, i) => (
                                                    <option key={i} value={city.label} style={{ background: '#1e293b', color: '#fff' }}>
                                                        {city.label}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loadingLocation}
                                className="btn w-100 py-2 mb-3 shadow fw-bold text-white"
                                style={{ background: '#3b82f6', borderRadius: '8px', fontSize: '15px' }}
                            >
                                {loadingLocation ? (
                                    <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Locating...</span>
                                ) : (
                                    <span>
                                        <i className={`bi ${useCitySelect ? 'bi-buildings' : 'bi-geo-alt-fill'} me-2`}></i>
                                        {useCitySelect ? "Join City Room" : "Find Nearby Devs"}
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="small" style={{ color: '#64748b' }}>
                            <span
                                className="fw-bold text-decoration-none"
                                style={{ cursor: "pointer", color: '#3b82f6' }}
                                onClick={() => navigate("/")}
                            >
                                <i className="bi bi-arrow-left me-1"></i> Back to Home
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
