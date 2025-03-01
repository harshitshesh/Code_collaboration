import React, { useState } from "react"
import { v4 as uuid } from "uuid";
import {toast} from "react-hot-toast"
import { useNavigate } from "react-router-dom";
export function Login() {

    const [roomid, setroomid] = useState("");
    const [username,setusername]= useState("")

    const navigatepage = useNavigate()

function joinroomfunc(){
if(!roomid || !username){
    toast.error("Invailid Room id or username")
    return
}

navigatepage(`/dashboard/${roomid}`,{
    state:{username}
})
toast.success("Wellcom, Work On Ideas")
}

    function genrateroomid(e){
e.preventDefault();
let id = uuid()
setroomid(id)
toast.success("Room id generated successfully")
    }
    return (
        <>
            <div className="container-fluid">
                <div className="row justify-content-end align-items-center min-vh-100 me-5">
                    <div className="col-12 col-md-6">
                        <div className="card shadow-sm  mb-5 bg-secondry rounded">
                            <div className="card-body text-center bg-dark">
                                <img className="img-fluid mx-auto d-block  rounded-pill w-25" src="/img/code-logo.png" alt="code-unity" />

                                <h1 className="text-white m-4">Enter your Details</h1>
                                <div className="form-group">
                                    <input type="text" className="form-control mb-2" placeholder="Enter genrated Id" value={roomid}
                                  onChange={(e)=>setroomid(e.target.value)} />

                                    <input value={username} onChange={(e)=>setusername(e.target.value)} type="text" className="form-control mb-2" placeholder="Enter Username" />

                                </div>
                                <button onClick={joinroomfunc} className="btn btn-success btn-lg btn-block">Join</button>
                                <p className="mt-3  text-light">Don't have a id Genrated id {"  "} <span className="text-success p-2" style={{ cursor: "pointer" }} 
                            onClick={genrateroomid}    >New Room-Id </span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}