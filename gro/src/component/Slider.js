import React, { useState } from "react";
import "./Slider.css"; // Import the CSS file

// Image paths from the public folder
const images = [
  "/images/saa.jpg",
  "/images/saaa.jpg",
];

export default function Slider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="slider-container">
      <button className="prev" onClick={prevSlide}>❮</button>
      <div className="slide-wrapper">
        <img src={images[currentIndex]} alt="Slide" className="slide-image" />
      </div>
      <button className="next" onClick={nextSlide}>❯</button>
    </div>
  );
}
