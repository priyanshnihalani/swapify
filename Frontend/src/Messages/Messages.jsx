import { useContext, useEffect, useState } from "react"
import messageImage from '../assets/images/message.png'
import './Messages.css'
import { useParams } from "react-router-dom";
import SocketContext from "../Sockets/SocketContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleRight } from "@fortawesome/free-solid-svg-icons";
import LoaderAnimation from "../Loader/Loader";

function Message() {
    const [name, setName] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [display, setDisplay] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState(null);
    const [id, setId] = useState(null)
    const [receiverId, setReceiverId] = useState(null);
    const socket = useContext(SocketContext);
    // const [hasRefreshed, setHasRefreshed] = useState(false)
    const [myId, setMyId] = useState(null)


    useEffect(() => {
        const id = localStorage.getItem('id')
        setMyId(id)
        console.log(loading)
        console.log(id)

        if (id) {
            socket.emit('login', id)
        }
    }, [])
    useEffect(() => {

        async function fetchData() {
            if(!myId){
                setLoading(true)
            }

            try {
                setLoading(true); // Set loading to true when fetching starts
                const response = await fetch(`http://localhost:3000/messages/${myId}`);
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false); 
            }
        }

        fetchData()

    }, [myId])

    useEffect(() => {
        const handleStatus = (data) => {
            setReceiverId(data.userId);
            setStatus(data.status);
        };

        socket.on('status', handleStatus);

        return () => {
            socket.off('status')
        }

    }, [socket])

    useEffect(() => {
        const handleMessage = (receivedMessage) => {
            console.log('Message received in frontend:', receivedMessage);
            setMessages(prevMessages => {
                console.log('Previous messages:', prevMessages);
                const newMessages = [...prevMessages, { message: receivedMessage, type: 'receive' }];
                console.log('New messages state:', newMessages);
                return newMessages;
            });
        };

        socket.on('receive-message', handleMessage);

        return () => {
            socket.off('receive-message')
        }
    })



    async function fetchReceivedChatData(id, myId) {
        try {

            const response = await fetch(`http://localhost:3000/sendedChat?from=${id}&to=${myId}`);

            const result = await response.json();
            const received = result.map(item => ({
                message: item.message,
                type: item.sender === myId ? "sent" : "receive",
                timestamp: item.timestamp,
            }));

            console.log(received)
            return received

        } catch (error) {
            console.error("Error fetching messages:", error);
        }
        finally{
            setLoading(false)
        }
    }

    async function fetchSendedChatData(myId, id) {
        try {
            const response = await fetch(`http://localhost:3000/sendedChat?from=${myId}&to=${id}`);

            const result = await response.json();
            console.log(result)
            const sended = result.map(item => ({
                message: item.message,
                type: item.sender === myId ? "sent" : "receive",
                timestamp: item.timestamp,
            }));

            console.log(sended)
            return sended

        } catch (error) {
            console.error("Error fetching messages:", error);
        }
        finally{
            setLoading(false)
        }
    }

    async function setChat(name, id) {

        setDisplay(!display)
        setName(name)
        setId(id);

        socket.emit('getStatus', id);
        let sended = await fetchSendedChatData(myId, id)
        let received = await fetchReceivedChatData(id, myId)

        const allMessages = [...sended, ...received]
        let newArray = allMessages.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(newArray);
    }


    function sendMessage(id) {
        if (message.trim() && id) {
            socket.emit('send-message', id, message);
            setMessages(prevMessages => [...prevMessages, { message: message, type: 'sent' }]);
            setMessage('');
            const timestamp = new Date().getTime();

            async function sendMessageDB() {
                const response = await fetch('http://localhost:3000/sendmessagedb', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sender: myId,
                        receiver: id,
                        message,
                        timestamp
                    })
                })

                const result = await response.json()
                console.log(result);
            }

            sendMessageDB()
        }
    }
    return (

        <div>
            {loading ? (
                    <LoaderAnimation />
            ) : (
                <>
                    <div className="font-jost flex min-h-screen w-full bg-gray-100 p-6">
                        {/* Users List Section */}
                        <div className="w-1/3 bg-white rounded-lg p-4 overflow-y-auto max-h-screen">
                            <h2 className="text-xl font-bold mb-4">Users</h2>
                            <div className="space-y-4">
                                {data?.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg shadow-sm bg-gray-50 hover:bg-gray-200 transition">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-[50px] h-[50px] rounded-full bg-cover" style={{ backgroundImage: `url(${item.profileImage})` }}></div>
                                            <div>
                                                <h3 className="font-bold text-md">{item.name}</h3>
                                                <p className="text-sm text-gray-600">{item.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] font-medium text-white px-3 py-2 rounded-md text-sm" onClick={() => setChat(item.name, item._id)}>Chat</button>
                                            <button className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] font-medium text-white px-3 py-2 rounded-md text-sm">View</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chat Section */}
                        <div className="w-2/3 flex flex-col bg-white rounded-lg overflow-hidden ml-6">
                            {display ? (
                                <div className="flex flex-col h-full">
                                    {/* Chat Header */}
                                    <div className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] text-white p-4 flex justify-between items-center">
                                        <div>
                                            <h2 className="text-lg font-semibold">{name}</h2>
                                            <p className="text-sm text-gray-300">{status}</p>
                                        </div>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-200 style-bg">
                                        {messages?.map((message, index) => (
                                            <div key={index} className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                                                <p className={`px-4 py-2 rounded-md text-white max-w-xs ${message.type === 'sent' ? 'bg-[#252535]' : 'bg-[#646491]'}`}>{message.message}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chat Input */}
                                    <div className="p-3 shadow-md border-b-2 rounded-br-md rounded-bl-md flex items-center bg-gray-100">
                                        <input
                                            type="text"
                                            className="flex-1 p-2 border rounded-md outline-none"
                                            placeholder="Type a message..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                        <button onClick={() => sendMessage(id)} className="ml-2 bg-gradient-to-r from-[#252535] to-[#6C6C9B]  text-white px-4 py-2 rounded-md">
                                            <FontAwesomeIcon icon={faArrowCircleRight} size="lg" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center items-center h-full">
                                    <img src={messageImage} alt="message-image" className="max-w-[300px]" />
                                </div>
                            )}
                        </div>
                    </div>
                </>)}
        </div>
    )
}
export default Message