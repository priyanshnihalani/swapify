import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import about from '../assets/images/about_background.png';
import './About.css'

function About() {
    return (
        <>
            <Header />
            <main className="font-jost min-h-screen">
                {/* Hero Section */}
                <section className='Hero-Section'>
                    <div className='relative'>

                        <img src={about} alt="" className='relative' />
                        <div className='alignment  text-center space-y-10'>
                            <h1 className='text-xl md:text-3xl font-black text-white '>About Us</h1>
                            <p className='hidden md:block text-xl font-bold text-white md:lineheight'>Swapify is an innovative skill-sharing platform that connects individuals eager to learn and teach skills, fostering collaboration and growth.</p>
                        </div>
                    </div>
                </section>

                <section className="py-20 px-5 md:px-20">
                    <h2 className="text-xl md:text-3xl font-bold text-center mb-8">Our Mission</h2>
                    <p className="md:text-lg text-gray-700 text-center max-w-4xl mx-auto font-medium">
                        We aim to break the barriers of costly education and create a community-driven space where anyone can learn or teach skills at no cost.
                    </p>
                </section>

                <section className="py-20 px-5 md:px-20">
                    <h2 className="text-xl md:text-3xl font-bold text-center mb-8">Our Story</h2>
                    <p className="md:text-lg text-gray-700 text-center max-w-4xl mx-auto font-medium">
                        Swapify was created by students who saw the need for a collaborative learning environment where skills could be exchanged without financial constraints. Inspired by the idea of "giving and receiving," Swapify was built to make skill-sharing simple and fun.
                    </p>
                </section>

                <section className="py-20 px-5 md:px-20">
                    <h2 className="text-xl md:text-3xl font-bold text-center mb-8">Our Values</h2>
                    <div className="md:text-lg text-gray-700 text-center max-w-4xl mx-auto">
                        <ul className='font-medium'>
                            <li>
                                Collaboration: Learning is better together.
                            </li>
                            <li>
                                Accessibility: Skills for everyone, without barriers.
                            </li>
                            <li>
                                Community: A safe, supportive environment for all.
                            </li>
                        </ul>
                    </div>
                </section>

                <section className="py-20 px-5 md:px-20">
                    <h2 className="text-xl md:text-3xl font-bold text-center mb-8">Why Choose Swapify?</h2>
                    <p className="md:text-lg text-gray-700 text-center max-w-4xl mx-auto font-medium">
                    Unlike traditional learning platforms, Swapify focuses on connecting people to learn from each other for free. It's more than a platform—it's a community of learners and teachers.
                    </p>
                </section>

                <section className="py-20 px-5 md:px-20">
                    <h2 className="text-xl md:text-3xl font-bold text-center mb-8">Join Us</h2>
                    <p className="md:text-lg text-gray-700 text-center max-w-4xl mx-auto font-medium">
                    Start your learning journey with Swapify today. Sign up, post your skills, and connect with a world of learners and teachers!
                    </p>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default About;
