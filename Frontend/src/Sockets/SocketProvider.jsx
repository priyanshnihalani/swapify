import { useContext, useMemo } from "react"
import SocketContext from "./SocketContext"
import { io } from 'socket.io-client'

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
}

export const SocketProvider = ({ children }) => {
    const socket = useMemo(() => io('http://localhost:3000'), [])
    return (
        <>
            <SocketContext.Provider value={socket}>
                {children}
            </SocketContext.Provider>
        </>
    )
}