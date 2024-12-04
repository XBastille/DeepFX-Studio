import logging
import sys

logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))
logging.getLogger().setLevel(logging.INFO)

from deoldify._device import _Device

device = _Device()
