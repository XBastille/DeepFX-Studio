# DeepFX Studio

# 🎉 Dockerfile for Background Remover has been added! 🚀👩‍💻

Welcome to **DeepFX Studio**! This AI-powered toolkit provides a suite of advanced image editing features powered by cutting-edge deep learning techniques. From enhancing image quality to creative transformations, DeepFX Studio is designed to be a comprehensive solution for all your image processing needs.

## 🚀 Features

DeepFX Studio offers the following capabilities:

1. **Neural Style Transfer**  
   - Apply artistic styles to your images, transforming them into visually stunning artwork inspired by famous artists and styles.

2. **Colorization of Black-and-White Images**  
   - Bring old photos to life by adding realistic color to black-and-white images.

3. **Background Removal**  
   - Easily separate the subject from the background for further editing or creative purposes.

4. **Image Super-Resolution (Enhance Image Quality)**  
   - Upscale low-resolution images to high-definition, preserving important details and clarity.

5. **Cartoonization**  
   - Turn photos into cartoon-like images, giving a fun and artistic twist to your pictures.

6. **Image Inpainting (Object Removal)**  
   - Effortlessly remove unwanted objects and reconstruct missing areas in images.

7. **Age Progression and Regression**  
   - Simulate aging effects to see younger or older versions of the person in the image.

8. **Auto-Background Blur (Portrait Mode)**  
   - Create a soft bokeh effect on the background, enhancing the subject's focus.

9. **HDR Effect (High Dynamic Range)**  
    - Enhance images with a high dynamic range for more vivid colors and rich details.

## 📅 Project Status

*Development Start Date*: **October 26, 2024**  
Stay tuned for progress updates as we work on implementing and refining each feature!

## 💻Local development

To run the example project:

1. create a virtual enviroment and activate it

2. Install dependencies via `pip`:

    ```bash
    pip install -r requirements.txt
    ```

3. Run development server:

    ```bash
    python manage.py runserver
    ```

4. using `which npm` or `where npm' to local your npm (it is different for windows and linux)

5. Open two separate terminal and run `python manage.py tailwind start` in one teminal and `python manage.py runserver` in other terminal

. Open `http://localhost:8000` in a browser. You should see the main page.


## Docker setup

1. Build containers via `docker`:

    ```bash
    docker build -t background-remover .
    ```

2. Start containers:

    ```bash
    docker run -p 8000:8000 background-remover
    ```

3. Open `http://localhost:8000` in a browser and have fun with the state-of-the-art Background remover
   
## 📬 Contact

For questions or support, please reach out to us via [GitHub Issues](https://github.com/your-username/deepfx-studio/issues).
