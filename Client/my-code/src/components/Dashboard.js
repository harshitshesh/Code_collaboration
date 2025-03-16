import React, { useEffect, useRef, useState } from "react"
import { Clintprofile } from "./Clintprofile"
import { Codeeditor } from "./Codeeditor"

import { initsocket } from "../socket"
import {useNavigate, useLocation , useParams ,Navigate,} from "react-router-dom"
import toast from "react-hot-toast"

export function Dashboard(){
    let [clients,setclients]=useState([])
const socketref = useRef(null)
const location = useLocation();
const {roomid} = useParams()
const navigate = useNavigate()
const coderef = useRef(null)

useEffect(()=>{
    let init = async ()=>{
        socketref.current = await initsocket()
socketref.current.on('connect_error',(err)=>handleerror(err))
socketref.current.on('connect_failed',(err)=>handleerror(err))

function handleerror(err){
    console.log('backend error>>',err)
    toast.error('Connection failed')
navigate("/")
}


        socketref.current.emit('join',{
            roomid,
            username: location.state?.username,
        })
        socketref.current.on('joined',({allclints,username,socketid})=>{
            if(username !== location.state?.username){
                toast.success(`${username} Joined`)
            }
            setclients(allclints)

            socketref.current.emit('sync-code',{
               code: coderef.current,
               socketid, 
            })
        })

       socketref.current.on('disconnected',({socketid,username})=>{
        toast.success(`${username} Leave room`)

        setclients((prev)=>{
            return prev.filter(
                (client)=> client.socketid !== socketid
            )
        })

       })
        
    }
    init();

    return ()=>{
        socketref.current.disconnect();
        socketref.current.off("joined");
        socketref.current.off("disconnected");

    }

},[])


    if(!location.state){
        return <Navigate to="/"/>
    }

   async function copyroomid(){

    // console.log(roomid)
try{
    await navigator.clipboard.writeText(roomid);
    toast.success("Copied Room ID!");
}catch(err){
   toast.error("unable to copy") 
}
    }

    function logout(){
        navigate("/")
    }

    return(
<>

<div className="container-fluid vh-100">
    <div className="row h-100">
        {/* first colume  */}
        <div className="col-md-3 bg-dark text-light d-flex flex-column h-100 " style={{ boxShadow: "inset 1px 5px 8px rgb(128, 171, 213)"}}>
<img src="/img/code-logo.png" className="img-fluid mx-auto rounded-pill " style={{ maxWidth:"80px", marginTop:"25px"}} />
<hr style={{marginTop:"2rem"}}/>

{/* client profile  */}
<div className="d-flex flex-column overflow-auto">

    {clients.map((data)=>(
        <Clintprofile roomid={data.roomid}username={data.username}/>
    ))}
</div>

{/* buttons  */}

<div className="mt-auto d-flex justify-content-center align-items-center flex-wrap gap-3 mb-3 ">

    <button onClick={copyroomid} className="btn btn-success">Copy room id</button>
    <button onClick={logout} className="btn btn-danger mb-2 px-3 btn-block mt-2">Logout</button>
</div>

        </div>
        {/* second colume  */}
       


        <div className="col-md-9  text-light d-flex flex-column h-100" style={{backgroundColor:"rgb(40, 40, 61)"}}>
        {/* <header>
            <nav>
                <li>Home</li>
                <li>About</li>

            </nav>
        </header> */}
            <Codeeditor socketref={socketref} roomid={roomid} oncodechange={(code)=>(coderef.current = code)}/>
      
        </div>
    </div>
</div>

</>
    )


}