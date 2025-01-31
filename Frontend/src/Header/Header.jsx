import logo from '../assets/images/logo2.png';
import { Link, useNavigate } from 'react-router-dom';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import './Header.css';

function Header() {
    const [display, setDisplay] = useState(false);
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem('accesstoken');
        window.location.reload();
    }

    return (
        <header className="w-full bg-white top-0 z-50 py-2 transition-all duration-500 ease-in-out">

            <div className="flex items-center shadow-lg justify-between xl:justify-between pr-4 pl-0 md:px-10 pt-5 pb-2">
                <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                    <img src={logo} className="w-12 md:w-16 animate-logo" alt="logo" />
                    <h1 className="font-jost font-bold text-lg md:text-2xl text-[#252535] transition-all duration-300">SWAPIIFY</h1>
                </div>

                {/* Mobile Menu Icon */}
                <div className="xl:hidden cursor-pointer" onClick={() => setDisplay(!display)}>
                    <FontAwesomeIcon icon={faBars} className="text-2xl text-[#3d3d67] font-bold transition-all duration-300" />
                </div>

                {/* Desktop Menu */}
                <div className="hidden xl:block">
                    <ul className="hidden xl:flex justify-between space-x-20 font-semibold text-lg text-[#252535]  border-b-[#252535] px-20 p-6 font-jost transition-all duration-300">
                        <li className="cursor-pointer"><Link to={'/'}>Home</Link></li>
                        
                        <li className="cursor-pointer"><Link to={'/browseskill'}>Browse Skills </Link></li>
                        <li className="cursor-pointer"><Link to={'/message'}>Messages</Link></li>
                        <li className="cursor-pointer"><Link to={'/meetboard'}>Meet Board</Link></li>
                    </ul>
                </div>

                {/* Desktop Buttons */}
                <div className="hidden xl:flex items-center space-x-5 font-semibold text-lg text-[#252535] font-jost">
                    {!localStorage.getItem('accesstoken') ? (
                        <>
                            <button onClick={() => navigate('/signin')} className="hover:border-b-2 ">Sign In</button>
                            <button disabled className="cursor-default">|</button>
                            <button onClick={() => navigate('/signup')} className="hover:border-b-2">Sign Up</button>
                        </>
                    ) : (
                        <>
                            <button className="btn-hover" onClick={() => navigate('/userprofile')}>Profile</button>
                            <button disabled className="cursor-default">|</button>
                            <button onClick={handleLogout} className="btn-hover">Logout</button>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {display && (
                <div className="header font-jost px-0 md:px-20 lg:flex items-center justify-between w-full xl:hidden animate-slide">
                    <ul className="flex flex-col justify-between items-start font-semibold text-sm md:text-lg text-[#252535] border-b-4 border-b-[#252535] md:px-20 p-6 font-jost space-y-4">
                        <li className="cursor-pointer"><Link to={'/'}>Home</Link></li>
                        <li className="cursor-pointer"><Link to={'/aboutus'}>About</Link></li>
                        <li className="cursor-pointer"><Link to={'/browseskill'}>Browse Skills </Link></li>
                        <li className="cursor-pointer"><Link to={'/message'}>Messages</Link></li>
                        <li><Link to={'/dashboard'}>DashBoard</Link></li>
                    </ul>
                    <ul className="flex flex-col justify-center mt-5 space-y-2 font-semibold text-sm md:text-lg md:px-20 px-6 text-[#252535]">
                        {!localStorage.getItem('accesstoken') ? (
                            <>
                                <li onClick={() => navigate('/signin')} className="btn-hover">Sign In</li>
                                {/* <li><button disabled className="cursor-default">|</button></li> */}
                                <li onClick={() => navigate('/signup')} className="btn-hover">Sign Up</li>
                            </>
                        ) : (
                            <>
                                <li onClick={() => navigate('/userprofile')} className="btn-hover">Profile</li>
                                <li onClick={handleLogout} className="btn-hover">Logout</li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </header>
    );
}
export default Header;
