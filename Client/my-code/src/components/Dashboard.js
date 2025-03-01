import React, { useState } from "react"
import { Clintprofile } from "./Clintprofile"
import { Codeeditor } from "./Codeeditor"

export function Dashboard(){
 let [clients,setclients]=useState([
    {roomid:1,username:"sanu"},{roomid:2,username:"nawaz"}])

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

    <button className="btn btn-success">Copy room id</button>
    <button className="btn btn-danger mb-2 px-3 btn-block mt-2">Logout</button>
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
            <Codeeditor/>
      
        </div>
    </div>
</div>

</>
    )


}