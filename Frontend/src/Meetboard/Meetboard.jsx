import Carousel from "./Carousel";
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faCopy, faKeyboard, faVideo } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useContext } from "react";
import SocketContext from "../Sockets/SocketContext";
import { useNavigate } from "react-router-dom";

function MeetBoard() {
    const [generateRoomId, setGenerateRoomId] = useState("");
    const [display, setDisplay] = useState(false)
    const [host, setHost] = useState({});
    const [name, setName] = useState('');
    const [id, setId] = useState(null);
    const socket = useContext(SocketContext)
    const navigate = useNavigate();
    
    useEffect(() => {
        let name = localStorage.getItem('name');
        console.log(name)
        setName(name);
        setHost({ name, Ishost: false });
    }, [socket])

    function handleGenerate() {
        const hexCode = Math.floor(Math.random() * 0xFFFFFF).toString(16).padEnd(8, '0');
        setGenerateRoomId(hexCode);
        setDisplay(true)
        setHost({ name, Ishost: true });
    }

    function handleChange(e) {
        if (e.target.value != null) {
            setId(false)
        }
        setId(e.target.value)
    }

    function handleJoin() {
        if (id) {
            socket.emit("join-room", id, host);
            navigate(`/room/${id}`);

        } else {
            console.log("No room ID entered!");
        }
    }

    return (
        <>
            <Header />
            <main className=" font-jost flex flex-col md:flex-row justify-between items-center px-6 md:px-28 min-h-screen space-y-8 md:space-y-0 md:space-x-20 pb-20">
                <div className="w-full md:w-[40%] space-y-4">
                    <div className="flex">
                        <h1 className="text-3xl md:text-4xl">Video calls and meetings for everyone</h1>

                    </div>
                    <p className="text-lg text-gray-600">Connect, Learn and Teach from anywhere with Swapify.</p>
                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                        <button className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] rounded p-3 font-bold text-white flex items-center" onClick={handleGenerate}>
                            <FontAwesomeIcon icon={faVideo} />
                            <span className="mx-2">Create Room</span>
                        </button>

                        <div className="rounded p-3 border-2 space-x-4 flex items-center w-full md:w-auto">
                            <FontAwesomeIcon icon={faKeyboard} />
                            <input
                                type="text"
                                className="h-full outline-none w-full"
                                placeholder="Enter Room Id"
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                        <button className="font-bold" onClick={handleJoin} disabled={id ? false : true}>Join</button>
                    </div>
                </div>

                <div className="w-full md:w-auto">
                    <Carousel />
                </div>
            </main>

            <Footer />
            {
                display &&
                <div className="font-jost alignment w-1/4 py-10 px-8 space-y-5 bg-white shadow-xl">
                    <div className="flex">
                        <h1 className="text-2xl">Here's Your Joining Information</h1>
                        <button onClick={() => setDisplay(false)}>
                            <FontAwesomeIcon icon={faClose} />
                        </button>
                    </div>
                    <p className="">Send this to people that you want to meet with. Make sure you can save it so that you can use it later, too.</p>
                    <div className="flex w-full px-6 py-3 bg-gray-200">
                        <p className="w-full">
                            {generateRoomId}
                        </p>
                        <button className="" onClick={() => {
                            navigator.clipboard.writeText(generateRoomId)
                        }}>
                            <FontAwesomeIcon icon={faCopy} />
                        </button>
                    </div>
                </div>
            }
        </>
    )
}
export default MeetBoard;