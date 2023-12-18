document.addEventListener('DOMContentLoaded', function () {
  const emailInput = document.getElementById('emailInput');
  const addImageButton = document.getElementById('addImageButton');
  const nextImageButton = document.getElementById('nextImageButton');
  const newEmailButton = document.getElementById('newEmailButton');
  const emailContainer = document.getElementById('emailSection');
  const dropdownContainer = document.getElementById('dropdownContainer');
  const emailDropdown = document.getElementById('emailDropdown');
  const currentImage = document.getElementById('currentImage');
  const assignedImagesContainer = document.getElementById('assignedImagesContainer');
  const imageContainer = document.getElementById('imageContainer');
  const errorDiv = document.getElementById('error');

  let imageAssignments = {};
  let currentImageInfo = {};

  function initialize() {
      // Populate the dropdown with saved emails from localStorage
  populateDropdown();

  // Set a default image source
  currentImage.src = 'https://picsum.photos/200';
    // Call the function to load assigned images from local storage when the script starts
    loadImageAssignmentsFromLocalStorage();
  }

  initialize();

  addImageButton.addEventListener('click', function () {
    const email = getCurrentEmail();
    if (isValidEmail(email)) {
      addImage(email);
      checkImageCountAndAppendButton();
      emailDropdown.value = email;
      emailContainer.classList.add('hidden');
      dropdownContainer.classList.remove('hidden');
    } else {
      errorDiv.textContent = 'Please select a valid email address.';
      setTimeout(function () {
        errorDiv.textContent = '';
      }, 1000);
    }
  });

  function addImage(email) {
    const imageUrl = currentImage.src;
    // Create a new image element to check if the image is valid
    const img = new Image();
    img.onload = function () {
      // If the image is valid, proceed with assignment
      currentImageInfo = { email, imageUrl };
      if (!isImageAssigned(email, imageUrl)) {
        assignImageToEmail(email, currentImageInfo);
        updateImageContainer();
        saveEmailToLocalStorage(email);
        saveImageAssignmentsToLocalStorage();
        clearCurrentImage();
        errorDiv.innerHTML = '';
        // Check if the option already exists before adding a new one
        const optionExists = Array.from(emailDropdown.options).some(option => option.value === email);
        if (!optionExists) {
          // Add the new option to the dropdown
          const option = document.createElement('option');
          option.value = email;
          option.text = email;
          emailDropdown.add(option);
        }
      } else {
        // If the image is not valid, show an error
        errorDiv.textContent = 'This image has been assigned to the email already.';
        setTimeout(function () {
          errorDiv.textContent = '';
        }, 1000);
      }
    };
    img.src = imageUrl;
  }
  
  function clearImagesForEmail(email) {
    // Clear images from the container
    imageAssignments[email] = [];
    updateImageContainer();
  
    // Clear images from local storage
    saveImageAssignmentsToLocalStorage();
  
    // Remove the "Clear Images" button
    assignedImagesContainer.querySelectorAll('.clear-images-button').forEach(button => {
      button.remove();
    })
  }

  function checkImageCountAndAppendButton() {
    const activeEmail = getCurrentEmail();
  
    // Remove existing buttons before adding a new one
    assignedImagesContainer.querySelectorAll('.clear-images-button').forEach(button => {
      button.remove();
    });
  
    if (activeEmail && imageAssignments[activeEmail]) {
      const imageCount = imageAssignments[activeEmail].length;
  
      if (imageCount > 8) {
        // Append a button to clear images
        const clearImagesButton = document.createElement('button');
        clearImagesButton.textContent = 'Clear Images';
        clearImagesButton.classList.add('clear-images-button');
        clearImagesButton.addEventListener('click', function () {
          clearImagesForEmail(activeEmail);
        });
  
        // Append the button to the container
        assignedImagesContainer.append(clearImagesButton);
      }
    }
  }
  
   
  nextImageButton.addEventListener('click', function () {
    const email = getCurrentEmail();
    loadRandomImage().then(function (imageUrl) {
      currentImageInfo = { email, imageUrl };
      if (!isImageAssigned(email, imageUrl)) {
        currentImage.src = imageUrl;
        errorDiv.innerHTML = '';
      } else {
        errorDiv.textContent = 'This image is already assigned to the selected email.';
        setTimeout(function () {
          errorDiv.textContent = '';
        }, 1000);
      }
    });
  });

  newEmailButton.addEventListener('click', function () {
    if (emailContainer.classList.contains('hidden')) {
        // If email input is hidden, show it and change button to "Cancel"
        emailContainer.classList.remove('hidden');
        dropdownContainer.classList.add('hidden');
        newEmailButton.textContent = 'Cancel';
    } else {
        // If email input is visible, hide it and change button to "New Email"
        emailContainer.classList.add('hidden');
        dropdownContainer.classList.remove('hidden');
        newEmailButton.textContent = 'New Email';
        populateDropdown(); // Show the saved emails in the dropdown
    }
    emailDropdown.value = ''; // Clear the selected value in the dropdown
    updateImageContainer();
    clearCurrentImage();
    errorDiv.textContent = '';
});

  emailDropdown.addEventListener('change', function () {
    const selectedEmail = emailDropdown.value;
    if (selectedEmail) {
      emailContainer.classList.add('hidden');
      dropdownContainer.classList.remove('hidden');
      updateImageContainer();
      clearCurrentImage();
    }
  });

  function getCurrentEmail() {
    return emailDropdown.value || emailInput.value;
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function loadRandomImage(email) {
    const imagesForEmail = imageAssignments[email] || [];
    if (imagesForEmail.length > 0) {
      return Promise.resolve(imagesForEmail[0].imageUrl);
    } else {
      const imageUrl = `https://picsum.photos/200?random=${Math.random()}`;
      return Promise.resolve(imageUrl);
    }
  }
  
  function assignImageToEmail(email, imageInfo) {
    if (!imageAssignments[email]) {
      imageAssignments[email] = [];
    }
    imageAssignments[email].push(imageInfo);
    checkImageCountAndAppendButton();
    saveImageAssignmentsToLocalStorage();
  }

  function isImageAssigned(email, imageUrl) {
    return imageAssignments[email]?.some(info => info.imageUrl === imageUrl);
  }

  function updateImageContainer() {
    assignedImagesContainer.style.display = 'block';
    imageContainer.innerHTML = '';

    const activeEmail = getCurrentEmail();

    if (activeEmail) {
      // Display the active email at the top
      imageContainer.innerHTML += `<h3>${activeEmail}</h3>`;

      const emailImagesContainer = document.createElement('div'); // Create a new container for images
      imageAssignments[activeEmail]?.forEach(function (imageInfo) {
        const imageElement = document.createElement('img');
        imageElement.src = imageInfo.imageUrl;
        imageElement.alt = 'Assigned Image';

        // Add an onclick function to delete the image when clicked
        imageElement.addEventListener('click', function (event) {
          // Check if it's a left-click (button 0)
          if (event.button === 0) {
            // Delete the image and update the container
            deleteImage(activeEmail, imageInfo.imageUrl);
            updateImageContainer();
            errorDiv.textContent = 'Image deleted';
            setTimeout(function () {
              errorDiv.textContent = '';
            }, 1000);
          }
        });

        emailImagesContainer.appendChild(imageElement);
      });

      // Append the container for images to the main imageContainer
      imageContainer.appendChild(emailImagesContainer);
    } else {
      assignedImagesContainer.style.display = 'none'; // Hide the container if no email is selected
    }
  }

  function deleteImage(email, imageUrl) {
    const index = imageAssignments[email]?.findIndex(info => info.imageUrl === imageUrl);
    if (index !== -1) {
      imageAssignments[email].splice(index, 1);
      saveImageAssignmentsToLocalStorage();
    }
  }

  function saveImageAssignmentsToLocalStorage() {
    localStorage.setItem('imageAssignerImages', JSON.stringify(imageAssignments));
  }

  function saveEmailToLocalStorage(email) {
    const savedEmails = JSON.parse(localStorage.getItem('emailAssignerEmails')) || [];
    if (!savedEmails.includes(email)) {
      savedEmails.push(email);
      localStorage.setItem('emailAssignerEmails', JSON.stringify(savedEmails));
    }
  }

  function loadImageAssignmentsFromLocalStorage() {
    const savedImageAssignments = JSON.parse(localStorage.getItem('imageAssignerImages')) || {};
    imageAssignments = savedImageAssignments;
    // Check each email's images and update them to valid URLs
    Object.keys(imageAssignments).forEach(email => {
      imageAssignments[email].forEach(imageInfo => {
        const img = new Image();
        img.onload = function () {
          // If the image is valid, update the image URL
          imageInfo.imageUrl = img.src;
        };
        img.onerror = function () {
          // If the image is broken, generate a random one
          imageInfo.imageUrl = `https://picsum.photos/200?random=${Math.random()}`;
        };
        img.src = imageInfo.imageUrl;
      });
    });
    saveImageAssignmentsToLocalStorage(); // Save the updated image URLs
  }
  
  function populateDropdown() {
    const savedEmails = JSON.parse(localStorage.getItem('emailAssignerEmails')) || [];
    emailDropdown.innerHTML = '';
    savedEmails.forEach(function (savedEmail) {
      emailDropdown.innerHTML += `<option value="${savedEmail}">${savedEmail}</option>`;
    });
  }

  function clearCurrentImage() {
    currentImageInfo = {};
  }
});
