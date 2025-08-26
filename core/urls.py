from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('environment-status/', views.environment_status, name='environment_status'),
    path('task-status/<str:task_id>/', views.task_status_api, name='task_status'),
    path('all-tasks/', views.all_tasks_status, name='all_tasks'),
    path('cancel-task/<str:task_id>/', views.cancel_task, name='cancel_task'),
    path('system-health/', views.system_health, name='system_health'),
    path('auto-prepare/', views.auto_prepare_environments, name='auto_prepare'),
]