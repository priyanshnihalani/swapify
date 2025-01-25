import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import contact from "../assets/images/contact.png";
import LeafletMapComponent from "../Map/Map";

function Contact() {
  return (
    <>
      <Header />
      <main className="font-jost min-h-screen">
        <h1 className="text-center font-black text-3xl mt-20 px-4 sm:px-8 lg:px-16">Contact Us</h1>
        <img
          src={contact}
          className="w-3/4 mx-auto mt-10 sm:w-2/3 lg:w-1/2"
          alt=""
        />

        <section className="w-full px-4 sm:px-8 lg:px-16">
          <h1 className="text-center font-semibold text-xl mt-20">
            Have questions or need assistance? We're here to help.
          </h1>

          <form className="w-full flex flex-col justify-center items-center space-y-4 py-20">
            <input
              type="email"
              name="email"
              placeholder="Enter Your Email Address"
              className="border-2 w-full sm:w-3/4 md:w-1/2 lg:w-1/3 p-4 rounded"
            />

            <input
              type="text"
              name="subject"
              placeholder="Briefly Describe Your Query"
              className="border-2 w-full sm:w-3/4 md:w-1/2 lg:w-1/3 p-4 rounded"
            />

            <textarea
              name="message"
              placeholder="Type Your Message"
              className="border-2 w-full sm:w-3/4 md:w-1/2 lg:w-1/3 p-4 rounded"
              rows={8}
            />

            <button
              type="submit"
              className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] px-10 py-3 rounded font-bold text-white"
            >
              Submit
            </button>
          </form>

          <h1 className="text-xl py-20 font-bold text-center">
            We'll get back to you within 24-48 hours.
          </h1>
        </section>

        <section className="w-full">
          <div className="w-full bg-white px-4 sm:px-8 lg:px-20 pb-8">
            <LeafletMapComponent />
          </div>

          <div className="space-y-4 px-5 md:px-0 py-12">
            <h1 className="text-xl font-bold text-center">
              Looking for quick answers? Visit our FAQ page
            </h1>

            <h1 className="text-xl font-bold text-center">
              Our support team is available Monday to Friday, 9:00 AM to 6:00 PM (IST).
            </h1>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Contact;
