FROM python:3.10-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

ARG NODE_MAJOR=18

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

USER python

COPY --chown=python:python requirements*.txt ./

RUN pip3 install --no-cache-dir -r requirements.txt

ENV DEBUG="false" \
    PYTHONUNBUFFERED="true" \
    PATH="${PATH}:/home/python/.local/bin" \
    USER="python"

COPY --chown=python:python . .

RUN mkdir -p background_remover/is_net/saved_models
RUN curl -L -o background_remover/is_net/saved_models/isnet.pth https://github.com/XBastille/DeepFX-Studio/releases/download/models/isnet.pth

RUN SECRET_KEY=dummy python manage.py tailwind install --no-input \
    && SECRET_KEY=dummy python manage.py tailwind build --no-input

RUN SECRET_KEY=dummy python manage.py collectstatic --no-input

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
