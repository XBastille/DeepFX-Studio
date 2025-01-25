# Use a lightweight Python base image
FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Set Node.js major version as an argument
ARG NODE_MAJOR=18

# Install Node.js, Python dependencies, and clean up unnecessary files
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl gnupg build-essential \
  && mkdir -p /etc/apt/keyrings \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
  && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends nodejs \
  && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man \
  && apt-get clean \
  && useradd --create-home python \
  && chown python:python -R /app

# Switch to the new user for better security
USER python

# Copy the dependency files and install Python dependencies
COPY --chown=python:python requirements*.txt ./

RUN pip install --no-cache-dir -r requirements.txt

# Environment variables
ENV DEBUG="false" \
    PYTHONUNBUFFERED="true" \
    PATH="${PATH}:/home/python/.local/bin" \
    USER="python"

# Copy the rest of the project
COPY --chown=python:python . .

# Download the isnet models
RUN mkdir -p background_remover/is_net/saved_models
RUN curl -L -o background_remover/is_net/saved_models/isnet.pth https://github.com/XBastille/DeepFX-Studio/releases/download/models/isnet.pth

# Install and build Tailwind assets
RUN SECRET_KEY=dummy python manage.py tailwind install --no-input \
    && SECRET_KEY=dummy python manage.py tailwind build --no-input

# Collect static files
RUN SECRET_KEY=dummy python manage.py collectstatic --no-input

# Expose the default Django development server port
EXPOSE 8000

# Run the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
