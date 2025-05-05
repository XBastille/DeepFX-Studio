document.addEventListener('DOMContentLoaded', function() {
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = document.getElementById('file_input');
    const uploadForm = document.getElementById('upload-form');
    const generateBtn = document.getElementById('generateBtn');
    let diffContainer = document.querySelector('.diff');
    const originalUploadImage = document.getElementById('upload_image');
    const uploadContainer = document.getElementById('upload_container');
    
    const qualitySlider = document.getElementById('quality_slider');
    const qualityValue = document.getElementById('quality_value');
    const artisticToggle = document.getElementById('artistic_toggle');
    const modelMode = document.getElementById('model_mode');
    const toggleAdvancedOptions = document.getElementById('toggleAdvancedOptions');
    const advancedOptionsContent = document.getElementById('advancedOptionsContent');
    
    if (qualitySlider) {
        qualitySlider.addEventListener('input', function() {
            qualityValue.textContent = this.value;
        });
    }
    
    if (artisticToggle) {
        artisticToggle.addEventListener('change', function() {
            modelMode.textContent = this.checked ? 'Artistic' : 'Stable';
        });
    }
    
    if (toggleAdvancedOptions) {
        toggleAdvancedOptions.addEventListener('click', function() {
            const isVisible = advancedOptionsContent.style.display !== 'none';
            
            advancedOptionsContent.style.display = isVisible ? 'none' : 'block';
            
            const collapseText = this.querySelector('.collapse-text');
            const collapseIcon = this.querySelector('.collapse-icon');
            
            if (isVisible) {
                collapseText.textContent = 'Show';
                collapseIcon.classList.remove('fa-chevron-up');
                collapseIcon.classList.add('fa-chevron-down');
            } else {
                collapseText.textContent = 'Hide';
                collapseIcon.classList.remove('fa-chevron-down');
                collapseIcon.classList.add('fa-chevron-up');
            }
        });
    }
    
    let originalPreview = null;
    let previewContainer = null;
    
    function showLoading() {
        generateBtn.innerHTML = '<span class="loading loading-spinner loading-sm mr-2"></span> Processing...';
        generateBtn.disabled = true;
    }
    
    function resetLoading() {
        generateBtn.innerHTML = '<i class="fa-solid fa-magic mr-2"></i> Generate Colorized Image';
        generateBtn.disabled = false;
    }
    
    function showError(message) {
        const messageBox = document.createElement('div');
        messageBox.id = 'message-box';
        messageBox.className = 'absolute top-5 left-5 right-5 md:left-auto md:top-10 md:right-10 animate-appear';
        
        messageBox.innerHTML = `
            <div class="alert alert-error shadow-lg">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 class="font-bold">Error Occurred</h3>
                        <div class="text-xs">${message}</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(messageBox);
        
        setTimeout(() => {
            messageBox.remove();
        }, 5000);
    }
    
    fileInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            if (!file.type.match('image.*')) {
                showError('Please upload an image file (JPEG, PNG)');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                showError('File size exceeds 5MB limit');
                return;
            }
            
            originalUploadImage.style.display = 'none';
            uploadContainer.style.display = 'none';
            
            if (!previewContainer) {
                previewContainer = document.createElement('div');
                previewContainer.className = 'relative w-full h-full flex items-center justify-center';
                uploadBox.appendChild(previewContainer);
            } else {
                previewContainer.innerHTML = '';
            }
            
            originalPreview = document.createElement('img');
            originalPreview.className = 'max-h-full max-w-full rounded-lg object-contain';
            originalPreview.file = file;
            previewContainer.appendChild(originalPreview);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                fileInput.value = '';
                
                previewContainer.remove();
                previewContainer = null;
                
                originalUploadImage.style.display = 'block';
                uploadContainer.style.display = 'block';
            });
            previewContainer.appendChild(removeBtn);
            
            const reader = new FileReader();
            reader.onload = function(e) {
                originalPreview.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });
    
    uploadBox.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('border-primary');
    });
    
    uploadBox.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('border-primary');
    });
    
    uploadBox.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('border-primary');
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            fileInput.files = e.dataTransfer.files;
            
            const changeEvent = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(changeEvent);
        }
    });
    
    uploadBox.addEventListener('click', function() {
        fileInput.click();
    });
    
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!fileInput.files || !fileInput.files[0]) {
            showError('Please select an image to colorize');
            return;
        }
        
        showLoading();
        
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        
        const quality = qualitySlider ? qualitySlider.value : 35;
        const artistic = artisticToggle ? artisticToggle.checked : true;
        
        formData.append('quality', quality);
        formData.append('artistic', artistic);
        
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        
        fetch(uploadForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrfToken
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError(data.error);
                resetLoading();
                return;
            }
            
            console.log("Received image data successfully!");
            const diffParent = diffContainer.parentElement;
            
            const newDiff = document.createElement('div');
            newDiff.className = 'diff aspect-[4/3] w-full h-full border-2 border-gray-500 rounded-xl shadow-lg';
            
            const diffItem1 = document.createElement('div');
            diffItem1.className = 'diff-item-1';
            const origImg = document.createElement('img');
            origImg.className = 'object-contain rounded-xl';
            origImg.alt = 'Original Image';
            origImg.src = data.original_image;
            diffItem1.appendChild(origImg);
            
            const diffItem2 = document.createElement('div');
            diffItem2.className = 'diff-item-2';
            const colorImg = document.createElement('img');
            colorImg.className = 'object-contain rounded-xl';
            colorImg.alt = 'Colorized Image';
            colorImg.src = data.colorized_image;
            diffItem2.appendChild(colorImg);
            
            const diffResizer = document.createElement('div');
            diffResizer.className = 'diff-resizer';
            
            newDiff.appendChild(diffItem1);
            newDiff.appendChild(diffItem2);
            newDiff.appendChild(diffResizer);
            
            diffParent.replaceChild(newDiff, diffContainer);
            
            diffContainer = newDiff;
            
            const downloadLink = document.querySelector('a[download]');
            if (downloadLink) {
                downloadLink.href = data.colorized_image;
                downloadLink.download = 'colorized_image.jpg';
                downloadLink.style.display = 'flex';
            }
            
            diffContainer.scrollIntoView({ behavior: 'smooth' });
            
            resetLoading();
        })
        .catch(error => {
            console.error('Error:', error);
            showError('An error occurred during processing. Please try again.');
            resetLoading();
        });
    });
});