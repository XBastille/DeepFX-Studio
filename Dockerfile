FROM python:3.12-slim-bookworm

WORKDIR /app

ARG NODE_MAJOR=18

# Install Node.js and necessary packages
RUN apt-get update \
  && apt-get install -y ca-certificates curl gnupg \
  && mkdir -p /etc/apt/keyrings \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
  && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
  && apt-get update \
  && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man \
  && apt-get clean \
  && useradd --create-home python \
  && chown python:python -R /app

USER python

# Copy requirements and install Python dependencies first
COPY --chown=python:python requirements*.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project directory into the container
COPY --chown=python:python . .

# Install npm dependencies
RUN npm install --prefix theme/static_src

# Copy entrypoint script and give permissions
COPY --chown=python:python entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set environment variables
ENV DEBUG="${DEBUG}" \
    PYTHONUNBUFFERED="true" \
    PATH="${PATH}:/home/python/.local/bin" \
    USER="python"

# Set the entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
