import { useState, useEffect } from 'react';
import io from 'socket.io-client';

function Chat() {
    const [status, setStatus] = useState('');
    const [socket, setSocket] = useState(null);
    const [userName, setUserName] = useState('');
    const [receiverName, setReceiverName] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const socketInstance = io(`${backendUrl}`);
        setSocket(socketInstance);

        socketInstance.on('status', (message) => {
            setStatus(message);
        });

        socketInstance.on('receive-message', (message) => {
            setMessages((prevMessages) => [...prevMessages, { text: message, type: 'receive' }]);
        });

        socketInstance.on('user-list', (userList) => {
            setUsers(userList); // Assuming `setUsers` is a state updater for your user list
        });

        socketInstance.on('disconnect', () => {
            setStatus('User is Offline');
        });

        return () => {
            socketInstance.off('status');
            socketInstance.disconnect();
        };
    }, []);

    function handleUser() {
        socket.emit('set-username', userName);
    }

    function sendMessage() {
        socket.emit('send-message', receiverName, message);
        setMessages((prevMessages) => [...prevMessages, { text: message, type: 'sent' }]);
        setMessage('');
    }

    return (
        <div className="h-screen bg-gradient-to-r from-[#252535] to-[#6C6C9B] flex">
            {/* Sidebar */}
            <div className="w-1/4 bg-gray-800 text-white flex flex-col">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">Your Name</h2>
                    <input
                        type="text"
                        className="w-full mt-2 p-2 rounded bg-gray-700 text-white"
                        placeholder="Enter your name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                    <button
                        onClick={handleUser}
                        className="mt-2 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                    >
                        Set User
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto">
                    {users.map((user, index) => (
                        <div
                            key={index}
                            className="p-4 border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
                            onClick={() => setReceiverName(user)}
                        >
                            {user}
                        </div>
                    ))}
                </div>

            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col bg-white">
                <div className="p-4 bg-gray-200 border-b border-gray-300">
                    <h2 className="text-lg font-bold">{receiverName || 'Select a User to Chat'}</h2>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`mb-2 flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            <div
                                className={`max-w-xs p-2 rounded-lg ${msg.type === 'sent'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-300 text-black'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="p-4 bg-gray-200 border-t border-gray-300 flex items-center">
                    <input
                        type="text"
                        className="flex-1 p-2 rounded border border-gray-400"
                        placeholder="Type a message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                        onClick={sendMessage}
                        className="ml-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;
