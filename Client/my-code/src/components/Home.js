import React from "react";
import { useNavigate } from "react-router-dom";

export function Home() {
    const navigate = useNavigate();

    return (
        <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center" 
             style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <div className="text-center mb-5">
                <img 
                    className="img-fluid mb-3 mx-auto d-block" 
                    src="/img/code-logo.png" 
                    alt="logo" 
                    style={{ width: '100px', filter: 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.4))' }} 
                />
                <h1 className="text-white fw-bold mb-2">Code Collab </h1>
                <p className="text-white opacity-75">Choose your workspace mode to start collaborating</p>
            </div>

            <div className="row w-100 justify-content-center gap-4 px-3" style={{ maxWidth: '800px' }}>
                <div 
                    className="col-12 col-md-5 glass-morphism p-5 rounded-4 shadow-lg text-center d-flex flex-column align-items-center justify-content-center"
                    style={{ cursor: "pointer", transition: "transform 0.3s ease, box-shadow 0.3s ease", minHeight: "250px" }}
                    onClick={() => navigate("/private")}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '';
                    }}
                >
                    <div className="rounded-circle mb-4 d-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px", background: "rgba(16, 185, 129, 0.2)", border: "2px solid var(--accent-primary)" }}>
                        <i className="bi bi-shield-lock-fill text-premium fs-1"></i>
                    </div>
                    <h3 className="text-white fw-bold">Private Room</h3>
                    <p className="text-white opacity-75 small">Create or join a secure room for focused pair programming.</p>
                </div>

                <div 
                    className="col-12 col-md-5 glass-morphism p-5 rounded-4 shadow-lg text-center d-flex flex-column align-items-center justify-content-center"
                    style={{ cursor: "pointer", transition: "transform 0.3s ease, box-shadow 0.3s ease", minHeight: "250px" }}
                    onClick={() => navigate("/public")}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '';
                    }}
                >
                    <div className="rounded-circle mb-4 d-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px", background: "rgba(59, 130, 246, 0.2)", border: "2px solid #3b82f6" }}>
                        <i className="bi bi-globe-americas text-primary fs-1"></i>
                    </div>
                    <h3 className="text-white fw-bold">Public Room</h3>
                    <p className="text-white opacity-75 small">Connect with developers nearby with local chat.</p>
                </div>
            </div>
            <div className="mt-5 text-center">
                <p className="text-muted small">Real-time synchronization powered by WebSockets</p>
            </div>
        </div>
    );
}
