import Carousel from "./Carousel";
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faCopy, faKeyboard, faVideo } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useContext } from "react";
import SocketContext from "../Sockets/SocketContext";
import { useLocation, useNavigate } from "react-router-dom";
import Rating from "../Rating/Rating";

function MeetBoard() {
    const [generateRoomId, setGenerateRoomId] = useState("");
    const [display, setDisplay] = useState(false);
    const [host, setHost] = useState({});
    const [name, setName] = useState('');
    const [id, setId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [displayRating, setDisplayRating] = useState(false);
    const socket = useContext(SocketContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [reviewed, setReviewed] = useState(false);

    useEffect(() => {
        if (location.state) {
            setDisplayRating(!location?.state.Ishost);
        }
    }, []);

    useEffect(() => {
        if (reviewed) {
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [reviewed]);

    useEffect(() => {
        let name = localStorage.getItem('name');
        let userid = localStorage.getItem('id');
        setUserId(userid);
        setName(name);
        setHost({ userid, name, Ishost: false });
    }, [socket]);

    function handleGenerate() {
        const hexCode = Math.floor(Math.random() * 0xFFFFFF).toString(16).padEnd(8, '0');
        setGenerateRoomId(hexCode);
        setDisplay(true);
        setHost({ userId, name, Ishost: true });
    }

    function handleChange(e) {
        if (e.target.value !== null) {
            setId(false);
        }
        setId(e.target.value);
    }

    function handleJoin() {
        if (id) {
            socket.emit("join-room", id, host);
            navigate(`/meetroom/${id}`);
        } else {
            console.log("No room ID entered!");
        }
    }

    return (
        <>
            <Header />
            <main className="font-jost flex flex-col py-10 md:flex-row justify-between items-center px-6 sm:px-10 md:px-20 lg:px-28 min-h-screen space-y-6 md:space-y-0 md:space-x-10 pb-10">
                <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold break-words">Video calls and meetings for everyone</h1>
                    <p className="text-lg text-gray-600">Connect, Learn, and Teach from anywhere with Swapiify.</p>

                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full">
                        <button
                            className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] rounded p-3 font-bold text-white flex items-center justify-center w-full sm:w-auto"
                            onClick={handleGenerate}
                        >
                            <FontAwesomeIcon icon={faVideo} />
                            <span className="mx-2">Create Room</span>
                        </button>

                        <div className="rounded p-3 border-2 flex items-center w-full sm:w-auto max-w-md">
                            <FontAwesomeIcon icon={faKeyboard} />
                            <input
                                type="text"
                                className="h-full outline-none w-full px-2"
                                placeholder="Enter Room Id"
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            className="font-bold px-4 py-2 rounded disabled:opacity-50  w-full sm:w-auto"
                            onClick={handleJoin}
                            disabled={!id}
                        >
                            Join
                        </button>
                    </div>
                </div>

                <div className="w-[90%] md:w-1/2 flex justify-center">
                    <Carousel />
                </div>
            </main>


            <Footer />
            {display && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="font-jost w-11/12 md:w-1/3 bg-white shadow-xl rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h1 className="text-xl font-bold">Here's Your Joining Information</h1>
                            <button onClick={() => setDisplay(false)}>
                                <FontAwesomeIcon icon={faClose} />
                            </button>
                        </div>
                        <p className="text-gray-600">Send this to people that you want to meet with. Save it for later use.</p>
                        <div className="flex items-center justify-between bg-gray-200 p-3 rounded">
                            <p className="truncate">{generateRoomId}</p>
                            <button onClick={() => navigator.clipboard.writeText(generateRoomId)}>
                                <FontAwesomeIcon icon={faCopy} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {displayRating && <Rating display={setDisplayRating} data={location?.state} reviewed={setReviewed} />}
        </>
    );
}

export default MeetBoard;