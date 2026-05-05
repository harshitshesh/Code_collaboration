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
                toast.success(`Connected! Found ${Math.max(nearbyUsers.length - 1, 0)} nearby users.`)
            })

            socketref.current.on('public-user-joined', ({ user }) => {
                toast.success(`${user.username} joined the room!`)
                setNearbyUsers((prev) => {
                    if (!prev.find(u => u.socketid === user.socketid)) {
                        return [...prev, user];
                    }
                    return prev;
                })
            })

            socketref.current.on('public-disconnected', ({ socketid, username }) => {
                toast.success(`${username} left the room`)
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

    const { username, city } = location.state;

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

    return (
        <div className="container-fluid vh-100 p-0 overflow-hidden d-flex flex-column flex-md-row">

            {/* ── Mobile Header ── */}
            <div className="d-md-none text-white p-2 d-flex align-items-center justify-content-between border-bottom border-secondary"
                 style={{ background: '#0f172a', minHeight: '52px', flexShrink: 0 }}>

                {/* Sidebar toggle */}
                <button
                    className="btn btn-sm btn-outline-secondary border-0 px-2"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    title="Members"
                >
                    <i className="bi bi-people-fill fs-5 text-primary"></i>
                </button>

                {/* Room label */}
                <h5 className="m-0 fw-bold fs-6" style={{ color: '#3b82f6' }}>
                    <i className="bi bi-geo-alt-fill me-1"></i>
                    {city ? city : "Public Chat"} ({nearbyUsers.length})
                </h5>

                {/* Leave button — visible on mobile */}
                <button
                    onClick={logout}
                    className="btn btn-sm btn-danger px-2 py-1 fw-semibold d-flex align-items-center gap-1"
                    style={{ fontSize: '12px', borderRadius: '7px' }}
                    title="Leave Room"
                >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Leave</span>
                </button>
            </div>

            {/* ── Sidebar (Members) ── */}
            <div
                className={`${isSidebarOpen ? 'd-flex' : 'd-none'} d-md-flex flex-column border-end border-secondary`}
                style={{
                    width: '260px',
                    minWidth: '260px',
                    background: '#1e293b',
                    zIndex: 1050,
                    position: window.innerWidth < 768 ? 'absolute' : 'relative',
                    top: window.innerWidth < 768 ? '52px' : 'auto',
                    left: 0,
                    height: window.innerWidth < 768 ? 'calc(100vh - 52px)' : '100%',
                }}
            >
                {/* Desktop header */}
                <div className="p-4 text-center d-none d-md-block border-bottom border-secondary">
                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                         style={{ width: "60px", height: "60px", background: "rgba(59, 130, 246, 0.2)", border: "2px solid #3b82f6" }}>
                        <i className="bi bi-globe-americas text-primary fs-3"></i>
                    </div>
                    <h5 className="fw-bold mb-0" style={{ color: '#3b82f6', fontSize: '15px' }}>PUBLIC ROOM</h5>
                    {city && <p className="small mt-1 mb-0" style={{ color: '#94a3b8' }}>{city}</p>}
                </div>

                <div className="px-3 pt-3">
                    <p className="small mb-2 text-uppercase fw-bold" style={{ color: '#94a3b8', letterSpacing: '1px' }}>
                        Developers ({nearbyUsers.length})
                    </p>
                    <hr className="border-secondary mt-0 mb-3" />
                </div>

                <div className="flex-grow-1 overflow-auto px-2 pb-2">
                    {nearbyUsers.map((data) => (
                        <div key={data.socketid} className="d-flex align-items-center mb-2 p-2 rounded-3"
                             style={{ background: "rgba(255,255,255,0.03)" }}>
                            <ClientProfile username={data.username} />
                            {data.socketid === socketref.current?.id && (
                                <span className="badge bg-primary ms-auto" style={{ fontSize: "10px" }}>You</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Leave button — desktop sidebar */}
                <div className="p-3 border-top border-secondary mt-auto">
                    <button
                        onClick={logout}
                        className="btn btn-outline-danger w-100 py-2 border-0 fw-semibold"
                        style={{ fontSize: '14px' }}
                    >
                        <i className="bi bi-box-arrow-right me-2"></i>Leave Public Room
                    </button>
                </div>
            </div>

            {/* Mobile sidebar backdrop */}
            {isSidebarOpen && window.innerWidth < 768 && (
                <div
                    className="position-fixed w-100 h-100"
                    style={{ top: '52px', left: 0, zIndex: 1049, background: 'rgba(0,0,0,0.55)' }}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* ── Main Chat Area ── */}
            <div className="d-flex flex-column flex-grow-1 min-vw-0" style={{ background: '#0f172a', overflow: 'hidden' }}>

                {/* Desktop chat header */}
                <div className="p-3 border-bottom border-secondary d-none d-md-flex align-items-center justify-content-between"
                     style={{ background: "rgba(255,255,255,0.02)", flexShrink: 0 }}>
                    <h6 className="m-0 text-white fw-bold">
                        <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                        {city ? `${city} — Local Chat` : "Local Area Chat"}
                    </h6>
                    <span className="badge" style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd', fontSize: '11px' }}>
                        {nearbyUsers.length} online
                    </span>
                </div>

                {/* Messages area */}
                <div className="flex-grow-1 overflow-auto p-3 p-md-4 d-flex flex-column gap-3"
                     style={{ background: 'linear-gradient(to bottom, #0f172a, #111827)' }}>

                    {messages.length === 0 && (
                        <div className="text-center mt-5 pt-5 flex-column d-flex align-items-center" style={{ color: '#475569' }}>
                            <i className="bi bi-chat-dots opacity-25" style={{ fontSize: "5rem" }}></i>
                            <p className="mt-3 small">
                                {city ? `Say hello to ${city} developers!` : "Say hello to nearby developers!"}
                            </p>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`d-flex flex-column ${msg.username === username ? 'align-items-end' : 'align-items-start'}`}
                        >
                            {/* ── Sender Name — always white, clearly visible ── */}
                            <span
                                className="mb-1 fw-semibold"
                                style={{
                                    fontSize: "11px",
                                    color: msg.username === username ? '#93c5fd' : '#ffffff',
                                    opacity: 1,
                                    letterSpacing: '0.3px'
                                }}
                            >
                                {msg.username === username ? 'You' : msg.username}
                            </span>

                            {/* Message bubble */}
                            <div
                                className="px-3 py-2 rounded-3 shadow-sm"
                                style={{
                                    background: msg.username === username
                                        ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                                        : 'rgba(255,255,255,0.10)',
                                    color: '#ffffff',
                                    maxWidth: '75%',
                                    wordBreak: 'break-word',
                                    fontSize: '14px',
                                    borderBottomRightRadius: msg.username === username ? '4px' : '12px',
                                    borderBottomLeftRadius: msg.username !== username ? '4px' : '12px',
                                    border: msg.username !== username ? '1px solid rgba(255,255,255,0.08)' : 'none',
                                }}
                            >
                                {msg.message}
                            </div>
                            <div ref={scrollRef}></div>
                        </div>
                    ))}
                </div>

                {/* Message input */}
                <form onSubmit={sendMessage} className="p-3 border-top border-secondary" style={{ background: "#111827", flexShrink: 0 }}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control border-secondary text-white p-2 p-md-3"
                            placeholder={city ? `Message ${city} developers...` : "Message nearby developers..."}
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            style={{ borderRadius: '12px 0 0 12px', background: 'rgba(255,255,255,0.07)', fontSize: '14px' }}
                        />
                        <button
                            className="btn text-white px-3 px-md-4"
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
