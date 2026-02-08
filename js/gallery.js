document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('galleryGrid');
    const emptyState = document.getElementById('emptyState');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modalImg');
    const modalPhotographer = document.getElementById('modalPhotographer');
    const modalDevice = document.getElementById('modalDevice');
    const modalClose = document.getElementById('modalClose');

    // 1. Load Images (Public View Only)
    loadGallery();

    function loadGallery() {
        const storedImages = localStorage.getItem(CONFIG.STORAGE_KEY);
        let images = [];

        if (storedImages) {
            try {
                images = JSON.parse(storedImages);
            } catch (e) {
                console.error("Error parsing gallery", e);
            }
        }

        galleryGrid.innerHTML = '';

        if (images.length === 0) {
            emptyState.style.display = 'block';
            galleryGrid.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            galleryGrid.style.display = 'grid';

            images.forEach(img => {
                const item = createGalleryItem(img);
                galleryGrid.appendChild(item);
            });
        }
    }

    function createGalleryItem(imgData) {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.dataset.id = imgData.id;

        // Image
        const img = document.createElement('img');
        img.src = imgData.src;
        img.alt = `Photo by ${imgData.photographer}`;
        img.loading = 'lazy'; // Performance optimization

        // Click to Open Modal
        div.onclick = () => {
            openModal(imgData);
        };

        div.appendChild(img);
        return div;
    }

    // 2. Modal Logic
    function openModal(data) {
        modalImg.src = data.src;
        modalPhotographer.textContent = data.photographer;
        modalDevice.textContent = data.phoneModel;
        modal.classList.add('active');
    }

    modalClose.onclick = () => {
        modal.classList.remove('active');
    };

    // Close on click outside
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    };

    // 3. Global Owner Login Icon
    addOwnerIcon();
});



function addOwnerIcon() {
    // 1. Add the lock icon if not present
    if (!document.querySelector('.owner-login-btn')) {
        const btn = document.createElement('div');
        btn.className = 'owner-login-btn';
        btn.innerHTML = '🔒';
        btn.title = 'Owner Login';
        btn.onclick = openLoginModal;
        document.body.appendChild(btn);
    }

    // 2. Add the Login Modal HTML if not present
    if (!document.getElementById('loginModal')) {
        const modalHtml = `
        <div id="loginModal" class="modal">
            <div class="login-modal-content">
                <button id="loginModalClose" class="modal-close" style="position:absolute; right:15px; top:15px; color:#333; background: #eee;">✕</button>
                <h2>Owner Login</h2>
                <form id="ownerLoginForm">
                    <div class="form-group">
                        <label for="ownerUsername">Username</label>
                        <input type="text" id="ownerUsername" required placeholder="Enter username">
                    </div>
                    <div class="form-group">
                        <label for="ownerPassword">Password</label>
                        <input type="password" id="ownerPassword" required placeholder="Enter password">
                    </div>
                    <button type="submit" class="btn btn-primary">Login</button>
                    <p id="loginMessage" style="color: red; margin-top: 10px; text-align: center; font-size: 0.9rem;"></p>
                </form>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Add Event Listeners for the new modal
        const loginModal = document.getElementById('loginModal');
        const closeBtn = document.getElementById('loginModalClose');
        const loginForm = document.getElementById('ownerLoginForm');

        // Close functions
        const closeLoginModal = () => {
            loginModal.classList.remove('active');
            document.getElementById('loginMessage').textContent = '';
            loginForm.reset();
        };

        closeBtn.onclick = closeLoginModal;
        loginModal.onclick = (e) => {
            if (e.target === loginModal) closeLoginModal();
        };

        // Handle Login Submission
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const username = document.getElementById('ownerUsername').value;
            const password = document.getElementById('ownerPassword').value;
            const msg = document.getElementById('loginMessage');

            if (username === CONFIG.OWNER_CREDENTIALS.username &&
                password === CONFIG.OWNER_CREDENTIALS.password) {

                sessionStorage.setItem(CONFIG.SESSION_KEY, 'true');
                alert("Login Successful! Redirecting to Owner Dashboard...");
                closeLoginModal();

                // Redirect to Owner Page
                window.location.href = 'owner.html';
            } else {
                msg.textContent = "Invalid username or password";
            }
        };
    }
}

function openLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.add('active');
        // Focus username field
        const userInput = document.getElementById('ownerUsername');
        if (userInput) setTimeout(() => userInput.focus(), 100);
    }
}
