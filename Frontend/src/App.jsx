import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DashBoard from "./DashBoard";
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
import MeetRoom from "./Meetboard/Meetroom";
import UserViewProfile from "./Profile/UserViewProfile";
import Chat from "./Chat/Chat";
import PeopleViewProfile from "./Profile/PeopleViewProfile";
import NotFound from "./NotFound/NotFound";
import Message from "./Messages/Messages";
import LearnMore from "./LearnMore/LearnMore";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import ResetPassword from "./ResetPassword/ResetPassword";
import Rating from "./Rating/Rating";

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
                <Route path="/userprofile" element={<UserViewProfile />} />
                <Route path="/meetroom/:roomid" element={<MeetRoom />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<DashBoard/>} />
                <Route path="/chatroom" element={<Chat/>} />
                <Route path="/chatroom" element={<Chat/>} />
                <Route path="/message" element={<Message/>} />
                <Route path="/peopleviewprofile/:uid" element={<PeopleViewProfile/>} />
                <Route path="/learnmore" element={<LearnMore/>} />
                <Route path="/forgotpassword" element={<ForgotPassword/>} />
                <Route path="/reset-password/:token" element={<ResetPassword/>} />
                <Route path = '*' element={<NotFound />} />
                <Route path="/rating" element={<Rating />} />
            </Routes>
        </Router>
    )
}
export default App;