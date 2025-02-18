import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="px-4 sm:px-8 md:px-20 lg:px-40 xl:px-60 w-full font-jost bg-gradient-to-r from-[#252535] to-[#6C6C9B] text-white py-10 lg:text-lg">
            <div className="flex flex-col items-center md:flex-row md:justify-between md:items-start space-y-10 md:space-y-0">
                <div className="text-center md:text-left">
                    <h1 className="font-extrabold">Quick Links</h1>
                    <ul className="mt-5 space-y-2">
                        <li><Link to={'/privacypolicy'}>Privacy Policy</Link></li>
                        <li><Link to={'/contactus'}>Contact Us</Link></li>
                        <li><Link to={'/aboutus'}>About Us</Link></li>
                        <li><Link to={'/termsandcondition'}>Terms and Condition</Link></li>
                        <li ><Link to={'/faq'}>FAQ</Link></li>
                    </ul>
                </div>
                <div className="text-center md:text-left">
                    <h1 className="font-extrabold">Follow Us On</h1>
                    <ul className="mt-5 space-y-2">
                        <li><Link to={'https://www.facebook.com/priyansh.nihalani'}>Facebook</Link></li>
                        <li><Link to={'https://www.instagram.com/priyansh_nihalani_16904'}>Instagram</Link></li>
                        <li><Link to={'https://x.com/PriyanshNi53075'}>Twitter</Link></li>
                        <li><Link to={'https://www.linkedin.com/in/priyansh-nihalani/'}>LinkedIn</Link></li>
                    </ul>
                </div>
                <div className="text-center md:text-left">
                    <h1 className="font-extrabold">Contact Information</h1>
                    <ul className="mt-5 space-y-2">
                        <li>Phone: +91 7041958565</li>
                        <li>Email: swapiify123@gmail.com</li>
                    </ul>
                </div>
            </div>
            <div>
                <p className="text-center mt-10 text-sm">&copy; 2025 Swapiify Co. All Rights Reserved</p>
            </div>
        </footer>
    );
}

export default Footer;
