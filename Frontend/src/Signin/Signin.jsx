import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import signinImage from '../assets/images/signin.png';
import logo from '../assets/images/logo2.png';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function SignIn() {
    const navigate = useNavigate();
    
    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/');
        }
    }, [navigate]);

    const { register, handleSubmit, formState: { errors } } = useForm();
    
    async function onSubmit(data) {
        const response = await fetch(`${backendUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: "include"
        });

        const responseData = await response.json();
        alert(responseData.message);

        if (responseData.message === 'Welcome Back!') {
            localStorage.setItem('accesstoken', responseData.accesstoken);
            localStorage.setItem('id', responseData.id);
            localStorage.setItem('name', responseData.name);
            navigate('/');
        }
    }

    function handleFacebookLogin() {
        window.location.href = `${backendUrl}/auth/facebook`;
    }

    return (
        <div>
            <div className="mt-20 ml-10 md:ml-20 flex items-center cursor-pointer" onClick={() => navigate('/')}> 
                <img src={logo} className="w-12 md:w-16 animate-logo" alt="logo" />
                <h1 className="font-jost font-bold text-lg md:text-2xl text-[#252535] transition-all duration-300">SWAPIFY</h1>
            </div>

            <div className="font-jost mt-20 flex flex-col-reverse lg:flex-row justify-center items-center w-full px-6 space-y-0 lg:space-y-0 lg:space-x-20">
                <div className="w-full lg:w-[35%] flex flex-col justify-center items-center text-center">
                    <div className="hidden md:hidden lg:block w-full max-w-md">
                        <img src={signinImage} alt="Sign In" className="w-full h-auto" />
                    </div>
                    <div className="w-[80%] mt-10 lg:w-[80%] lg:mt-4">
                        <p className="text-xs lg:text-sm">
                            By signing up, you agree to Swapify's <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
                        </p>
                    </div>
                </div>
                
                <div className="w-full md:w-[80%] lg:w-[35%] xl:w-[25%]">
                    <form className="flex flex-col justify-center items-center shadow-lg px-8 py-10 rounded-md bg-white" onSubmit={handleSubmit(onSubmit)}>
                        <h1 className="text-2xl font-black mb-5">Sign In</h1>
                        <div className="w-full space-y-4 flex flex-col">
                            <input
                                type="email"
                                placeholder="Enter Email"
                                className="p-3 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C6C9B]"
                                {...register("email", { 
                                    required: "Email is required", 
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                        message: "Invalid email format"
                                    }
                                })}
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                            
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
                        <div className="flex flex-col md:flex-row items-center justify-center w-full md:justify-between mt-8">
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
    );
}

export default SignIn;
