import React, { useRef, useState, useEffect, useCallback } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // Connect to signaling server

const Meetroom = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef();

  useEffect(() => {
    // Get user media
    const initializeMedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    };

    initializeMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCall = useCallback(() => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Add local tracks to the connection
    localStream.getTracks().forEach((track) =>
      peerConnection.current.addTrack(track, localStream)
    );

    // Handle remote stream
    peerConnection.current.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      }
    };

    // Handle ICE candidates
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate });
      }
    };

    // Create offer
    peerConnection.current.createOffer().then((offer) => {
      peerConnection.current.setLocalDescription(offer);
      socket.emit("offer", { offer });
    });

    setIsCallActive(true);
  }, [localStream]);

  const handleAnswer = useCallback(async (answer) => {
    if (peerConnection.current) {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    }
  }, []);

  const handleOffer = useCallback(async ({ from, offer }) => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Add local tracks
    localStream.getTracks().forEach((track) =>
      peerConnection.current.addTrack(track, localStream)
    );

    peerConnection.current.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      }
    };

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    socket.emit("answer", { answer });
  }, [localStream]);

  useEffect(() => {
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);

    return () => {
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
    };
  }, [handleOffer, handleAnswer]);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Simple Video Call App</h1>
      <div>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "300px" }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: "300px", marginLeft: "20px" }}
        />
      </div>
      {!isCallActive && (
        <button onClick={startCall} style={{ marginTop: "20px" }}>
          Start Call
        </button>
      )}
    </div>
  );
};

export default Meetroom;
