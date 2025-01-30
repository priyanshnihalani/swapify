import React, { useContext, useState } from 'react';
import { useEffect } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import heroImage from "../assets/images/sharing.png"
import process from "../assets/images/process.png"
import features from '../assets/images/features.png'
import popular from '../assets/images/popular.png'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAd, faChain, faLightbulb, faPen, faPenFancy, faSignIn, faTachographDigital } from "@fortawesome/free-solid-svg-icons";
import SocketContext from '../Sockets/SocketContext';
import LoaderAnimation from '../Loader/Loader';

function Home() {
    const [id, setId] = useState(null);
    const name = localStorage.getItem('name')
    const token = localStorage.getItem('accesstoken');
    const socket = useContext(SocketContext)
    const [loading, setLoading] = useState(true);

    useEffect(() => {


        async function fetchData() {
            const response = await fetch(`http://localhost:3000/home/${name}`)
            const result = await response.json();
            setLoading(false)
            setId(result._id)
        }

        if (name) {
            fetchData()
        }

        if (token) {
            try {
                const decodeToken = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Math.floor(Date.now() / 1000);

                const isTokenValid = decodeToken.exp > currentTime;

                if (!isTokenValid) {
                    console.warn('Token expired');
                    localStorage.removeItem('accesstoken');
                }
            } catch (error) {
                console.error('Invalid token format:', error);
                localStorage.removeItem('accesstoken');
            }
        } else {
            const params = new URLSearchParams(window.location.search);
            const authToken = params.get('token');
            const name = params.get('name');

            if (authToken && name) {
                localStorage.setItem('accesstoken', authToken);
                localStorage.setItem('name', name);
                window.history.replaceState({}, document.title, '/');
            }
            else {
                console.warn('No token found');
            }
        }
    }, []);

    {loading && <LoaderAnimation/>}

    return (
        <div className="Home overflow-x-hidden flex flex-col min-h-screen">
            <Header />
            <div className="font-jost">
                {/* Hero Section with Fade and Slide Animations */}
                <section className="min-h-screen flex flex-col justify-center items-center first-section md:px-10 py-20 lg:py-40 space-y-40 md:space-y-0 xl:space-y-0">
                    <div className="w-full lg:w-1/2 py-0 md:py-20 lg:py-0 text-center xl:mt-10 
                        animate-fade-in-down">
                        <h1 className="mx-auto w-[80%] text-xl text-[#252535] font-black md:text-4xl md:w-[80%] lg:w-[100%] xl:w-[90%]
                            transition-all duration-1000 hover:scale-105">
                            Share your expertise, gain new skills, and grow together!
                        </h1>
                        <button className="mx-auto mt-6 bg-gradient-to-r p-3 rounded-md md:px-6 from-[#252535] to-[#6C6C9B] 
                            font-extrabold text-white md:mt-10 text-md 
                            animate-bounce hover:animate-none 
                            transition-transform duration-300 hover:scale-110">
                            Learn More
                        </button>
                    </div>
                    <div className="flex justify-start items-start w-full animate-fade-in-right">
                        <img
                            src={heroImage}
                            alt="hero-section-image"
                            className="w-[60%] md:w-1/2 lg:w-1/3 transition-transform duration-500 hover:scale-105"
                        />
                    </div>
                </section>

                {/* How It Works Section with Staggered Animations */}
                <section className="min-h-screen flex flex-col items-center space-y-10 w-full">
                    <div className="w-full space-y-4 mx-auto animate-fade-in-up">
                        <h1 className="text-center font-black text-3xl md:text-4xl text-[#252535]">How It Works</h1>
                        <p className="mx-auto w-3/4 text-center font-bold text-gray-800 text-xl">
                            Follow These Simple Steps To Use Swapify
                        </p>
                    </div>

                    <div className="py-10 -z-10 w-full flex flex-col items-center space-y-5 md:space-y-20">
                        <div className="rounded-2xl mx-auto w-[90%] md:w-[30%] lg:w-[24%] xl:w-[18%] py-12 
                            bg-gradient-to-r from-[#252535] to-[#6C6C9B] text-white space-y-4 
                            animate-fade-in-left hover:scale-105 transition-transform duration-300">
                            <div className="text-center">
                                <FontAwesomeIcon icon={faSignIn} size="2x" />
                            </div>
                            <h1 className="font-extrabold text-center">Sign Up</h1>
                            <p className="font-medium text-center">Create Your Profile.</p>
                        </div>

                        {/* Rest of the sections with similar animation classes */}
                        <div className="space-y-5 md:space-y-0 flex flex-col md:flex-row items-center justify-between w-full relative">
                            <div className="rounded-2xl mx-auto w-[90%] md:w-[30%] lg:w-[24%] xl:w-[18%] py-12 
                                bg-gradient-to-r from-[#252535] to-[#6C6C9B] text-white space-y-4 px-10 
                                animate-fade-in-left hover:scale-105 transition-transform duration-300">
                                <div className="text-center">
                                    <FontAwesomeIcon icon={faLightbulb} size="2x" />
                                </div>
                                <h1 className="font-extrabold text-center">Post Skills</h1>
                                <p className="font-medium text-center">Share what you can teach or want to learn.</p>
                            </div>

                            <div className="-z-10 md:absolute left-1/2 transform xl:-translate-x-1/2 
                                md:-translate-x-[30%] md:translate-y-[40%] translate-x-1/4 
                                lg:-translate-x-[25%] lg:translate-y-[30%] xl:translate-y-1/2 bottom-0 
                                animate-fade-in-up">
                                <img src={process}
                                    className="w-2/3 md:w-[50%] lg:w-[60%] xl:w-3/4 
                                    transition-transform duration-500 hover:scale-110"
                                    alt="Process Illustration"
                                />
                            </div>

                            <div className="rounded-2xl mx-auto w-[90%] md:w-[30%] lg:w-[24%] xl:w-[18%] py-12 
                                bg-gradient-to-r from-[#252535] to-[#6C6C9B] text-white space-y-4 px-10 
                                animate-fade-in-right hover:scale-105 transition-transform duration-300">
                                <div className="text-center">
                                    <FontAwesomeIcon icon={faChain} size="2x" />
                                </div>
                                <h1 className="font-extrabold text-center">Connect</h1>
                                <p className="font-medium text-center">Match with others and start learning.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section with Reveal Animations */}
                <section className="py-20 min-h-screen">
                    <h1 className="py-20 font-black text-center text-4xl text-[#252535] animate-fade-in-up">Features</h1>
                    <div className="flex flex-col lg:flex-row justify-center items-center px-10 space-y-40 lg:space-y-0 lg:space-x-40">
                        <div className="md:w-1/2 lg:w-1/3 animate-fade-in-left">
                            <img src={features}
                                alt="Features"
                                className="transition-transform duration-500 hover:scale-105"
                            />
                        </div>
                        <ul className="space-y-4 md:space-y-8 lg:space-y-10">
                            {['Find The Perfect Skill Match Easily',
                                'Swap Skill Without Any Money Exchange',
                                'Learn and Teach Anywhere and Anytime',
                                'Showcase your skills with a Stunning Profile',
                                'Explore Wide Range of Skills',
                                'Secure and Reliable Communication',
                                'Track Your Progress and Exchanges'].map((feature, index) => (
                                    <li
                                        key={index}
                                        className="font-bold opacity-100 animate-fade-in-right"
                                        style={{ animationDelay: `${index * 200}ms` }}
                                    >
                                        {index + 1}. {feature}
                                    </li>
                                ))}
                        </ul>
                    </div>
                </section>


                {/* Popular Skills Section with Hover Effects */}
                <section className="min-h-screen">
                    <div className="w-full pt-40 md:py-10 space-y-4 mx-auto animate-fade-in-up">
                        <h1 className="text-center font-black text-3xl md:text-4xl text-[#252535]">Popular Skills</h1>
                        <p className="mx-auto w-full text-center font-bold text-gray-800 text-lg md:text-xl">
                            Explore the most sought-after skills to enhance your career and build new opportunities.
                        </p>
                    </div>
                    <div className="w-full flex flex-col space-y-10">
                        {/* Skill cards with hover and animate-fade-in effects */}
                        <div className="flex flex-wrap justify-center gap-10 md:gap-20 mt-10">
                            {[
                                { icon: faAd, title: 'Digital Marketing' },
                                { icon: faPen, title: 'Content Writing' }
                            ].map((skill, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl bg-gradient-to-r from-[#252535] to-[#6C6C9B] 
                                    px-8 py-12 md:px-10 md:py-12 space-y-2 text-white 
                                    animate-fade-in-left hover:scale-110 transition-transform duration-300"
                                    style={{ animationDelay: `${index * 200}ms` }}
                                >
                                    <div className="text-center">
                                        <FontAwesomeIcon icon={skill.icon} size="2x" />
                                    </div>
                                    <h1 className="font-black text-white text-center">{skill.title}</h1>
                                </div>
                            ))}
                        </div>

                        {/* Second Row with Similar Animations */}
                        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20">
                            {[
                                { icon: faTachographDigital, title: 'Web Development' },
                                { icon: faPenFancy, title: 'Graphic Designing' }
                            ].map((skill, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl bg-gradient-to-r from-[#252535] to-[#6C6C9B] 
                                    px-8 py-12 md:px-10 md:py-18 text-white space-y-2 
                                    animate-fade-in-right hover:scale-110 transition-transform duration-300"
                                    style={{ animationDelay: `${index * 200}ms` }}
                                >
                                    <div className="text-center">
                                        <FontAwesomeIcon icon={skill.icon} size="2x" />
                                    </div>
                                    <h1 className="font-black text-white text-center">{skill.title}</h1>
                                </div>
                            ))}
                            <div className="flex justify-center animate-fade-in-up">
                                <img
                                    src={popular}
                                    alt="Popular Skills"
                                    className="w-64 h-auto md:w-80 lg:w-96 xl:w-[26rem] object-contain 
                                    transition-transform duration-500 hover:scale-105"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
}

export default Home;