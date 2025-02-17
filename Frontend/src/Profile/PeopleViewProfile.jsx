import { useContext, useEffect, useState, useRef } from "react";
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
import LoaderAnimation from '../Loader/Loader'
function PeopleViewProfile() {
  const params = useParams();
  const { uid } = params;
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
  const [sendMessages, setSendMessages] = useState([]);
  const [receiveMessages, setReceiveMessages] = useState([]);
  const chatRef = useRef(null);
  const [review, setReview] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const id = localStorage.getItem('id')
    setMyId(id);
    console.log(id)

    if (id) {
      socket.emit('login', id)
    }
  }, [])

  useEffect(() => {
    if (uid) {
      async function fetchUserData() {
        try {
          setLoading(true)
          const response = await fetch(`${backendUrl}/peopleviewprofile/${uid}`);

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const result = await response.json();
          console.log(result.message);
          setData(result);
          setId(result._id);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
      fetchUserData();
    }

  }, [uid]);

  useEffect(() => {
    if (id) {
      socket.emit('getStatus', id);
    }
  }, [id])

  useEffect(() => {
    if (data) {
      const refromedReview = data?.reviews?.map((item) => {
        const date = new Date(item.timestamp)
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' })
        const year = date.getFullYear();

        const completeTime = day + " " + month + " " + year
        console.log(completeTime)

        return { from: item.from, textValue: item.textValue, completeTime, stars: item.stars }
      })
      setReview(refromedReview)
    }
  }, [data])

  useEffect(() => {
    if (data) {
      async function fetchSendedChatData() {

        try {
          setLoading(true);
          const response = await fetch(`${backendUrl}/sendedChat?from=${myId}&to=${data?._id}`);
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
        finally {
          setLoading(false)
        }
      }

      fetchSendedChatData();
    }
  }, [myId, data]);

  useEffect(() => {
    if (data) {
      async function fetchReceivedChatData() {
        try {
          setLoading(true)
          const response = await fetch(`${backendUrl}/sendedChat?from=${data?._id}&to=${myId}`);
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
        finally {
          setLoading(false)
        }
      }

      console.log(id, myId, status)
      fetchReceivedChatData();
    }
  }, [myId, data, status]);

  useEffect(() => {

    if (!socket) return;

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
      socket.emit('send-message', myId, receiverId, message);
      setMessages(prevMessages => [...prevMessages, { message: message, type: 'sent' }]);

      setMessage('');
      
      const timestamp = new Date().getTime();

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

      sendMessageDB()
    }
  }


  return (
    <>

      {loading ? (<LoaderAnimation />) : (<>
        <Header />
        <div className="relative px-4 font-jost flex flex-col md:flex-row items-start py-8 md:space-x-6">
          <main
            className={`${display
              ? "md:w-[70%] px-6 py-0 space-y-10 ml-4"
              : "w-full space-y-10 px-6 md:px-20 lg:px-40 pb-0 min-h-screen "
              }`}
          >
            {/* Profile Section */}
            <div className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] rounded-xl p-1">
              <div className="relative shadow-md rounded-lg overflow-hidden">
                <div className='z-40 shadow-lg bg-white flex flex-col md:flex-row justify-between px-6 md:px-10 py-4'>
                  <div className="flex items-center text-gray-600 space-x-2">
                    <p className='font-bold'>{data?.name}'s Balance:</p>
                    <FontAwesomeIcon icon={faCoins} className="text-yellow-500" />
                    <span className="ml-2">{data?.coins}</span>
                  </div>

                  <div className="flex items-center text-gray-600 space-x-2 mt-2 md:mt-0">
                    <p className='font-bold'>{data?.name}'s Charges:</p>
                    <FontAwesomeIcon icon={faCoins} className="text-yellow-500" />
                    <span className="ml-2">{data?.charges} / minute</span>
                  </div>
                </div>
                <div
                  className="h-40 sm:h-64 md:h-60 bg-gray-200 bg-cover bg-center"
                  style={{
                    backgroundImage: data?.coverImage ? `url(${data.coverImage})` : "none",
                  }}
                >
                  <div className="absolute bottom-[16rem] left-4 sm:left-8">
                    <div
                      className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gray-400 bg-cover border-4 border-white shadow-lg"
                      style={{
                        backgroundImage: data?.profileImage ? `url(${data.profileImage})` : null,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="border-t-2 border-gray-700 space-y-2 min-h-[300px] pt-20 bg-white px-6">
                  <h1 className="font-extrabold text-xl sm:text-2xl text-gray-800">
                    {data?.name}
                  </h1>
                  <p className="italic text-gray-500 mt-4">
                    {data?.description || "Welcome to my Swapify profile! Feel free to connect if we can collaborate."}
                  </p>
                  <div className="pt-4 flex items-center  space-y-4 space-x-6">
                    <p className="font-bold">
                      No of Swap's: {((data?.teaches?.length || 0) > 0 || (data?.learnes?.length || 0) > 0)
                        ? ((data?.teaches?.length || 0) + (data?.learnes?.length || 0))
                        : 0}
                    </p>
                    <button
                      className="font-semibold bg-gradient-to-r from-[#252535] to-[#6C6C9B] text-white py-2 px-4 rounded-full hover:scale-105 transform transition duration-300"
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
              <SkillSection title="Skill Provided By Him" skills={data?.skillprovide} emptyMessage="No Skills Provided By Him" />
              <SkillSection title="Skill Want By Him" skills={data?.skillwant} emptyMessage="No Skills Want By Him" />
            </div>

            {/* Ratings Section */}
            <div className="bg-gradient-to-r p-1 rounded-xl from-[#252535] to-[#6C6C9B]">
              <div className="bg-white rounded-lg">
                <h1 className="text-2xl sm:text-3xl font-black pt-4 pl-4 underline">Ratings</h1>
                {review?.length > 0 ? (
                  <div className="flex flex-wrap justify-around p-6 space-x-4 space-y-4">
                    {review.map((item, index) => (
                      <div key={index} className="flex flex-col items-center justify-between p-4 rounded-full bg-white shadow w-full md:w-1/3 lg:w-1/4 h-[10rem] space-x-6 space-y-6">
                        <div className="flex flex-col gap-1 items-center">
                          <p className="flex items-center justify-center gap-1 text-lg font-semibold">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                            <span>{item.stars}/5</span>
                          </p>
                          <p className="text-sm text-gray-700 font-medium">{item.textValue}</p>
                        </div>

                        <div className="w-full flex flex-col items-center border-t border-gray-200 pt-2">
                          <p className="text-sm font-semibold">{item.from}</p>
                          <p className="text-xs text-gray-500">{item.completeTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <img src={ratings} alt="" className="w-1/4 py-6" />
                    <p className="font-bold text-xl sm:text-3xl">No Ratings Till Date...</p>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Message Box */}
          {display && (
            <div className="px-6 absolute md:static right-0 w-full md:w-[28%] flex flex-col h-full">
              <div className="shadow rounded-lg py-2 px-3 bg-gradient-to-r text-white from-[#252535] to-[#6C6C9B]">
                <p>{data?.name}</p>
                <p>{status}</p>
              </div>

              <div ref={chatRef} className="bg-gray-100 min-h-[300px] md:min-h-[500px] max-h-[500px] overflow-auto py-4 px-2 style-bg chat-container">
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
              <div className="flex items-center bg-white shadow-md rounded-lg p-2 w-full">
                <input
                  type="text"
                  placeholder="Type Message..."
                  className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#6C6C9B]"
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  onClick={sendMessage}
                  className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] text-white p-2 rounded-r-lg hover:scale-105 transform transition duration-300"
                >
                  <FontAwesomeIcon icon={faArrowCircleRight} className="text-xl" />
                </button>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </>
      )}

    </>
  );
}

function SkillSection({ title, skills, emptyMessage }) {
  return (
    <div className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] w-full rounded-lg p-1">
      <div className="bg-white relative shadow-md min-h-[200px] w-full rounded-md p-4">
        <h1 className="font-extrabold text-xl md:text-2xl pt-2 pl-2 underline">
          {title}
        </h1>
        <div className="p-2 md:p-4">
          {skills?.length ? (
            <ul className="space-y-2">
              {skills.map((item, index) => (
                <li
                  key={index}
                  className="text-lg md:text-xl font-bold break-words"
                >
                  {index + 1}. {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="w-full font-bold text-lg md:text-xl ">
              {emptyMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}



export default PeopleViewProfile;
