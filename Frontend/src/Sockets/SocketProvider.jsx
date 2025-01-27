import React, { useContext, useMemo, useEffect } from "react";
import { io } from "socket.io-client";
import SocketContext from "./SocketContext";

export const SocketProvider = ({ children }) => {
    const socket = useMemo(() => io("http://localhost:3000"), []);

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