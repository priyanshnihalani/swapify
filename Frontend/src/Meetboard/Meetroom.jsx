import { useCallback, useEffect, useState, useRef, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faCut, faDesktop, faStop, faL, faMicrophone, faMicrophoneSlash, faPhoneSlash, faVideo, faVideoSlash } from "@fortawesome/free-solid-svg-icons";
import logo from '../assets/images/logo2.png'
import { useNavigate } from "react-router-dom";
import SocketContext from "../Sockets/SocketContext";
import ReactPlayer from 'react-player'
import './Meetroom.css'


function MeetRoom() {

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
    const [host, setHost] = useState(false)
    const [isJoin, setIsJoin] = useState(false)
    const [inMeet, setInMeet] = useState(false);
    const [streamUrl, setStreamUrl] = useState(false)
    const deductCoins = useRef(null);
    const [clientId, setClientId] = useState(null);
    const [localName, setLocalName] = useState(null);
    const [remoteName, setRemoteName] = useState(null);
    const [newJoined, setNewJoined] = useState(null);
    const [hostId, setHostId] = useState(null);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isRemoteScreenSharing, setIsRemoteScreenSharing] = useState(false);
    const screenStream = useRef(null);
    const originalStreamRef = useRef(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    // Step 1: Initialize media streams
    const initializeMedia = async (videoenabled = true, audioenabled = true) => {
        try {

            const stream = await navigator.mediaDevices.getUserMedia({
                video: videoenabled ? {
                    facingMode: 'user'
                } : false,
                audio: audioenabled ? {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    voiceIsolation: true

                } : false
            });

            setLocalStream(stream);
            console.log(navigator.mediaDevices.getSupportedConstraints());

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


    const initializePeerConnection = useCallback(() => {
        if (peerRef.current) {
            peerRef.current.close();
            peerRef.current = null;
        }

        if (!peerRef.current) {
            peerRef.current = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:global.stun.twilio.com:3478"
                        ]
                    },
                    {
                        urls: "turn:openrelay.metered.ca:80",
                        username: "openrelayproject",
                        credential: "openrelayproject"
                    },
                    {
                        urls: "turn:openrelay.metered.ca:443",
                        username: "openrelayproject",
                        credential: "openrelayproject"
                    }
                ]

            });

            peerRef.current.onicecandidate = (event) => {
                if (event.candidate && (receiverId || callerId)) {
                    socket.emit("ice-candidate", {
                        to: receiverId || callerId,
                        candidate: event.candidate
                    });
                }
            };

            peerRef.current.onconnectionstatechange = () => {
                setIsConnected(peerRef.current.connectionState === 'connected');
            };

            peerRef.current.ontrack = (event) => {
                console.log('Track received:', {
                    trackKind: event.track.kind,
                    trackEnabled: event.track.enabled,
                    trackMuted: event.track.muted,
                    hasStreams: !!event.streams,
                    streamCount: event.streams?.length
                });

                if (event.streams && event.streams[0]) {
                    const stream = event.streams[0];

                    // Immediately try to play the stream
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = stream;

                        // Force a play attempt
                        const playPromise = remoteVideoRef.current.play();
                        if (playPromise !== undefined) {
                            playPromise.then(() => {
                                console.log('Video started playing successfully');
                            }).catch(error => {
                                console.log('Error playing video:', error);
                            });
                        }
                    }

                    setRemoteStream(stream);
                }
            };

            if (localStream) {
                localStream.getTracks().forEach(track => {
                    peerRef.current.addTrack(track, localStream);
                });
            }
        }
    }, [localStream, socket, receiverId, callerId]);

    useEffect(() => {
        socket.on('screen-sharing-started', () => {
            setIsRemoteScreenSharing(true);
        });

        socket.on('screen-sharing-stopped', () => {
            setIsRemoteScreenSharing(false);
        });

        return () => {
            socket.off('screen-sharing-started');
            socket.off('screen-sharing-stopped');
        };
    }, [socket]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            console.log('Remote stream updated:', {
                active: remoteStream.active,
                tracks: remoteStream.getTracks().map(track => ({
                    kind: track.kind,
                    enabled: track.enabled,
                    muted: track.muted
                }))
            });
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    useEffect(() => {
        async function fetchCharges() {
            if (hostId) {

                const response = await fetch(`${backendUrl}/fetchCharges/${hostId}`)

                const result = await response.json();
                deductCoins.current = result.charges;
            }
        }

        fetchCharges()

    }, [hostId])

    useEffect(() => {

        console.log(clientId)
        console.log(hostId)

    }, [clientId, hostId])
    useEffect(() => {
        let coinInterval;
        let chargeInterval;

        if (peerRef.current?.connectionState === 'connected') {
            setInMeet(true)

            if (!host && deductCoins.current) {
                coinInterval = setInterval(async () => {
                    try {
                        const response = await fetch(`${backendUrl}/deductCoin/${clientId}`, {
                            method: "PATCH",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ coins: deductCoins.current })
                        });

                        const result = await response.json();

                        console.log(result.message)
                        if (result.message === "User has zero or negative coins, cannot deduct.") {
                            clearInterval(coinInterval);
                            callEnd()
                        }
                    } catch (error) {
                        console.error("Error deducting coins:", error);
                        clearInterval(coinInterval);
                    }
                }, 60000);

                chargeInterval = setInterval(async () => {
                    try {
                        const response = await fetch(`${backendUrl}/incrementCoin/${hostId}`, {
                            method: "PATCH",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ coins: deductCoins.current })
                        });

                        const result = await response.json();

                        console.log(result.message)

                    } catch (error) {
                        console.error("Error deducting coins:", error);
                        clearInterval(coinInterval);
                    }
                }, 60000);
            }
        }

        if (peerRef.current?.connectionState === 'failed' ||
            peerRef.current?.connectionState === "disconnected") {
            initializePeerConnection();
        }

        // Cleanup function
        return () => {
            if (coinInterval && chargeInterval) {
                clearInterval(coinInterval);
                clearInterval(chargeInterval);

            }
        };
    }, [peerRef.current?.connectionState, deductCoins.current]);

    useEffect(() => {
        const storedName = localStorage.getItem('name');
        if (storedName && storedName !== name) {
            setName(storedName);
        }
    }, []);

    useEffect(() => {
        socket.on('user-connected', (data) => {
            console.log('Connected users:', data.users);
            console.log('Current user:', data.oneuser);

            // Update all users list
            setAllUsers(prev => [...prev, ...data.users]);
            setLocalName(data.oneuser.name);

            // Standardize ID field access
            const getUserId = (user) => user.userid || user.userId;

            // Handle current user's role
            if (data.oneuser.Ishost) {
                setReceiverId(data.oneuser.id);
                setHostId(getUserId(data.oneuser));
                setHost(true);
                // Even if user is host, store their ID as client for consistency
                setClientId(getUserId(data.oneuser));
            } else {
                setClientId(getUserId(data.oneuser));
            }

            // Find and set host information
            const hostUser = data.users.find(user => user.Ishost);
            if (hostUser) {
                setReceiverId(hostUser.id);
                setHostId(getUserId(hostUser));
            }

            // Set remote user's name
            const remoteUsers = data.users.filter(user => user.name !== data.oneuser.name);
            setRemoteName(remoteUsers[0]?.name || "");
        });

        socket.on('new-join', (data) => {
            console.log('New user joined:', data);
            setNewJoined(data.users?.name);

            // Standardize ID field access
            const getUserId = (user) => user.userid || user.userId;

            if (data.users.Ishost) {
                setHostId(getUserId(data.users));
                setReceiverId(data.users.id);

                // If local user exists and is not host, ensure their clientId remains set
                if (data.oneuser && !data.oneuser.Ishost) {
                    setClientId(getUserId(data.oneuser));
                }
            } else {
                // Store the new joining user's ID as client
                setClientId(getUserId(data.users));
            }

            setRemoteName(data.users?.name);
        });

        socket.on('ice-candidate', async ({ from, candidate }) => {
            if (!peerRef.current) return;


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


    useEffect(() => {
        allusers.forEach((user) => {
            if (!user.Ishost) {
                setClientId(user.userid)
            }
        });
    }, [allusers])

    const startScreenShare = async () => {
        try {
            // Store original stream for later
            originalStreamRef.current = localStream;

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always"
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            // Store the screen share stream
            screenStream.current = stream;
            setIsScreenSharing(true);

            // Notify remote peer about screen sharing
            socket.emit('screen-sharing-started', { to: receiverId || callerId });

            // Handle stream end (user stops sharing)
            stream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };

            // Update peer connection with screen share track
            if (peerRef.current && peerRef.current.connectionState === 'connected') {
                const senders = peerRef.current.getSenders();
                const videoSender = senders.find(sender => sender.track?.kind === "video");
                if (videoSender) {
                    await videoSender.replaceTrack(stream.getVideoTracks()[0]);
                }

                // If screen share has audio, replace audio track too
                const audioTrack = stream.getAudioTracks()[0];
                if (audioTrack) {
                    const audioSender = senders.find(sender => sender.track?.kind === "audio");
                    if (audioSender) {
                        await audioSender.replaceTrack(audioTrack);
                    }
                }
            }

            // Update local video preview to show screen share
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            setLocalStream(stream);

        } catch (err) {
            console.error('Error starting screen share:', err);
            // Restore original stream if screen sharing fails
            if (originalStreamRef.current) {
                setLocalStream(originalStreamRef.current);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = originalStreamRef.current;
                }
            }
        }
    };

    // Function to stop screen sharing
    const stopScreenShare = async () => {
        try {
            if (screenStream.current) {
                screenStream.current.getTracks().forEach(track => track.stop());
                screenStream.current = null;
            }

            setIsScreenSharing(false);
            socket.emit('screen-sharing-stopped', { to: receiverId || callerId });

            // Restore original stream
            if (originalStreamRef.current) {
                // Update local video
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = originalStreamRef.current;
                }

                // Replace tracks in peer connection
                if (peerRef.current && peerRef.current.connectionState === 'connected') {
                    const senders = peerRef.current.getSenders();

                    // Replace video track
                    const videoTrack = originalStreamRef.current.getVideoTracks()[0];
                    const videoSender = senders.find(sender => sender.track?.kind === "video");
                    if (videoSender && videoTrack) {
                        await videoSender.replaceTrack(videoTrack);
                    }

                    // Replace audio track
                    const audioTrack = originalStreamRef.current.getAudioTracks()[0];
                    const audioSender = senders.find(sender => sender.track?.kind === "audio");
                    if (audioSender && audioTrack) {
                        await audioSender.replaceTrack(audioTrack);
                    }
                }

                setLocalStream(originalStreamRef.current);
            }
        } catch (err) {
            console.error('Error stopping screen share:', err);
        }
    };

    const renderVideoContainer = (stream, isLocal = false) => {
        const isSharing = isLocal ? isScreenSharing : isRemoteScreenSharing;
        const name = isLocal ? localName : remoteName;

        return (
            <div className="relative w-full h-full rounded-xl overflow-hidden">
                <div className="object-cover">
                    {stream ? (
                        isLocal ? (
                            <video
                                id={isLocal ? "localVideo" : "remoteVideo"}
                                ref={isLocal ? localVideoRef : remoteVideoRef}
                                autoPlay
                                muted={isLocal}
                                playsInline
                                className={`${isSharing ? '' : 'scale-x-[-1]'} rounded-xl w-full h-full object-cover`}
                            />
                        ) : (
                            <div className={`w-full h-full ${isRemoteScreenSharing ? '' : 'scale-x-[1]'}`}>
                                <ReactPlayer
                                    url={stream}
                                    playing
                                    width="100%"
                                    height="100%"
                                    style={{
                                        width: '100%',
                                        height: '100%'
                                    }}
                                    light={false}
                                    controls={false}
                                    className="remoteVideo"
                                />
                            </div>
                        )
                    ) : ""}
                </div>
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center space-x-2">
                    <span className="text-sm font-medium">{name}</span>
                    {isSharing && (
                        <span className="text-xs bg-blue-500 px-2 py-1 rounded">Sharing Screen</span>
                    )}
                </div>
            </div>
        );
    };

    const renderControls = () => (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-white/60 backdrop-blur-lg px-6 py-3 rounded-2xl">
            <button
                onClick={toggleMicrophone}
                className={`
                    w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                    ${microphone ? 'bg-gray-900 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'}
                `}
            >
                <FontAwesomeIcon
                    icon={microphone ? faMicrophone : faMicrophoneSlash}
                    className="text-lg"
                />
            </button>
            <button
                onClick={toggleCamera}
                className={`
                    w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                    ${camera ? 'bg-gray-900 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'}
                `}
            >
                <FontAwesomeIcon
                    icon={camera ? faVideo : faVideoSlash}
                    className="text-lg"
                />
            </button>

            {/* Screen Share Button */}
            <button
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                className={`
                    w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                    ${isScreenSharing ? 'bg-gradient-to-tr from-[#252535] to-[#6c6c9b] hover:bg-gradient-to-tl hover:from-[#6c6c9b] hover:to-[#252535]' : 'bg-gray-900 hover:bg-gray-700'}
                `}
                disabled={isRemoteScreenSharing} // Disable if remote user is sharing
                title={isRemoteScreenSharing ? "Cannot share screen while others are sharing" : "Share screen"}
            >
                <FontAwesomeIcon
                    icon={isScreenSharing ? faStop : faDesktop}
                    className="text-lg"
                />
            </button>

            {inMeet || host ? (
                <button
                    onClick={callEnd}
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 bg-red-600 hover:bg-red-700"
                >
                    <FontAwesomeIcon
                        icon={faPhoneSlash}
                        className="text-lg"
                    />
                </button>
            ) : null}
        </div>
    );


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

            console.log(receiverId)
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
            if (!peerRef.current) {
                initializePeerConnection();
            }

            setIsJoin(true);
            setCallerId(from);

            await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));



        } catch (err) {
            console.error('Error handling offer:', err);
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
        console.log(remoteStream)
        const newCameraState = !camera;
        setCamera(newCameraState);

        try {

            if (localStream) {
                const videoTracks = localStream.getVideoTracks();
                if (videoTracks.length > 0 && !newCameraState) {
                    // If turning off the camera, disable the video track
                    videoTracks.forEach(track => track.enabled = false);
                } else if (newCameraState) {
                    // If turning the camera back on, get a new stream
                    const newStream = await getNewMediaStream(true, microphone);

                    // Set the local stream properly
                    setLocalStream(newStream);
                    const videoTrack = newStream.getVideoTracks()[0];

                    // Check if the video track is properly added to the video element
                    const videoElement = document.querySelector("#localVideo"); // Replace with your video element selector
                    if (videoElement) {
                        videoElement.srcObject = newStream;
                    }

                    // Update peer connection if it's connected
                    if (peerRef.current && peerRef.current.connectionState === 'connected') {
                        const senders = peerRef.current.getSenders();
                        const videoSender = senders.find(sender => sender.track?.kind === "video");
                        if (videoSender) {
                            await videoSender.replaceTrack(videoTrack);
                        }
                    }
                }
            } else if (newCameraState) {
                // If there's no current stream, create a new stream with video enabled
                const newStream = await getNewMediaStream(true, microphone);
                setLocalStream(newStream);
            }
        } catch (err) {
            console.error("Error toggling camera:", err);
            // Revert camera state on error
            setCamera(!newCameraState);
        }
    }



    async function toggleMicrophone() {
        const newMicState = !microphone;
        setMicrophone(newMicState);

        try {
            if (localStream) {
                const audioTracks = localStream.getAudioTracks();
                if (audioTracks.length > 0) {
                    audioTracks.forEach(track => {
                        track.enabled = newMicState; // Enable/disable based on new state
                    });
                } else {
                    // If no audio tracks exist, get a new stream
                    await getNewMediaStream(camera, newMicState);
                }
            } else if (newMicState) {
                await getNewMediaStream(camera, newMicState);
            }
        } catch (err) {
            console.error("Error toggling microphone:", err);
            setMicrophone(!newMicState); // Revert state on error
        }
    }

    async function getNewMediaStream(videoEnabled, audioEnabled) {
        try {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }

            if (!videoEnabled && !audioEnabled) {
                setLocalStream(null);
                return;
            }

            const constraints = {
                video: videoEnabled ? { facingMode: "user" } : false,
                audio: audioEnabled
            };

            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(newStream);

            // If peer connection exists and is active, replace tracks
            if (peerRef.current && peerRef.current.connectionState === 'connected') {
                const senders = peerRef.current.getSenders();

                // Replace video track
                if (videoEnabled) {
                    const videoTrack = newStream.getVideoTracks()[0];
                    const videoSender = senders.find(sender => sender.track?.kind === "video");
                    if (videoSender && videoTrack) {
                        await videoSender.replaceTrack(videoTrack);
                    }
                }

                // Replace audio track
                if (audioEnabled) {
                    const audioTrack = newStream.getAudioTracks()[0];
                    const audioSender = senders.find(sender => sender.track?.kind === "audio");
                    if (audioSender && audioTrack) {
                        await audioSender.replaceTrack(audioTrack);
                    }
                }
            }

            return newStream; // Ensure the new stream is returned
        } catch (err) {
            console.error("Error getting media stream:", err);
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            setLocalStream(null);
            throw err; // Propagate error to handle state reversions
        }
    }


    useEffect(() => {

        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);

        return () => {
            socket.off('offer');
            socket.off('answer');
        };
    }, [socket, handleOffer, handleAnswer]);


    const cleanupAndNavigate = async () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
        }
        if (peerRef.current) {
            peerRef.current.close();
            peerRef.current = null;
        }

        setLocalStream(null);
        setRemoteStream(null);
        setIsConnected(false);

        await swapskill()
        socket.disconnect();
        navigate('/meetboard', { state: { client: localName, host: remoteName, hostId: hostId } });
    };

    useEffect(() => {
        socket.on('endCall', cleanupAndNavigate);

        return () => {
            socket.off('endCall', cleanupAndNavigate);
        };
    }, [socket, localStream, remoteStream]);

    async function swapskill() {
        let learner = null;
        let teacher = null;

        allusers.forEach((user) => {
            if (user.Ishost) {
                teacher = user.userId || user.userid;
            } else if (!user.Ishost) {
                learner = user.userId || user.userid;
            }
            console.log(user)
        });

        if (!learner || !teacher) {
            console.error("Missing learner or teacher");
            return;
        }

        try {
            const learnSkillResponse = await fetch(
                `${backendUrl}/learnSkill?learner=${learner}&teacher=${teacher}`, 
                { method: "PATCH" }
            );
        
            if (!learnSkillResponse.ok) {
                throw new Error(`Error in learnSkill: ${learnSkillResponse.statusText}`);
            }
        
            const teachSkillResponse = await fetch(
                `${backendUrl}/teachSkill?teacher=${teacher}&learner=${learner}`, 
                { method: "PATCH" }
            );
        
            if (!teachSkillResponse.ok) {
                throw new Error(`Error in teachSkill: ${teachSkillResponse.statusText}`);
            }
        
            console.log("Skill swap successful");
        
        } catch (err) {
            console.error("Failed to swap skills", err);
        }
        
    }


    async function callEnd() {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
        }

        if (peerRef.current) {
            peerRef.current.ontrack = null;
            peerRef.current.onicecandidate = null;
            peerRef.current.onconnectionstatechange = null;
            peerRef.current.close();
            peerRef.current = null;
        }


        setLocalStream(null);
        setRemoteStream(null);
        setIsConnected(false);
        connectionInitialized.current = false;

        if (host) {
            socket.emit('endCall');
        }
        if(!host){
            await swapskill()
        }
        socket.disconnect();
        navigate('/meetboard', !host ? { state: { client: localName, host: remoteName, hostId: hostId } } : {});

    }

    async function handleAdmit() {
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socket.emit('answer', { to: callerId, answer });
        setIsJoin(false)
    }

    return (!host && inMeet == false ? (
        <div className="overflow-hidden font-jost min-h-screen">
            {/* Header */}
            <div className="px-4 sm:px-8 md:px-16 pt-4 sm:pt-8 flex items-center cursor-pointer" onClick={() => navigate('/')}>
                <img src={logo} className="w-10 sm:w-12 md:w-16 animate-logo" alt="logo" />
                <h1 className="font-jost font-bold text-base sm:text-lg md:text-2xl text-[#252535] transition-all duration-300">SWAPIIFY</h1>
            </div>

            {/* Main Content */}
            <div className="font-jost relative px-4 sm:px-8 md:px-20  py-6 sm:py-10 flex flex-col lg:flex-row lg:space-x-8 mt-40 lg:mt-20 xl:space-x-20 items-center">
                {/* Video Container */}
                <div className="relative w-full lg:w-2/3 max-w-3xl mx-auto mb-8 lg:mb-0">
                    <h1 className="absolute text-base sm:text-lg py-3 sm:py-6 px-4 sm:px-8 text-white font-black z-10">{localName}</h1>
                    <div className="w-full aspect-video relative">
                        {camera ?
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="scale-x-[-1] rounded-xl sm:rounded-3xl w-full h-full object-cover"
                            />
                            : <h1 className="flex justify-center items-center min-h-full text-black text-4xl">{localName}</h1>
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
                            <p className="text-sm sm:text-base text-gray-600">{remoteName ? remoteName + " is waiting in room..." : "No one else is here"}</p>
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
        {isJoin && host ?  <div className="animate-fade-in-up font-jost w-1/5 backdrop-blur-sm py-4 space-y-4 px-4 rounded z-10 bottom-10 right-10 absolute bg-white/65">
            <h1>{remoteName + " is asking to get in."}</h1>
            <button onClick={handleAdmit} className="rounded bg-gradient-to-tr from-[#252535] to-[#6c6c9b] text-white px-4 py-2">Admit</button>
        </div> : null}
        <div className="font-jost relative w-full h-screen bg-gray-900 text-white">
            <div className="relative w-full h-screen bg-[#252535] text-white overflow-hidden">
                {/* Remote Video */}
                <div className="alignment relative w-full h-[85vh] p-4 flex justify-center items-center">
                    <div className="relative w-[90vw] h-full rounded-xl overflow-hidden bg-gray-800">
                        {renderVideoContainer(remoteStream, false)}
                    </div>
                </div>

                {/* Local Video */}
                <div className={`
                    ${!remoteStream || !inMeet ? 'w-full h-full p-4' : 'absolute bottom-4 right-4 w-40 md:w-80 aspect-video'} 
                    transition-all duration-300 ease-in-out
                `}>
                    {renderVideoContainer(localStream, true)}
                </div>

                {/* Controls */}
                {renderControls()}
            </div>
        </div>


    </>)
}

export default MeetRoom;