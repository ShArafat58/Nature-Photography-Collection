document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('galleryGrid');
    const emptyState = document.getElementById('emptyState');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modalImg');
    const modalPhotographer = document.getElementById('modalPhotographer');
    const modalDevice = document.getElementById('modalDevice');
    const modalClose = document.getElementById('modalClose');
    const logoutBtn = document.getElementById('logoutBtn');

    // 1. Check if actually logged in (Security Check)
    const isOwner = sessionStorage.getItem(CONFIG.SESSION_KEY) === 'true';
    if (!isOwner) {
        window.location.href = 'index.html'; // Redirect if not logged in
        return;
    }

    // 2. Load Images
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
        img.loading = 'lazy';

        // Metadata Container
        const metaDiv = document.createElement('div');
        metaDiv.className = 'gallery-item-metadata';

        // Date Formatting
        let dateStr = 'Just now';
        if (imgData.timestamp) {
            const date = new Date(imgData.timestamp);
            dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        metaDiv.innerHTML = `
            <span>📸 <strong>${imgData.photographer}</strong></span>
            <span>📱 ${imgData.phoneModel}</span>
            <span style="font-size: 0.75em; color: #aaa;">🕒 ${dateStr}</span>
        `;

        // Click to Open Modal
        div.onclick = (e) => {
            if (e.target.closest('.delete-btn')) return;
            openModal(imgData);
        };

        div.appendChild(img);
        div.appendChild(metaDiv);

        // Delete Button (ALWAYS Visible on Admin Page)
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.innerHTML = '🗑️';
        delBtn.title = 'Delete Image';
        delBtn.style.display = 'flex'; // Force show
        delBtn.onclick = (e) => {
            e.stopPropagation();
            deleteImage(imgData.id);
        };
        div.appendChild(delBtn);

        return div;
    }

    // 3. Modal Logic
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

    // 4. Delete Logic
    function deleteImage(id) {
        if (confirm("Are you sure you want to delete this image?")) {
            let images = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
            images = images.filter(img => img.id !== id);
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(images));
            loadGallery(); // Re-render
        }
    }

    // 5. Logout Logic
    logoutBtn.onclick = () => {
        if (confirm("Logout from Admin Panel?")) {
            sessionStorage.removeItem(CONFIG.SESSION_KEY);
            window.location.href = 'index.html';
        }
    };
});
