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

      // Galleries and Lists
      const imageGallery = document.getElementById('imageGallery');
      const imageSelectionGallery = document.getElementById('image-selection-gallery');
      const sessionsList = document.getElementById('sessions-list');
      const imageDescriptionFields = document.getElementById('image-description-fields');

      // Inputs
      const imageInput = document.getElementById('imageInput');
      const sessionNameInput = document.getElementById('session-name-input');

      const resetCreateSessionForm = () => {
        sessionNameInput.value = '';
        imageDescriptionFields.innerHTML = '';
        const selectedImages = imageSelectionGallery.querySelectorAll('.border-blue-500');
        selectedImages.forEach(img => {
          img.classList.remove('border-4', 'border-blue-500');
        });
      };

      const showView = (view) => {
        [uploadView, dashboardView, sessionsView, createSessionView].forEach(v => v.classList.add('hidden'));
        view.classList.remove('hidden');
      };

      uploadLink.addEventListener('click', () => showView(uploadView));
      dashboardLink.addEventListener('click', () => showView(dashboardView));
      sessionsLink.addEventListener('click', () => {
        showView(sessionsView);
        loadSessions();
      });
      createSessionBtn.addEventListener('click', () => {
        resetCreateSessionForm();
        showView(createSessionView);
        loadImagesForSelection();
      });

      cancelSessionBtn.addEventListener('click', () => {
        resetCreateSessionForm();
        showView(sessionsView);
      });

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

      const loadImagesForSelection = () => {
        fetch('http://localhost:3000/api/images')
          .then(response => response.json())
          .then(images => {
            imageSelectionGallery.innerHTML = '';
            if (images) {
              Object.keys(images).forEach(key => {
                const image = images[key];
                const container = document.createElement('div');
                container.classList.add('relative');
                const imgElement = document.createElement('img');
                imgElement.src = image.url;
                imgElement.classList.add('w-full', 'h-auto', 'rounded-lg', 'cursor-pointer');
                imgElement.dataset.imageId = key;
                imgElement.dataset.imageUrl = image.url;
                container.appendChild(imgElement);
                imageSelectionGallery.appendChild(container);
              });
            }
          });
      };

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

      imageSelectionGallery.addEventListener('click', (event) => {
        if (event.target.tagName === 'IMG') {
          const selectedCount = imageSelectionGallery.querySelectorAll('.border-blue-500').length;
          if (event.target.classList.contains('border-blue-500')) {
            event.target.classList.remove('border-4', 'border-blue-500');
            const field = document.getElementById(`desc-${event.target.dataset.imageId}`);
            if (field) {
              field.remove();
            }
          } else {
            if (selectedCount < 3) {
              event.target.classList.add('border-4', 'border-blue-500');
              const descriptionField = document.createElement('div');
              descriptionField.id = `desc-${event.target.dataset.imageId}`;
              descriptionField.innerHTML = `
                <label for="desc-input-${event.target.dataset.imageId}" class="block text-gray-700 text-sm font-bold mt-2 mb-1">Description for ${event.target.src.substring(event.target.src.lastIndexOf('/') + 1)}:</label>
                <input type="text" id="desc-input-${event.target.dataset.imageId}" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" data-image-id="${event.target.dataset.imageId}">
              `;
              imageDescriptionFields.appendChild(descriptionField);
            } else {
              alert('You can select a maximum of 3 images.');
            }
          }
        }
      });

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
        const selectedImages = Array.from(imageSelectionGallery.querySelectorAll('.border-blue-500'));

        if (!sessionName) {
          alert('Please enter a session name.');
          return;
        }

        if (selectedImages.length !== 3) {
          alert('Please select exactly 3 images.');
          return;
        }

        const imagesData = selectedImages.map(img => {
          const imageId = img.dataset.imageId;
          const descriptionInput = document.getElementById(`desc-input-${imageId}`);
          return {
            url: img.dataset.imageUrl,
            description: descriptionInput ? descriptionInput.value : '',
          };
        });

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
    });
});
