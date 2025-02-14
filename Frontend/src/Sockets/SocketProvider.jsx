import React, { useContext, useMemo, useEffect } from "react";
import { io } from "socket.io-client";
import SocketContext from "./SocketContext";

export const SocketProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const socket = useMemo(() => io(backendUrl, { transports: ["websocket", "polling"] }), [backendUrl]);

    console.log(backendUrl)
    useEffect(() => {
        console.log(socket)
    }, [])

    return (
        <SocketContext value={socket}>
            {children}
        </SocketContext>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};

export default SocketContext;