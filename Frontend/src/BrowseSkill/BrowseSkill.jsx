import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

function Browseskill() {
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

    return (
        <>
            <Header />
            <main className="min-h-screen space-y-10 py-40 px-4">
                {/* Title Section */}
                <h1 className="text-3xl font-black text-center text-[#252535]">
                    Browse and Learn Skills
                </h1>
                <p className="text-center italic text-lg text-gray-600">
                    Find the perfect skill to learn or teach. Explore categories or search for specific skills.
                </p>

                {/* Search Section */}
                <div className="flex justify-center items-center w-full px-4">
                    <div className="flex w-full max-w-3xl">
                        <input
                            type="text"
                            className="border-2 border-black border-r-0 w-[80%] rounded-tl-md rounded-bl-md p-4 placeholder:text-[#3d3d67] placeholder:font-bold outline-none text-sm md:text-base"
                            placeholder="Find Out Skills You are looking For..."
                        />
                        <button className="w-[20%] bg-gray-100 shadow-sm border-2 border-black rounded-tr-md rounded-br-md flex justify-center items-center">
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </div>
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
