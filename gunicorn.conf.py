import os

bind = "0.0.0.0:8000"
backlog = 2048

workers = int(os.getenv("WEB_CONCURRENCY", 2))  
worker_class = "sync"
worker_connections = 1000
timeout = int(os.getenv("TIMEOUT", 180))  
keepalive = 2

max_requests = 50  
max_requests_jitter = 10

worker_tmp_dir = "/dev/shm"  

loglevel = os.getenv("LOG_LEVEL", "info").lower()
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'
accesslog = "-"
errorlog = "-"

proc_name = "deepfx_studio"

preload_app = True

tmp_upload_dir = "/tmp"

limit_request_line = 8192
limit_request_fields = 200
limit_request_field_size = 8192
