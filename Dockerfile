FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    wget \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p remover/ml_models/saved_models

RUN wget -O remover/ml_models/saved_models/isnet.pth https://github.com/XBastille/DeepFX-Studio/releases/download/models/isnet.pth

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
