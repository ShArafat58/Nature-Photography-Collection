// Admin Dashboard JavaScript

let currentRejectId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadStatistics();
    loadPendingImages();
});

// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();

        if (data.success) {
            const stats = data.stats;
            document.getElementById('pendingCount').textContent = stats.pending || 0;
            document.getElementById('approvedCount').textContent = stats.approved || 0;
            document.getElementById('rejectedCount').textContent = stats.rejected || 0;
            document.getElementById('totalCount').textContent = stats.total || 0;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load pending images
async function loadPendingImages() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const emptyState = document.getElementById('emptyState');
    const pendingGrid = document.getElementById('pendingGrid');

    try {
        const response = await fetch('/api/images/pending');
        const data = await response.json();

        loadingSpinner.style.display = 'none';

        if (data.success && data.images.length > 0) {
            emptyState.style.display = 'none';
            pendingGrid.innerHTML = '';

            data.images.forEach(image => {
                const item = createPendingItem(image);
                pendingGrid.appendChild(item);
            });
        } else {
            emptyState.style.display = 'block';
            pendingGrid.innerHTML = '';
        }
    } catch (error) {
        console.error('Error loading pending images:', error);
        loadingSpinner.style.display = 'none';
    }
}

// Create pending item element
function createPendingItem(image) {
    const item = document.createElement('div');
    item.className = 'pending-item';
    item.innerHTML = `
    <img 
      src="/uploads/pending/${image.filename}" 
      alt="${image.photographer_name}"
      class="pending-image"
      onclick="window.open('/uploads/pending/${image.filename}', '_blank')"
    >
    <div class="pending-info">
      <div class="pending-detail">
        <div class="detail-label">Photographer</div>
        <div class="detail-value">${escapeHtml(image.photographer_name)}</div>
      </div>
      <div class="pending-detail">
        <div class="detail-label">Phone Model</div>
        <div class="detail-value">${escapeHtml(image.phone_model)}</div>
      </div>
      <div class="pending-meta">
        <span>📅 ${formatDate(image.upload_date)}</span>
        <span>ID: ${image.id}</span>
      </div>
      <div class="pending-actions">
        <button class="btn btn-approve" onclick="approveImage(${image.id})">
          ✅ Approve
        </button>
        <button class="btn btn-reject" onclick="openRejectModal(${image.id})">
          ❌ Reject
        </button>
      </div>
    </div>
  `;
    return item;
}

// Approve image
async function approveImage(id) {
    if (!confirm('Are you sure you want to approve this image?')) {
        return;
    }

    try {
        const response = await fetch(`/api/images/${id}/approve`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            alert('Image approved successfully!');
            loadStatistics();
            loadPendingImages();
        } else {
            alert('Failed to approve image: ' + data.error);
        }
    } catch (error) {
        console.error('Error approving image:', error);
        alert('An error occurred while approving the image.');
    }
}

// Open reject modal
function openRejectModal(id) {
    currentRejectId = id;
    document.getElementById('rejectionReason').value = '';
    document.getElementById('rejectModal').classList.add('active');
}

// Close reject modal
function closeRejectModal() {
    currentRejectId = null;
    document.getElementById('rejectModal').classList.remove('active');
}

// Confirm reject
async function confirmReject() {
    if (!currentRejectId) return;

    const reason = document.getElementById('rejectionReason').value.trim();

    try {
        const response = await fetch(`/api/images/${currentRejectId}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });

        const data = await response.json();

        if (data.success) {
            alert('Image rejected successfully!');
            closeRejectModal();
            loadStatistics();
            loadPendingImages();
        } else {
            alert('Failed to reject image: ' + data.error);
        }
    } catch (error) {
        console.error('Error rejecting image:', error);
        alert('An error occurred while rejecting the image.');
    }
}

// Helper: Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Helper: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modal when clicking outside
document.getElementById('rejectModal').addEventListener('click', (e) => {
    if (e.target.id === 'rejectModal') {
        closeRejectModal();
    }
});
