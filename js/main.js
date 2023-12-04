// main.js

document.addEventListener('DOMContentLoaded', function () {
    // Run this code when the DOM is fully loaded
  
    const apiUrl = 'https://picsum.photos/200/300'; // Picsum API URL for images
    let currentIndex = 0; // Index of the current image in the array
  
    const emailDropdown = document.getElementById('emailDropdown');
    const addEmailBtn = document.getElementById('addEmailBtn');
    const addImgBtn = document.getElementById('addImgBtn');
    const nextImgBtn = document.getElementById('nextImgBtn');
  
    addEmailBtn.addEventListener('click', addEmail);
    addImgBtn.addEventListener('click', addImage);
    nextImgBtn.addEventListener('click', nextImage);
  
    // Object to store images associated with each email
    const emailImages = {};
  
    function addEmail() {
      const emailInput = document.getElementById('emailInput');
      const email = emailInput.value.trim();
  
      // Validate email address (you can use a more sophisticated validation)
      if (email === '' || !isValidEmail(email)) {
        alert('Please enter a valid email address.');
        return;
      }
  
      // Add the email to the dropdown menu
      addEmailToDropdown(email);
  
      // Clear the email input
      emailInput.value = '';
    }
  
    function addEmailToDropdown(email) {
      const option = document.createElement('option');
      option.value = email;
      option.text = email;
      emailDropdown.add(option);
    }
  
    function displayImage(email) {
      const photoGallery = document.getElementById('photoGallery');
  
      // Check if the email is already displayed
      let emailDiv = photoGallery.querySelector(`[data-email="${email}"]`);
  
      if (emailDiv === null) {
        // Create a new div for the email and add it to the gallery
        emailDiv = document.createElement('div');
        emailDiv.classList.add('email-entry');
        emailDiv.setAttribute('data-email', email);
        emailDiv.innerHTML = `<p>${email}</p>`;
        photoGallery.appendChild(emailDiv);
        emailImages[email] = [];
      }
  
      // Display the current image linked to the email
      const imageDiv = document.createElement('div');
      imageDiv.classList.add('image-entry');
      const imageUrl = `${apiUrl}?random=${currentIndex + 1}`; // Generate a random image URL
      imageDiv.innerHTML = `<img src="${imageUrl}" alt="Image ${currentIndex + 1}" />`;
  
      // Add the image URL to the emailImages object
      emailImages[email].push(imageUrl);
  
      emailDiv.appendChild(imageDiv);
  
      // Move to the next image in the array
      currentIndex++;
    }
  
    function isValidEmail(email) {
      // Simple email validation regex (you can use a more robust one)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  
    function addImage() {
      const selectedEmail = emailDropdown.value;
  
      if (selectedEmail === '' || !isValidEmail(selectedEmail)) {
        alert('Please select a valid email address before adding an image.');
        return;
      }
  
      // Display the image linked to the selected email
      displayImage(selectedEmail);
    }
  
    function nextImage() {
      const selectedEmail = emailDropdown.value;
  
      if (selectedEmail === '' || !isValidEmail(selectedEmail)) {
        alert('Please select a valid email address before moving to the next image.');
        return;
      }
  
      // Display the next image linked to the selected email
      displayImage(selectedEmail);
    }
  });
  