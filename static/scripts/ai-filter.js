document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("uploadForm");
    const fileInput = document.getElementById("fileInput");
    const generateBtn = document.getElementById("generateBtn");
    const dropZone = document.getElementById("drop-zone");
    const uploadContent = document.getElementById("upload-content");
    const imagePreview = document.getElementById("image-preview");
    const previewImg = document.getElementById("preview-img");
    const fileName = document.getElementById("file-name");
    const removeBtn = document.getElementById("remove-image");

    initializeFilterSlideshows();

    dropZone.addEventListener("click", (e) => {
        if (e.target.id !== "remove-image") {
            fileInput.click();
        }
    });

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("drop-zone-active");
    });

    dropZone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        dropZone.classList.remove("drop-zone-active");
    });    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("drop-zone-active");
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInput.files = dt.files;
                
                handleFileSelection(file);
            }
        }
    });

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    });

    removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        clearFileSelection();
    });

    function handleFileSelection(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            fileName.textContent = file.name;
            uploadContent.classList.add("hidden");
            imagePreview.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
    }

    function clearFileSelection() {
        fileInput.value = "";
        uploadContent.classList.remove("hidden");
        imagePreview.classList.add("hidden");
        previewImg.src = "";
        fileName.textContent = "";
    }  
    function initializeFilterSlideshows() {
        const filterCards = document.querySelectorAll('.filter-card');
        
        filterCards.forEach((card, index) => {
            const images = card.querySelectorAll('.slideshow-image');
            let currentIndex = 0;
            
            setTimeout(() => {
                const slideInterval = setInterval(() => {
                    images[currentIndex].classList.remove('active');
                    currentIndex = (currentIndex + 1) % images.length;
                    images[currentIndex].classList.add('active');
                }, 3000);
                
                card.slideInterval = slideInterval;
            }, index * 200); 
        });
    }

    form.addEventListener("submit", (e) => {
        if (!fileInput.files || !fileInput.files[0]) {
            e.preventDefault();
            alert("Please select an image to apply filter.");
            return;
        }

        const selectedFilter = document.querySelector('input[name="filter"]:checked');
        if (!selectedFilter) {
            e.preventDefault();
            alert("Please select a filter style.");
            return;
        }

        generateBtn.innerHTML = `
            <i class="fas fa-circle-notch fa-spin"></i>
            Processing...
        `;
        generateBtn.disabled = true;
    });

    window.addEventListener("beforeunload", () => {
        const filterCards = document.querySelectorAll('.filter-card');
        filterCards.forEach(card => {
            if (card.slideInterval) {
                clearInterval(card.slideInterval);
            }
        });
    });
});
