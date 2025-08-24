import threading
import queue
import time
import uuid
from enum import Enum
from dataclasses import dataclass
from typing import Any, Dict, Optional, Callable
import logging

logger = logging.getLogger(__name__)

class TaskStatus(Enum):
    PENDING = "pending"
    PREPARING_ENV = "preparing_env" 
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class Task:
    id: str
    task_type: str
    function: Callable
    args: tuple
    kwargs: dict
    status: TaskStatus
    result: Any = None
    error: str = None
    created_at: float = None
    started_at: float = None
    completed_at: float = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = time.time()

class TaskQueue:
    def __init__(self):
        self.tasks = {}
        self.queue = queue.Queue()
        self.worker_thread = None
        self.running = False
        self.lock = threading.Lock()
        
        self.start_worker()
    
    def start_worker(self):
        """Start the background worker thread"""
        if self.worker_thread is None or not self.worker_thread.is_alive():
            self.running = True
            self.worker_thread = threading.Thread(target=self._worker, daemon=True)
            self.worker_thread.start()
            logger.info("Task queue worker started")
    
    def stop_worker(self):
        """Stop the background worker thread"""
        self.running = False
        if self.worker_thread and self.worker_thread.is_alive():
            self.worker_thread.join(timeout=5)
            logger.info("Task queue worker stopped")
    
    def add_task(self, task_type: str, function: Callable, *args, **kwargs) -> str:
        """
        Add a task to the queue
        
        Args:
            task_type: Type of task (e.g., 'sd35_generation', 'flux_inpaint')
            function: Function to execute
            *args, **kwargs: Arguments for the function
            
        Returns:
            str: Task ID
        """
        task_id = str(uuid.uuid4())
        
        task = Task(
            id=task_id,
            task_type=task_type,
            function=function,
            args=args,
            kwargs=kwargs,
            status=TaskStatus.PENDING
        )
        
        with self.lock:
            self.tasks[task_id] = task
        
        self.queue.put(task_id)
        logger.info(f"Added task {task_id} of type {task_type} to queue")
        
        return task_id
    
    def get_task_status(self, task_id: str) -> Optional[Dict]:
        """Get status of a specific task"""
        with self.lock:
            task = self.tasks.get(task_id)
            if not task:
                return None
            
            return {
                "id": task.id,
                "type": task.task_type,
                "status": task.status.value,
                "result": task.result,
                "error": task.error,
                "created_at": task.created_at,
                "started_at": task.started_at,
                "completed_at": task.completed_at,
                "duration": (task.completed_at - task.started_at) if task.completed_at and task.started_at else None
            }
    
    def get_all_tasks(self) -> Dict[str, Dict]:
        """Get status of all tasks"""
        with self.lock:
            return {
                task_id: self.get_task_status(task_id)
                for task_id in self.tasks.keys()
            }
    
    def _worker(self):
        """Background worker that processes tasks"""
        logger.info("Task queue worker running")
        
        while self.running:
            try:
                task_id = self.queue.get(timeout=1)
                
                with self.lock:
                    task = self.tasks.get(task_id)
                
                if not task:
                    continue
                
                with self.lock:
                    task.status = TaskStatus.RUNNING
                    task.started_at = time.time()
                
                logger.info(f"Processing task {task_id} of type {task.task_type}")
                
                try:
                    result = task.function(*task.args, **task.kwargs)
                    
                    with self.lock:
                        task.status = TaskStatus.COMPLETED
                        task.result = result
                        task.completed_at = time.time()
                    
                    logger.info(f"Task {task_id} completed successfully")
                    
                except Exception as e:
                    with self.lock:
                        task.status = TaskStatus.FAILED
                        task.error = str(e)
                        task.completed_at = time.time()
                    
                    logger.error(f"Task {task_id} failed: {e}")
                
                self.queue.task_done()
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Worker error: {e}")
    
    def wait_for_task(self, task_id: str, timeout: Optional[float] = None) -> Optional[Dict]:
        """
        Wait for a task to complete
        
        Args:
            task_id: Task ID to wait for
            timeout: Maximum time to wait (None for no timeout)
            
        Returns:
            Task status dict or None if timeout
        """
        start_time = time.time()
        
        while True:
            status = self.get_task_status(task_id)
            if not status:
                return None
            
            if status["status"] in [TaskStatus.COMPLETED.value, TaskStatus.FAILED.value]:
                return status
            
            if timeout and (time.time() - start_time) > timeout:
                return status
            
            time.sleep(0.5)
    
    def cancel_task(self, task_id: str) -> bool:
        """Cancel a pending task (cannot cancel running tasks)"""
        with self.lock:
            task = self.tasks.get(task_id)
            if not task:
                return False
            
            if task.status == TaskStatus.PENDING:
                task.status = TaskStatus.FAILED
                task.error = "Task cancelled"
                task.completed_at = time.time()
                return True
            
            return False

task_queue = TaskQueue()

def add_task(task_type: str, function: Callable, *args, **kwargs) -> str:
    """Add a task to the global queue"""
    return task_queue.add_task(task_type, function, *args, **kwargs)

def get_task_status(task_id: str) -> Optional[Dict]:
    """Get status of a task from the global queue"""
    return task_queue.get_task_status(task_id)

def wait_for_task(task_id: str, timeout: Optional[float] = None) -> Optional[Dict]:
    """Wait for a task to complete"""
    return task_queue.wait_for_task(task_id, timeout)