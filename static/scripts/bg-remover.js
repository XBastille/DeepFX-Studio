
document.addEventListener('DOMContentLoaded', function () {
    // Variables
    const uploadBox = document.getElementById("uploadBox");
    const fileInput = document.getElementById("file_input");
    const uploadImage = document.getElementById("upload_image")
    const uploadContainer = document.getElementById("upload-container");
    const generateBtn = document.getElementById("generateBtn");
    const form = document.getElementById("upload-form");

    const supportedImages = ["jpg", "jpeg", "png"]
    // File input click trigger
    uploadBox.addEventListener('click', () => {
        fileInput.click();
    });

    // Listenes to the changes for the Input File Type
    fileInput.addEventListener("change", () => {
        const files = fileInput.files;
        if (files.length > 0) {
            previewImage(files[0]);
        }
    });

    // Drag-and-drop functionality
    uploadBox.addEventListener("dragover", (event) => {
        event.preventDefault();
        uploadBox.classList.remove("border-2");
        uploadBox.classList.add("border-4");
        uploadContainer.innerHTML = `
            <p> Release the image to upload </p>
        `;
    });
    
    uploadBox.addEventListener("dragleave", (event) => {
        event.preventDefault();
        resetUploadBox();
    });

    uploadBox.addEventListener("drop", (event) => {
        event.preventDefault();
        resetUploadBox();

        const files = event.dataTransfer.files;
        if(files.length > 1) {
            alert("You can upload only one image at a time.");
            return;
        }

        if(validateAndHandleFiles(files)) {
            console.log("File Data: ", files);
            fileInput.files = files;

            if (files[0]) {
                console.log("Preview Images Function Called.")
                previewImage(files[0]);
            } else {
                alert("No image data found.");
                return;
            }
        } else {
            alert(`Invalid file type. Please upload an image.`)
            return;
        }
    });

    // Form submission
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Check if file is selected
        if (!fileInput.files.length) {
            alert("Please select an image before submitting!");
            return;
        }

        try {
            const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
            const base64Image = await getBase64Image(fileInput.files[0]);

            const formData = {
                file: base64Image,
                csrfmiddlewaretoken: csrfToken
            }

            console.log("formData: ", formData);

            generateBtn.innerHTML = `
                <i class="fa-solid fa-spinner animate-spin"></i>
                Processing
            `;
            try {
                const response = await fetch(form.action, {
                    method: "POST",
                    headers: {
                        "X-CSRFToken": csrfToken,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });
    
                if (response.ok) {
                    const result = await response.json();
                    console.log("API Response:", result);
                    resetForm();
                } else {
                    console.log("Failed to upload");
                }
            } catch(error) {
                console.log(error);
            } finally {
                generateBtn.innerHTML = `
                    <i class="fa-solid fa-palette"></i>
                    GENERATE
                `;
            }
        } catch (error) {
            console.log("Error during form submission:", error);
        }
    });

    function resetUploadBox() {
        uploadBox.classList.remove("border-4");
        uploadBox.classList.add("border-2");
        uploadContainer.innerHTML = `
            Drop Image Here 
            <br/>
            Click to Upload
        `;
    }

    function previewImage(file) {
        const reader = new FileReader();

        const previewContainer = document.createElement("img");
        reader.onload = function (event) {
            previewContainer.src = event.target.result;
            previewContainer.alt = "Preview Image";
            previewContainer.classList.add("h-fit", "md:h-56", "rounded-md", "border", "border-gray-600", "object-cover");
        }

        reader.onerror = function () {
            console.error("Failed to read the file.");
            alert("An error occurred while reading the file.");
        };

        reader.readAsDataURL(file);

        previewContainer.alt = "Preview Image";
        previewContainer.classList.add(
            "h-20",
            "md:h-56",
            "rounded-md",
            "border",
            "border-gray-600",
            "object-cover"
        );

        // Append the preview image to the upload box
        uploadBox.innerHTML = "";
        uploadBox.appendChild(previewContainer); 
    }

    function resetForm() {
        const staticUrl = uploadImage.getAttribute("src");
        const HTML = `
            <img src="${staticUrl}" class="text-gray-500 m-3 w-8 h-8" alt="upload" />
            <p id="upload-container" class="text-center text-sm text-gray-300 mb-4 font-light">Drop Image Here <br/> Click to Upload</p>
        `
        uploadBox.innerHTML = HTML;
    }

    function validateAndHandleFiles(files) {
        return supportedImages.includes(files[0].name.split('.')[1]);
    }

    function getBase64Image(file){
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject("Failed to read file.");
            reader.readAsDataURL(file);
        });
    };
});
