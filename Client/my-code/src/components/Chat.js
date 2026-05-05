import React, { useState, useEffect, useRef } from "react";

export function Chat({ socketref, roomid, username, onNewUnread, fullWidth }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const scrollRef = useRef();

    useEffect(() => {
        if (socketref.current) {
            socketref.current.on('receive-message', (data) => {
                setMessages((prev) => [...prev, data]);
                if (onNewUnread) onNewUnread();
            });
        }
        return () => {
            if (socketref.current) {
                socketref.current.off('receive-message');
            }
        };
    }, [socketref.current]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && socketref.current) {
            socketref.current.emit('send-message', {
                roomid,
                message,
                username,
            });
            setMessage("");
        }
    };

    return (
        <div className="d-flex flex-column h-100 glass-morphism shadow-lg" style={{ width: fullWidth ? '100%' : '300px', borderLeft: fullWidth ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
            <div className="p-3 border-bottom border-secondary d-flex align-items-center">
                <h6 className="m-0 text-accent font-weight-bold" style={{ color: 'var(--accent-primary)' }}>CHAT</h6>
            </div>

            <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-2" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message-bubble ${msg.username === username ? 'message-self' : 'message-other'}`}
                    >
                        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>
                            {msg.username === username ? 'You' : msg.username}
                        </div>
                        <div style={{ fontSize: '13px' }}>{msg.message}</div>
                        <div ref={scrollRef}></div>
                    </div>
                ))}
            </div>

            <form onSubmit={sendMessage} className="p-3 bg-dark-sidebar border-top border-secondary">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control bg-dark border-secondary text-white"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{ fontSize: '13px', borderRadius: '8px 0 0 8px' }}
                    />
                    <button
                        className="btn btn-premium"
                        type="submit"
                        style={{ borderRadius: '0 8px 8px 0', padding: '0 15px' }}
                    >
                        <i className="bi bi-send-fill"></i>
                    </button>
                </div>
            </form>
        </div>
    );
}
