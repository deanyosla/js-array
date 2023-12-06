$(document).ready(function () {
  const emailInput = $('#emailInput');
  const fetchImageButton = $('#fetchImageButton');
  const addImageButton = $('#addImageButton');
  const nextImageButton = $('#nextImageButton');
  const newEmailButton = $('#newEmailButton');
  const emailContainer = $('#emailSection');
  const dropdownContainer = $('#dropdownContainer');
  const emailDropdown = $('#emailDropdown');
  const currentImage = $('#currentImage');
  const assignedImagesContainer = $('#assignedImagesContainer');
  const imageContainer = $('#imageContainer');
  const errorDiv = $('#error');

  let imageAssignments = {};
  let currentImageInfo = {};

  // Populate the dropdown with saved emails from localStorage
  populateDropdown();

  // Set a default image source
  currentImage.attr('src', 'https://picsum.photos/200');

  fetchImageButton.click(function () {
      const email = getCurrentEmail();
      if (isValidEmail(email)) {
          loadRandomImage().then(function (imageUrl) {
              currentImageInfo = { email, imageUrl };
              if (!isImageAssigned(email, imageUrl)) {
                  currentImage.attr('src', imageUrl);
                  assignImageToEmail(email, currentImageInfo);
                  saveEmailToLocalStorage(email);
                  updateImageContainer();
                  emailDropdown.append(`<option value="${email}">${email}</option>`);
                  emailDropdown.val(email);
                  emailContainer.addClass('hidden');
                  dropdownContainer.removeClass('hidden');              
                  errorDiv.empty();
              } else {
                  errorDiv.text('This image is already assigned to the selected email.');
              }
          });
      } else {
          errorDiv.text('Please input a valid email address.');
      }
  });

  addImageButton.click(function () {
      const email = getCurrentEmail();
      if (isValidEmail(email) && currentImageInfo.imageUrl) {
          if (!isImageAssigned(email, currentImageInfo.imageUrl)) {
              assignImageToEmail(email, currentImageInfo);
              updateImageContainer();
              saveEmailToLocalStorage(email);
              clearCurrentImage();
              errorDiv.empty();
          } else {
              errorDiv.text('This image is already assigned to the selected email.');
          }
      } else {
          errorDiv.text('Please select a valid email address and fetch an image before adding.');
      }
  });

  nextImageButton.click(function () {
      const email = getCurrentEmail();
      loadRandomImage().then(function (imageUrl) {
          currentImageInfo = { email, imageUrl };
          if (!isImageAssigned(email, imageUrl)) {
              currentImage.attr('src', imageUrl);
              errorDiv.empty();
          } else {
              errorDiv.text('This image is already assigned to the selected email.');
          }
      });
  });

  newEmailButton.click(function () {
    emailInput.val(''); // Clear the email input field
    emailContainer.removeClass('hidden');
    dropdownContainer.addClass('hidden');
    emailDropdown.val(''); // Clear the selected value in the dropdown
    updateImageContainer();
    clearCurrentImage();
    errorDiv.empty();
});

 emailDropdown.change(function () {
    const selectedEmail = emailDropdown.val();
    if (selectedEmail) {
        emailContainer.addClass('hidden');
        dropdownContainer.removeClass('hidden');
        updateImageContainer();
        clearCurrentImage();
    }
});

  function getCurrentEmail() {
      return emailDropdown.val() || emailInput.val();
  }

  function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
  }

  function loadRandomImage() {
      return new Promise(function (resolve) {
          const imageUrl = `https://picsum.photos/200?random=${Math.random()}`;
          resolve(imageUrl);
      });
  }

  function assignImageToEmail(email, imageInfo) {
      if (!imageAssignments[email]) {
          imageAssignments[email] = [];
      }
      imageAssignments[email].push(imageInfo);
      saveImageAssignmentsToLocalStorage();
  }

  function isImageAssigned(email, imageUrl) {
      return imageAssignments[email]?.some(info => info.imageUrl === imageUrl);
  }

  function updateImageContainer() {
    assignedImagesContainer.show();
    imageContainer.empty();
    
    const activeEmail = getCurrentEmail();
    
    if (activeEmail) {
        // Display the active email at the top
        imageContainer.append(`<h3>${activeEmail}</h3>`);
        
        const emailImagesContainer = $('<div>'); // Create a new container for images
        imageAssignments[activeEmail]?.forEach(function (imageInfo) {
            const imageElement = $(`<img src="${imageInfo.imageUrl}" alt="Assigned Image">`);
            
            // Add an onclick function to delete the image when clicked
            imageElement.click(function (event) {
                // Check if it's a left-click (button 0)
                if (event.button === 0) {
                    // Delete the image and update the container
                    deleteImage(activeEmail, imageInfo.imageUrl);
                    updateImageContainer();
                    errorDiv.text('Image deleted');
                }
            });

            emailImagesContainer.append(imageElement);
        });

        // Append the container for images to the main imageContainer
        imageContainer.append(emailImagesContainer);
    } else {
        assignedImagesContainer.hide(); // Hide the container if no email is selected
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

  function populateDropdown() {
      const savedEmails = JSON.parse(localStorage.getItem('emailAssignerEmails')) || [];
      emailDropdown.empty();
      savedEmails.forEach(function (savedEmail) {
          emailDropdown.append(`<option value="${savedEmail}">${savedEmail}</option>`);
      });
  }

  function clearCurrentImage() {
      currentImageInfo = {};
  }
});
