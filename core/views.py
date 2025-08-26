from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import logging

from core.dependency_manager import get_environment_status, ensure_sd35_environment, ensure_flux_inpaint_environment
from core.task_queue import get_task_status, task_queue

logger = logging.getLogger(__name__)

@require_http_methods(["GET"])
def environment_status(request):
    """Get the status of all environments"""
    try:
        status = get_environment_status()
        return JsonResponse({
            "success": True,
            "data": status
        })
    except Exception as e:
        logger.error(f"Error getting environment status: {e}")
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)

@require_http_methods(["GET"])
def task_status_api(request, task_id):
    """Get the status of a specific task"""
    try:
        status = get_task_status(task_id)
        if status is None:
            return JsonResponse({
                "success": False,
                "error": "Task not found"
            }, status=404)
        
        return JsonResponse({
            "success": True,
            "data": status
        })
    except Exception as e:
        logger.error(f"Error getting task status: {e}")
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)

@require_http_methods(["GET"])
def all_tasks_status(request):
    """Get the status of all tasks"""
    try:
        tasks = task_queue.get_all_tasks()
        return JsonResponse({
            "success": True,
            "data": {
                "tasks": tasks,
                "queue_size": task_queue.queue.qsize(),
                "total_tasks": len(tasks)
            }
        })
    except Exception as e:
        logger.error(f"Error getting all tasks status: {e}")
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def cancel_task(request, task_id):
    """Cancel a pending task"""
    try:
        success = task_queue.cancel_task(task_id)
        if success:
            return JsonResponse({
                "success": True,
                "message": "Task cancelled successfully"
            })
        else:
            return JsonResponse({
                "success": False,
                "error": "Task not found or cannot be cancelled"
            }, status=400)
    except Exception as e:
        logger.error(f"Error cancelling task: {e}")
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)

@require_http_methods(["GET"])
def system_health(request):
    """Get overall system health status"""
    try:
        env_status = get_environment_status()
        tasks = task_queue.get_all_tasks()
        
        task_counts = {
            "pending": 0,
            "running": 0,
            "completed": 0,
            "failed": 0
        }
        
        for task in tasks.values():
            if task and task.get("status"):
                status = task["status"]
                if status in task_counts:
                    task_counts[status] += 1
        
        return JsonResponse({
            "success": True,
            "data": {
                "environments": env_status,
                "queue": {
                    "size": task_queue.queue.qsize(),
                    "worker_running": task_queue.running,
                    "task_counts": task_counts
                },
                "system_ready": not any(
                    env["downloading"] for env in env_status["environments"].values()
                )
            }
        })
    except Exception as e:
        logger.error(f"Error getting system health: {e}")
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def auto_prepare_environments(request):
    """Auto-prepare environments based on page context"""
    try:
        data = json.loads(request.body) if request.body else {}
        page_type = data.get('page_type', 'unknown')
        
        logger.info(f"Auto-preparing environments for page: {page_type}")
        
        if page_type == 'text-to-image':
            env_status = ensure_sd35_environment(wait=False)
            logger.info(f"SD 3.5 preparation triggered: {env_status}")
            
        elif page_type == 'image-editor' or page_type == 'inpaint':
            env_status = ensure_flux_inpaint_environment(wait=False)
            logger.info(f"FLUX inpaint preparation triggered: {env_status}")
            
        elif page_type == 'all':
            sd35_status = ensure_sd35_environment(wait=False)
            flux_status = ensure_flux_inpaint_environment(wait=False)
            logger.info(f"Both environments preparation triggered - SD35: {sd35_status}, FLUX: {flux_status}")
        
        current_status = get_environment_status()
        return JsonResponse({
            "success": True,
            "message": f"Environment preparation triggered for {page_type}",
            "data": current_status
        })
        
    except Exception as e:
        logger.error(f"Error auto-preparing environments: {e}")
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)