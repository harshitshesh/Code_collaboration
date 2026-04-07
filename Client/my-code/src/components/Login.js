import React, { useState } from "react"
import { v4 as uuid } from "uuid";
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom";

export function Login() {
    const [roomid, setroomid] = useState("");
    const [username, setusername] = useState("")
    const navigatepage = useNavigate()

    function joinroomfunc() {
        if (!roomid || !username) {
            toast.error("Invalid Room ID or Username")
            return
        }
        navigatepage(`/dashboard/${roomid}`, {
            state: { username }
        })
        toast.success("Welcome! Start collaborating.")
    }

    function genrateroomid(e) {
        e.preventDefault();
        let id = uuid()
        setroomid(id)
        toast.success("New Room ID generated")
    }

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" 
             style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <div className="row w-100 justify-content-center">
                <div className="col-12 col-md-5 col-lg-4">
                    <div className="glass-morphism p-5 rounded-4 shadow-lg text-center">
                        <div className="mb-4">
                            <img 
                                className="img-fluid rounded-pill mb-3" 
                                src="/img/code-logo.png" 
                                alt="logo" 
                                style={{ width: '80px', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))' }} 
                            />
                            <h2 className="text-white fw-bold mb-1">Code Collab</h2>
                            <p className="text-muted small">Real-time Pair Programming Platform</p>
                        </div>

                        <div className="form-group mb-4">
                            <label className="text-start d-block text-muted small mb-2 ms-1">ROOM ID</label>
                            <input 
                                type="text" 
                                className="form-control bg-dark border-secondary text-white mb-3 py-2 px-3" 
                                placeholder="Paste or Generate ID" 
                                value={roomid}
                                onChange={(e) => setroomid(e.target.value)}
                                style={{ borderRadius: '10px' }}
                            />

                            <label className="text-start d-block text-muted small mb-2 ms-1">USERNAME</label>
                            <input 
                                type="text" 
                                className="form-control bg-dark border-secondary text-white py-2 px-3" 
                                placeholder="Choose a display name" 
                                value={username}
                                onChange={(e) => setusername(e.target.value)}
                                style={{ borderRadius: '10px' }}
                            />
                        </div>

                        <button 
                            onClick={joinroomfunc} 
                            className="btn btn-premium w-100 py-2 mb-4 shadow"
                        >
                            Join Workspace
                        </button>

                        <div className="text-muted small">
                            Don't have an ID? <span 
                                className="text-primary fw-bold text-decoration-none" 
                                style={{ cursor: "pointer", color: 'var(--accent-primary) !important' }} 
                                onClick={genrateroomid}
                            >Create New Room</span>
                        </div>
                    </div>
                    
                    <div className="text-center mt-4">
                        <p className="text-muted" style={{ fontSize: '11px' }}>Built for developers, by developers.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}