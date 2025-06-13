document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.getElementById("prompt-input");

  function autoResize() {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  }

  textarea.addEventListener("input", autoResize);

  if (textarea.value) {
    autoResize();
  }

  const generateBtn = document.getElementById("generate-btn");
  const generatedImagesContainer = document.getElementById("generated-images");

  function updateGenerateButtonState() {
    if (textarea.value.trim().length > 0) {
      generateBtn.classList.remove("generate-inactive");
      generateBtn.classList.add("generate-active");
    } else {
      generateBtn.classList.add("generate-inactive");
      generateBtn.classList.remove("generate-active");
    }
  }

  updateGenerateButtonState();

  textarea.addEventListener("input", updateGenerateButtonState);

  const aspectRatios = {
    "2:3": { width: 688, height: 1024, class: "aspect-[2/3]" },
    "1:1": { width: 1024, height: 1024, class: "aspect-square" },
    "9:16": { width: 576, height: 1024, class: "aspect-[9/16]" },
    "4:3": { width: 1024, height: 768, class: "aspect-[4/3]" },
    custom: { width: 1024, height: 1024, class: "aspect-square" },
  };

  const imageSettings = {
    ratio: "1:1",
    dimensions: { width: 1024, height: 1024, class: "aspect-square" },
    quantity: 2,
    inferenceSteps: 40,
    guidanceScale: 4.5,
    seed: 42,
    useRandomSeed: true,
    usingCustomDimensions: false,
  };

  function updateDimensionsDisplay() {
    const dimensionsDisplay = document.querySelector(
      ".settings-box-header .text-xs.text-gray-400",
    );
    if (dimensionsDisplay) {
      dimensionsDisplay.textContent = `${imageSettings.dimensions.width} × ${imageSettings.dimensions.height}`;
    }
  }

  const sections = {
    aspectRatio: document.querySelector(".settings-box .grid.grid-cols-5"),
    imageQuantity: document.querySelector(".settings-box .grid.grid-cols-4"),
    prompt: document.querySelector(".prompt-container"),
    inputs: document.querySelectorAll("input.interactive-element"),
    others: document.querySelectorAll(
      ".settings-box.interactive-element, #resetBtn",
    ),
  };

  function setActiveInSection(element, section) {
    if (
      section === sections.prompt ||
      Array.from(sections.others).includes(element)
    ) {
      element.classList.add("active");
      return;
    }

    if (
      section === sections.aspectRatio ||
      section === sections.imageQuantity
    ) {
      const siblings = section.querySelectorAll(".interactive-element");
      siblings.forEach((sibling) => {
        sibling.classList.remove("active");
      });

      if (section === sections.aspectRatio) {
        const ratioText = element.querySelector(".text-xs")?.textContent;

        if (ratioText === "More") {
          const customDimensionsContainer = document.getElementById(
            "customDimensionsContainer",
          );
          if (customDimensionsContainer) {
            customDimensionsContainer.classList.remove("hidden");
            imageSettings.usingCustomDimensions = true;

            const widthSlider = document.getElementById("widthSlider");
            const heightSlider = document.getElementById("heightSlider");
            const widthInput = document.getElementById("widthInput");
            const heightInput = document.getElementById("heightInput");

            if (widthSlider && heightSlider) {
              widthSlider.value = imageSettings.dimensions.width;
              heightSlider.value = imageSettings.dimensions.height;
              widthInput.value = imageSettings.dimensions.width;
              heightInput.value = imageSettings.dimensions.height;

              updateSliderTrack(widthSlider);
              updateSliderTrack(heightSlider);
            }
          }
        } else if (ratioText && aspectRatios[ratioText]) {
          const customDimensionsContainer = document.getElementById(
            "customDimensionsContainer",
          );
          if (customDimensionsContainer) {
            customDimensionsContainer.classList.add("hidden");
            imageSettings.usingCustomDimensions = false;
          }

          imageSettings.ratio = ratioText;
          imageSettings.dimensions = aspectRatios[ratioText];
          updateDimensionsDisplay();
        }
      } else if (section === sections.imageQuantity) {
        imageSettings.quantity = parseInt(element.textContent) || 1;
      }
    }

    element.classList.add("active");
  }

  function updateCustomDimensions() {
    const width = parseInt(document.getElementById("widthInput").value);
    const height = parseInt(document.getElementById("heightInput").value);

    const validWidth = Math.min(Math.max(width, 256), 2048);
    const validHeight = Math.min(Math.max(height, 256), 2048);

    imageSettings.dimensions.width = validWidth;
    imageSettings.dimensions.height = validHeight;
    imageSettings.ratio = "custom";

    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(validWidth, validHeight);
    const aspectW = validWidth / divisor;
    const aspectH = validHeight / divisor;

    if (Math.abs(aspectW / aspectH - 1) < 0.01) {
      imageSettings.dimensions.class = "aspect-square";
    } else if (Math.abs(aspectW / aspectH - 4 / 3) < 0.01) {
      imageSettings.dimensions.class = "aspect-[4/3]";
    } else if (Math.abs(aspectW / aspectH - 2 / 3) < 0.01) {
      imageSettings.dimensions.class = "aspect-[2/3]";
    } else if (Math.abs(aspectW / aspectH - 9 / 16) < 0.01) {
      imageSettings.dimensions.class = "aspect-[9/16]";
    } else {
      imageSettings.dimensions.class = `aspect-[${aspectW}/${aspectH}]`;
    }

    updateDimensionsDisplay();
  }

  document.addEventListener("click", (e) => {
    if (sections.prompt) {
      sections.prompt
        .querySelector(".interactive-element")
        ?.classList.remove("active");
    }

    sections.inputs.forEach((input) => input.classList.remove("active"));

    const dropdowns = document.querySelectorAll(".dropdown-menu.active");
    if (
      dropdowns.length &&
      !e.target.closest(".dropdown-menu") &&
      !e.target.closest(".btn-dropdown")
    ) {
      dropdowns.forEach((dropdown) => dropdown.classList.remove("active"));
    }
  });
  const defaultAspectRatio =
    sections.aspectRatio?.querySelector(".btn:nth-child(2)");
  const defaultQuantity =
    sections.imageQuantity?.querySelector(".btn:nth-child(2)");

  if (defaultAspectRatio) defaultAspectRatio.classList.add("active");
  if (defaultQuantity) defaultQuantity.classList.add("active");

  updateDimensionsDisplay();

  document.querySelectorAll(".interactive-element").forEach((element) => {
    element.addEventListener("click", (e) => {
      e.stopPropagation();

      let targetSection = null;
      let targetElement = e.target.closest(".interactive-element");

      if (!targetElement) return;

      if (sections.aspectRatio?.contains(targetElement)) {
        targetSection = sections.aspectRatio;
      } else if (sections.imageQuantity?.contains(targetElement)) {
        targetSection = sections.imageQuantity;
      } else if (sections.prompt?.contains(targetElement)) {
        targetSection = sections.prompt;
        targetElement = sections.prompt.querySelector(".interactive-element");
      } else if (Array.from(sections.inputs).includes(targetElement)) {
      } else {
        Array.from(sections.others).forEach((other) => {
          if (other.contains(targetElement) || other === targetElement) {
            targetSection = sections.others;
          }
        });
      }

      if (targetSection) {
        setActiveInSection(targetElement, targetSection);
      } else {
        targetElement.classList.add("active");
      }
    });
  });

  const widthSlider = document.getElementById("widthSlider");
  const heightSlider = document.getElementById("heightSlider");
  const widthInput = document.getElementById("widthInput");
  const heightInput = document.getElementById("heightInput");

  if (widthSlider && heightSlider) {
    updateSliderTrack(widthSlider);
    updateSliderTrack(heightSlider);

    widthSlider.addEventListener("input", () => {
      widthInput.value = widthSlider.value;
      updateSliderTrack(widthSlider);
      updateCustomDimensions();
    });

    widthInput.addEventListener("input", () => {
      const value = parseInt(widthInput.value);
      if (!isNaN(value) && value >= 256 && value <= 2048) {
        widthSlider.value = value;
        updateSliderTrack(widthSlider);
        updateCustomDimensions();
      }
    });

    widthInput.addEventListener("change", () => {
      let value = parseInt(widthInput.value);
      if (isNaN(value)) value = 1024;
      value = Math.min(Math.max(value, 256), 2048);

      widthInput.value = value;
      widthSlider.value = value;
      updateSliderTrack(widthSlider);
      updateCustomDimensions();
    });

    heightSlider.addEventListener("input", () => {
      heightInput.value = heightSlider.value;
      updateSliderTrack(heightSlider);
      updateCustomDimensions();
    });

    heightInput.addEventListener("input", () => {
      const value = parseInt(heightInput.value);
      if (!isNaN(value) && value >= 256 && value <= 2048) {
        heightSlider.value = value;
        updateSliderTrack(heightSlider);
        updateCustomDimensions();
      }
    });

    heightInput.addEventListener("change", () => {
      let value = parseInt(heightInput.value);
      if (isNaN(value)) value = 1024;
      value = Math.min(Math.max(value, 256), 2048);

      heightInput.value = value;
      heightSlider.value = value;
      updateSliderTrack(heightSlider);
      updateCustomDimensions();
    });
  }

  function generateRandomSeed() {
    return Math.floor(Math.random() * 1000000);
  }

  const defaultImageUrl = "/static/images/undefined_image.png";

  let generationCount = 0;

  function getCurrentSettings() {
    return {
      prompt: textarea.value,
      ratio: imageSettings.ratio,
      dimensions: { ...imageSettings.dimensions },
      quantity: imageSettings.quantity,
      inferenceSteps: parseInt(
        document.getElementById("inferenceStepsInput").value,
      ),
      guidanceScale: parseFloat(
        document.getElementById("guidanceScaleInput").value,
      ),
      seed: document.getElementById("seedInput").value,
      useRandomSeed: document.getElementById("randomSeedCheckbox").checked,
      usingCustomDimensions: imageSettings.usingCustomDimensions,
    };
  }

  function applySettings(settings) {
    textarea.value = settings.prompt;
    autoResize();
    updateGenerateButtonState();

    if (settings.usingCustomDimensions) {
      const moreButton =
        sections.aspectRatio.querySelector(".btn:nth-child(5)");
      if (moreButton) {
        setActiveInSection(moreButton, sections.aspectRatio);

        const widthSlider = document.getElementById("widthSlider");
        const heightSlider = document.getElementById("heightSlider");
        const widthInput = document.getElementById("widthInput");
        const heightInput = document.getElementById("heightInput");

        if (widthSlider && heightSlider) {
          widthSlider.value = settings.dimensions.width;
          heightSlider.value = settings.dimensions.height;
          widthInput.value = settings.dimensions.width;
          heightInput.value = settings.dimensions.height;

          updateSliderTrack(widthSlider);
          updateSliderTrack(heightSlider);
          updateCustomDimensions();
        }
      }
    } else if (settings.ratio) {
      const ratioButtons = sections.aspectRatio.querySelectorAll(
        ".interactive-element",
      );
      ratioButtons.forEach((button) => {
        const ratioText = button.querySelector(".text-xs")?.textContent;
        if (ratioText === settings.ratio) {
          setActiveInSection(button, sections.aspectRatio);
          imageSettings.ratio = settings.ratio;
          imageSettings.dimensions = aspectRatios[settings.ratio];
          updateDimensionsDisplay();
        }
      });
    }

    if (settings.quantity) {
      const quantityButtons = sections.imageQuantity.querySelectorAll(
        ".interactive-element",
      );
      quantityButtons.forEach((button) => {
        if (parseInt(button.textContent) === settings.quantity) {
          setActiveInSection(button, sections.imageQuantity);
          imageSettings.quantity = settings.quantity;
        }
      });
    }

    if (settings.inferenceSteps) {
      const inferenceStepsSlider = document.getElementById(
        "inferenceStepsSlider",
      );
      const inferenceStepsInput = document.getElementById(
        "inferenceStepsInput",
      );
      inferenceStepsSlider.value = settings.inferenceSteps;
      inferenceStepsInput.value = settings.inferenceSteps;
      updateSliderTrack(inferenceStepsSlider);
    }

    if (settings.guidanceScale) {
      const guidanceScaleSlider = document.getElementById(
        "guidanceScaleSlider",
      );
      const guidanceScaleInput = document.getElementById("guidanceScaleInput");
      guidanceScaleSlider.value = settings.guidanceScale;
      guidanceScaleInput.value = settings.guidanceScale;
      updateSliderTrack(guidanceScaleSlider);
    }

    if (settings.seed) {
      const seedInput = document.getElementById("seedInput");
      seedInput.value = settings.seed;
    }

    if (settings.useRandomSeed !== undefined) {
      const randomSeedCheckbox = document.getElementById("randomSeedCheckbox");
      randomSeedCheckbox.checked = settings.useRandomSeed;

      if (settings.useRandomSeed) {
        seedInput.disabled = true;
        seedInput.classList.add("opacity-50");
      } else {
        seedInput.disabled = false;
        seedInput.classList.remove("opacity-50");
      }
    }
  }

  function setupImageActions() {
    const actions = generatedImagesContainer.querySelectorAll(".image-actions");

    actions.forEach((actionContainer) => {
      const entry = actionContainer.closest(".generation-entry");
      const prompt = entry.dataset.prompt;
      const settings = JSON.parse(entry.dataset.settings);

      const topArrowBtn = actionContainer.querySelector(".btn-top-arrow");
      if (topArrowBtn) {
        topArrowBtn.addEventListener("click", () => {
          textarea.value = prompt;
          autoResize();
          updateGenerateButtonState();

          textarea.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => textarea.focus(), 500);
        });
      }

      const retryBtn = actionContainer.querySelector(".btn-retry");
      if (retryBtn) {
        retryBtn.addEventListener("click", () => {
          applySettings(settings);

          generateBtn.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => generateBtn.click(), 500);
        });
      }

      const dropdownBtn = actionContainer.querySelector(".btn-dropdown");
      if (dropdownBtn) {
        dropdownBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const dropdown = dropdownBtn.nextElementSibling;
          dropdown.classList.toggle("active");

          const allDropdowns =
            generatedImagesContainer.querySelectorAll(".dropdown-menu");
          allDropdowns.forEach((d) => {
            if (d !== dropdown) d.classList.remove("active");
          });
        });

        const downloadBtn = actionContainer.querySelector(".btn-download");
        if (downloadBtn) {
          downloadBtn.addEventListener("click", () => {
            alert("Downloading all images from this generation");
            dropdownBtn.nextElementSibling.classList.remove("active");
          });
        }

        const deleteBtn = actionContainer.querySelector(".btn-delete");
        if (deleteBtn) {
          deleteBtn.addEventListener("click", () => {
            entry.nextElementSibling?.remove();
            entry.remove();
          });
        }
      }
    });
  }

  generateBtn.addEventListener("click", () => {
    if (
      !textarea.value.trim() &&
      generateBtn.classList.contains("generate-inactive")
    ) {
      return;
    }

    const randomSeedCheckbox = document.getElementById("randomSeedCheckbox");
    const seedInput = document.getElementById("seedInput");

    if (randomSeedCheckbox.checked) {
      seedInput.value = generateRandomSeed();
    }

    const promptText = textarea.value;

    const currentSettings = getCurrentSettings();

    const generationEntry = document.createElement("div");
    generationEntry.className = "generation-entry";
    generationEntry.dataset.prompt = promptText;
    generationEntry.dataset.settings = JSON.stringify(currentSettings);

    generationCount++;

    const response = fetch("/text-to-image/generate/", {
      method: "POST",
    }).then((res) => JSON.stringify(res));
    console.log(response);

    const imagesHtml = Array(imageSettings.quantity)
      .fill(0)
      .map(
        () => `
          <div class="relative group rounded-lg overflow-hidden ${imageSettings.dimensions.class}" style="max-width: 256px;">
            <img src="${defaultImageUrl}" alt="Generated image" class="w-full h-full object-cover">
            <div class="absolute bottom-2 right-2 flex flex-wrap gap-1">
              <div class="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <span>Model</span>
                <span class="font-medium">SD 3.5 Large</span>
              </div>
              <div class="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                ${imageSettings.dimensions.width} × ${imageSettings.dimensions.height}px
              </div>
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div class="flex gap-2">
                <button class="bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        `,
      )
      .join("");

    generationEntry.innerHTML = `
        <div class="flex flex-wrap items-center gap-2 mb-2">
          <div class="bg-gray-800/50 text-xs px-2 py-1 rounded">Txt2Img</div>
          <div class="text-gray-300 truncate max-w-full sm:max-w-xs">${promptText}</div>
          <div class="ml-auto flex items-center gap-2 image-actions">
            <button class="btn-top-arrow text-gray-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
              </svg>
            </button>
            <button class="btn-retry text-gray-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
            <div class="relative">
              <button class="btn-dropdown text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                </svg>
              </button>
              <div class="dropdown-menu absolute right-0 mt-2 py-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10">
                <button class="btn-download text-white px-4 py-2 hover:bg-gray-700 w-full text-left flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download All
                </button>
                <button class="btn-delete text-white px-4 py-2 hover:bg-gray-700 w-full text-left flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="grid-images">
          ${imagesHtml}
        </div>
      `;

    if (generatedImagesContainer.firstChild) {
      generatedImagesContainer.insertBefore(
        generationEntry,
        generatedImagesContainer.firstChild,
      );
    } else {
      generatedImagesContainer.appendChild(generationEntry);
    }

    const separator = document.createElement("hr");
    separator.className = "border-gray-800 my-6";
    generatedImagesContainer.insertBefore(
      separator,
      generationEntry.nextSibling,
    );

    setupImageActions();

    autoResize();
  });

  function updateSliderTrack(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(slider.value);
    const percentage = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, rgb(255, 255, 255) 0%, #3b82f6 ${percentage}%, #27272a ${percentage}%, #27272a 100%)`;
  }

  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach((slider) => {
    const inputId = slider.id.replace("Slider", "Input");
    const numberInput = document.getElementById(inputId);

    if (numberInput) {
      updateSliderTrack(slider);

      slider.addEventListener("input", () => {
        numberInput.value = slider.value;
        updateSliderTrack(slider);
      });

      numberInput.addEventListener("input", () => {
        slider.value = numberInput.value;
        updateSliderTrack(slider);
      });
    }
  });

  const diceBtn = document.getElementById("diceBtn");
  const seedInput = document.getElementById("seedInput");
  const randomSeedCheckbox = document.getElementById("randomSeedCheckbox");

  diceBtn.addEventListener("click", () => {
    seedInput.value = generateRandomSeed();
  });

  randomSeedCheckbox.checked = true;
  seedInput.disabled = true;
  seedInput.classList.add("opacity-50");
  seedInput.value = generateRandomSeed();

  randomSeedCheckbox.addEventListener("change", () => {
    if (randomSeedCheckbox.checked) {
      seedInput.disabled = true;
      seedInput.classList.add("opacity-50");
      seedInput.value = generateRandomSeed();
    } else {
      seedInput.disabled = false;
      seedInput.classList.remove("opacity-50");
    }
  });

  const resetBtn = document.getElementById("resetBtn");
  resetBtn.addEventListener("click", () => {
    const inferenceStepsSlider = document.getElementById(
      "inferenceStepsSlider",
    );
    const inferenceStepsInput = document.getElementById("inferenceStepsInput");
    inferenceStepsSlider.value = 40;
    inferenceStepsInput.value = 40;
    updateSliderTrack(inferenceStepsSlider);

    const guidanceScaleSlider = document.getElementById("guidanceScaleSlider");
    const guidanceScaleInput = document.getElementById("guidanceScaleInput");
    guidanceScaleSlider.value = 4.5;
    guidanceScaleInput.value = 4.5;
    updateSliderTrack(guidanceScaleSlider);

    seedInput.value = generateRandomSeed();
    randomSeedCheckbox.checked = true;
    seedInput.disabled = true;
    seedInput.classList.add("opacity-50");
  });

  const configHeader = document.getElementById("configHeader");
  const arrow = document.getElementById("arrow");
  const configContent = document.getElementById("configContent");

  configHeader.addEventListener("click", () => {
    configContent.classList.toggle("hidden");
    arrow.classList.toggle("rotate-180");
  });

  function handleResponsiveLayout() {
    const sidebar = document.querySelector(".sidebar");
    const viewportWidth = window.innerWidth;

    if (viewportWidth < 768) {
      sidebar.classList.add("mobile-mode");
    } else {
      sidebar.classList.remove("mobile-mode");
    }
  }

  handleResponsiveLayout();

  window.addEventListener("resize", handleResponsiveLayout);

  setTimeout(() => {
    updateGenerateButtonState();
  }, 500);
});
