import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import videocall1 from "../assets/images/video-call-1.png";
import videocall2 from "../assets/images/video-call-2.png";
import calander from "../assets/images/calander.png";

function Carousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 3000,
  };

  return (
    <div className="carousel-container w-full max-w-md mx-auto">
      <Slider {...settings}>
        <div className="flex justify-center">
          <img src={videocall1} alt="Slide 1" className="w-1/2 mx-auto" />
          <div className="py-5">
            <p className="text-center text-xl">Generate a Code and Be a Host</p>
            <p className="text-center">
              Click on <span className="font-bold">Create Room</span> that
              you can send to the person you want to meet with.
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <img src={calander} alt="Slide 2" className="w-1/2 mx-auto" />
          <div className="py-5">
            <p className="text-center text-xl">Plan ahead</p>
            <p className="text-center">
              Click on <span className="font-bold">Create Room</span> to
              schedule a meeting for later.
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <img src={videocall2} alt="Slide 3" className="w-1/2 mx-auto" />
          <div className="py-5">
            <p className="text-center text-xl">Your meeting is safe</p>
            <p className="text-center">
              No one can join a meeting unless invited by the host.
            </p>
          </div>
        </div>
      </Slider>

      {/* Custom styling for dots and arrows */}
      <style jsx>{`
        .carousel-container .slick-dots {
          position: static;
          margin-top: 16px;
          display: flex !important;
          justify-content: center;
          gap: 0px;
        }
        .carousel-container .slick-dots li button:before {
          font-size: 6px;
          color: #6b7280; /* Gray */
        }
        .carousel-container .slick-dots li.slick-active button:before {
          color: #111827; /* Black */
        }

       .slick-arrow {
        color: black;
        border-radius: 100%;
      }

        .slick-arrow::before {
        color: black;  /* Add this if the button uses an icon */
      }

      `}</style>
    </div>
  );
}

export default Carousel;
