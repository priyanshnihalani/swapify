import { BrowserRouter as Router } from "react-router-dom";
import AnimatedRoutes from "./AnimatedRoutes";


function App() {

    return (

        <Router>
            <AnimatedRoutes />
        </Router>
    )
}
export default App;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then(reg => console.log('Service Worker Registered:', reg))
            .catch(err => console.error('Service Worker Error:', err));
    });
}

