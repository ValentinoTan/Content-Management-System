document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/firebase-config')
    .then(response => response.json())
    .then(firebaseConfig => {
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
      const storage = firebase.storage();
      const database = firebase.database();

      // View Elements
      const uploadView = document.getElementById('upload-view');
      const dashboardView = document.getElementById('dashboard-view');
      const sessionsView = document.getElementById('sessions-view');
      const createSessionView = document.getElementById('create-session-view');

      // Navigation Links
      const uploadLink = document.getElementById('upload-link');
      const dashboardLink = document.getElementById('dashboard-link');
      const sessionsLink = document.getElementById('sessions-link');

      // Buttons
      const uploadButton = document.getElementById('uploadButton');
      const createSessionBtn = document.getElementById('create-session-btn');
      const saveSessionBtn = document.getElementById('save-session-btn');
      const cancelSessionBtn = document.getElementById('cancel-session-btn');
      const closeModalBtn = document.getElementById('close-modal-btn');

      // Galleries, Lists, and Placeholders
      const imageGallery = document.getElementById('imageGallery');
      const sessionsList = document.getElementById('sessions-list');
      const imageDescriptionFields = document.getElementById('image-description-fields');
      const imagePlaceholders = document.querySelectorAll('.image-placeholder');

      // Modal
      const imageSelectionModal = document.getElementById('image-selection-modal');
      const modalImageGallery = document.getElementById('modal-image-gallery');

      // Inputs
      const imageInput = document.getElementById('imageInput');
      const sessionNameInput = document.getElementById('session-name-input');

      let currentPlaceholderId = null;

      const resetCreateSessionForm = () => {
        sessionNameInput.value = '';
        imageDescriptionFields.innerHTML = '';
        imagePlaceholders.forEach(placeholder => {
          placeholder.innerHTML = `<button class="select-image-btn bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">Select Image</button>`;
          delete placeholder.dataset.imageUrl;
          delete placeholder.dataset.imageId;
        });
        addPlaceholderEventListeners();
      };

      const showView = (view) => {
        [uploadView, dashboardView, sessionsView, createSessionView].forEach(v => v.classList.add('hidden'));
        view.classList.remove('hidden');
      };

      const openModal = () => imageSelectionModal.classList.remove('hidden');
      const closeModal = () => imageSelectionModal.classList.add('hidden');

      uploadLink.addEventListener('click', () => showView(uploadView));
      dashboardLink.addEventListener('click', () => showView(dashboardView));
      sessionsLink.addEventListener('click', () => {
        showView(sessionsView);
        loadSessions();
      });
      createSessionBtn.addEventListener('click', () => {
        resetCreateSessionForm();
        showView(createSessionView);
        loadImagesForModal();
      });

      cancelSessionBtn.addEventListener('click', () => {
        resetCreateSessionForm();
        showView(sessionsView);
      });

      closeModalBtn.addEventListener('click', closeModal);

      const addPlaceholderEventListeners = () => {
        document.querySelectorAll('.select-image-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            currentPlaceholderId = e.target.parentElement.dataset.placeholderId;
            openModal();
          });
        });
      };

      const loadImages = () => {
        fetch('http://localhost:3000/api/images')
          .then(response => response.json())
          .then(images => {
            imageGallery.innerHTML = '';
            if (images) {
              Object.values(images).forEach(image => {
                const imgElement = document.createElement('img');
                imgElement.src = image.url;
                imgElement.classList.add('w-full', 'h-auto', 'rounded-lg');
                imageGallery.appendChild(imgElement);
              });
            }
          });
      };

      const loadImagesForModal = () => {
        fetch('http://localhost:3000/api/images')
          .then(response => response.json())
          .then(images => {
            modalImageGallery.innerHTML = '';
            if (images) {
              Object.keys(images).forEach(key => {
                const image = images[key];
                const imgElement = document.createElement('img');
                imgElement.src = image.url;
                imgElement.classList.add('w-full', 'h-auto', 'rounded-lg', 'cursor-pointer', 'hover:opacity-75');
                imgElement.dataset.imageId = key;
                imgElement.dataset.imageUrl = image.url;
                modalImageGallery.appendChild(imgElement);
              });
            }
          });
      };

      modalImageGallery.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
          const imageUrl = e.target.dataset.imageUrl;
          const imageId = e.target.dataset.imageId;
          const placeholder = document.querySelector(`[data-placeholder-id='${currentPlaceholderId}']`);

          placeholder.innerHTML = `<img src="${imageUrl}" class="w-full h-auto rounded-lg">`;
          placeholder.dataset.imageUrl = imageUrl;
          placeholder.dataset.imageId = imageId;

          const existingField = document.getElementById(`desc-div-${currentPlaceholderId}`);
          if (existingField) existingField.remove();

          const descriptionField = document.createElement('div');
          descriptionField.id = `desc-div-${currentPlaceholderId}`;
          descriptionField.innerHTML = `
            <label for="desc-input-${currentPlaceholderId}" class="block text-gray-700 text-sm font-bold mt-2 mb-1">Description for ${currentPlaceholderId}:</label>
            <input type="text" id="desc-input-${currentPlaceholderId}" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          `;
          imageDescriptionFields.appendChild(descriptionField);

          closeModal();
        }
      });

      const loadSessions = () => {
        fetch('http://localhost:3000/api/sessions')
          .then(response => response.json())
          .then(sessions => {
            sessionsList.innerHTML = '';
            if (sessions) {
              Object.keys(sessions).forEach(sessionId => {
                const session = sessions[sessionId];
                const sessionElement = document.createElement('div');
                sessionElement.classList.add('p-4', 'border', 'rounded-lg', 'mb-4');
                sessionElement.innerHTML = `
                  <h3 class="text-xl font-bold">${session.sessionName}</h3>
                  <p class="text-sm text-gray-500">Created at: ${new Date(session.createdAt).toLocaleString()}</p>
                `;
                sessionsList.appendChild(sessionElement);
              });
            }
          });
      };

      uploadButton.addEventListener('click', () => {
        const file = imageInput.files[0];
        if (!file) return;
        const storageRef = storage.ref(`images/${file.name}`);
        const task = storageRef.put(file);
        task.on('state_changed',
          () => {},
          (error) => console.error('Upload failed:', error),
          () => {
            task.snapshot.ref.getDownloadURL().then((downloadURL) => {
              fetch('http://localhost:3000/api/images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: downloadURL }),
              }).then(() => location.reload());
            });
          }
        );
      });

      saveSessionBtn.addEventListener('click', () => {
        const sessionName = sessionNameInput.value;
        if (!sessionName) {
          alert('Please enter a session name.');
          return;
        }

        let allPlaceholdersFilled = true;
        const imagesData = { home_screen: [], game_over_screen: null };

        imagePlaceholders.forEach(placeholder => {
          const placeholderId = placeholder.dataset.placeholderId;
          if (!placeholder.dataset.imageUrl) {
            allPlaceholdersFilled = false;
          } else {
            const descriptionInput = document.getElementById(`desc-input-${placeholderId}`);
            const imageData = {
              url: placeholder.dataset.imageUrl,
              description: descriptionInput ? descriptionInput.value : '',
            };

            if (placeholderId.startsWith('home-')) {
              imagesData.home_screen.push(imageData);
            } else if (placeholderId === 'game-over') {
              imagesData.game_over_screen = imageData;
            }
          }
        });

        if (!allPlaceholdersFilled) {
          alert('Please select an image for every placeholder.');
          return;
        }

        const sessionData = {
          sessionName,
          images: imagesData,
        };

        fetch('http://localhost:3000/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData),
        }).then(() => {
          resetCreateSessionForm();
          showView(sessionsView);
          loadSessions();
        });
      });

      // Initial load
      showView(uploadView);
      loadImages();
      addPlaceholderEventListeners();
    });
});