import { faCheckCircle, faCross, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

function Rating({ display, data, reviewed }) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    // Store the rating stars and the current hover value
    const [stars] = useState([1, 2, 3, 4, 5]);
    const [hoveredValue, setHoveredValue] = useState(null); // To track hovered value
    const [selected, setSelected] = useState(null); // To track selected value
    const [textValue, setTextValue] = useState(null);
    const [buttonValue, setButtonValue] = useState(null);
    // Handle hover event
    function handleHover(value) {
        setHoveredValue(value);
    }

    function handleMouseOut() {
        setHoveredValue(null); // Reset hover when mouse leaves
    }

    
    function handleClick(value) {
        setSelected(value);
    }

    // Stars rendering logic
    function renderStars() {
        return stars.map((star) => (
            <div
                key={star}
                className="cursor-pointer"
                onMouseOver={() => handleHover(star)}
                onMouseOut={handleMouseOut}           // Reset on mouse out
                onClick={() => handleClick(star)}     // Set rating on click
            >
                <FontAwesomeIcon
                    icon={faStar}
                    className={`text-xl ${(hoveredValue >= star || selected >= star) ? 'text-yellow-400' : 'text-gray-300'}`}
                />
            </div>
        ));
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (selected == null) {
            return alert("Please Provide an Review")
        }
        const response = await fetch(`${backendUrl}/rating`, {
            headers: {
                "Content-Type": "application/json"
            },
            method: "PATCH",
            body: JSON.stringify({ client: data.client, hostId: data.hostId, starValue: selected, textValue })
        })

        const result = await response.json()
        console.log(result)

        if (result.message == "Review Sent Successfully") {
            setButtonValue(
                <FontAwesomeIcon icon={faCheckCircle}/>
            )

            reviewed(true)
        }
        else{
            setButtonValue(
                <FontAwesomeIcon icon={faCross}/>
            )
            reviewed(true)
        }

        setTimeout((display(false)), 2000)
        console.log(selected, textValue)

    }

    return (
        <div className="absolute top-[50%] left-[50%] flex flex-col justify-center items-center min-h-screen w-full font-jost p-2"
            style={{ transform: "translate(-50%, -50%)" }}>

            <div className="space-y-4 p-5 flex flex-col items-center shadow-md w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 bg-white rounded-lg">
                <h1 className="font-extrabold text-2xl text-center">Rate This Meeting</h1>

                <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col space-y-4 w-full">
                    <div className="flex justify-center space-x-2">
                        {renderStars()}
                    </div>
                    <textarea
                        name="message"
                        id="message"
                        rows={5}
                        className="resize-none border-2 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                        placeholder="Message (optional)"
                        onChange={(e) => setTextValue(e.target.value)}>
                    </textarea>

                    <button
                        type="submit"
                        className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] font-extrabold text-white px-4 py-3 rounded w-full transition-transform transform hover:scale-105">
                        {buttonValue ? buttonValue : "Submit"}
                    </button>
                </form>
            </div>
        </div>

    );
}

export default Rating;
