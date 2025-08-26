#!/bin/bash

set -e

echo "Starting Django application in production mode..."

echo "Collecting static files..."
python3 manage.py collectstatic --no-input --clear

echo "Running database migrations..."
python3 manage.py migrate

if [ -z "$SECRET_KEY" ]; then
    echo "WARNING: SECRET_KEY environment variable is not set!"
fi

echo "Starting Gunicorn server..."
exec gunicorn deepfx_studio.wsgi:application \
    --config gunicorn.conf.py \
    --log-level info \
    --access-logfile - \
    --error-logfile -
