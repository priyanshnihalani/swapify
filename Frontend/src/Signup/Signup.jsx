import signupImage from '../assets/images/signup.png';
import logo from '../assets/images/logo2.png';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function SignUp() {
    const navigate = useNavigate();

    useEffect(() => {

        const token = localStorage.getItem('accesstoken');

        if (token) {
            navigate('/')
        }

    }, [navigate])

    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: ''
    })

    const [showToolTip, setShowToolTip] = useState(false);
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    async function handleSubmit(e) {
        e.preventDefault();
        console.log(userData);
        try {
            const response = await fetch(`${backendUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: userData.name,
                    email: userData.email,
                    password: userData.password
                })
            });
            const result = await response.json();
            alert(result.message);
            console.log(result)
            localStorage.setItem('name', result.name);
            localStorage.setItem('accesstoken', result.accesstoken)
            localStorage.setItem('id', result.id)
            navigate('/');
        }
        catch (error) {
            console.log(error);
        }
    }
    async function handleFacebookLogin() {
        window.location.href = `${backendUrl}/auth/facebook`;
    }

    useEffect(() => {

        if(showToolTip){
            setTimeout(() => {
                setShowToolTip(false)
            }, 2000)
        }

    }, [showToolTip])
    return (
        <>
            <div className="mt-20 ml-10 md:ml-20 flex items-center cursor-pointer" onClick={() => navigate('/')}>
                <img src={logo} className="w-12 md:w-16 animate-logo" alt="logo" />
                <h1 className="font-jost font-bold text-lg md:text-2xl text-[#252535]  transition-all duration-300">SWAPIFY</h1>
            </div>


            {/* Right Section (Form) */}
            <div className="font-jost mt-5 lg:mt-20 flex flex-col lg:flex-row justify-center items-center w-full px-6 space-y-0 lg:space-y-0 lg:space-x-20">
                <div className="w-full md:w-[80%] lg:w-[35%] xl:w-[25%]">
                    <form onSubmit={handleSubmit} method='post' className="flex flex-col justify-center items-center shadow-lg px-8 py-10 rounded-md bg-white">
                        <h1 className="text-2xl font-black mb-5">Sign Up</h1>
                        <div className="w-full space-y-4 flex flex-col">
                            <input
                                type="text"
                                placeholder="Enter Name"
                                className="p-3 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C6C9B]"
                                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                            />

                            <input
                                onFocus={() => setShowToolTip(true)}
                                onBlur={() => setShowToolTip(false)}
                                type="email"
                                placeholder="Enter Email"
                                className="p-3 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C6C9B]"
                                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                            />
                            {showToolTip && <div className=' w-1/4 bg-black text-white px-8 py-2 opacity-60 rounded-full absolute top-[16rem] transition-colors'>Make sure your email must be linked to particular provider like google, yahoo and more...</div>}
                            <input
                                type="password"
                                placeholder="Enter Password"
                                className="p-3 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C6C9B]"
                                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                            />
                        </div>
                        <div className="w-full mt-8">
                            <button className="w-full bg-gradient-to-r from-[#252535] to-[#6C6C9B] font-extrabold text-white p-3 rounded-md" >
                                Sign Up
                            </button>
                            <hr className="border border-gray-300 my-5" />
                            <div className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] rounded-lg p-[3px]">
                                <button className="rounded-md px-2 py-2 bg-white w-full font-extrabold text-[#252535]" onClick={handleFacebookLogin}>
                                    Sign Up with Facebook
                                </button>
                            </div>
                        </div>

                        <Link to="/signin">
                            <p className="mt-5 -mb-2 underline font-medium text-sm cursor-pointer" >Already Have Account?</p>
                        </Link>
                    </form>
                </div>

                {/* Left Section (Image and Content) */}
                <div className="w-full font-jost  lg:w-[35%] flex flex-col justify-center items-center text-center">
                    {/* Image: Hidden for small to medium screens */}
                    <div className="hidden md:hidden lg:block w-full max-w-md">
                        <img src={signupImage} alt="Sign In" className="w-full h-auto" />
                    </div>

                    {/* Content: Always displayed, moves below the image on large screens */}
                    <div className="w-[80%] mt-10 lg:w-[80%] lg:mt-4">
                        <p className="text-xs lg:text-sm">
                            By signing up, you agree to Swapify's
                            <span className="underline"> Terms of Service</span> and
                            <span className="underline"> Privacy Policy</span>. You may also receive important updates and promotional communications from Swapify at the email address provided.
                        </p>
                    </div>

                </div>


            </div>
        </>
    );
}

export default SignUp;
