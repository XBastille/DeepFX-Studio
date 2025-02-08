import os
from .device_id import DeviceId

class HardwareException(Exception):
    pass

class ComputeManager:
    def __init__(self):
        self.configure(DeviceId.CPU)

    def is_accelerated(self):
        return self.active_device() is not DeviceId.CPU
  
    def active_device(self):
        return self._active_compute_unit

    def configure(self, hardware_unit:DeviceId):     
        if hardware_unit == DeviceId.CPU:
            os.environ['CUDA_VISIBLE_DEVICES'] = ''
        else:
            os.environ['CUDA_VISIBLE_DEVICES'] = str(hardware_unit.value)
            import torch
            torch.backends.cudnn.benchmark = False
        
        self._active_compute_unit = hardware_unit    
        return hardware_unit
