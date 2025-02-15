import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Browseskill() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const navigate = useNavigate();
    const [name, setName] = useState(null);
    const [mId, setmId] = useState(null);
    const [searchValue, setSearchValue] = useState("");
    const [data, setData] = useState([])
    const [categories, setCategories] = useState([
        "Web Development",
        "App Development",
        "DSA",
        "UI/UX",
        "Digital Marketing",
        "AI/ML",
        "Sketching & Arts",
        "Video Editing",
    ]);

    useEffect(() => {
        const name = localStorage.getItem('name')
        const id = localStorage.getItem('id')
        setName(name)
        setmId(id)
    }, [])

    async function fetchData(data) {
        if (data === "") {
            setData([]);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/searchData/${data}`);
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            const result = await response.json()
            console.log(result)
            const finalData = result.filter((item) => item.name !== name);
            setData(finalData);
            console.log(finalData);
        } catch (error) {
            console.error("Error fetching data:", error);
            setData([]); 
        }
    }

    function handleSearch(e) {
        fetchData(e.target.value)
        setSearchValue(e.target.value)
    }

    async function moveToProfile(id) {
        const timeStamp = Date.now()
        const response = await fetch(`${backendUrl}/profileview/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({ timeStamp, id: mId })
        })
        const result = await response.json();
        console.log(result.message)
        if (result.message == "View Added" || result.message == "View Already Exists") {
            navigate(`/peopleviewprofile/${id}`)
        }
    }

    return (
        <>
            <Header />
            <main className="font-jost min-h-screen space-y-10 py-40 px-4">
                {/* Title Section */}
                <h1 className="text-3xl font-black text-center text-[#252535]">
                    Browse and Learn Skills
                </h1>
                <p className="text-center italic text-lg text-gray-600">
                    Find the perfect skill to learn or teach. Explore categories or search for specific skills.
                </p>

                {/* Search Section */}
                <div className="relative flex justify-center items-center w-full px-4">
                    <div className="flex w-full max-w-3xl">
                        <input
                            type="text"
                            className="border-2 border-black border-r-0 w-[80%] rounded-tl-md rounded-bl-md p-4 placeholder:text-[#3d3d67] placeholder:font-bold outline-none text-sm md:text-base"
                            placeholder="Find Out Skills You are looking For..."
                            onChange={(e) => handleSearch(e)}
                        />
                        <button className="w-[20%] bg-gray-100 shadow-sm border-2 border-black rounded-tr-md rounded-br-md flex justify-center items-center">
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </div>
                    {data.length > 0 && <div className="bg-white w-full max-w-3xl absolute shadow-lg top-20 rounded-md">
                        {data.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-4 px-8">
                                <div className="flex items-center space-x-8">
                                    <div className="shadow w-[80px] h-[80px] rounded-full bg-gray-200" style={{ backgroundImage: `url(${item.profileImage})` }}>
                                    </div>
                                    <div>
                                        <h1>{item.name}</h1>
                                        <p>{item.description}</p>
                                    </div>
                                </div>
                                <div>
                                    <button className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] text-white px-4 py-2 rounded" onClick={() => moveToProfile(item._id)}>View</button>
                                </div>
                            </div>
                        ))}
                    </div>}
                </div>



                {/* Categories Section */}
                <div className="py-6 w-full max-w-4xl mx-auto grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {categories.map((item, index) => (
                        <button
                            className="w-full h-12 bg-gradient-to-r from-[#252535] to-[#6C6C9B] text-white rounded-md flex justify-center items-center text-sm sm:text-base"
                            key={index}
                            type="button"
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </main>
            <Footer />
        </>
    );
}

export default Browseskill;
