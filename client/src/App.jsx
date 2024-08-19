import "bootstrap/dist/css/bootstrap.min.css";
import LoginForm from "./components/login_page/Login";
import { Routes, Route } from "react-router-dom";
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import Activitise from "./components/pages/Activitise";
import News from "./components/pages/News";
import Event from "./components/pages/Event";

/*import Image from "./components/gallary/Image";
import Video from "./components/gallary/Video";*/
//import ProtectedRoute from "./utils/ProtecredRoute";

function App() {
  return (
    <>
      <Routes>
        <Route exact path="/" element={<LoginForm />} />
        <Route exact path="/home" element={<Home />} />
        <Route exact path="/about" element={<About />} />
        <Route exact path="/activitise" element={<Activitise />} />
        <Route exact path="/news" element={<News />} />
        <Route exact path="/events" element={<Event />} />
        {/*<Route exact path="/image" element={<Image />} />
          <Route exact path="/video" element={<Video />} />
          <Route exact path="/" element={<Home />} />*/}
      </Routes>
    </>
  );
}
export default App;
