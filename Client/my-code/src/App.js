
import {Routes,Route} from "react-router-dom"
import { Login } from './components/Login';
import { Home } from './components/Home';
import { PublicLogin } from './components/PublicLogin';
import { PublicDashboard } from './components/PublicDashboard';
import { Dashboard } from './components/Dashboard';
import {Toaster} from 'react-hot-toast'
function App() {
  return (
    <>
    <Toaster position="top-right"></Toaster>
<Routes>
<Route path="/" element={<Home/>}/>
<Route path="/private" element={<Login/>}/>
<Route path="/public" element={<PublicLogin/>}/>
<Route path="/dashboard/:roomid" element={<Dashboard/>}/>
<Route path="/public-dashboard" element={<PublicDashboard/>}/>
</Routes>
 </>
  )
}

export default App;
