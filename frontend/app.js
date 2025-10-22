document.addEventListener('DOMContentLoaded', () => {
  fetch('/firebase-config')
    .then(response => response.json())
    .then(firebaseConfig => {
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
      const storage = firebase.storage();
      const database = firebase.database();

      const imageInput = document.getElementById('imageInput');
      const uploadButton = document.getElementById('uploadButton');
      const imageGallery = document.getElementById('imageGallery');
      const configureImageGallery = document.getElementById('configureImageGallery');
      const submitConfiguration = document.getElementById('submitConfiguration');

      const uploadLink = document.getElementById('upload-link');
      const dashboardLink = document.getElementById('dashboard-link');
      const configureLink = document.getElementById('configure-link');

      const uploadView = document.getElementById('upload-view');
      const dashboardView = document.getElementById('dashboard-view');
      const configureView = document.getElementById('configure-view');

      const showView = (view) => {
        [uploadView, dashboardView, configureView].forEach(v => v.classList.add('hidden'));
        view.classList.remove('hidden');
      };

      uploadLink.addEventListener('click', () => showView(uploadView));
      dashboardLink.addEventListener('click', () => showView(dashboardView));
      configureLink.addEventListener('click', () => {
        showView(configureView);
        loadImagesForConfiguration();
      });

      const loadImages = () => {
        fetch('/api/images')
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

      const loadImagesForConfiguration = () => {
        fetch('/api/images')
          .then(response => response.json())
          .then(images => {
            configureImageGallery.innerHTML = '';
            if (images) {
              Object.values(images).forEach(image => {
                const container = document.createElement('div');
                container.classList.add('relative');

                const imgElement = document.createElement('img');
                imgElement.src = image.url;
                imgElement.classList.add('w-full', 'h-auto', 'rounded-lg');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = image.url;
                checkbox.classList.add('absolute', 'top-2', 'right-2', 'h-6', 'w-6');

                container.appendChild(imgElement);
                container.appendChild(checkbox);
                configureImageGallery.appendChild(container);
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
              fetch('/api/images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: downloadURL }),
              }).then(() => loadImages());
            });
          }
        );
      });

      submitConfiguration.addEventListener('click', () => {
        const selectedImages = Array.from(configureImageGallery.querySelectorAll('input[type="checkbox"]:checked'))
          .map(cb => cb.value);

        if (selectedImages.length !== 3) {
          alert('Please select exactly 3 images.');
          return;
        }

        const sessionData = {
          image1: selectedImages[0],
          image2: selectedImages[1],
          image3: selectedImages[2],
        };

        fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData),
        }).then(() => alert('Configuration saved!'));
      });

      // Initial load
      showView(uploadView);
      loadImages();
    });
});
