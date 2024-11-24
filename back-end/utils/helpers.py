from joblib import Parallel, delayed
from tqdm import tqdm

import os
from collections.abc import Iterable
import sys
import traceback
from utils import logger

def check_if_iterable(objs):
    if isinstance(objs, dict):
        for key, value in objs.items():
            objs[key] = check_if_iterable(value)
    if isinstance(objs, list):
        for i, value in enumerate(objs):
            objs[i] = check_if_iterable(value)
    elif not isinstance(objs, Iterable):
        objs = str(objs)
        return objs
    else:
        return objs
    
    return objs


def iterable_handler(func):
    def wrapper(*args, **kwargs):
        return check_if_iterable(func(*args, **kwargs))
    return wrapper

def parallelize(data, func, n_cores=8):
    return Parallel(n_jobs=n_cores, prefer="threads")(delayed(func)(**x) for x in tqdm(data))