import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import resetpassword from '../assets/images/reset-password.png'
import { useForm } from 'react-hook-form'
import { faClose, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import logo from '../assets/images/logo2.png';

const backendUrl = import.meta.env.REACT_APP_BACKEND_URL;

function ResetPassword() {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [showpassword, setShowPassword] = useState(false)
    const [message, setMessage] = useState('');
    const { token } = useParams();
    const navigate = useNavigate()

    async function submit(value) {
        const response = await fetch(`${backendUrl}/reset-password/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: value.password })
        })

        const result = await response.json()
        console.log(result.message)
        setMessage(result.message)
        reset()
    }

    function handleClose() {
        setMessage(null)
        window.location.href = 'http://localhost:5173/'
    }

    return (
        <>
            <div className="absolute mt-20 ml-10 md:ml-20 flex items-center cursor-pointer" onClick={() => navigate('/')}>
                <img src={logo} className="w-12 md:w-16 animate-logo" alt="logo" />
                <h1 className="font-jost font-bold text-lg md:text-2xl text-[#252535] transition-all duration-300">SWAPIFY</h1>
            </div>

            {message &&
                <div className='font-jost absolute top-[50%] left-[50%] bg-white w-[80%] sm:w-[60%] md:w-[40%] lg:w-[30%] h-[20%] px-4 py-2 shadow-lg' style={{ transform: 'translate(-50%, -50%)' }}>
                    <div className='flex justify-between items-center w-full border-b-4 p-2 border-blue-950'>
                        <h1 className='font-bold text-lg'>Message</h1>
                        <div className="cursor-pointer" onClick={handleClose}>
                            <FontAwesomeIcon icon={faClose} />
                        </div>
                    </div>
                    <p className='py-4'>
                        {message}
                    </p>
                </div>
            }

            <div className='font-jost min-h-screen flex flex-col lg:flex-row justify-evenly items-center'>
                <div className='w-full lg:w-1/3 px-10 md:px-20 lg:px-4 py-6 space-y-10'>
                    <h1 className='text-center text-3xl font-bold'>Reset Your Password</h1>
                    <form onSubmit={handleSubmit(submit)} className='flex flex-col space-y-4'>
                        <div className='space-y-1'>
                            <div className='flex px-3 border-2 border-black'>
                                <input type={showpassword ? 'text' : 'password'} name="email" className='w-full py-3 rounded  outline-none' placeholder='Enter New Password' {...register('password', { minLength: { value: 6, message: 'Password must be of 6 values' }, required: "New password required" })} />

                                <button type='button' onClick={() => setShowPassword(!showpassword)} className="px-2">
                                    {showpassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
                                </button>
                            </div>
                            <p className='text-red-600'>{errors.password && errors.password.message}</p>
                        </div>

                        <button type='submit' className='mx-auto w-full sm:w-1/2 bg-gradient-to-r from-[#252535] to-[#6C6C9B] font-extrabold text-white px-2 py-3 rounded'>
                            Reset Password
                        </button>
                    </form>

                    <p className="text-gray-700 italic text-center">
                        "Reset your password to regain access and protect your account. Choose a strong password to enhance security."
                    </p>
                </div>

                <div className="w-full lg:w-1/3 px-4 py-6 hidden lg:flex justify-center items-center">
                    <img src={resetpassword} alt="resetpasswordimage" className='w-full max-w-[300px] object-contain' />
                </div>
            </div>
        </>
    )
}

export default ResetPassword;
