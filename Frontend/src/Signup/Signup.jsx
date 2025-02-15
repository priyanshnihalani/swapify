import signupImage from '../assets/images/signup.png';
import logo from '../assets/images/logo2.png';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

function SignUp() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();

    useEffect(() => {
        const token = localStorage.getItem('accesstoken');
        if (token) {
            navigate('/')
        }
    }, [navigate]);

    const [showToolTip, setShowToolTip] = useState(false);
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    async function onSubmit(userData) {
        try {
            const response = await fetch(`${backendUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: "include"
            });
            const result = await response.json();
            alert(result.message);
            console.log(result);
            localStorage.setItem('name', result.name);
            localStorage.setItem('accesstoken', result.accesstoken);
            localStorage.setItem('id', result.id);
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
        if (showToolTip) {
            setTimeout(() => {
                setShowToolTip(false);
            }, 2000);
        }
    }, [showToolTip]);

    return (
        <>
            <div className="mt-20 ml-10 md:ml-20 flex items-center cursor-pointer" onClick={() => navigate('/')}>
                <img src={logo} className="w-12 md:w-16 animate-logo" alt="logo" />
                <h1 className="font-jost font-bold text-lg md:text-2xl text-[#252535]">SWAPIFY</h1>
            </div>

            <div className="font-jost mt-5 lg:mt-20 flex flex-col lg:flex-row justify-center items-center w-full px-6 space-y-0 lg:space-y-0 lg:space-x-20">
                <div className="w-full md:w-[80%] lg:w-[35%] xl:w-[25%]">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center items-center shadow-lg px-8 py-10 rounded-md bg-white">
                        <h1 className="text-2xl font-black mb-5">Sign Up</h1>
                        <div className="w-full space-y-4 flex flex-col">
                            <input
                                type="text"
                                placeholder="Enter Name"
                                className="p-3 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C6C9B]"
                                {...register("name", { required: "Name is required" })}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

                            <input
                                onFocus={() => setShowToolTip(true)}
                                onBlur={() => setShowToolTip(false)}
                                type="email"
                                placeholder="Enter Email"
                                className="p-3 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C6C9B]"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Enter a valid email address"
                                    }
                                })}
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

                            {showToolTip && <div className='w-1/4 bg-black text-white px-8 py-2 opacity-60 rounded-full absolute top-[16rem] transition-colors'>Make sure your email is linked to a valid provider like Google, Yahoo, etc.</div>}
                            
                            <input
                                type="password"
                                placeholder="Enter Password"
                                className="p-3 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C6C9B]"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                            />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                        </div>
                        <div className="w-full mt-8">
                            <button className="w-full bg-gradient-to-r from-[#252535] to-[#6C6C9B] font-extrabold text-white p-3 rounded-md" type="submit">
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
                            <p className="mt-5 -mb-2 underline font-medium text-sm cursor-pointer">Already Have an Account?</p>
                        </Link>
                    </form>
                </div>
                <div className="w-full font-jost lg:w-[35%] flex flex-col justify-center items-center text-center">
                    <div className="hidden md:hidden lg:block w-full max-w-md">
                        <img src={signupImage} alt="Sign In" className="w-full h-auto" />
                    </div>
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