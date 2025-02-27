import { useContext, useEffect, useState, useRef } from "react"
import messageImage from '../assets/images/message.png'
import './Messages.css'
import { useNavigate, useParams } from "react-router-dom";
import SocketContext from "../Sockets/SocketContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleRight, faCircleStop, faCommentDots, faHandDots, faListDots } from "@fortawesome/free-solid-svg-icons";
import LoaderAnimation from "../Loader/Loader";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";


function Message() {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [name, setName] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const chatRef = useRef(null);
    const [display, setDisplay] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState(null);
    const [id, setId] = useState(null)
    const [receiverId, setReceiverId] = useState(null);
    const socket = useContext(SocketContext);
    const [hastoken, setHastoken] = useState(false)
    const [myId, setMyId] = useState(null)
    const [isblock, setisBlock] = useState(false)
    const navigate = useNavigate()
    const [messageExist, setMessageExist] = useState(false)
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const accesstoken = localStorage.getItem("accesstoken")
        if (accesstoken) {
            setHastoken(true);
        }
    }, [])

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
            if (!myId) {
                setLoading(true)
            }

            try {
                setLoading(true); // Set loading to true when fetching starts
                const response = await fetch(`${backendUrl}/messages/${myId}`);
                const result = await response.json();
                if (result.message == "No Opponents found") {
                    setLoading(false)
                    setMessageExist(false)
                }
                else {

                    setData(result);
                    setMessageExist(true);
                }
                console.log(result)
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData()

    }, [myId])

    useEffect(() => {
        if (!data) {
            setLoading(false)
        }
    }, [data])

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
    }, [socket])



    async function fetchReceivedChatData(id, myId) {
        try {

            const response = await fetch(`${backendUrl}/sendedChat?from=${id}&to=${myId}`);

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
        finally {
            setLoading(false)
        }
    }

    async function fetchSendedChatData(myId, id) {
        try {
            const response = await fetch(`${backendUrl}/sendedChat?from=${myId}&to=${id}`);

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
        finally {
            setLoading(false)
        }
    }

    async function fetchUserData(myId) {
        const response = await fetch(`${backendUrl}/userviewprofile/${myId}`)

        const result = await response.json()
        return result;
    }

    async function setChat(name, id) {

        let userData = await fetchUserData(myId)
        userData?.BlockUsers?.map((ids) => {
            if (id === ids) {
                setisBlock("UnBlock")
            }
        })

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


    function sendMessage(id, name, message) {
        let timestamp;

        async function sendMessageDB() {
            const response = await fetch(`${backendUrl}/sendmessagedb`, {
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


        if (message.trim() && id) {
            socket.emit('send-message', myId, id, message);
            setMessages(prevMessages => [...prevMessages, { message: message, type: 'sent' }]);
            setMessage('');
            timestamp = new Date().getTime();
        }

        const item = data?.filter((item) => {
            if (item._id == id) {
                console.log(item)
                return item
            }
        })

        console.log(item[0]?.BlockUsers)
        if (item[0]?.BlockUsers?.length == 0) {
            console.log("Empty")
            sendMessageDB()
        }
        else if (item[0]?.BlockUsers == undefined) {
            console.log("Not Exist")
            sendMessageDB()
        }
        else {
            console.log("Not Match")
            item[0]?.BlockUsers?.map((item) => {
                console.log("yes")
                if (item != myId) {
                    console.log("yes")
                    sendMessageDB()
                }
            })
        }
    }

    async function handleBlock() {
        setisBlock(prevIsBlock => {
            const newIsBlock = !prevIsBlock;
            console.log("New isBlock value:", newIsBlock);

            if (!prevIsBlock) {
                fetch(`${backendUrl}/block/?idToBlock=${id}&idWantToBlock=${myId}`)
                    .then(response => response.json())
                    .then(result => {
                        console.log("Blocked");
                        if (result.message !== "Success to Block User") {
                            setisBlock(prev => !prev);
                        }
                    });
            } else {
                fetch(`${backendUrl}/unblock/?idToUnBlock=${id}&idWantToUnBlock=${myId}`)
                    .then(response => response.json())
                    .then(result => {
                        console.log(result);
                        if (result.message !== "Success to Unblock User") {
                            setisBlock(prev => !prev);
                        }
                    });
            }

            return newIsBlock;
        });
    }


    return (

        <div>
            {<Header />}
            {messageExist ? (<div>
                {loading ? (
                    <LoaderAnimation />
                ) : (
                    <>
                        <Header />
                        <div className="font-jost flex flex-col md:flex-row w-full ">
                            {/* Users List Section */}
                            <div className="w-full md:w-1/3 bg-gray-100 rounded-lg p-4 overflow-y-auto max-h-screen mb-6 md:mb-0">
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
                                                <button onClick={() => navigate(`/peopleviewprofile/${item._id}`)} className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] font-medium text-white px-3 py-2 rounded-md text-sm">View</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Chat Section */}
                            <div className="w-full md:w-2/3 flex flex-col bg-white rounded-lg overflow-hidden h-[85vh]">
                                {display ? (
                                    <div className="flex flex-col h-full">
                                        {/* Chat Header */}
                                        <div className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] text-white p-4 flex justify-between items-center">
                                            <div>
                                                <h2 className="text-lg font-semibold">{name}</h2>
                                                <p className="text-sm text-gray-300">{status}</p>
                                            </div>
                                            <div className="relative flex space-x-4">
                                                <div className="group cursor-pointer relative">
                                                    <FontAwesomeIcon icon={faCircleStop} />

                                                    <div className="hidden group-hover:block absolute 
                                                    bg-[#6C6C9B] border-4 border-[#252535] right-0 text-white px-4 py-2 rounded" onClick={handleBlock}>

                                                        <h1>{isblock ? "UnBlock" : "Block"}</h1>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chat Messages */}
                                        <div className="flex-1 p-4 pb-0 overflow-y-scroll space-y-2 bg-gray-200 style-bg" ref={chatRef}>
                                            {messages?.map((message, index) => (
                                                <div key={index} className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                                                    <p className={`my-2 px-4 py-2 rounded-md text-white max-w-xs ${message.type === 'sent' ? 'bg-[#252535]' : 'bg-[#464673]'}`}>{message.message}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Chat Input */}
                                        <div className="p-3 shadow-md border-t-2 rounded-br-md rounded-bl-md flex items-center bg-gray-100">
                                            <input
                                                type="text"
                                                className="flex-1 p-2 border rounded-md outline-none"
                                                placeholder="Type a message..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                            />
                                            <button onClick={() => sendMessage(id, name, message)} className="ml-2 bg-gradient-to-r from-[#252535] to-[#6C6C9B] text-white px-4 py-2 rounded-md">
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
                        <Footer />
                    </>
                )}
            </div>) : (
                <div className="relative min-h-screen">
                    <img src={messageImage} className="w-[40%] alignment" />
                </div>
            )}
            {<Footer />}
        </div>


    )
}
export default Message