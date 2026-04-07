import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export function PublicLogin() {
    const [username, setusername] = useState("");
    const [loadingLocation, setLoadingLocation] = useState(false);
    
    // For testing purposes: Mock location overrides
    const [useMock, setUseMock] = useState(false);
    const [mockCoord, setMockCoord] = useState("0,0");

    const navigate = useNavigate();

    const mockLocations = [
        { label: "User A (Base Location)", value: "40.7128,-74.0060" }, // NY
        { label: "User B (Within 50m of A)", value: "40.71285,-74.00605" }, // Dist ~ 7m
        { label: "User C (Exactly 100m from A)", value: "40.71370,-74.0060" }, // Dist ~ 100m
        { label: "User D (Far away - 1km)", value: "40.7200,-74.0060" },
    ];

    async function handleJoin(e) {
        e.preventDefault();
        
        if (!username) {
            toast.error("Username is required");
            return;
        }

        setLoadingLocation(true);

        if (useMock && mockCoord) {
            const [lat, lng] = mockCoord.split(",");
            navigate("/public-dashboard", {
                state: { username, lat: parseFloat(lat), lng: parseFloat(lng) }
            });
            toast.success("Joined Public Room (Mock Location)");
            setLoadingLocation(false);
            return;
        }

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
                toast.success("Joined Public Room");
                setLoadingLocation(false);
            },
            (error) => {
                console.error("Geo error:", error);
                setLoadingLocation(false);
                toast.error("Unable to retrieve your location. Please allow location access.");
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" 
             style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <div className="row w-100 justify-content-center">
                <div className="col-12 col-md-5 col-lg-4">
                    <div className="glass-morphism p-5 rounded-4 shadow-lg text-center" style={{ borderTop: "4px solid #3b82f6" }}>
                        <div className="mb-4">
                            <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px", background: "rgba(59, 130, 246, 0.2)", border: "2px solid #3b82f6" }}>
                                <i className="bi bi-globe-americas text-primary fs-3"></i>
                            </div>
                            <h2 className="text-white fw-bold mb-1">Public Room</h2>
                            <p className="text-muted small">Connect with developers </p>
                        </div>

                        <form onSubmit={handleJoin}>
                            <div className="form-group mb-4 text-start">
                                <label className="d-block text-muted small mb-2 ms-1">USERNAME</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-dark border-secondary text-white py-2 px-3 mb-3" 
                                    placeholder="Choose a display name" 
                                    value={username}
                                    onChange={(e) => setusername(e.target.value)}
                                    style={{ borderRadius: '10px' }}
                                />

                                {/* Mock Location Dev Tool */}
                                <div className="p-3 mt-3 rounded rounded-3" style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px dashed rgba(255,255,255,0.2)" }}>
                                    <div className="form-check form-switch mb-2">
                                        <input className="form-check-input" type="checkbox" id="mockSwitch" checked={useMock} onChange={(e) => setUseMock(e.target.checked)} />
                                        <label className="form-check-label text-warning small" htmlFor="mockSwitch">Enable  Locations</label>
                                    </div>
                                    {useMock && (
                                        <select 
                                            className="form-select bg-dark text-white border-secondary small" 
                                            value={mockCoord} 
                                            onChange={(e) => setMockCoord(e.target.value)}
                                        >
                                            <option value="0,0" disabled>Select Mock Location</option>
                                            {mockLocations.map((loc, i) => (
                                                <option key={i} value={loc.value}>{loc.label}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loadingLocation}
                                className="btn w-100 py-2 mb-3 shadow fw-bold text-white"
                                style={{ background: '#3b82f6', borderRadius: '8px' }}
                            >
                                {loadingLocation ? (
                                    <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Locating...</span>
                                ) : (
                                    <span><i className="bi bi-geo-alt-fill me-2"></i>Find Nearby Devs</span>
                                )}
                            </button>
                        </form>
                        
                        <div className="text-muted small">
                            <span 
                                className="text-primary fw-bold text-decoration-none" 
                                style={{ cursor: "pointer", color: 'var(--accent-primary) !important' }} 
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
