import abc
import bz2
import collections
import concurrent
import csv
import functools
import gc
import gzip
import hashlib
import html
import importlib
import inspect
import io
import itertools
import json
import math
import mimetypes
import numbers
import operator
import os
import pathlib
import pickle
import random
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import typing
import warnings
import weakref
from abc import abstractmethod, abstractproperty
from collections import Counter, OrderedDict, abc, defaultdict, namedtuple
from collections.abc import Iterable
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
from contextlib import contextmanager
from copy import copy, deepcopy
from dataclasses import InitVar, dataclass, field
from enum import Enum, IntEnum
from functools import partial, reduce
from io import BufferedWriter, BytesIO
from operator import attrgetter, itemgetter
from pathlib import Path
from pdb import set_trace
from warnings import warn

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import pkg_resources
import requests
import scipy.special
import scipy.stats
import yaml
from fastprogress.fastprogress import MasterBar, ProgressBar
from matplotlib import patches, patheffects
from matplotlib.patches import Patch
from numpy import array, cos, exp, log, sin, tan, tanh
from pandas import DataFrame, Series

pkg_resources.require("fastprogress>=0.1.19")
# for type annotations
from numbers import Number
from types import SimpleNamespace
from typing import (
    Any,
    AnyStr,
    Callable,
    Collection,
    Dict,
    Hashable,
    Iterator,
    List,
    Mapping,
    NewType,
    Optional,
    Sequence,
    Tuple,
    TypeVar,
    Union,
)

from fastprogress.fastprogress import master_bar, progress_bar


def try_import(module):
    "Try to import `module`. Returns module's object on success, None on failure"
    try:
        return importlib.import_module(module)
    except:
        return None


def have_min_pkg_version(package, version):
    "Check whether we have at least `version` of `package`. Returns True on success, False otherwise."
    try:
        pkg_resources.require(f"{package}>={version}")
        return True
    except:
        return False
