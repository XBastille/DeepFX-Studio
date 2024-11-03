#!/bin/sh

# Run migrations
cd ./theme/static_src && npm install && cd ./../../
python manage.py makemigrations
python manage.py migrate
python manage.py tailwind build

# Start the Django server
exec python manage.py runserver 0.0.0.0:8000