// Variables
const uploadBox1 = document.getElementById("uploadBox");
const fileInput1 = document.getElementById("file_input");
const uploadImage1 = document.getElementById("upload_image");

const uploadBox2 = document.getElementById("uploadBoxArtStyle");
const fileInput2 = document.getElementById("file_input_art_style");
const uploadImage2 = document.getElementById("upload_image_art_style");

const generateBtn = document.getElementById("generateBtn");
const form = document.getElementById("upload-form");

const supportedImages = ["jpg", "jpeg", "png"];

// File input click trigger
uploadBox1.addEventListener('click', () => {
    fileInput1.click();
});

uploadBox2.addEventListener('click', () => {
    fileInput2.click();
});

// Listeners for the Input File Type
fileInput1.addEventListener("change", () => {
    const files = fileInput1.files;
    if (files.length > 0) {
        previewImage(files[0], uploadBox1);
    }
});

fileInput2.addEventListener("change", () => {
    const files = fileInput2.files;
    if (files.length > 0) {
        previewImage(files[0], uploadBox2);
    }
});

// Drag-and-drop functionality for content image
setupDragAndDrop(uploadBox1, fileInput1);
setupDragAndDrop(uploadBox2, fileInput2);

function setupDragAndDrop(uploadBox, fileInput) {
    uploadBox.addEventListener("dragover", (event) => {
        event.preventDefault();
        uploadBox.classList.remove("border-2");
        uploadBox.classList.add("border-4");
        uploadBox.innerHTML = `<p>Release the image to upload</p>`;
    });

    uploadBox.addEventListener("dragleave", (event) => {
        event.preventDefault();
        if(uploadBox.id === "uploadBox") {
            resetUploadBox1(uploadBox);
        }

        if(uploadBox.id === "uploadBoxArtStyle") {
            resetUploadBox2(uploadBox);
        }
    });

    uploadBox.addEventListener("drop", (event) => {
        event.preventDefault();
        if(uploadBox.id === "uploadBox") {
            resetUploadBox1(uploadBox);
        }

        if(uploadBox.id === "uploadBoxArtStyle") {
            resetUploadBox2(uploadBox);
        }

        const files = event.dataTransfer.files;
        if (files.length > 1) {
            alert("You can upload only one image at a time.");
            return;
        }

        if (validateAndHandleFiles(files)) {
            console.log("File Data: ", files);
            fileInput.files = files;

            if (files[0]) {
                console.log("Preview Images Function Called.");
                previewImage(files[0], uploadBox);
            } else {
                alert("No image data found.");
                return;
            }
        } else {
            alert(`Invalid file type. Please upload an image.\nValid Image Types are: .jpg, .jpeg, .png`);
            return;
        }
    });
}

// Form submission
form.addEventListener("submit", async function (event) {
    if (!fileInput1.files.length || !fileInput2.files.length) {
        alert("Please select both images before submitting!");
        return;
    }
    generateBtn.innerHTML = `
        <i class="fas fa-circle-notch fa-spin"></i>
        Processing
    `;
    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
});

function resetUploadBox1(uploadBox) {
    uploadBox.classList.remove("border-4");
    uploadBox.classList.add("border-2");
    uploadBox.innerHTML = `
        Drop Image Here
        <br/>
        Click to Upload
    `;
}

function resetUploadBox2(uploadBox) {
    uploadBox.classList.remove("border-4");
    uploadBox.classList.add("border-2");
    uploadBox.innerHTML = `
        Drop the Art Style Image Here
        <br />
        Click to Upload
    `;
}

function previewImage(file, uploadBox) {
    const reader = new FileReader();
    const previewContainer = document.createElement("img");

    reader.onload = function (event) {
        previewContainer.src = event.target.result;
        previewContainer.alt = "Preview Image";
        previewContainer.classList.add("h-fit", "md:h-56", "rounded-md", "border", "border-gray-600", "object-cover");
    };

    reader.onerror = function () {
        console.error("Failed to read the file.");
        alert("An error occurred while reading the file.");
    };

    reader.readAsDataURL(file);

    // Append the preview image to the upload box
    uploadBox.innerHTML = "";
    uploadBox.appendChild(previewContainer);
}

function validateAndHandleFiles(files) {
    return supportedImages.includes(files[0].name.split(".")[1]);
}
