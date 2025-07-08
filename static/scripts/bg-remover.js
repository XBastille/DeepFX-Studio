// Variables
const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("file_input");
const uploadImage = document.getElementById("upload_image")
const uploadContainer = document.getElementById("upload_container");
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
        alert(`Invalid file type. Please upload an image.\nValid Image Types are: .jpg, .jpeg, .png`);
        return;
    }
});

// Form submission
form.addEventListener("submit", async function (event) {
    const formData = new FormData(form);
    const image = document.getElementById("file_input").files[0];

    if (!document.getElementById("file_input").files.length) {
        alert("Please select an image before submitting!");
        return;
    }
    generateBtn.innerHTML = `
        <i class="fas fa-circle-notch fa-spin"></i>
        Processing
    `;
    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
});


function resetUploadBox(event) {
    if (event) {
        event.preventDefault();
    }

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
