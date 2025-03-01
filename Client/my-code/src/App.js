
import {Routes,Route} from "react-router-dom"
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import {Toaster} from 'react-hot-toast'
function App() {
  return (
    <>
    <Toaster position="top-right"></Toaster>
<Routes>
<Route path="/" element={<Login/>}/>
<Route path="/dashboard/:id" element={<Dashboard/>}/>

</Routes>
 </>
  )
}

export default App;
