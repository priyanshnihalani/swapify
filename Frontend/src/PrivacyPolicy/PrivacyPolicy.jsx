import Header from '../Header/Header'
import Footer from '../Footer/Footer'

function PrivacyPolicy() {
    return (
        <>
            <Header />
            <main className="font-jost min-h-screen">
                <h1 className="text-center text-3xl font-black mt-10 md:mt-20">Privacy Policy</h1>

                <div className="w-full px-5 md:px-20 mt-10 md:mt-20">
                    <p className="w-full md:w-3/4 mx-auto font-extrabold text-lg md:text-xl">
                        Effective January 1, 2025.
                    </p>
                    <p className="w-full md:w-3/4 mx-auto text-base md:text-lg mt-4">
                        Welcome to Swapify! Your privacy is important to us. This Privacy Policy explains how we collect, use, share, and protect your personal information.
                    </p>
                    <p className="w-full md:w-3/4 mx-auto text-base md:text-lg mt-2">
                        By using Swapify, you agree to the terms outlined in this policy.
                    </p>
                    <div className="border-b-2 mt-4 w-full md:w-3/4 border-black mx-auto"></div>
                </div>

                <div className="w-full px-5 md:px-20 mt-10 md:mt-20">
                    <h1 className="w-full md:w-3/4 mx-auto text-xl md:text-2xl font-black">1. Information We Collect</h1>
                    <p className="w-full md:w-3/4 mx-auto text-base md:text-lg mt-2">
                        We collect the following types of information to provide and improve our services:
                    </p>
                    <ul className="w-full md:w-3/4 mx-auto list-disc list-inside mt-4">
                        <li className="font-semibold">a) Personal Information</li>
                        <ul className="list-disc list-inside ml-5">
                            <li>Name</li>
                            <li>Email address</li>
                            <li>Password (encrypted)</li>
                            <li>Contact details (if voluntarily provided)</li>
                        </ul>
                        <li className="font-semibold mt-4">b) Skills and Profile Information</li>
                        <ul className="list-disc list-inside ml-5">
                            <li>Skills you want to teach or learn</li>
                            <li>Profile description, images, or other content you upload</li>
                        </ul>
                        <li className="font-semibold mt-4">c) Usage Information</li>
                        <ul className="list-disc list-inside ml-5">
                            <li>Interactions with the platform (e.g., posts, messages, profile visits)</li>
                            <li>Device information (e.g., IP address, browser type, operating system)</li>
                            <li>Cookies to track preferences and usage</li>
                        </ul>
                    </ul>
                </div>

                <div className="w-full px-5 md:px-20 mt-10">
                    <h1 className="w-full md:w-3/4 mx-auto text-xl md:text-2xl font-black">2. How We Use Your Information</h1>
                    <p className="w-full md:w-3/4 mx-auto text-base md:text-lg mt-2">
                        We use the information collected to:
                    </p>
                    <ul className="w-full md:w-3/4 mx-auto list-disc list-inside mt-4">
                        <li>Create and manage your account.</li>
                        <li>Facilitate skill-swapping connections between users.</li>
                        <li>Improve and personalize your experience.</li>
                        <li>Send important updates, such as changes to policies or platform features.</li>
                        <li>Respond to inquiries and provide support.</li>
                        <li>Ensure platform security and prevent fraud.</li>
                    </ul>
                </div>

                <div className="w-full px-5 md:px-20 mt-10">
                    <h1 className="w-full md:w-3/4 mx-auto text-xl md:text-2xl font-black">3. How We Share Your Information</h1>
                    <p className="w-full md:w-3/4 mx-auto text-base md:text-lg mt-2">
                        We respect your privacy and do not sell your information. However, we may share information in the following cases:
                    </p>
                    <ul className="w-full md:w-3/4 mx-auto list-disc list-inside mt-4">
                        <li>
                            <strong>With Other Users:</strong> To display your profile and posted skills to other users.
                        </li>
                        <li>
                            <strong>For Legal Reasons:</strong> If required by law or to comply with a legal request.
                        </li>
                        <li>
                            <strong>With Service Providers:</strong> To assist us with hosting, analytics, or technical support.
                        </li>
                    </ul>
                </div>

                <div className="w-full px-5 md:px-20 mt-10">
                    <h1 className="w-full md:w-3/4 mx-auto text-xl md:text-2xl font-black">4. Cookies and Tracking Technologies</h1>
                    <p className="w-full md:w-3/4 mx-auto text-base md:text-lg mt-2">
                        We use cookies and similar technologies to:
                    </p>
                    <ul className="w-full md:w-3/4 mx-auto list-disc list-inside mt-4">
                        <li>Remember your login session.</li>
                        <li>Analyze platform usage and improve performance.</li>
                    </ul>
                    <p className="w-full md:w-3/4 mx-auto text-base md:text-lg mt-2">
                        You can disable cookies in your browser settings, but some features may not function correctly.
                    </p>
                </div>

                <div className="w-full px-5 md:px-20 mt-10 mb-20">
                    <h1 className="w-full md:w-3/4 mx-auto text-xl md:text-2xl font-black">5. How We Protect Your Information</h1>
                    <p className="w-full md:w-3/4 mx-auto text-base md:text-lg mt-2">
                        We take appropriate security measures to protect your data, including:
                    </p>
                    <ul className="w-full md:w-3/4 mx-auto list-disc list-inside mt-4">
                        <li>Encrypted passwords</li>
                        <li>Secure servers and firewalls</li>
                        <li>Regular monitoring for vulnerabilities</li>
                    </ul>
                    <p className="w-full md:w-3/4 mx-auto text-base md:text-lg mt-2">
                        However, no method of transmission over the internet is 100% secure. Use strong passwords and be cautious with your data.
                    </p>
                </div>
            </main>

            <Footer />
        </>
    )
}
export default PrivacyPolicy