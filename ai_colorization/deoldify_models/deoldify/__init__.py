import logging
import sys

logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))
logging.getLogger().setLevel(logging.INFO)

from ai_colorization.deoldify_models.deoldify._device import ComputeManager

device = ComputeManager()
