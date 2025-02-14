import { useForm } from 'react-hook-form'
import forgotPassword from '../assets/images/forgetpassword.png'
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import './ForgotPassword.css'
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo2.png';

function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const [message, setMessage] = useState(null);
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    async function submit(value) {
        setLoading(true);
        const response = await fetch(`${backendUrl}/forgotpassword`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: value.email })
        });

        const result = await response.json()
        setLoading(false)
        console.log(result.message)
        setMessage(result.message)
        reset()
    }

    return (
        <>
            <div className="absolute mt-20 ml-10 md:ml-20 flex items-center cursor-pointer" onClick={() => navigate('/')}>
                <img src={logo} className="w-12 md:w-16 animate-logo" alt="logo" />
                <h1 className="font-jost font-bold text-lg md:text-2xl text-[#252535] transition-all duration-300">SWAPIFY</h1>
            </div>
            {message &&
                <div className='font-jost absolute top-[50%] left-[50%] bg-white w-[80%] sm:w-[40%] md:w-[30%] lg:w-[25%] h-[20%] px-4 py-2 shadow-lg' style={{ transform: 'translate(-50%, -50%)' }}>
                    <div className='flex justify-between items-center w-full border-b-4 p-2 border-blue-950'>
                        <h1 className='font-bold text-lg'>Message</h1>
                        <div className="cursor-pointer" onClick={() => { setMessage(null) }}>
                            <FontAwesomeIcon icon={faClose} />
                        </div>
                    </div>
                    <p className='py-4'>
                        {message}
                    </p>
                </div>
            }
            <div className='font-jost min-h-screen flex flex-col lg:flex-row justify-evenly items-center'>
                <div className="w-full lg:w-1/3 bg-black min-h-[200px] hidden lg:flex justify-center items-center">
                    <img src={forgotPassword} alt="forgotpasswordimage" className='max-w-full max-h-full object-cover' />
                </div>
                <div className='w-full lg:w-1/4 px-10 md:px-20 lg:px-4 py-6 space-y-10'>
                    <h1 className='text-center text-3xl font-bold'>Forgot Password?</h1>
                    <form onSubmit={handleSubmit(submit)} className='flex flex-col space-y-3'>
                        <input type="email" name="email" className='p-3 rounded border-2 border-black outline-none' placeholder='Enter Your Email' {...register('email', { required: "email required" })} />
                        <p className='text-red-600'>{errors.email && errors.email.message}</p>
                        <button type='submit' className='mx-auto w-full sm:w-1/2 bg-gradient-to-r from-[#252535] to-[#6C6C9B] font-extrabold text-white px-2 py-3 rounded'>
                            {loading ? <div className="mx-auto forgetloader"></div> : <span>Submit</span>}
                        </button>
                    </form>
                    <p className="text-gray-700 italic text-center">
                        "Don't worry! It happens to the best of us. Just enter your email, and we'll help you reset your password."
                    </p>
                </div>
            </div>
        </>
    )
}

export default ForgotPassword
