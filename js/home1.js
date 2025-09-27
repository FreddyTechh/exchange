
  // HAMBURGER MENU FUNCTIONALITY
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");

  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");

    // Toggle between hamburger and X icon
    const icon = hamburger.querySelector("i");
    if (icon.classList.contains("fa-bars")) {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-times");
    } else {
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
  });

  // AUTO CHAT POPUP FUNCTIONALITY
  const chatPopup = document.getElementById("chatPopup");
  const closePopup = document.getElementById("closePopup");
  const chatNow = document.getElementById("chatNow");

  // Show popup after 5 seconds
  setTimeout(() => {
    chatPopup.style.display = "block";
  }, 5000);

  // Close popup when "Close" button is clicked
  closePopup.addEventListener("click", () => {
    chatPopup.style.display = "none";
  });

  // Open WhatsApp with pre-filled message when "Chat Now" is clicked
  chatNow.addEventListener("click", () => {
    const phoneNumber = "2348159204641"; // Your WhatsApp number
    const message = "I want to trade, what are your current rates?";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  });
