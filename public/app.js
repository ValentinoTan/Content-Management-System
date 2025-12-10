document.addEventListener('DOMContentLoaded', () => {
    // Check if firebaseConfig is defined
    if (!window.firebaseConfig || window.firebaseConfig.apiKey === "YOUR_API_KEY") {
        console.error("Firebase configuration is missing or invalid. Please update config.js.");
        alert("Firebase configuration is missing. Please update config.js with your project credentials.");
        return;
    }

    // Initialize Firebase
    firebase.initializeApp(window.firebaseConfig);
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
    const sessionDetailsModal = document.getElementById('session-details-modal');
    const detailsModalTitle = document.getElementById('details-modal-title');
    const detailsModalContent = document.getElementById('details-modal-content');
    const closeDetailsModalBtn = document.getElementById('close-details-modal-btn');

    // Inputs
    const imageInput = document.getElementById('imageInput');
    const sessionNameInput = document.getElementById('session-name-input');
    const schoolFilter = document.getElementById('school-filter');

    let currentPlaceholderId = null;

    const resetCreateSessionForm = () => {
        sessionNameInput.value = '';
        imageDescriptionFields.innerHTML = '';
        imagePlaceholders.forEach(placeholder => {
            placeholder.innerHTML = `<button class="select-image-btn bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">Select Image</button>`;
            delete placeholder.dataset.imageUrl;
            delete placeholder.dataset.imageId;
            const changeBtn = document.querySelector(`.change-image-btn[data-placeholder-id='${placeholder.dataset.placeholderId}']`);
            if (changeBtn) changeBtn.classList.add('hidden');
        });
        attachPlaceholderEventListeners();
    };

    const showView = (view) => {
        [uploadView, dashboardView, sessionsView, createSessionView].forEach(v => v.classList.add('hidden'));
        view.classList.remove('hidden');
    };

    const openModal = (placeholderId) => {
        currentPlaceholderId = placeholderId;
        imageSelectionModal.classList.remove('hidden');
    };
    const closeModal = () => imageSelectionModal.classList.add('hidden');

    uploadLink.addEventListener('click', () => showView(uploadView));
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

    const attachPlaceholderEventListeners = () => {
        document.querySelectorAll('.select-image-btn, .change-image-btn').forEach(btn => {
            btn.onclick = (e) => {
                openModal(e.target.dataset.placeholderId || e.target.parentElement.dataset.placeholderId);
            };
        });
    };

    const loadImages = () => {
        database.ref('images').once('value')
            .then((snapshot) => {
                const images = snapshot.val();
                imageGallery.innerHTML = '';
                if (images) {
                    Object.values(images).forEach(image => {
                        const imgElement = document.createElement('img');
                        imgElement.src = image.url;
                        imgElement.classList.add('w-full', 'h-auto', 'rounded-lg');
                        imageGallery.appendChild(imgElement);
                    });
                }
            })
            .catch((error) => {
                console.error('Error fetching images', error);
            });
    };

    const loadImagesForModal = () => {
        database.ref('images').once('value')
            .then((snapshot) => {
                const images = snapshot.val();
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
            })
            .catch((error) => {
                console.error('Error fetching images for modal', error);
            });
    };

    modalImageGallery.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            const imageUrl = e.target.dataset.imageUrl;
            const imageId = e.target.dataset.imageId;
            const placeholder = document.querySelector(`[data-placeholder-id='${currentPlaceholderId}']`);

            placeholder.innerHTML = `<img src="${imageUrl}" class="rounded-lg" style="width: 200px; height: 250px; object-fit: cover;">`;
            placeholder.dataset.imageUrl = imageUrl;
            placeholder.dataset.imageId = imageId;

            const changeBtn = document.querySelector(`.change-image-btn[data-placeholder-id='${currentPlaceholderId}']`);
            if (changeBtn) changeBtn.classList.remove('hidden');

            const existingField = document.getElementById(`desc-div-${currentPlaceholderId}`);
            if (existingField) existingField.remove();

            if (currentPlaceholderId !== 'game-over') {
                const descriptionField = document.createElement('div');
                descriptionField.id = `desc-div-${currentPlaceholderId}`;
                descriptionField.innerHTML = `
            <label for="desc-input-${currentPlaceholderId}" class="block text-gray-700 text-sm font-bold mt-2 mb-1">Description for ${currentPlaceholderId}:</label>
            <input type="text" id="desc-input-${currentPlaceholderId}" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <p class="text-xs text-gray-500 mt-1">Recommended maximum 400 letters.</p>
          `;
                imageDescriptionFields.appendChild(descriptionField);
            }

            closeModal();
        }
    });

    const loadSessions = () => {
        database.ref('sessions').once('value')
            .then((snapshot) => {
                const sessions = snapshot.val();
                sessionsList.innerHTML = '';
                if (sessions) {
                    Object.keys(sessions).forEach(sessionId => {
                        const session = sessions[sessionId];
                        const sessionElement = document.createElement('div');
                        sessionElement.classList.add('p-4', 'border', 'rounded-lg', 'mb-4', 'flex', 'justify-between', 'items-center');
                        sessionElement.innerHTML = `
                  <div>
                    <h3 class="text-xl font-bold">${session.sessionName}</h3>
                    <p class="text-sm text-gray-500">Created at: ${new Date(session.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button class="details-btn bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" data-session-id="${sessionId}">Details</button>
                `;
                        sessionsList.appendChild(sessionElement);
                    });
                }
            })
            .catch((error) => {
                console.error('Error fetching sessions', error);
            });
    };

    sessionsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('details-btn')) {
            const sessionId = e.target.dataset.sessionId;
            database.ref(`sessions/${sessionId}`).once('value')
                .then((snapshot) => {
                    const session = snapshot.val();
                    let totalClicks = 0;
                    if (session.images.home_screen) {
                        totalClicks += session.images.home_screen.reduce((acc, img) => acc + (img.clickCount || 0), 0);
                    }
                    if (session.images.game_over_screen) {
                        totalClicks += session.images.game_over_screen.clickCount || 0;
                    }
                    detailsModalTitle.textContent = `Details for ${session.sessionName}`;
                    detailsModalContent.innerHTML = `<p class="text-2xl">${totalClicks}</p><p>Total Clicks</p>`;
                    sessionDetailsModal.classList.remove('hidden');
                })
                .catch((error) => {
                    console.error('Error fetching session details', error);
                });
        }
    });

    closeDetailsModalBtn.addEventListener('click', () => {
        sessionDetailsModal.classList.add('hidden');
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
                    const newImageRef = database.ref('images').push();
                    newImageRef.set({
                            url: downloadURL
                        })
                        .then(() => {
                            location.reload();
                        })
                        .catch((error) => console.error('Error saving image URL:', error));
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
        const imagesData = {
            home_screen: [],
            game_over_screen: null
        };

        imagePlaceholders.forEach(placeholder => {
            const placeholderId = placeholder.dataset.placeholderId;
            if (!placeholder.dataset.imageUrl) {
                allPlaceholdersFilled = false;
            } else {
                let description = '';
                if (placeholderId === 'game-over') {
                    description = '-';
                } else {
                    const descriptionInput = document.getElementById(`desc-input-${placeholderId}`);
                    description = descriptionInput ? descriptionInput.value : '';
                }

                const imageData = {
                    url: placeholder.dataset.imageUrl,
                    description: description,
                    clickCount: 0 // Initialize click count
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
            createdAt: new Date().toISOString(),
            images: imagesData,
        };

        const newSessionRef = database.ref('sessions').push();
        newSessionRef.set(sessionData)
            .then(() => {
                resetCreateSessionForm();
                showView(sessionsView);
                loadSessions();
            })
            .catch((error) => {
                console.error('Error saving session:', error);
                alert('Failed to save session');
            });
    });

    // Dashboard Elements
    const totalPlayersEl = document.getElementById('total-players');
    const returnRateEl = document.getElementById('return-rate');
    const totalPlaysEl = document.getElementById('total-plays');
    const averagePlaysEl = document.getElementById('average-plays');
    const highestPlayCountEl = document.getElementById('highest-play-count');
    const playerDataTable = document.getElementById('player-data-table');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const pageIndicator = document.getElementById('page-indicator');

    let allPlayers = [];
    let fullPlayerData = [];
    let currentPage = 1;
    const rowsPerPage = 20;
    let playFrequencyChart, schoolEngagementChart, schoolDistributionChart;

    let currentSort = {
        column: null,
        direction: 'asc'
    };

    const sortPlayers = (column) => {
        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = column;
            currentSort.direction = 'asc';
        }

        allPlayers.sort((a, b) => {
            let valA = a[column];
            let valB = b[column];

            if (column === 'playerScore' || column === 'playCount') {
                valA = Number(valA);
                valB = Number(valB);
            }

            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (valA < valB) {
                return currentSort.direction === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return currentSort.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        currentPage = 1;
        displayPlayerPage(currentPage);
        updatePaginationControls();
        updateHeaderStyles();
    };

    const updateHeaderStyles = () => {
        ['playerName', 'phoneNumber', 'schoolName', 'playerScore', 'playCount'].forEach(col => {
            const span = document.getElementById(`sort-${col}`);
            span.innerHTML = ''; // Clear previous icons
            if (currentSort.column === col) {
                span.innerHTML = currentSort.direction === 'asc' ? '&#9650;' : '&#9660;'; // Up or down arrow
            }
        });
    };

    document.getElementById('th-playerName').addEventListener('click', () => sortPlayers('playerName'));
    document.getElementById('th-phoneNumber').addEventListener('click', () => sortPlayers('phoneNumber'));
    document.getElementById('th-schoolName').addEventListener('click', () => sortPlayers('schoolName'));
    document.getElementById('th-playerScore').addEventListener('click', () => sortPlayers('playerScore'));
    document.getElementById('th-playCount').addEventListener('click', () => sortPlayers('playCount'));


    const displayPlayerPage = (page) => {
        playerDataTable.innerHTML = '';
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedPlayers = allPlayers.slice(start, end);

        for (const player of paginatedPlayers) {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td class="text-left py-3 px-4">${player.playerName}</td>
            <td class="text-left py-3 px-4">${player.phoneNumber}</td>
            <td class="text-left py-3 px-4">${player.schoolName}</td>
            <td class="text-left py-3 px-4">${player.playerScore}</td>
            <td class="text-left py-3 px-4">${player.playCount}</td>
          `;
            playerDataTable.appendChild(row);
        }
    };

    const updatePaginationControls = () => {
        const totalPages = Math.ceil(allPlayers.length / rowsPerPage);
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages || 1}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    };

    const destroyCharts = () => {
        if (playFrequencyChart) playFrequencyChart.destroy();
        if (schoolEngagementChart) schoolEngagementChart.destroy();
        if (schoolDistributionChart) schoolDistributionChart.destroy();
    };

    const populateSchoolFilter = (players) => {
        const schools = new Set();
        players.forEach(player => {
            if (player.schoolName) {
                schools.add(player.schoolName);
            }
        });

        const sortedSchools = Array.from(schools).sort();

        // Save current selection if possible
        const currentSelection = schoolFilter.value;

        schoolFilter.innerHTML = '<option value="">All Schools</option>';
        sortedSchools.forEach(school => {
            const option = document.createElement('option');
            option.value = school;
            option.textContent = school;
            schoolFilter.appendChild(option);
        });

        if (currentSelection && sortedSchools.includes(currentSelection)) {
            schoolFilter.value = currentSelection;
        }
    };

    const filterPlayerTable = () => {
        const selectedSchool = schoolFilter.value;

        if (selectedSchool) {
            allPlayers = fullPlayerData.filter(p => p.schoolName === selectedSchool);
        } else {
            allPlayers = [...fullPlayerData];
        }

        // Apply current sort if exists
        if (currentSort.column) {
            // Re-use logic from sortPlayers but just the sorting part?
            // Easier to just let sortPlayers trigger or duplicate the sort logic.
            // Since sortPlayers sorts `allPlayers` in place, we can just call it if we want,
            // but sortPlayers toggles direction.
            // For simplicity, let's just sort it if a sort is active.
             allPlayers.sort((a, b) => {
                let valA = a[currentSort.column];
                let valB = b[currentSort.column];

                if (currentSort.column === 'playerScore' || currentSort.column === 'playCount') {
                    valA = Number(valA);
                    valB = Number(valB);
                }

                if (typeof valA === 'string') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                if (valA < valB) {
                    return currentSort.direction === 'asc' ? -1 : 1;
                }
                if (valA > valB) {
                    return currentSort.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        currentPage = 1;
        displayPlayerPage(currentPage);
        updatePaginationControls();
    };

    const loadPlayerAnalytics = async () => {
        try {
            const jungleJumperRef = database.ref('Jungle Jumper');
            const sandsOfCairoRef = database.ref('Sands of Cairo');

            const [jungleJumperSnapshot, sandsOfCairoSnapshot] = await Promise.all([
                jungleJumperRef.once('value'),
                sandsOfCairoRef.once('value'),
            ]);

            const allPlays = [];
            if (jungleJumperSnapshot.exists()) {
                jungleJumperSnapshot.forEach(child => {
                    allPlays.push(child.val());
                });
            }
            if (sandsOfCairoSnapshot.exists()) {
                sandsOfCairoSnapshot.forEach(child => {
                    allPlays.push(child.val());
                });
            }

            const totalPlays = allPlays.length;

            const uniquePlayers = {};
            allPlays.forEach(play => {
                if (!uniquePlayers[play.phoneNumber]) {
                    uniquePlayers[play.phoneNumber] = { ...play,
                        playCount: 0
                    };
                }
                uniquePlayers[play.phoneNumber].playCount += 1;
                if (play.playerScore > (uniquePlayers[play.phoneNumber].playerScore || 0)) {
                    uniquePlayers[play.phoneNumber].playerScore = play.playerScore;
                }
            });

            fullPlayerData = Object.values(uniquePlayers);
            const totalUniquePlayers = fullPlayerData.length;

            let returningPlayers = 0;
            let highestPlayCount = 0;
            fullPlayerData.forEach(player => {
                if (player.playCount > 1) {
                    returningPlayers += 1;
                }
                if (player.playCount > highestPlayCount) {
                    highestPlayCount = player.playCount;
                }
            });

            const returnRate = totalUniquePlayers > 0 ? (returningPlayers / totalUniquePlayers) * 100 : 0;
            const averagePlays = totalUniquePlayers > 0 ? (totalPlays / totalUniquePlayers) : 0;

             // Data for Player Play Frequency Chart
            const playFrequency = {
                '1': 0,
                '2-3': 0,
                '4-5': 0,
                '6+': 0
            };
            fullPlayerData.forEach(player => {
                if (player.playCount === 1) playFrequency['1']++;
                else if (player.playCount >= 2 && player.playCount <= 3) playFrequency['2-3']++;
                else if (player.playCount >= 4 && player.playCount <= 5) playFrequency['4-5']++;
                else if (player.playCount >= 6) playFrequency['6+']++;
            });

            // Data for School-based charts
            const schoolData = {};
            fullPlayerData.forEach(player => {
                const school = player.schoolName || 'Unknown';
                if (!schoolData[school]) {
                    schoolData[school] = {
                        uniquePlayers: 0,
                        totalPlays: 0
                    };
                }
                schoolData[school].uniquePlayers++;
                schoolData[school].totalPlays += player.playCount;
            });

             // Update UI Stats
            totalPlayersEl.textContent = totalUniquePlayers;
            returnRateEl.textContent = `${returnRate.toFixed(2)}%`;
            totalPlaysEl.textContent = totalPlays;
            averagePlaysEl.textContent = averagePlays.toFixed(2);
            highestPlayCountEl.textContent = highestPlayCount;

            // Render charts
            destroyCharts();
            renderPlayFrequencyChart(playFrequency);
            renderSchoolEngagementChart(schoolData);
            renderSchoolDistributionChart(schoolData);

            populateSchoolFilter(fullPlayerData);
            filterPlayerTable();

        } catch (error) {
            console.error('Error fetching player analytics:', error);
            // Optionally show error on UI
        }
    };

    const renderPlayFrequencyChart = (playFrequency) => {
        const ctx = document.getElementById('playFrequencyChart').getContext('2d');
        playFrequencyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1 Play', '2-3 Plays', '4-5 Plays', '6+ Plays'],
                datasets: [{
                    label: 'Number of Players',
                    data: [
                        playFrequency['1'],
                        playFrequency['2-3'],
                        playFrequency['4-5'],
                        playFrequency['6+']
                    ],
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 50
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    };

    const renderSchoolEngagementChart = (schoolData) => {
        const schools = Object.keys(schoolData);
        const uniquePlayers = schools.map(school => schoolData[school].uniquePlayers);
        const totalPlays = schools.map(school => schoolData[school].totalPlays);

        const ctx = document.getElementById('schoolEngagementChart').getContext('2d');
        schoolEngagementChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: schools,
                datasets: [{
                    label: 'Total Unique Players',
                    data: uniquePlayers,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }, {
                    label: 'Total Plays',
                    data: totalPlays,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 50
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    };

    const renderSchoolDistributionChart = (schoolData) => {
        const schools = Object.keys(schoolData);
        const uniquePlayers = schools.map(school => schoolData[school].uniquePlayers);

        const ctx = document.getElementById('schoolDistributionChart').getContext('2d');
        schoolDistributionChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: schools,
                datasets: [{
                    label: 'Player Distribution',
                    data: uniquePlayers,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    };

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPlayerPage(currentPage);
            updatePaginationControls();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allPlayers.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayPlayerPage(currentPage);
            updatePaginationControls();
        }
    });

    dashboardLink.addEventListener('click', () => {
        showView(dashboardView);
        loadPlayerAnalytics();
    });

    schoolFilter.addEventListener('change', filterPlayerTable);

    // Initial load
    showView(uploadView);
    loadImages();
    attachPlaceholderEventListeners();
});
