FROM python:3.10-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

ARG NODE_MAJOR=22

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        gnupg \
        build-essential \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender1 \
        libgomp1 \
        libfontconfig1 \
        ffmpeg \
        libgl1-mesa-glx \
        libgl1-mesa-dri \
        libglu1-mesa \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man \
    && apt-get clean \
    && useradd --create-home python \
    && chown python:python -R /app

USER python

COPY --chown=python:python requirements*.txt ./

RUN pip3 install --no-cache-dir -r requirements.txt

ENV DEBUG="false" \
    PYTHONUNBUFFERED="true" \
    PYTHONDONTWRITEBYTECODE="1" \
    PATH="${PATH}:/home/python/.local/bin" \
    USER="python" \
    QT_QPA_PLATFORM="offscreen" \
    WEB_CONCURRENCY="4"

COPY --chown=python:python package.json tailwind.config.js ./

RUN npm install

COPY --chown=python:python . .

RUN mkdir -p static/css staticfiles media tmp

RUN chmod +x ./startup.sh

RUN apt-get update && apt-get install -y dos2unix
RUN dos2unix download-models.sh
RUN chmod +x download-models.sh
RUN ./download-models.sh

RUN npm run build

RUN python manage.py collectstatic --no-input --verbosity 2

RUN python manage.py migrate

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/admin/login/ || exit 1

EXPOSE 8000


CMD ["./startup.sh"]
