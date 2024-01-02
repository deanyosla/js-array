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
      
        // Clear the saved default image ID to force a new random ID on page refresh
        localStorage.removeItem('defaultImageId');
      
        // Set a default image source with a new random ID
        loadRandomImage().then(({ imageUrl, imageId }) => {
          currentImage.src = imageUrl;
        });
      
        // Call the function to load assigned images from local storage when the script starts
        loadImageAssignmentsFromLocalStorage();
      }
            
      initialize();

      addImageButton.addEventListener('click', function () {
        const email = getCurrentEmail();
        const imageUrl = currentImage.src;
      
        if (isValidEmail(email)) {
          if (imageUrl) {
            const existingImages = imageAssignments[email] || [];
            const existingImageIds = existingImages.map(info => info.imageId);
      
            if (!isImageAssigned(email, imageUrl)) {
              // Check if the current image has an ID
              if (!currentImageInfo.imageId) {
                currentImageInfo.imageId = generateImageId();
              }
      
              addImage(email, imageUrl, currentImageInfo.imageId);
              checkImageCountAndAppendButton();
              emailDropdown.value = email;
              emailContainer.classList.add('hidden');
              dropdownContainer.classList.remove('hidden');
            } else {
              errorDiv.textContent = 'This image is already assigned to the selected email.';
              setTimeout(function () {
                errorDiv.textContent = '';
              }, 1000);
            }
          } else {
            errorDiv.textContent = 'Please select a valid image.';
            setTimeout(function () {
              errorDiv.textContent = '';
            }, 1000);
          }
        } else {
          errorDiv.textContent = 'Please select a valid email address.';
          setTimeout(function () {
            errorDiv.textContent = '';
          }, 1000);
        }
      });
      
      function addImage(email, imageUrl) {
        const img = new Image();
      
        img.onload = function () {
          const imageId = generateImageId();
          const currentImageInfo = { email, imageUrl, imageId };
      
          if (!isImageAssigned(email, imageId) && !isDuplicateImage(email, currentImageInfo)) {
            assignImageToEmail(email, currentImageInfo);
            updateImageContainer();
            saveEmailToLocalStorage(email);
            saveImageAssignmentsToLocalStorage();
            clearCurrentImage();
            errorDiv.innerHTML = '';
      
            const optionExists = Array.from(emailDropdown.options).some(option => option.value === email);
      
            if (!optionExists) {
              const option = document.createElement('option');
              option.value = email;
              option.text = email;
              emailDropdown.add(option);
            }
      
            newEmailButton.textContent = 'New Email';
          } else {
            errorDiv.textContent = 'This image has been assigned to the email already.';
            setTimeout(function () {
              errorDiv.textContent = '';
            }, 1000);
          }
        };
      
        img.onerror = function () {
          errorDiv.textContent = 'Please select a valid image.';
          setTimeout(function () {
            errorDiv.textContent = '';
          }, 1000);
        };
      
        // Set the image source after setting the onload and onerror handlers
        img.src = imageUrl;
      }
      
                       
      function isDuplicateImage(email, currentImageInfo) {
        return (
          imageAssignments[email]?.some(info =>
            info.imageUrl === currentImageInfo.imageUrl && info.imageId !== currentImageInfo.imageId
          ) || false
        );
      }
      
      function isImageAssigned(email, imageId) {
        return imageAssignments[email]?.some(info => info.imageId === imageId);
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
      
        // Remove all existing buttons
        assignedImagesContainer.querySelectorAll('.clear-images-button').forEach(button => {
          button.remove();
        });
      
        if (activeEmail && imageAssignments[activeEmail]) {
          const imageCount = imageAssignments[activeEmail].length;
      
          if (imageCount >= 8 && emailDropdown.value === activeEmail) {
            // Check if the selected email is the active email
            // Append a button to clear images
            const clearImagesButton = document.createElement('button');
            clearImagesButton.textContent = 'Clear Images';
            clearImagesButton.classList.add('clear-images-button');
            clearImagesButton.dataset.email = activeEmail;
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
        loadRandomImage().then(function ({ imageUrl, imageId }) {
          currentImageInfo = { email, imageUrl, imageId };
          currentImage.src = imageUrl;
          errorDiv.innerHTML = '';
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

        // Check image count and hide/show the "Clear Images" button
        const imageCount = imageAssignments[selectedEmail]?.length || 0;
        const clearImagesButton = assignedImagesContainer.querySelector('.clear-images-button');
        
        if (imageCount < 8) {
          // If there are fewer than 8 images, hide the button
          clearImagesButton?.classList.add('hidden');
        } else {
          // If there are 8 or more images, show the button
          clearImagesButton?.classList.remove('hidden');
        }
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
          const randomIndex = Math.floor(Math.random() * imagesForEmail.length);
          const { imageUrl, imageId } = imagesForEmail[randomIndex];
          return Promise.resolve({ imageUrl, imageId });
        } else {
          const randomIdWithinRange = Math.floor(Math.random() * 1084) + 1; // Generate random ID within the valid range
          const imageUrl = getImageUrlById(randomIdWithinRange);
      
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = function () {
              resolve({ imageUrl, imageId: randomIdWithinRange });
            };
            img.onerror = function () {
              console.error('Error loading image:', imageUrl);
              return true;
            };
            img.src = imageUrl;
          });
        }
      }

      function getImageUrlById(imageId) {
        // Use the ID to create a specific image URL
        return `https://picsum.photos/id/${imageId}/200/200`;
      }
      
      function assignImageToEmail(email, imageInfo) {
        if (!imageAssignments[email]) {
          imageAssignments[email] = [];
        }
      
        // Check if the image already has an ID, generate one if not
        if (!imageInfo.imageId) {
          imageInfo.imageId = generateImageId();
        }
      
        imageAssignments[email].push(imageInfo);
        checkImageCountAndAppendButton();
        saveImageAssignmentsToLocalStorage();
      }

      function isImageAssigned(email, imageId) {
        return imageAssignments[email]?.some(info => info.imageId === imageId);
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
                deleteImage(activeEmail, imageInfo.imageId);
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

      function deleteImage(email, imageId) {
        const index = imageAssignments[email]?.findIndex(info => info.imageId === imageId);
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
        return new Promise((resolve) => {
          const savedImageAssignments = JSON.parse(localStorage.getItem('imageAssignerImages')) || {};
          imageAssignments = savedImageAssignments;
      
          // Check each email's images and update them to valid URLs
          const promises = Object.keys(imageAssignments).map(email => {
            return Promise.all(imageAssignments[email].map(async imageInfo => {
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
      
              // If the image ID is missing, assign a new one
              if (!imageInfo.imageId) {
                imageInfo.imageId = generateImageId();
              }
            }));
          });
      
          Promise.all(promises).then(() => {
            saveImageAssignmentsToLocalStorage(); // Save the updated image URLs
            resolve();
          });
        });
      }

      function generateImageId() {
        return Date.now().toString() + Math.floor(Math.random() * 1000000).toString();
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