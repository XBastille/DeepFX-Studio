import os
import sys
import subprocess
import threading
import time
from enum import Enum
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelType(Enum):
    SD35 = "sd35"
    FLUX_INPAINT = "flux_inpaint"

class DependencyManager:
    def __init__(self):
        self.current_env = None
        self.is_switching = False
        self.lock = threading.Lock()
        self._detect_current_environment()
    
    def _detect_current_environment(self):
        """Detect which environment is currently active"""
        try:
            try:
                from importlib import metadata
            except Exception:
                import importlib_metadata as metadata  # type: ignore

            version = metadata.version('diffusers')

            if version == "0.30.2":
                self.current_env = ModelType.FLUX_INPAINT
            else:
                self.current_env = ModelType.SD35

            logger.info(f"Current diffusers version: {version}")
            logger.info(f"Current environment: {self.current_env}")
            
        except ImportError:
            logger.warning("Diffusers not installed")
            self.current_env = None
        except Exception as e:
            logger.warning(f"Could not detect diffusers via metadata: {e}")
            self.current_env = None
    
    def _install_diffusers_version(self, version):
        """Install specific diffusers version"""
        try:
            try:
                from importlib import metadata
            except Exception:
                import importlib_metadata as metadata  # type: ignore

            numpy_before = None
            try:
                numpy_before = metadata.version('numpy')
            except Exception:
                numpy_before = None

            base_pkg = "diffusers" if version == "latest" else f"diffusers=={version}"
            cmd_no_deps = [sys.executable, "-m", "pip", "install", base_pkg, "--no-deps", "--no-cache-dir", "--force-reinstall"]
            cmd_with_deps = [sys.executable, "-m", "pip", "install", base_pkg, "--no-cache-dir", "--force-reinstall"]
            
            logger.info(f"Installing diffusers {version}...")
            logger.info(f"Attempting pip install (no-deps) for {base_pkg}")
            result = subprocess.run(cmd_no_deps, capture_output=True, text=True, timeout=300)

            if result.returncode != 0:
                logger.warning(f"pip install --no-deps failed for {base_pkg}: {result.stderr}. Retrying with deps.")
                result = subprocess.run(cmd_with_deps, capture_output=True, text=True, timeout=300)

            if result.returncode == 0:
                logger.info(f"Successfully installed diffusers {version}")
                try:
                    numpy_after = metadata.version('numpy')
                except Exception:
                    numpy_after = None

                self.numpy_before = numpy_before
                self.numpy_after = numpy_after
                self.restart_required = False
                if numpy_before and numpy_after and numpy_before != numpy_after:
                    logger.warning(f"NumPy version changed: {numpy_before} -> {numpy_after}; Python process may require restart")
                    self.restart_required = True

                return True
            else:
                logger.error(f"Failed to install diffusers {version}: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error(f"Timeout installing diffusers {version}")
            return False
        except Exception as e:
            logger.error(f"Error installing diffusers {version}: {e}")
            return False
    
    def _clear_gpu_memory(self):
        """Clear GPU memory before switching environments"""
        try:
            import torch
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                logger.info("GPU memory cleared")
        except:
            pass
    
    def switch_to_environment(self, model_type, wait=True):
        """Switch to required environment with proper error handling"""
        if self.current_env == model_type:
            logger.info(f"Already in {model_type} environment")
            return {"ready": True, "downloading": False}
        
        if self.is_switching:
            logger.info("Environment switch already in progress...")
            if wait:
                while self.is_switching:
                    time.sleep(1)
                return {"ready": self.current_env == model_type, "downloading": False}
            else:
                return {"ready": False, "downloading": True}
        
        with self.lock:
            if self.current_env == model_type:
                return {"ready": True, "downloading": False}
            
            self.is_switching = True
        
        def _switch():
            try:
                logger.info(f"Switching to {model_type} environment...")
                
                self._clear_gpu_memory()
                
                if model_type == ModelType.SD35:
                    required_version = "0.34.0"
                else:  
                    required_version = "0.30.2"
                
                success = self._install_diffusers_version(required_version)
                
                if success:
                    self.current_env = model_type
                    logger.info(f"Successfully switched to {model_type}")
                else:
                    logger.error(f"Failed to switch to {model_type}")
                    
            except Exception as e:
                logger.error(f"Error switching to {model_type}: {e}")
            finally:
                self.is_switching = False
        
        if wait:
            _switch()
            return {"ready": self.current_env == model_type, "downloading": False}
        else:
            thread = threading.Thread(target=_switch)
            thread.daemon = True
            thread.start()
            return {"ready": False, "downloading": True}

_dependency_manager = DependencyManager()

def ensure_sd35_environment(wait=True):
    """Ensure SD 3.5 environment (latest diffusers) is ready"""
    try:
        try:
            from importlib import metadata
        except Exception:
            import importlib_metadata as metadata  # type: ignore

        current_version = None
        try:
            current_version = metadata.version('diffusers')
        except Exception:
            current_version = None

        if current_version:
            parts = current_version.split('.')
            try:
                major = int(parts[0]) if len(parts) > 0 else 0
                minor = int(parts[1]) if len(parts) > 1 else 0
            except Exception:
                major = 0; minor = 0

            if (major > 0) or (major == 0 and minor >= 34) or major >= 1:
                logger.info(f"SD 3.5 environment ready (diffusers {current_version})")
                return {"ready": True, "downloading": False}
            else:
                logger.info(f"SD 3.5 needs upgrade: current {current_version}, need >= 0.34.0")
    except ImportError:
        logger.info("Diffusers not installed, will install 0.34.0")
    except Exception as e:
        logger.warning(f"Error checking diffusers version: {e}, assuming needs upgrade")
    
    return _dependency_manager.switch_to_environment(ModelType.SD35, wait=wait)

def ensure_flux_inpaint_environment(wait=True):
    """Ensure FLUX inpaint environment (diffusers==0.30.2) is ready"""
    try:
        import diffusers
        version = diffusers.__version__
        
        if version == "0.30.2":
            logger.info(f"FLUX inpaint environment ready (diffusers {version})")
            return {"ready": True, "downloading": False}
    except ImportError:
        pass
    
    return _dependency_manager.switch_to_environment(ModelType.FLUX_INPAINT, wait=wait)

def get_current_environment():
    """Get current environment info"""
    return {
        "current": _dependency_manager.current_env,
        "switching": _dependency_manager.is_switching
    }

def get_environment_status():
    """Get comprehensive environment status for API endpoints"""
    try:
        try:
            from importlib import metadata
        except Exception:
            import importlib_metadata as metadata  # type: ignore

        try:
            current_version = metadata.version('diffusers')
        except Exception:
            current_version = None
    except ImportError:
        current_version = None
    
    return {
        "current_environment": _dependency_manager.current_env.value if _dependency_manager.current_env else None,
        "is_switching": _dependency_manager.is_switching,
        "diffusers_version": current_version,
        "numpy_before": getattr(_dependency_manager, 'numpy_before', None),
        "numpy_after": getattr(_dependency_manager, 'numpy_after', None),
        "restart_required": getattr(_dependency_manager, 'restart_required', False),
        "environments": {
            "sd35": {
                "name": "SD 3.5 (Diffusers 0.34.0)",
                "active": _dependency_manager.current_env == ModelType.SD35,
                "downloading": _dependency_manager.is_switching and _dependency_manager.current_env != ModelType.SD35,
                "required_version": "0.34.0"
            },
            "flux_inpaint": {
                "name": "FLUX Inpainting (Diffusers 0.30.2)",
                "active": _dependency_manager.current_env == ModelType.FLUX_INPAINT,
                "downloading": _dependency_manager.is_switching and _dependency_manager.current_env != ModelType.FLUX_INPAINT,
                "required_version": "0.30.2"
            }
        }
    }