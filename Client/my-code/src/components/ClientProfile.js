import React from "react"
import Avatar from "react-avatar"

export function ClientProfile({username}) {
    return (
        <div className="d-flex align-items-center mb-4 ms-4 avatar-wrapper">
            <Avatar 
                name={username.toString()} 
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${username}`}
                size={40} 
                round="12px" 
                color="#10b981"
                fgColor="#ffffff" 
            />
            <span className="ms-2 font-weight-medium text-light" style={{ fontSize: '14px' }}>
                {username.toString()}
            </span>
        </div>
    )
}