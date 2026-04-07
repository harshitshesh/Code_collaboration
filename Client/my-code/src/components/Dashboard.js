import React, { useEffect, useRef, useState } from "react"
import { ClientProfile } from "./ClientProfile"
import { Codeeditor } from "./Codeeditor"
import { Chat } from "./Chat"

import { initsocket } from "../socket"
import { useNavigate, useLocation, useParams, Navigate } from "react-router-dom"
import toast from "react-hot-toast"

export function Dashboard() {
    let [clients, setclients] = useState([])
    const socketref = useRef(null)
    const location = useLocation();
    const { roomid } = useParams()
    const navigate = useNavigate()
    const coderef = useRef(null)

    useEffect(() => {
        let init = async () => {
            socketref.current = await initsocket()
            socketref.current.on('connect_error', (err) => handleerror(err))
            socketref.current.on('connect_failed', (err) => handleerror(err))

            function handleerror(err) {
                console.log('backend error>>', err)
                toast.error('Connection failed')
                navigate("/")
            }

            socketref.current.emit('join', {
                roomid,
                username: location.state?.username,
            })

            socketref.current.on('joined', ({ allclints, username, socketid }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} Joined`)
                }
                setclients(allclints)

                socketref.current.emit('sync-code', {
                    code: coderef.current,
                    socketid,
                })
            })

            socketref.current.on('disconnected', ({ socketid, username }) => {
                toast.success(`${username} Left the room`)

                setclients((prev) => {
                    return prev.filter(
                        (client) => client.socketid !== socketid
                    )
                })
            })
        }
        init();

        return () => {
            if (socketref.current) {
                socketref.current.disconnect();
                socketref.current.off("joined");
                socketref.current.off("disconnected");
            }
        }
    }, [])

    if (!location.state) {
        return <Navigate to="/" />
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

    return (
        <div className="container-fluid vh-100 p-0">
            <div className="row g-0 h-100">
                {/* Sidebar */}
                <div className="col-md-2 bg-sidebar text-light d-flex flex-column h-100 border-end border-secondary">
                    <div className="p-4 text-center">
                        <img src="/img/code-logo.png" className="img-fluid rounded-pill mb-3" style={{ maxWidth: "60px" }} alt="Logo" />
                        <h5 className="font-weight-bold" style={{ color: 'var(--accent-primary)', fontSize: '16px' }}>CODE COLLAB</h5>
                    </div>
                    
                    <div className="px-3">
                        <p className="text-muted small mb-3 text-uppercase font-weight-bold" style={{ letterSpacing: '1px' }}>Connected Members</p>
                        <hr className="border-secondary mt-0 mb-4" />
                    </div>

                    <div className="flex-grow-1 overflow-auto custom-scrollbar">
                        {clients.map((data) => (
                            <ClientProfile key={data.socketid} username={data.username} />
                        ))}
                    </div>

                    <div className="p-3 d-flex flex-column gap-2 mt-auto">
                        <button onClick={copyroomid} className="btn btn-premium w-100 py-2" style={{ fontSize: '14px' }}>
                            <i className="bi bi-clipboard-plus me-2"></i>Copy Room ID
                        </button>
                        <button onClick={logout} className="btn btn-outline-danger w-100 py-2 border-0" style={{ fontSize: '14px' }}>
                            <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                        </button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="col-md-7 d-flex flex-column h-100 bg-dark">
                    <Codeeditor socketref={socketref} roomid={roomid} oncodechange={(code) => (coderef.current = code)} />
                </div>

                {/* Chat Area */}
                <div className="col-md-3 h-100">
                    <Chat socketref={socketref} roomid={roomid} username={location.state?.username} />
                </div>
            </div>
        </div>
    )
}