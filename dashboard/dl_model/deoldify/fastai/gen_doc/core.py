import re

from ..core import *


def strip_fastai(s):
    return re.sub(r"^fastai\.", "", s)
