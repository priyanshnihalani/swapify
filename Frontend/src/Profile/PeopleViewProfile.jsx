import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowCircleRight,
  faCoins,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import ratings from "../assets/images/ratings.png";
import './PeopleViewProfile.css'
import SocketContext from "../Sockets/SocketContext";

function PeopleViewProfile() {
  const params = useParams();
  const { name } = params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [display, setDisplay] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(null);
  const [id, setId] = useState(null)
  const [receiverId, setReceiverId] = useState(null);
  const socket = useContext(SocketContext);
  // const [hasRefreshed, setHasRefreshed] = useState(false)
  const [myId, setMyId] = useState(null)
  const [sendMessages, setSendMessages] = useState([]);
  const [receiveMessages, setReceiveMessages] = useState([]);

  useEffect(() => {

    const id = localStorage.getItem('id')
    setMyId(id);
    console.log(id)

    if (id) {
      socket.emit('login', id)
    }
  }, [])

  useEffect(() => {

    const username = encodeURIComponent(name);
    async function fetchUserData() {
      try {
        const response = await fetch(
          `http://localhost:3000/peopleviewprofile/${myId}`
        );
        const result = await response.json();
        console.log(result)
        setData(result);
        setId(result._id);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();

  }, [name, myId]);

  useEffect(() => {
    if (id) {
      socket.emit('getStatus', id);
    }
  }, [id])

  useEffect(() => {
    if (data) {
      async function fetchSendedChatData() {

        try {
          const response = await fetch(`http://localhost:3000/sendedChat?from=${myId}&to=${data?._id}`);
          const result = await response.json();
          const newMessages = result.map(item => ({
            message: item.message,
            type: item.sender === myId ? "sent" : "receive",
            timestamp: item.timestamp,
          }));

          setSendMessages(newMessages);

        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }

      fetchSendedChatData();
    }
  }, [myId, data]);

  useEffect(() => {
    if (data) {
      async function fetchReceivedChatData() {
        try {
          const response = await fetch(`http://localhost:3000/sendedChat?from=${data?._id}&to=${myId}`);
          const result = await response.json();
          const newMessages = result.map(item => ({
            message: item.message,
            type: item.sender === myId ? "sent" : "receive",
            timestamp: item.timestamp,
          }));

          setReceiveMessages(newMessages);

        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }

      console.log(id, myId, status)
      fetchReceivedChatData();
    }
  }, [myId, data, status]);

  useEffect(() => {

    const handleStatus = (data) => {
      setReceiverId(data.userId);
      setStatus(data.status);
    };


    const handleMessage = (receivedMessage) => {
      console.log('Message received in frontend:', receivedMessage);
      setMessages(prevMessages => {
        console.log('Previous messages:', prevMessages);
        const newMessages = [...prevMessages, { message: receivedMessage, type: 'receive' }];
        console.log('New messages state:', newMessages);
        return newMessages;
      });
    };


    socket.on('status', handleStatus);
    socket.on('receive-message', handleMessage);


    return () => {
      socket.off('status', handleStatus);
      socket.off('receive-message', handleMessage);
    };

  }, [socket]);


  useEffect(() => {

    if (receiveMessages || sendMessages) {

      const allMessages = [...receiveMessages, ...sendMessages];
      let newArray = allMessages.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(newArray);

      console.log(allMessages);
    }

  }, [receiveMessages, sendMessages])


  function showMessageBox() {
    setDisplay(!display);
  }

  function sendMessage() {
    if (message.trim() && receiverId) {
      socket.emit('send-message', receiverId, message);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="relative px-4 font-jost flex items-start py-8 space-x-6">
        <main
          className={`${display
            ? "w-[70%] space-y-10 ml-4"
            : "space-y-10 px-6 py-8 min-h-screen bg-gray-50"
            }`}
        >
          {/* Profile Section */}
          <div className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] rounded-xl p-1">
            <div className="relative shadow-md rounded-lg overflow-hidden">
              <div
                className="relative min-h-[250px] bg-gray-200 bg-cover"
                style={{
                  backgroundImage: data?.coverImage
                    ? `url(${data.coverImage})`
                    : "none",
                }}
              >
                <div
                  className="shadow-lg absolute -bottom-10 rounded-full w-[120px] h-[120px] bg-gray-400 bg-cover border-4 border-white left-6"
                  style={{
                    backgroundImage: data?.profileImage
                      ? `url(${data.profileImage})`
                      : null,
                  }}
                ></div>
              </div>
              <div className="bg-gray-100 min-h-[300px] pt-16 px-6">
                <h1 className="font-extrabold text-2xl text-gray-800">
                  {data?.name}
                </h1>
                <p className="italic text-gray-500 mt-4">
                  {data?.description ||
                    "Welcome to my Swapify profile! Feel free to connect if we can collaborate."}
                </p>
                <div className="flex mt-4 space-x-4 items-center">
                  <div className="flex items-center text-gray-600">
                    <FontAwesomeIcon
                      icon={faCoins}
                      className="text-yellow-500 text-sm"
                    />
                    <span className="text-xs ml-2">100</span>
                  </div>
                  <button
                    className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] text-white py-2 px-4 rounded-full hover:scale-105 transform transition duration-300"
                    onClick={showMessageBox}
                  >
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="flex flex-col space-y-6">
            <SkillSection
              title="Skill Provided By Him"
              skills={data?.skillprovide}
              emptyMessage="No Skills Provided By Him"
            />
            <SkillSection
              title="Skill Want By Him"
              skills={data?.skillwant}
              emptyMessage="No Skills Want By Him"
            />
          </div>

          {/* Ratings Section */}
          <div className="bg-gradient-to-r p-1 rounded-xl from-[#252535] to-[#6C6C9B]">
            <div className="bg-white rounded-lg">
              <h1 className="text-3xl font-black pt-4 pl-4 underline">
                Ratings
              </h1>
              {data?.ratings?.length ? (
                <div className="flex flex-wrap p-6 space-x-4">
                  {data.ratings.map((rating, index) => (
                    <FontAwesomeIcon
                      key={index}
                      icon={faStar}
                      className="text-yellow-500 text-2xl"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <img src={ratings} alt="" className="w-1/4 py-6" />
                  <p className="font-bold text-3xl">No Ratings Till Date...</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Message Box */}
        {display && (
          <div className="px-6 absolute right-0 w-[28%] flex flex-col h-full">
            {/* Header Section */}
            <div className="shadow rounded-lg py-2 px-3 bg-gradient-to-r text-white from-[#252535] to-[#6C6C9B]">
              <p>{data?.name}</p>
              <p>{status}</p>
            </div>

            {/* Chat Container */}
            <div className="bg-gray-100 min-h-[500px] max-h-[500px] overflow-y-scroll py-4 px-2 chat-container style-bg">
              {messages.length > 0 && (
                <div className="messages">
                  {messages.map((message, index) => (
                    <div key={index} className={message.type === 'sent' ? 'flex justify-end' : 'flex justify-start'}>
                       <p className={`my-2 px-4 py-2 rounded-md text-white max-w-xs ${message.type === 'sent' ? 'bg-[#252535]' : 'bg-[#646491]'}`}>{message.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input Section */}
            <div className="w-full shadow rounded-lg">
              <div className="w-full flex items-center bg-gray-white px-2">
                <input
                  type="text"
                  className="outline-none p-2 px-0  w-full"
                  placeholder="Message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage} className="p-2">
                  <FontAwesomeIcon icon={faArrowCircleRight} />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </>
  );
}

function SkillSection({ title, skills, emptyMessage }) {
  return (
    <div className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] w-full rounded-lg p-1">
      <div className="bg-white relative shadow-md min-h-[200px] w-full rounded-md">
        <h1 className="font-extrabold text-xl pt-4 pl-4 underline">{title}</h1>
        <div className="p-4">
          {skills?.length ? (
            skills.map((item, index) => (
              <p key={index} className="text-lg font-bold">
                {index + 1}. {item}
              </p>
            ))
          ) : (
            <p className="w-full font-bold text-lg">{emptyMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PeopleViewProfile;
