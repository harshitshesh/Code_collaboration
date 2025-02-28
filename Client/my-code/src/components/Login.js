import React from "react"

export function Login() {
    return (
        <>
            <div className="container-fluid">
                <div className="row justify-content-end align-items-center min-vh-100 me-5">
                    <div className="col-12 col-md-6">
                        <div className="card shadow-sm p-2 mb-5 bg-secondry rounded">
                            <div className="card-body text-center bg-dark">
                                <img className="img-fluid mx-auto d-block  rounded-pill w-25" src="/img/code-logo.png" alt="code-unity" />

                                <h1 className="text-white">Enter your Details</h1>
                                <div className="form-group">
                                    <input type="text" className="form-control mb-2" placeholder="Enter genrated key" />

                                    <input type="text" className="form-control mb-2" placeholder="Enter Username" />

                                </div>
                                <button className="btn btn-success btn-lg btn-block">Join</button>
                                <p className="mt-3  text-light">Don't have a Genrated id? {"  "} <span className="text-success p-2" style={{ cursor: "pointer" }} >New id create</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}