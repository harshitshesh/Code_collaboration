import React, { useEffect, useRef, useState } from "react"
import { ClientProfile } from "./ClientProfile"
import { initsocket } from "../socket"
import { useNavigate, useLocation, Navigate } from "react-router-dom"
import toast from "react-hot-toast"

export function PublicDashboard() {
    const [nearbyUsers, setNearbyUsers] = useState([])
    const [messages, setMessages] = useState([])
    const [messageInput, setMessageInput] = useState("")
    const scrollRef = useRef()

    const socketref = useRef(null)
    const location = useLocation();
    const navigate = useNavigate()

    useEffect(() => {
        if (!location.state) return;
        const { username, lat, lng } = location.state;

        let init = async () => {
            socketref.current = await initsocket()
            socketref.current.on('connect_error', (err) => handleerror(err))
            socketref.current.on('connect_failed', (err) => handleerror(err))

            function handleerror(err) {
                console.log('backend error>>', err)
                toast.error('Connection failed')
                navigate("/public")
            }

            socketref.current.emit('join-public', { username, lat, lng })

            socketref.current.on('public-joined', ({ nearbyUsers }) => {
                setNearbyUsers(nearbyUsers)
                toast.success(`Connected to local chat! Found ${Math.max(nearbyUsers.length - 1, 0)} nearby users.`)
            })

            socketref.current.on('public-user-joined', ({ user }) => {
                toast.success(`${user.username} appeared nearby!`)
                setNearbyUsers((prev) => {
                    if (!prev.find(u => u.socketid === user.socketid)) {
                        return [...prev, user];
                    }
                    return prev;
                })
            })

            socketref.current.on('public-disconnected', ({ socketid, username }) => {
                toast.success(`${username} left the area`)
                setNearbyUsers((prev) => prev.filter((u) => u.socketid !== socketid))
            })

            socketref.current.on('receive-public-message', (data) => {
                setMessages((prev) => [...prev, data]);
            })
        }
        init();

        return () => {
            if (socketref.current) {
                socketref.current.disconnect();
                socketref.current.off("public-joined");
                socketref.current.off("public-user-joined");
                socketref.current.off("public-disconnected");
                socketref.current.off("receive-public-message");
            }
        }
    }, [location.state])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!location.state) {
        return <Navigate to="/public" />
    }

    const { username } = location.state;

    const sendMessage = (e) => {
        e.preventDefault();
        if (messageInput.trim() && socketref.current) {
            socketref.current.emit('send-public-message', {
                message: messageInput,
                username,
            });
            setMessageInput("");
        }
    };

    function logout() {
        navigate("/")
    }

    // ... useEffect remains unchanged ...

    return (
        <div className="container-fluid vh-100 p-0 overflow-hidden d-flex flex-column flex-md-row">
            {/* Mobile Header */}
            <div className="d-md-none bg-dark text-white p-3 d-flex align-items-center justify-content-between border-bottom border-secondary">
                <div onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{cursor:'pointer'}}>
                    <i className="bi bi-people-fill fs-4 text-primary"></i>
                </div>
                <h5 className="m-0 fw-bold fs-6" style={{color:'#3b82f6'}}><i className="bi bi-geo-alt-fill me-1"></i> Public Chat ({nearbyUsers.length})</h5>
                <div style={{width:'32px'}}></div> {/* Spacer balance */}
            </div>

            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'd-flex' : 'd-none'} d-md-flex col-12 col-md-3 bg-sidebar text-light flex-column border-end border-secondary position-relative z-index-master h-100`} style={{ zIndex: 1050 }}>
                <div className="p-4 text-center d-none d-md-block">
                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px", background: "rgba(59, 130, 246, 0.2)", border: "2px solid #3b82f6" }}>
                        <i className="bi bi-globe-americas text-primary fs-3"></i>
                    </div>
                    <h5 className="font-weight-bold mb-1" style={{ color: '#3b82f6', fontSize: '16px' }}>PUBLIC ROOM</h5>
                 
                </div>
                
                <div className="px-3 pt-3 pt-md-0">
                    <p className="text-white opacity-50 small mb-3 text-uppercase font-weight-bold" style={{ letterSpacing: '1px' }}>Nearby Developers ({nearbyUsers.length})</p>
                    <hr className="border-secondary mt-0 mb-4" />
                </div>

                <div className="flex-grow-1 overflow-auto custom-scrollbar px-2">
                    {nearbyUsers.map((data) => (
                        <div key={data.socketid} className="d-flex align-items-center mb-2 p-2 rounded" style={{ background: "rgba(255,255,255,0.02)" }}>
                            <ClientProfile username={data.username} />
                            {data.socketid === socketref.current?.id && (
                                <span className="badge bg-primary ms-auto" style={{ fontSize: "10px" }}>You</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-3 d-flex flex-column mt-auto border-top border-secondary">
                    <button onClick={logout} className="btn btn-outline-danger w-100 py-2 border-0" style={{ fontSize: '14px' }}>
                        <i className="bi bi-box-arrow-right me-2"></i>Leave Public Room
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="d-flex flex-column bg-dark position-relative flex-grow-1 min-vw-0" style={{ height: window.innerWidth < 768 ? 'calc(100vh - 60px)' : '100vh' }}>
                <div className="p-3 border-bottom border-secondary d-none d-md-flex align-items-center justify-content-between" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <h6 className="m-0 text-white font-weight-bold">
                        <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                        Local Area Chat
                    </h6>
                </div>
                
                <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3" style={{ background: 'linear-gradient(to bottom, #0f172a, #111827)' }}>
                    {messages.length === 0 && (
                        <div className="text-center text-muted mt-5 pt-5 flex-column d-flex align-items-center">
                            <i className="bi bi-chat-dots opacity-25" style={{ fontSize: "5rem" }}></i>
                            <p className="mt-3">Say hello to nearby developers!</p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`d-flex flex-column ${msg.username === username ? 'align-items-end' : 'align-items-start'}`}
                        >
                            <span className="text-muted mb-1" style={{ fontSize: "11px", opacity: 0.7 }}>
                                {msg.username === username ? 'You' : msg.username}
                            </span>
                            <div 
                                className="px-3 py-2 rounded-3 shadow-sm text-white max-w-75"
                                style={{ 
                                    background: msg.username === username ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                    borderBottomRightRadius: msg.username === username ? '0' : '8px',
                                    borderBottomLeftRadius: msg.username !== username ? '0' : '8px'
                                }}
                            >
                                {msg.message}
                            </div>
                            <div ref={scrollRef}></div>
                        </div>
                    ))}
                </div>

                <form onSubmit={sendMessage} className="p-3 border-top border-secondary" style={{ background: "#111827" }}>
                    <div className="input-group">
                        <input 
                            type="text" 
                            className="form-control bg-dark border-secondary text-white p-3" 
                            placeholder="Message nearby developers..." 
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            style={{ borderRadius: '12px 0 0 12px' }}
                        />
                        <button 
                            className="btn text-white px-4" 
                            type="submit"
                            style={{ background: '#3b82f6', borderRadius: '0 12px 12px 0' }}
                        >
                            <i className="bi bi-send-fill"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
