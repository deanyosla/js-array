$(document).ready(function () {
    const emailInput = $('#emailInput');
    const assignButton = $('#assignButton');
    const imageContainer = $('#imageContainer');

    let imageAssignments = {};

    assignButton.click(function () {
        const email = emailInput.val().trim();

        if (isValidEmail(email)) {
            loadRandomImage().then(function (imageUrl) {
                assignImageToEmail(email, imageUrl);
                updateImageContainer();
                emailInput.val('');
            });
        } else {
            alert('Please enter a valid email address.');
        }
    });

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function loadRandomImage() {
        return new Promise(function (resolve) {
            // Using the Picsum API to get a random photo
            const imageUrl = `https://picsum.photos/500?random=${Math.random()}`;
            resolve(imageUrl);
        });
    }

    function assignImageToEmail(email, imageUrl) {
        if (!imageAssignments[email]) {
            imageAssignments[email] = [];
        }
        imageAssignments[email].push(imageUrl);
    }

    function updateImageContainer() {
        imageContainer.empty();
        for (const [email, images] of Object.entries(imageAssignments)) {
            const emailImagesList = $('<ul class="image-list"></ul>');
            emailImagesList.append(`<li><strong>${email}</strong></li>`);
            images.forEach(function (imageUrl) {
                emailImagesList.append(`<li><img src="${imageUrl}" alt="Assigned Image"></li>`);
            });
            imageContainer.append(emailImagesList);
        }
    }
});
