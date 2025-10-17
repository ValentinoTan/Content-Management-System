document.addEventListener('DOMContentLoaded', () => {
  fetch('/firebase-config')
    .then(response => response.json())
    .then(firebaseConfig => {
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
      const storage = firebase.storage();

      const imageInput = document.getElementById('imageInput');
      const uploadButton = document.getElementById('uploadButton');
      const imageGallery = document.getElementById('imageGallery');

      // Function to fetch and display images
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

      // Function to upload image
      uploadButton.addEventListener('click', () => {
        const file = imageInput.files[0];
        if (!file) {
          return;
        }

        const storageRef = storage.ref(`images/${file.name}`);
        const task = storageRef.put(file);

        task.on('state_changed',
          (snapshot) => {
            // You can use this to show upload progress
          },
          (error) => {
            console.error('Upload failed:', error);
          },
          () => {
            task.snapshot.ref.getDownloadURL().then((downloadURL) => {
              fetch('/api/images', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: downloadURL }),
              })
              .then(() => {
                loadImages(); // Reload images after upload
              });
            });
          }
        );
      });

      // Initial load of images
      loadImages();
    });
});