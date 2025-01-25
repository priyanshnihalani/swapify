import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "./Sockets/SocketProvider";


function DashBoard() {

    const socket = useSocket()
    const [roomId, setRoomId] = useState("");
    const [generateRoomId, setGenerateRoomId] = useState("");
    const navigate = useNavigate();
    const [host, setHost] = useState({});
    const [name, setName] = useState('');
    useEffect(() => {
        let name = localStorage.getItem('name');
        console.log(name)
        setName(name);
        setHost({ name, Ishost: false });
    }, [socket])


    function join() {

        if (roomId) {
            console.log(host)
            socket.emit("join-room", roomId, host);
            navigate(`/room/${roomId}`);

        } else {
            console.log("No room ID entered!");
        }
    }
    function handleGenerate() {
        setGenerateRoomId(Math.round((Math.random() * 200)) + 1);
        setHost({ name, Ishost: true });
    }

    return (
        <div>
            <h1>Dashboard</h1>

            <button onClick={handleGenerate}>Generate Room ID</button>
            {generateRoomId && <p>Generated Room Id: {generateRoomId}</p>}

            <input
                type="text"
                name="roomId"
                placeholder="Room Id"
                onChange={(e) => setRoomId(e.target.value)} // Capture roomId from input
            />
            <button onClick={join}>Join</button>
        </div>
    );
}

export default DashBoard;
