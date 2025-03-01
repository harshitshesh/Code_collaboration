import React from "react"
import Avatar from "react-avatar"
export function Clintprofile({username}){

    return(
        <>
        <div className="d-flex align-items-center mb-4 ms-4">
            <Avatar name={username.toString()} size={40} round="20px" />
            <span className="ms-2">{username.toString()}</span>
        </div>
        </>
    )
}