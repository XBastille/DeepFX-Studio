document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("uploadForm");
    const fileInput = document.getElementById("fileInput");
    const generateBtn = document.getElementById("generateBtn");

    form.addEventListener("submit", (e) => {
        if (!fileInput.files || !fileInput.files[0]) {
            e.preventDefault();  // Prevent form submission
            alert("Please select an image to colorize.");
            return;
        }

        generateBtn.innerHTML = `
            <i class="fas fa-circle-notch fa-spin"></i>
            Processing...
        `;
    });
});
