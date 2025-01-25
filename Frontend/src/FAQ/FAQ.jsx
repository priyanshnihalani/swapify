import React from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

function FAQ() {
  return (
    <div className="min-h-screen text-gray-800 flex flex-col">
      {/* Header */}
      <Header/>

      {/* Main Content */}
      <main className="w-full font-jost container mx-auto px-6 py-8 flex-grow">
      <h2 className="py-20 text-center text-2xl font-bold text-gray-800 mb-6">
        Frequently Asked Questions (FAQ)
      </h2>

      <h3 className="w-full mx-auto text-lg mb-8">
        Welcome to the Swapify FAQ page! Below, you'll find answers to common questions about how our platform works.
      </h3>

      <div className="space-y-6 py-10">
        <div className="mb-6">
          <h4 className="font-semibold">1. What is Swapify?</h4>
          <p className="text-gray-700">Swapify is an online platform designed to help users connect and exchange skills. Whether you want to learn graphic design or teach content writing, Swapify makes it easy to connect with others and swap skills.</p>
        </div>
        <hr className="border-gray-200"/>

        <div className="mb-6">
          <h4 className="font-semibold">2. How does Swapify work?</h4>
          <p className="text-gray-700">Using Swapify is simple:</p>
          <ol className="list-decimal ml-6 mt-2">
            <li>Sign Up: Create an account and set up your profile</li>
            <li>Post Skills: Share what you can teach or want to learn</li>
            <li>Connect: Match with others to start swapping skills</li>
          </ol>
          <p className="mt-2">We provide a safe space for learning and collaboration between users.</p>
        </div>
        <hr className="border-gray-200"/>

        <div className="mb-6">
          <h4 className="font-semibold">3. Is Swapify free to use?</h4>
          <p className="text-gray-700">Yes, Swapify is free for all users! There are no hidden charges for creating an account, posting skills, or connecting with others.</p>
        </div>
        <hr className="border-gray-200"/>

        <div className="mb-6">
          <h4 className="font-semibold">4. Who can use Swapify?</h4>
          <p className="text-gray-700">Anyone aged 13 and above can use Swapify. If you're under 18, you'll need parental or legal guardian consent to join the platform.</p>
        </div>
        <hr className="border-gray-200"/>

        <div className="mb-6">
          <h4 className="font-semibold">5. What kind of skills can I swap?</h4>
          <p className="text-gray-700">You can swap many different skills, including:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Web Development</li>
            <li>Graphic Designing</li>
            <li>Digital Marketing</li>
            <li>Content Writing</li>
          </ul>
          <p className="mt-2">And many more! Post your skills and browse through what others offer.</p>
        </div>
        <hr className="border-gray-200"/>

        <div className="mb-6">
          <h4 className="font-semibold">6. Is Swapify safe to use?</h4>
          <p className="text-gray-700">We prioritize user safety by implementing clear guidelines and moderation. However, users are responsible for ensuring mutual respect during skill swaps. If you encounter any issues, please report them to our team.</p>
        </div>
        <hr className="border-gray-200"/>

        <div className="mb-6">
          <h4 className="font-semibold">7. How do I connect with someone for a skill swap?</h4>
          <p className="text-gray-700">Once you find a skill that interests you, click on the profile of the user offering it. From there, you can message them and arrange the details of your skill swap (e.g., schedule, duration).</p>
        </div>
        <hr className="border-gray-200"/>

        <div className="mb-6">
          <h4 className="font-semibold">8. Do I need any specific qualifications to teach a skill?</h4>
          <p className="text-gray-700">No formal qualifications are required! You just need enough knowledge and experience in your skill to share it effectively with others.</p>
        </div>
        <hr className="border-gray-200"/>

        <div className="mb-6">
          <h4 className="font-semibold">9. What happens if a skill swap doesn't go as planned?</h4>
          <p className="text-gray-700">Swapify acts as a connector and we don't oversee or manage skill swaps. If there are any issues, we recommend resolving them respectfully with the other party. You can also report users who violate our terms.</p>
        </div>
        <hr className="border-gray-200"/>

        <div className="mb-6">
          <h4 className="font-semibold">10. Can I use Swapify on my phone?</h4>
          <p className="text-gray-700">Yes! Swapify is fully responsive and works seamlessly on phones, tablets, and desktop devices.</p>
        </div>
        <hr className="border-gray-200"/>

        <div className="mb-6">
          <h4 className="font-semibold">11. How can I delete my account?</h4>
          <p className="text-gray-700">To delete your account:</p>
          <ol className="list-decimal ml-6 mt-2">
            <li>Go to your profile settings</li>
            <li>Click on "Delete Account"</li>
            <li>Confirm your decision</li>
          </ol>
          <p className="mt-2">If you face any issues, you can contact us at [insert support email].</p>
        </div>
        <hr className="border-gray-200"/>

        <div className="mb-6">
          <h4 className="font-semibold">12. How do I report inappropriate behavior or content?</h4>
          <p className="text-gray-700">If you encounter anything inappropriate, you can report it directly through the platform by clicking on the "Report" option on a user's profile or content. Our team will review and take necessary action.</p>
        </div>
        <hr className="border-gray-200"/>

        <div className="mb-6">
          <h4 className="font-semibold">13. How do I contact Swapify support?</h4>
          <p className="text-gray-700">For questions, issues, or feedback, feel free to contact us at:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Email: [insert email address]</li>
            <li>Support Page: [insert link]</li>
            <li>We're here to help!</li>
          </ul>
        </div>
        <hr className="border-gray-200"/>

        <div className="mt-8 font-semibold">
          Still Have Questions?
          <p className="mt-2 font-normal">If your question isn't answered here, feel free to reach out to us. We're happy to assist you!</p>
        </div>
      </div>
    </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default FAQ;