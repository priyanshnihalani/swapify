import signinImage from '../assets/images/signin.png';
import logo from '../assets/images/logo2.png';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function SignIn() {
    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/')
        }
    }, [])
    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        email: '',
        password: ''
    })

    async function handleSubmit(event) {
        event.preventDefault()

        const response = await fetch(`${backendUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userData.email,
                password: userData.password
            }),
            credentials: "include" 
        })

        const data = await response.json();
        alert(data.message);

        if (data.message === 'Welcome Back!') {
            localStorage.setItem('accesstoken', data.accesstoken)
            localStorage.setItem('id', data.user._id)
            localStorage.setItem('name', data.user.name);
            navigate('/')
        }
    }

    function handleFacebookLogin() {
        window.location.href = `${backendUrl}/auth/facebook`;
    }

    return (
        <>
            <div className=''>

                <div className="mt-20 ml-10 md:ml-20 flex items-center cursor-pointer" onClick={() => navigate('/')}>
                    <img src={logo} className="w-12 md:w-16 animate-logo" alt="logo" />
                    <h1 className="font-jost font-bold text-lg md:text-2xl text-[#252535] transition-all duration-300">SWAPIFY</h1>
                </div>

                <div className="font-jost mt-20 flex flex-col-reverse  lg:flex-row justify-center items-center w-full px-6 space-y-0 lg:space-y-0 lg:space-x-20">
                    {/* Left Section (Image and Content) */}
                    <div className="w-full  lg:w-[35%] flex flex-col justify-center items-center text-center">
                        {/* Image: Hidden for small to medium screens */}
                        <div className="hidden md:hidden lg:block w-full max-w-md">
                            <img src={signinImage} alt="Sign In" className="w-full h-auto" />
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

                    {/* Right Section (Form) */}
                    <div className="w-full md:w-[80%] lg:w-[35%] xl:w-[25%]">
                        <form method="post" className="flex flex-col justify-center items-center shadow-lg px-8 py-10 rounded-md bg-white" onSubmit={(e) => handleSubmit(e)}>
                            <h1 className="text-2xl font-black mb-5">Sign In</h1>
                            <div className="w-full space-y-4 flex flex-col">
                                <input
                                    type="email"
                                    placeholder="Enter Email"
                                    className="p-3 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C6C9B]"
                                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                />
                                <input
                                    type="password"
                                    placeholder="Enter Password"
                                    className="p-3 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C6C9B]"
                                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                                />
                            </div>
                            <div className="w-full mt-8">
                                <button className="w-full bg-gradient-to-r from-[#252535] to-[#6C6C9B] font-extrabold text-white p-3 rounded-md" type='submit'>
                                    Sign In
                                </button>
                                <hr className="border border-gray-300 my-5" />
                                <div className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] rounded-lg p-[3px]">
                                    <button className="rounded-md px-2 py-2 bg-white w-full font-extrabold text-[#252535]" type='button' onClick={handleFacebookLogin}>
                                        Sign In with Facebook
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-center  justify-center  w-full md:justify-between mt-8">
                                <Link to="/forgotpassword">
                                    <p className="underline font-medium text-sm cursor-pointer">Forget Password?</p>
                                </Link>
                                <Link to="/signup">
                                    <p className="underline font-medium text-sm cursor-pointer">Create New Account</p>
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SignIn;
