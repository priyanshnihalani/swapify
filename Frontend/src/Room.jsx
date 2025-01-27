import { useCallback, useEffect, useState, useRef, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faL, faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash } from "@fortawesome/free-solid-svg-icons";
import logo from './assets/images/logo2.png'
import { useNavigate } from "react-router-dom";
import SocketContext from "./Sockets/SocketContext";

function Room() {
    const [microphone, setMicrophone] = useState(true)
    const [camera, setCamera] = useState(true)
    const [name, setName] = useState('')
    const socket = useContext(SocketContext);
    const message = useRef();
    const [sockets, setSockets] = useState({});
    const [receiverId, setReceiverId] = useState(null);
    const [callerId, setCallerId] = useState(null);
    const peerRef = useRef(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const connectionInitialized = useRef(false);
    const [users, setUsers] = useState()
    const [allusers, setAllUsers] = useState([]);
    const navigate = useNavigate()
    const [host, setHost] = useState(true)
    const [isJoin, setIsJoin] = useState(false)
    const [inMeet, setInMeet] = useState(false);
    // Step 1: Initialize media streams
    const initializeMedia = async (videoenabled = true, audioenabled = true) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: videoenabled ? {
                    facingMode: 'user'
                } : false,
                audio: audioenabled
            });

            setLocalStream(stream);

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Error accessing media devices:', err);
        }
    }

    useEffect(() => {
        initializeMedia();
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Step 2: Set up peer connection with improved ICE handling
    const initializePeerConnection = useCallback(() => {
        if (!peerRef.current) {
            peerRef.current = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:global.stun.twilio.com:3478"
                        ]
                    }
                ],
                iceCandidatePoolSize: 10
            });

            // Add local tracks immediately
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    peerRef.current.addTrack(track, localStream);
                });

                console.log('Local Stream Tracks:', localStream.getTracks());
                console.log('Local Video Tracks:', localStream.getVideoTracks());
                console.log('Local Audio Tracks:', localStream.getAudioTracks());
            }

            // Handle incoming tracks
            peerRef.current.ontrack = (event) => {
                console.log("Event: ",event)
                console.log('RemoteVideoRef current:', remoteVideoRef.current);
                if (event.streams && event.streams[0]) {
                    setRemoteStream(event.streams[0]);
                    console.log(event?.streams[0])
                }
            };

            // Improved ICE candidate handling
            peerRef.current.onicecandidate = (event) => {
                const targetId = receiverId || callerId;
                if (event.candidate && targetId) {
                    socket.emit("ice-candidate", {
                        to: targetId,
                        candidate: event.candidate
                    });
                }
            };

            // Connection state monitoring
            peerRef.current.onconnectionstatechange = () => {
                setIsConnected(peerRef.current.connectionState === 'connected');
            };
        }
    }, [localStream, remoteStream, remoteVideoRef.current, peerRef.current, socket, receiverId, callerId]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch((error) => {
                console.error('Error playing remote video:', error);
            });
        }
    }, [remoteStream]);


    useEffect(() => {
        if (peerRef.current) {
            console.log('Connection state:', peerRef.current.connectionState);
            console.log('Remote stream:', remoteStream);
            console.log('Video Tracks:', remoteStream?.getVideoTracks());
            console.log('Audio Tracks:', remoteStream?.getAudioTracks());
            console.log(remoteVideoRef);

        }
        if (peerRef.current?.connectionState === 'connected') {
            setInMeet(true);
        }
    }, [peerRef.current?.connectionState]);

    // Step 3: Handle socket events
    useEffect(() => {
        const storedName = localStorage.getItem('name');
        if (storedName && storedName !== name) {
            setName(storedName);
        }
    }, []);



    useEffect(() => {
        socket.on('user-connected', (data) => {
            const storedName = localStorage.getItem('name');
            const myData = data.users.filter((user) => {
                return user.name == storedName;
            })
            setHost(myData[0]?.Ishost);

            const newData = data.users.filter((user) => {
                return user.name != storedName
            })
            // const users = data.users
            setReceiverId(newData[0]?.id)
            console.log(newData)
            setUsers(newData[0]?.name)
        });


        socket.on('new-join', (data) => {
            console.log(data)
            setUsers(data.users.name)
            setCallerId(data.users.id)
        });

        socket.on('ice-candidate', async ({ from, candidate }) => {
            try {
                if (peerRef.current && candidate) {
                    await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch (err) {
                console.error('Error adding ICE candidate:', err);
            }
        });

        socket.emit('ready');

        return () => {
            socket.off('ice-candidate');
            socket.off('user-connected');
            socket.off('new-join');
        };
    }, [socket]);


    // Step 4: Improved call handling
    const handleCall = async () => {
        try {
            if (!connectionInitialized.current) {
                initializePeerConnection();
                connectionInitialized.current = true;
            }

            const offer = await peerRef.current.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });

            await peerRef.current.setLocalDescription(offer);
            socket.emit('offer', { to: receiverId, offer });

        } catch (err) {
            console.error('Error creating offer:', err);
            connectionInitialized.current = false;
        }
    };

    // Step 5: Handle offer and answer
    const handleOffer = useCallback(async ({ from, offer }) => {
        try {
            if (!connectionInitialized.current) {
                initializePeerConnection();
                connectionInitialized.current = true;
            }
            setIsJoin(true);
            setCallerId(from);


            await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
            console.log(offer)
            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);
            socket.emit('answer', { to: callerId, answer });
        } catch (err) {
            console.error('Error handling offer:', err);
            connectionInitialized.current = false;
        }
    }, [socket, initializePeerConnection]);


    const handleAnswer = useCallback(async ({ from, answer }) => {
        try {
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
            console.error('Error handling answer:', err);
            connectionInitialized.current = false;
        }
    }, []);

    async function toggleCamera() {
        const newCameraState = !camera;
        setCamera(newCameraState);
    
        // Stop and remove existing local stream tracks
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
    
        // Reinitialize media stream
        await initializeMedia(newCameraState, microphone);
    
        // Recreate peer connection if needed
        if (peerRef.current) {
            // Close existing peer connection
            peerRef.current.close();
            peerRef.current = null;
            connectionInitialized.current = false;
    
            // Reinitialize peer connection
            initializePeerConnection();
    
            // Renegotiate connection if users are connected
            if (receiverId || callerId) {
                handleCall();
            }
        }
    }

    function toggleMicrophone() {
        setMicrophone(prevState => !prevState);
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
        }
    }

    // Step 6: Set up offer/answer handlers
    useEffect(() => {

        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);

        return () => {
            socket.off('offer');
            socket.off('answer');
        };
    }, [socket, handleOffer, handleAnswer]);

    return (!host && inMeet == false ? (
        <div className="overflow-hidden font-jost min-h-screen">
            {/* Header */}
            <div className="px-4 sm:px-8 md:px-16 pt-4 sm:pt-8 flex items-center cursor-pointer" onClick={() => navigate('/')}>
                <img src={logo} className="w-10 sm:w-12 md:w-16 animate-logo" alt="logo" />
                <h1 className="font-jost font-bold text-base sm:text-lg md:text-2xl text-[#252535] transition-all duration-300">SWAPIFY</h1>
            </div>

            {/* Main Content */}
            <div className="relative px-4 sm:px-8 md:px-20  py-6 sm:py-10 flex flex-col lg:flex-row lg:space-x-8 mt-40 lg:mt-20 xl:space-x-20 items-center">
                {/* Video Container */}
                <div className="relative w-full lg:w-2/3 max-w-3xl mx-auto mb-8 lg:mb-0">
                    <h1 className="absolute text-base sm:text-lg py-3 sm:py-6 px-4 sm:px-8 text-white font-black z-10">{name}</h1>
                    <div className="w-full aspect-video relative">
                        {camera ?
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="scale-x-[-1] rounded-xl sm:rounded-3xl w-full h-full object-cover"
                            />
                            : <h1 className="flex justify-center items-center min-h-full text-black text-4xl">{name}</h1>
                        }
                        {/* Video Controls */}
                        <div className="absolute bottom-0 w-full flex justify-center items-center py-3 sm:py-4 bg-gradient-to-t from-black/50 to-transparent rounded-xl sm:rounded-br-3xl sm:rounded-tr-none sm:rounded-tl-none sm:rounded-bl-3xl">
                            <div className="flex space-x-3 sm:space-x-6">
                                {/* Microphone Button */}
                                <button
                                    className={`border-2 outline-none rounded-full text-white w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-colors ${microphone ? 'bg-black/30 hover:bg-black/40' : 'bg-red-600 border-none hover:bg-red-700'
                                        }`}
                                    onClick={toggleMicrophone}
                                >
                                    <FontAwesomeIcon icon={microphone ? faMicrophone : faMicrophoneSlash} className="text-sm sm:text-base" />
                                </button>
                                {/* Camera Button */}
                                <button
                                    className={`border-2 outline-none rounded-full text-white w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-colors ${camera ? 'bg-black/30 hover:bg-black/40' : 'bg-red-600 border-none hover:bg-red-700'
                                        }`}
                                    onClick={toggleCamera}
                                >
                                    <FontAwesomeIcon icon={camera ? faVideo : faVideoSlash} className="text-sm sm:text-base" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Join Section */}
                <div className="w-full lg:w-1/3 px-4 sm:px-0 max-w-md lg:max-w-none">
                    <div className="flex flex-col space-y-6 sm:space-y-10">

                        <div className="text-center">
                            <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Ready To Join?</h1>
                            <p className="text-sm sm:text-base text-gray-600">{users ? users + " is waiting in room..." : "No one else is here"}</p>
                        </div>

                        {!host && <button
                            onClick={handleCall}
                            className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] rounded-lg p-3 font-bold text-white w-full sm:w-2/3 mx-auto transition-all duration-300 hover:opacity-90"
                            disabled={isConnected}
                        >
                            {isConnected ? 'Connected' : 'Ask To Join'}
                        </button>}
                    </div>
                </div>
            </div>
        </div>
    ) : <>
        <div className="relative w-full h-screen bg-gray-900 text-white ">
            {/* Remote Video */}
            {isJoin && <button onClick={handleCall}>admit</button>}
            {
                remoteStream ?

                    <div className="alignment w-[90%] rounded-lg  h-[80%] bg-black rounded-b-lg overflow-hidden">
                        {console.log(remoteStream)}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover rounded-b-lg"
                            style={{}}
                            onError={(e) => {
                                console.error('Remote video error:', e);
                            }}
                        />
                        <div className="absolute top-2 left-2 bg-black/50 text-white px-3 py-1 rounded-md text-sm">
                            Remote User
                        </div>
                    </div>
                    : <>
                    </>
            }

            {/* Local Video */}

            <div className={`${remoteVideoRef.current == null ? 'alignment rounded-lg w-[90%] aspect-video' : 'absolute bottom-4 right-4 w-1/4 aspect-video bg-black rounded-lg overflow-hidden shadow-lg'} `}>
                {camera ? (
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={` rounded-lg w-full h-full object-cover scale-x-[-1]`}
                    />
                ) : (
                    <div className="remotealignment rounded-lg w-[90%] aspect-video bg-gray-800 flex items-center justify-center h-full text-xl font-semibold text-gray-400">
                        {name || "You"}
                    </div>
                )}

                {
                    camera &&
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-sm">
                        {name || "You"}
                    </div>
                }
            </div>

            {/* Floating Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-4 bg-black/70 px-6 py-3 rounded-full">
                {/* Microphone Button */}
                <button
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition ${microphone ? "bg-gray-800 hover:bg-gray-700" : "bg-red-600 hover:bg-red-700"
                        }`}
                    onClick={toggleMicrophone}
                >
                    <FontAwesomeIcon
                        icon={microphone ? faMicrophone : faMicrophoneSlash}
                        className="text-lg text-white"
                    />
                </button>

                {/* Camera Button */}
                <button
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition ${camera ? "bg-gray-800 hover:bg-gray-700" : "bg-red-600 hover:bg-red-700"
                        }`}
                    onClick={toggleCamera}
                >
                    <FontAwesomeIcon
                        icon={camera ? faVideo : faVideoSlash}
                        className="text-lg text-white"
                    />
                </button>
            </div>
        </div>


    </>)
}

export default Room;