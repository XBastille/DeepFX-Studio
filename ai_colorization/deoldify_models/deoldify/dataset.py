from fastai import *
from fastai.core import *
from fastai.vision.transform import get_transforms
from fastai.vision.data import ImageImageList, ImageDataBunch, imagenet_stats

def create_training_data(
    dimension: int,
    batch_count: int,
    source_path: Path,
    target_path: Path,
    seed_value: int = None,
    retention_rate: float = 1.0,
    thread_count: int = 8,
    normalization_stats: tuple = imagenet_stats,
    additional_transforms=[],
) -> ImageDataBunch:
    
    data_source = (
        ImageImageList.from_folder(source_path, convert_mode='RGB')
        .use_partial_data(sample_pct=retention_rate, seed=seed_value)
        .split_by_rand_pct(0.1, seed=seed_value)
    )

    processed_data = (
        data_source.label_from_func(lambda x: target_path / x.relative_to(source_path))
        .transform(
            get_transforms(
                max_zoom=1.2, max_lighting=0.5, max_warp=0.25, 
                xtra_tfms=additional_transforms
            ),
            size=dimension,
            tfm_y=True,
        )
        .databunch(bs=batch_count, num_workers=thread_count, no_check=True)
        .normalize(normalization_stats, do_y=True)
    )

    processed_data.c = 3
    return processed_data

def init_test_databunch() -> ImageDataBunch:
    test_path = Path('./dummy/')
    return create_training_data(
        dimension=1, batch_count=1, source_path=test_path, 
        target_path=test_path, retention_rate=0.001
    )
