#!/bin/bash


echo "Starting Django application..."

echo "Collecting static files..."
python manage.py collectstatic --no-input --clear

echo "Running database migrations..."
python manage.py migrate

echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000 --noreload
