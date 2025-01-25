import Footer from "../Footer/Footer";
import Header from "../Header/Header";

function Terms_Conditions() {
    return (
        <div className="bg-white">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="px-6 md:px-20 lg:px-40 py-10 font-jost">
                <h2 className="text-4xl font-bold mb-6 text-center py-10 text-black">
                    Terms and Conditions
                </h2>
                <p className="text-lg font-semibold text-black leading-relaxed mb-8">
                    Effective Date: 1/1/2025 <br />
                    Welcome to Swapify! These Terms and Conditions ("Terms") govern your use of
                    our platform. By accessing or using Swapify, you agree to comply with these
                    Terms.
                </p>

                {/* Sections */}
                <section className="space-y-8">
                    {/* 1. Definitions */}
                    <div>
                        <h3 className="text-xl font-bold text-black">1. Definitions</h3>
                        <p className="text-lg font-medium text-black leading-relaxed">
                            "Platform": Refers to Swapify, including its website and services.
                            <br /> "User": Any individual who creates an account or uses the
                            platform.
                            <br /> "Content": Refers to any text, images, videos, or other materials
                            posted by users.
                        </p>
                    </div>

                    {/* 2. Eligibility */}
                    <div>
                        <h3 className="text-xl font-bold text-black">2. Eligibility</h3>
                        <div className="text-lg font-medium text-black leading-relaxed">
                            To use Swapify, you must:
                            <ul className="list-disc list-inside">
                                <li>Be at least 13 years old.</li>
                                <li>Provide accurate and truthful information during registration.</li>
                                <li>Agree to comply with these Terms and any applicable laws.</li>
                                <li>
                                    If you are under 18, you must have parental or legal guardian
                                    consent to use the platform.
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 3. User Responsibilities */}
                    <div>
                        <h3 className="text-xl font-bold text-black">3. User Responsibilities</h3>
                        <div className="text-lg font-medium text-black leading-relaxed">
                            By using Swapify, you agree to:
                            <ul className="list-disc list-inside">
                                <li>Use the platform only for lawful purposes.</li>
                                <li>Be respectful and avoid posting harmful, offensive, or illegal content.</li>
                                <li>Maintain the confidentiality of your account credentials.</li>
                                <li>Not impersonate others or provide false information.</li>
                            </ul>
                        </div>
                        <div className="text-lg font-medium text-black leading-relaxed mt-4">
                            Prohibited Activities:
                            <ul className="list-disc list-inside">
                                <li>You must NOT use the platform to spam, scam, or harass others.</li>
                                <li>Reverse-engineer, modify, or disrupt the platform’s operations.</li>
                                <li>Post copyrighted content without permission.</li>
                            </ul>
                        </div>
                    </div>

                    {/* 4. Content Ownership and Usage */}
                    <div>
                        <h3 className="text-xl font-bold text-black">
                            4. Content Ownership and Usage
                        </h3>
                        <p className="text-lg font-medium text-black leading-relaxed">
                            <b>a) Your Content:</b> You retain ownership of the content you post on
                            Swapify. By uploading content, you grant Swapify a non-exclusive,
                            worldwide, royalty-free license to display and share your content as
                            part of the platform.
                            <br />
                            <b>b) Platform Content:</b> All platform features, logos, and designs
                            are the property of Swapify. You may not use them without prior written
                            consent.
                        </p>
                    </div>

                    {/* 5. Skill Swapping Agreements */}
                    <div>
                        <h3 className="text-xl font-bold text-black">
                            5. Skill Swapping Agreements
                        </h3>
                        <div className="text-lg font-medium text-black leading-relaxed">
                            Swapify facilitates connections between users for skill swapping.
                            However:
                            <ul className="list-disc list-inside">
                                <li>Swapify is not responsible for the outcomes of skill exchanges.</li>
                                <li>
                                    Users are solely responsible for agreeing on terms for the exchange
                                    (e.g., schedule, duration).
                                </li>
                                <li>
                                    Swapify does not guarantee the quality or success of skills offered
                                    or learned.
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 6. Disclaimer of Warranties */}
                    <div>
                        <h3 className="text-xl font-bold text-black">
                            6. Disclaimer of Warranties
                        </h3>
                        <div className="text-lg font-medium text-black leading-relaxed">
                            Swapify is provided "as is" without warranties of any kind, including:
                            <ul className="list-disc list-inside">
                                <li>No guarantee that the platform will be error-free or uninterrupted.</li>
                                <li>
                                    No responsibility for user-generated content or behavior. Use the
                                    platform at your own risk.
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 7. Limitation of Liability */}
                    <div>
                        <h3 className="text-xl font-bold text-black">7. Limitation of Liability</h3>
                        <div className="text-lg font-medium text-black leading-relaxed">
                            To the fullest extent permitted by law, Swapify is not liable for:
                            <ul className="list-disc list-inside">
                                <li>
                                    Any direct, indirect, or incidental damages resulting from your use
                                    of the platform.
                                </li>
                                <li>Loss of data, revenue, or reputation caused by platform usage.</li>
                            </ul>
                        </div>
                    </div>

                    {/* 8. Termination */}
                    <div>
                        <h3 className="text-xl font-bold text-black">8. Termination</h3>
                        <p className="text-lg font-medium text-black leading-relaxed">
                            Swapify reserves the right to suspend or terminate your account at any
                            time for violating these Terms or engaging in harmful activities. You
                            may also terminate your account by contacting us at
                            swapify@gmail.com.
                        </p>
                    </div>

                    {/* 9. Modifications to Terms */}
                    <div>
                        <h3 className="text-xl font-bold text-black">
                            9. Modifications to Terms
                        </h3>
                        <p className="text-lg font-medium text-black leading-relaxed">
                            We may update these Terms periodically. Any changes will be effective
                            immediately upon posting on the platform. It is your responsibility to
                            review the updated Terms.
                        </p>
                    </div>

                    {/* 10. Governing Law */}
                    <div>
                        <h3 className="text-xl font-bold text-black">10. Governing Law</h3>
                        <p className="text-lg font-medium text-black leading-relaxed">
                            These Terms are governed by the laws of [Insert jurisdiction, e.g., your
                            country or state]. Any disputes will be resolved in the courts of
                            Junagadh.
                        </p>
                    </div>

                    {/* 11. Contact Us */}
                    <div>
                        <h3 className="text-xl font-bold text-black">11. Contact Us</h3>
                        <p className="text-lg font-medium text-black leading-relaxed">
                            For questions or concerns about these Terms, contact us at:
                            <br />
                            <b>Email:</b> swapify@gmail.com <br />
                            <b>Website:</b> www.swapify.app
                        </p>
                    </div>
                </section>
            </main>


            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Terms_Conditions;
