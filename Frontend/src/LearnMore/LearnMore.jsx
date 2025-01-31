import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { Link } from 'react-router-dom';

function LearnMore() {
  return (
    <>
      <Header />
      <main className="font-jost min-h-screen">
        <h1 className="text-center text-3xl font-black mt-10 md:mt-20">Learn More About Swapify</h1>

        <div className="w-full px-5 md:px-20 mt-10 md:mt-20">
          <h2 className="w-full md:w-3/4 mx-auto text-xl md:text-2xl font-black">1. Introduction to Swapify</h2>
          <p className="w-full md:w-3/4 mx-auto text-base md:text-lg mt-2">
            <strong>What is Swapify?</strong> Swapify is a <strong>skill exchange platform</strong> where users can swap skills instead of money.
          </p>
          <p className="w-full md:w-3/4 mx-auto text-base md:text-lg mt-2">
            <strong>How Does It Work?</strong>
          </p>
          <ol className="w-full md:w-3/4 mx-auto list-decimal list-inside mt-4">
            <li>Create an account.</li>
            <li>List the skills you can offer.</li>
            <li>Find someone with the skill you need.</li>
            <li>Request a swap and complete the exchange.</li>
          </ol>
        </div>

        <div className="w-full px-5 md:px-20 mt-10 md:mt-20">
          <h2 className="w-full md:w-3/4 mx-auto text-xl md:text-2xl font-black">2. Why Use Swapify? (Benefits)</h2>
          <ul className="w-full md:w-3/4 mx-auto list-disc list-inside mt-4">
            <li><strong>Learn New Skills for Free:</strong> Exchange skills instead of paying.</li>
            <li><strong>Build Your Network:</strong> Connect with people from different fields.</li>
            <li><strong>Flexible Learning:</strong> Learn at your own pace.</li>
            <li><strong>Increase Your Value:</strong> Improve your skills and add experience to your resume.</li>
          </ul>
        </div>

        <div className="w-full px-5 md:px-20 mt-10 md:mt-20">
          <h2 className="w-full md:w-3/4 mx-auto text-xl md:text-2xl font-black">3. How to Swap Skills?</h2>
          <ul className="w-full md:w-3/4 mx-auto list-disc list-inside mt-4">
            <li><strong>Finding the Right Match:</strong> Search for users who have the skill you need.</li>
            <li><strong>Requesting a Swap:</strong> Send a request and wait for approval.</li>
            <li><strong>Chat & Discuss:</strong> Use the chat system to schedule sessions.</li>
            <li><strong>Complete the Exchange:</strong> Learn from each other and give feedback.</li>
          </ul>
        </div>

        <div className="w-full px-5 md:px-20 mt-10 md:mt-20">
          <h2 className="w-full md:w-3/4 mx-auto text-xl md:text-2xl font-black">4. Safety & Trust Guidelines</h2>
          <ul className="w-full md:w-3/4 mx-auto list-disc list-inside mt-4">
            <li><strong>Verified Profiles:</strong> Encourage users to verify their profiles for trust.</li>
            <li><strong>Honest Reviews:</strong> Ask users to leave feedback after each swap.</li>
            <li><strong>Report Misuse:</strong> Provide a way to report bad behavior.</li>
          </ul>
        </div>

        <div className="w-full px-5 md:px-20 mt-10 md:mt-20">
          <h2 className="w-full md:w-3/4 mx-auto text-xl md:text-2xl font-black">5. FAQs (Frequently Asked Questions)</h2>
          <ul className="w-full md:w-3/4 mx-auto list-disc list-inside mt-4">
            <li><strong>Who can use Swapify?</strong> Anyone who wants to learn or teach a skill.</li>
            <li><strong>Is it free?</strong> Explain if it’s fully free or if there are premium features.</li>
            <li><strong>How do I know if a person is trustworthy?</strong> Verified accounts, reviews, and chat before swapping.</li>
            <li><strong>What if I’m not satisfied with the swap?</strong> Dispute resolution process.</li>
          </ul>
        </div>

        <div className="w-full px-5 md:px-20 mt-10 md:mt-20">
          <h2 className="w-full md:w-3/4 mx-auto text-xl md:text-2xl font-black">6. Success Stories / Testimonials</h2>
          <p className="w-full md:w-3/4 mx-auto text-base md:text-lg mt-2">
            Here are some real user stories where people successfully exchanged skills.
          </p>
          <div className="w-full md:w-3/4 mx-auto mt-4">
            <p className="bg-gray-100 p-4 border-l-4 border-green-500">
              "I learned coding from an experienced developer and helped them with graphic design in return. It was a great experience!" - User A
            </p>
            <p className="bg-gray-100 p-4 border-l-4 border-green-500 mt-4">
              "Thanks to Swapify, I was able to learn French while teaching someone web development. A perfect exchange!" - User B
            </p>
          </div>
        </div>

        <div className="w-full px-5 md:px-20 mt-10 mb-20">
          <h2 className="w-full md:w-3/4 mx-auto text-xl md:text-2xl font-black">7. Contact Us / Support</h2>
          <p className="w-full md:w-3/4 mx-auto text-base md:text-lg mt-2">
            If you have any issues or need assistance, feel free to contact us at:
          </p>
          <p className="w-full md:w-3/4 mx-auto text-base md:text-lg mt-4">
            Email: <a href="swapify123@gmail.com" className="text-blue-500">swapify123@gmail.com</a>
          </p>
          <p className="w-full md:w-3/4 mx-auto text-base md:text-lg mt-4">
            Or visit our <Link to="/contactus" className="text-blue-500">contact page</Link> for more options.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default LearnMore;
