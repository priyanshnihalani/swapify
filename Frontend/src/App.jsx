import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DashBoard from "./DashBoard";
import Room from "./Room";
import SignIn from "./Signin/Signin";
import SignUp from "./Signup/Signup";
import Home from "./Home/Home";
import About from "./About/About";
import Contact from "./Contact/Contact";
import PrivacyPolicy from "./PrivacyPolicy/PrivacyPolicy";
import Browseskill from "./BrowseSkill/BrowseSkill";
import FAQ from "./FAQ/FAQ";
import Terms_Condition from "./Terms_Condition/Terms_Condition";
import MeetBoard from "./Meetboard/Meetboard";
import Meetroom from "./Meetboard/Meetroom";
import UserViewProfile from "./Profile/UserViewProfile";
import Chat from "./Chat/Chat";
import PeopleViewProfile from "./Profile/PeopleViewProfile";
import NotFound from "./NotFound/NotFound";
import Message from "./Messages/Messages";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/aboutus" element={<About />} />
                <Route path="/contactus" element={<Contact/>} />
                <Route path="/dashboard" element={<DashBoard />} />
                <Route path="/privacypolicy" element={<PrivacyPolicy />} />
                <Route path="/browseskill" element={<Browseskill/>}/>
                <Route path="/faq" element={<FAQ />} />
                <Route path="/termsandcondition" element={<Terms_Condition/>} />
                <Route path="/meetboard" element={<MeetBoard/>} />
                <Route path="/meetroom" element={<Meetroom />} />
                <Route path="/userprofile" element={<UserViewProfile />} />
                <Route path="/room/:roomid" element={<Room />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<DashBoard/>} />
                <Route path="/chatroom" element={<Chat/>} />
                <Route path="/chatroom" element={<Chat/>} />
                <Route path="/message" element={<Message/>} />
                <Route path="/peopleviewprofile/:name" element={<PeopleViewProfile/>} />
                <Route path = '*' element={<NotFound />} />
            </Routes>
        </Router>
    )
}
export default App;