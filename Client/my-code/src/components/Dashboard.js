import React, { useEffect, useRef, useState } from "react"
import { ClientProfile } from "./ClientProfile"
import { Codeeditor } from "./Codeeditor"
import { Chat } from "./Chat"
import { Terminal } from "./Terminal"

import { initsocket } from "../socket"
import { useNavigate, useLocation, useParams, Navigate } from "react-router-dom"
import toast from "react-hot-toast"

const PISTON_LANGUAGES = {
    javascript: "18.15.0",
    python: "3.10.0",
    cpp: "10.2.0",
    java: "15.0.2"
};

export function Dashboard() {
    let [clients, setclients] = useState([])
    let [currentController, setCurrentController] = useState(null)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false) // For mobile menu
    const [unreadCount, setUnreadCount] = useState(0)

    const [language, setLanguage] = useState("javascript")
    const [terminalOutput, setTerminalOutput] = useState("")
    const [terminalError, setTerminalError] = useState("")
    const [isTerminalRunning, setIsTerminalRunning] = useState(false)

    const socketref = useRef(null)
    const location = useLocation();
    const { roomid } = useParams()
    const navigate = useNavigate()
    const coderef = useRef("")

    useEffect(() => {
        let init = async () => {
            socketref.current = await initsocket()
            socketref.current.on('connect_error', (err) => handleerror(err))
            socketref.current.on('connect_failed', (err) => handleerror(err))

            function handleerror(err) {
                console.log('backend error>>', err)
                toast.error('Connection failed')
                navigate("/private")
            }

            socketref.current.emit('join', {
                roomid,
                username: location.state?.username,
                isHost: location.state?.isHost || false
            })

            socketref.current.on('joined', ({ allclints, username, socketid }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} Joined`)
                }
                setclients(allclints)

                if (socketid === socketref.current.id) {
                    socketref.current.emit('sync-code', {
                        code: coderef.current,
                        socketid,
                    })
                }
            })

            socketref.current.on('controller-changed', ({ controllerId }) => {
                setCurrentController(controllerId);
                if (controllerId === socketref.current.id) {
                    toast.success("You have editor control!");
                }
            })

            socketref.current.on('language-change', ({ language }) => {
                setLanguage(language);
            })

            socketref.current.on('terminal-output', ({ output }) => {
                setTerminalOutput(output.out || "");
                setTerminalError(output.err || "");
                setIsTerminalRunning(output.isRunning || false);
            })

            socketref.current.on('disconnected', ({ socketid, username }) => {
                toast.success(`${username} Left the room`)
                setclients((prev) => prev.filter((client) => client.socketid !== socketid))
            })

            socketref.current.on('execution-result', ({ out, err }) => {
                setTerminalOutput(out);
                setTerminalError(err);
                setIsTerminalRunning(false);
            })
        }
        init();

        // Responsive handling Default UI states
        if (window.innerWidth >= 768) {
            setIsChatOpen(true);
            setIsSidebarOpen(true);
        }

        return () => {
            if (socketref.current) {
                socketref.current.disconnect();
                socketref.current.off("joined");
                socketref.current.off("disconnected");
                socketref.current.off("controller-changed");
                socketref.current.off("language-change");
                socketref.current.off("terminal-output");
                socketref.current.off("execution-result");
            }
        }
    }, [])

    if (!location.state) {
        return <Navigate to="/private" />
    }

    async function copyroomid() {
        try {
            await navigator.clipboard.writeText(roomid);
            toast.success("Copied Room ID!");
        } catch (err) {
            toast.error("unable to copy")
        }
    }

    function logout() {
        navigate("/")
    }

    function passControl(targetId) {
        if (socketref.current && currentController === socketref.current.id) {
            socketref.current.emit('pass-control', { roomid, targetId });
            toast.success("Control passed successfully");
        }
    }

    function changeLanguage(lang) {
        if (currentController !== socketref.current?.id) return;
        setLanguage(lang);
        socketref.current.emit("language-change", { roomid, language: lang });
    }

    async function executeCode() {
        if (currentController !== socketref.current?.id) return;
        const codeToRun = coderef.current;
        
        setIsTerminalRunning(true);
        setTerminalOutput("");
        setTerminalError("");
        socketref.current.emit("terminal-output", { roomid, output: { out: "", err: "", isRunning: true } });

        // Send to our local backend to execute
        socketref.current.emit("execute-code", {
            roomid,
            code: codeToRun,
            language: language
        });
    }

    const unreadBadge = (!isChatOpen && unreadCount > 0) ? (
        <span className="badge bg-danger rounded-pill ms-2">{unreadCount}</span>
    ) : null;

    const isHost = currentController === socketref.current?.id;

    return (
        <div className="container-fluid vh-100 p-0 overflow-hidden d-flex flex-column flex-md-row">
            
            {/* Mobile Header Bar */}
            <div className="d-md-none bg-dark text-white p-3 d-flex align-items-center justify-content-between border-bottom border-secondary">
                <div onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{cursor:'pointer'}}>
                    <i className="bi bi-list fs-4"></i>
                </div>
                <h5 className="m-0 text-premium fw-bold fs-6">Code Collab</h5>
                <div>
                   <button className="btn btn-sm btn-outline-primary position-relative" onClick={() => setIsChatOpen(!isChatOpen)}>
                       <i className="bi bi-chat-left-dots"></i>
                       {unreadBadge && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light" style={{fontSize:'0.6em'}}>{unreadCount}</span>}
                   </button>
                </div>
            </div>

            {/* Sidebar */}
            {isSidebarOpen && (
                <div className="col-12 col-md-2 bg-sidebar text-light d-flex flex-column border-end border-secondary h-100 position-relative z-index-master">
                    <div className="p-4 text-center d-none d-md-block">
                        <img src="/img/code-logo.png" className="img-fluid mb-3 mx-auto d-block" style={{ maxWidth: "60px" }} alt="Logo" />
                        <h5 className="font-weight-bold" style={{ color: 'var(--accent-primary)', fontSize: '16px' }}>CODE COLLAB</h5>
                    </div>
                    
                    <div className="px-3 pt-3 pt-md-0">
                        <p className="text-white opacity-50 small mb-3 text-uppercase font-weight-bold" style={{ letterSpacing: '1px' }}>Connected Members</p>
                        <hr className="border-secondary mt-0 mb-4" />
                    </div>

                    <div className="flex-grow-1 overflow-auto custom-scrollbar px-2">
                        {clients.map((data) => (
                            <div key={data.socketid} className="d-flex align-items-center justify-content-between mb-2 p-2 rounded" style={{ background: "rgba(255,255,255,0.02)" }}>
                                <div><ClientProfile username={data.username} /></div>
                                <div className="text-end">
                                    {data.socketid === currentController ? (
                                        <span className="badge bg-warning text-dark me-2" title="Host Configuration"><i className="bi bi-star-fill"></i> Host</span>
                                    ) : null}
                                    {isHost && data.socketid !== currentController ? (
                                        <button 
                                            className="btn btn-sm btn-outline-info p-1 px-2 mt-1" 
                                            style={{ fontSize: "10px" }}
                                            onClick={() => passControl(data.socketid)}
                                        >
                                            Pass Control
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 d-flex flex-column gap-2 mt-auto border-top border-secondary">
                        <button 
                            onClick={() => {
                                setIsChatOpen(!isChatOpen);
                                if (!isChatOpen) setUnreadCount(0);
                            }} 
                            className="btn btn-outline-primary w-100 py-2 d-none d-md-block" style={{ fontSize: '14px' }}>
                            <i className={`bi ${isChatOpen ? 'bi-chat-left-text' : 'bi-chat-left-dots'} me-2`}></i>
                            {isChatOpen ? "Hide Chat" : "Show Chat"}
                            {unreadBadge}
                        </button>
                        <button onClick={copyroomid} className="btn btn-premium w-100 py-2" style={{ fontSize: '14px' }}>
                            <i className="bi bi-clipboard-plus me-2"></i>Copy Room ID
                        </button>
                        <button onClick={logout} className="btn btn-outline-danger w-100 py-2 border-0" style={{ fontSize: '14px' }}>
                            <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                        </button>
                    </div>
                </div>
            )}

            {/* Editor & Terminal Area */}
            <div className="d-flex flex-column h-100 bg-dark transition-all flex-grow-1 min-vw-0">
                
                {/* Editor Action Bar */}
                <div className="bg-dark border-bottom border-secondary p-2 d-flex justify-content-between align-items-center flex-wrap">
                    <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
                         {isHost ? (
                             <select className="form-select form-select-sm bg-secondary text-white border-secondary" style={{width: '140px'}} value={language} onChange={(e) => changeLanguage(e.target.value)}>
                                 <option value="javascript">JavaScript (Node)</option>
                                 <option value="python">Python</option>
                                 <option value="cpp">C++</option>
                                 <option value="java">Java</option>
                             </select>
                         ) : (
                             <span className="badge bg-secondary px-3 py-2 text-uppercase fs-6">{language}</span>
                         )}
                         <span className={`badge ${isHost ? 'bg-success' : 'bg-secondary'} ms-2`}>
                            {isHost ? "Editing Permitted" : "View Only"}
                         </span>
                    </div>
                    {isHost && (
                        <button className="btn btn-sm btn-success fw-bold px-4" onClick={executeCode} disabled={isTerminalRunning}>
                            {isTerminalRunning ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-play-fill me-1"></i>} 
                            Run
                        </button>
                    )}
                </div>

                <div className="flex-grow-1 overflow-hidden">
                    <Codeeditor 
                        socketref={socketref} 
                        roomid={roomid} 
                        language={language}
                        oncodechange={(code) => (coderef.current = code)} 
                        readOnly={!isHost}
                    />
                </div>
                
                {/* Terminal Pane */}
                <Terminal output={terminalOutput} error={terminalError} isRunning={isTerminalRunning} />
                
            </div>

            {/* Chat Area */}
            {isChatOpen && (
                <div className="col-12 col-md-auto border-start border-secondary h-100 z-index-chat bg-dark" style={{ width: '300px' }}>
                    {window.innerWidth < 768 && (
                       <div className="bg-dark border-bottom border-secondary p-2 w-100 text-end">
                           <button className="btn btn-sm text-white" onClick={() => setIsChatOpen(false)}><i className="bi bi-x-lg"></i> Close Chat</button>
                       </div>
                    )}
                    <div style={{ height: window.innerWidth < 768 ? 'calc(100% - 40px)' : '100%' }}>
                        <Chat 
                            socketref={socketref} 
                            roomid={roomid} 
                            username={location.state?.username} 
                            onNewUnread={() => {
                                if (!isChatOpen) setUnreadCount((c) => c + 1);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Mobile Backdrop Overlay for Sidebar */}
            {isSidebarOpen && window.innerWidth < 768 && (
                <div className="position-fixed w-100 h-100 bg-black opacity-50" style={{top: '60px', left: 0, zIndex: 1045}} onClick={() => setIsSidebarOpen(false)}></div>
            )}
        </div>
    )
}