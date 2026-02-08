document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const imageUpload = document.getElementById('imageUpload');
    const previewImg = document.getElementById('previewImg');
    const imagePreview = document.getElementById('imagePreview');
    const agreeCheckbox = document.getElementById('agreeCheckbox');
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');
    const loadingDiv = document.getElementById('loading');

    // 1. Handle Image Preview
    imageUpload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewImg.src = e.target.result;
                imagePreview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        } else {
            previewImg.src = '';
            imagePreview.style.display = 'none';
        }
    });

    // 2. Enable/Disable Submit Button based on Checkbox
    agreeCheckbox.addEventListener('change', function () {
        submitBtn.disabled = !this.checked;
    });

    // 3. Handle Form Submission
    uploadForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Basic Validation
        const photographer = document.getElementById('photographer').value.trim();
        const phoneModel = document.getElementById('phoneModel').value.trim();
        const file = imageUpload.files[0];

        if (!photographer || !phoneModel || !file) {
            showMessage('Please fill in all required fields.', 'error');
            return;
        }

        if (!agreeCheckbox.checked) {
            showMessage('You must agree to the rules.', 'error');
            return;
        }

        // Show Loading
        loadingDiv.style.display = 'block';
        submitBtn.disabled = true;
        messageDiv.textContent = '';

        // Process Image (Convert to Base64)
        const reader = new FileReader();
        reader.onload = function (event) {
            const base64Image = event.target.result;

            // Create Image Object
            const newImage = {
                id: Date.now().toString(),
                src: base64Image,
                photographer: photographer,
                phoneModel: phoneModel,
                timestamp: new Date().toISOString()
            };

            // Save to LocalStorage
            saveImage(newImage);

            // Simulate Network Delay for UX
            setTimeout(() => {
                loadingDiv.style.display = 'none';
                showMessage('Image uploaded successfully!', 'success');

                // Reset Form
                uploadForm.reset();
                imagePreview.style.display = 'none';
                submitBtn.disabled = true;

                // Redirect to Gallery after short delay
                setTimeout(() => {
                    window.location.href = 'gallery.html';
                }, 1500);
            }, 1000);
        };

        reader.onerror = function () {
            loadingDiv.style.display = 'none';
            submitBtn.disabled = false;
            showMessage('Failed to process image. Please try again.', 'error');
        };

        reader.readAsDataURL(file);
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
    }

    function saveImage(imageObj) {
        let images = [];
        const storedImages = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (storedImages) {
            try {
                images = JSON.parse(storedImages);
            } catch (e) {
                console.error("Error parsing images", e);
            }
        }
        // Add new image to the beginning
        images.unshift(imageObj);
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(images));
    }

    // Check for Owner Icon insertion (Global logic)
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
