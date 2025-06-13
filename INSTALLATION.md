# DeepFX Studio


## Download models

Download all the necessey models for the releases page from [Releases](https://github.com/XBastille/DeepFX-Studio/releases)

Refer [CONTRIBUTING.md](CONTRIBUTING.md) to get an idea how to place the models

## Docker Setup

1. Create a .env file in your project directory and add your own environment variables

2. Build containers via `docker-compose`:

    ```bash
    docker-compose build
    ```

3. Start containers:

    ```bash
    docker-compose up
    ```

## Follow these Steps

- Fork and then Clone the repo

    ```bash
    git clone https://github.com/<username>/DeepFX-Studio.git
    ```

- create a local virtual environment

    ```bash
    python -m venv venv
    ```

- Activate that enviroment

    *macOS/Linux*

    ```bash
    source venv/bin/activate
    ```

    *Windows (CMD)*

    ```cmd
    venv\Scripts\activate
    ```

    *Windows (PowerShell):*

    ```powershell
    venv\Scripts\Activate.ps1
    ```

- Get you env variables

    *macOS/Linux*

    ```bash
    cp .env.example .env
    ```

    *Windows (CMD)*

    ```cmd
    copy .env.example .env
    ```

    *Windows (PowerShell):*

    ```powershell
    Copy-Item .env.example -Destination .env
    ```

    update .env with appropiate keys

- Install Python Packages:

    ```bash
    pip install -r requirements.txt
    ```

- Install `tailwindcss` related packages

    ```bash
    npm install
    ```

### Development Setup
> Note: You need to set up your huggingface-cli by logging in and approving the use of stabilityai/stable-diffusion-3.5-large

.For developement setup you need to run `python manage.py runserver` in one terminal and then run `npm run watch:css` in other terminal
