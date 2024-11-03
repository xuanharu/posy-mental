from joblib import Parallel, delayed
from tqdm import tqdm

def parallelize(data, func, n_cores=8):
    return Parallel(n_jobs=n_cores, prefer="threads")(delayed(func)(**x) for x in tqdm(data))