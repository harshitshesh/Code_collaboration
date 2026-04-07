import React, { useEffect, useRef } from "react";

export function Terminal({ output, error, isRunning }) {
    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output, error]);

    return (
        <div className="w-100 bg-black text-white d-flex flex-column border-top border-secondary" style={{ height: "30%", fontFamily: "'Fira Code', monospace", fontSize: "13px" }}>
            <div className="p-2 d-flex align-items-center justify-content-between" style={{ background: "#21252b", borderBottom: "1px solid #181a1f" }}>
                <span className="fw-bold small"><i className="bi bi-terminal me-2"></i>OUTPUT</span>
                {isRunning && <span className="spinner-border spinner-border-sm text-primary"></span>}
            </div>
            <div 
                ref={terminalRef} 
                className="flex-grow-1 p-3 overflow-auto custom-scrollbar"
                style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
            >
                {output && <div className="text-light">{output}</div>}
                {error && <div className="text-danger mt-2">{error}</div>}
                {!output && !error && !isRunning && (
                    <div className="opacity-50 fst-italic">Code output will appear here...</div>
                )}
            </div>
        </div>
    );
}
