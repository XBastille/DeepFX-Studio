import PIL
import torch
from fastai.core import *
from fastai.vision import *
from matplotlib.axes import Axes

# from ai_col orization.deoldify_models.fastai.vision.image import Image

from .filters import ColorizeFilter, ImgFilterInterface, MultiStageFilter
from .generators import init_deep_inference, init_wide_inference


class ModelImageEnhancer:
    def __init__(self, filter: ImgFilterInterface, results_dir: str = None):
        self.filter = filter
        self.results_dir = None if results_dir is None else Path(results_dir)
        self.results_dir.mkdir(parents=True, exist_ok=True)

    def _optimize_memory(self):
        torch.cuda.empty_cache()

    def _load_img(self, path: Path) -> Image:
        return PIL.Image.open(path).convert("RGB")

    def bnw_img(
        self,
        path: str,
        results_dir: Path = None,
        figsize: Tuple[int, int] = (20, 20),
        quality_factor: int = None,
        display_quality: bool = False,
        compare: bool = False,
        post_process: bool = True,
    ) -> Path:
        path = Path(path)
        results_dir = Path(self.results_dir) if results_dir is None else results_dir
        bnwd = self.generate_bnwd_img(path, quality_factor, post_process=post_process)
        original = self._load_img(path)

        if compare:
            self._display_comparison(
                figsize, quality_factor, display_quality, original, bnwd
            )
        else:
            self._display_single(figsize, quality_factor, display_quality, bnwd)

        original.close()
        result_path = self._save_bnwd_img(path, bnwd, results_dir=results_dir)
        bnwd.close()
        return result_path

    def _display_comparison(
        self,
        figsize: Tuple[int, int],
        quality_factor: int,
        display_quality: bool,
        original: Image,
        bnwd: Image,
    ):
        fig, axes = plt.subplots(1, 2, figsize=figsize)
        self._display_img(
            original,
            axes=axes[0],
            figsize=figsize,
            quality_factor=quality_factor,
            display_quality=False,
        )
        self._display_img(
            bnwd,
            axes=axes[1],
            figsize=figsize,
            quality_factor=quality_factor,
            display_quality=display_quality,
        )

    def _display_single(
        self,
        figsize: Tuple[int, int],
        quality_factor: int,
        display_quality: bool,
        bnwd: Image,
    ):
        fig, axes = plt.subplots(1, 1, figsize=figsize)
        self._display_img(
            bnwd,
            axes=axes,
            figsize=figsize,
            quality_factor=quality_factor,
            display_quality=display_quality,
        )

    def _save_bnwd_img(self, source_path: Path, img: Image, results_dir=None) -> Path:
        results_dir = Path(self.results_dir) if results_dir is None else results_dir
        output_path = results_dir / source_path.name
        img.save(output_path)
        return output_path

    def generate_bnwd_img(
        self,
        path: Path,
        quality_factor: int = None,
        post_process: bool = True,
    ) -> Image:
        self._optimize_memory()
        source_img = self._load_img(path)
        return self.filter.process(
            source_img,
            source_img,
            quality_factor=quality_factor,
            bnw_output=post_process,
        )

    def _display_img(
        self,
        img: Image,
        quality_factor: int,
        axes: Axes = None,
        figsize=(20, 20),
        display_quality=False,
    ):
        if axes is None:
            _, axes = plt.subplots(figsize=figsize)
        axes.imshow(np.asarray(img) / 255)
        axes.axis("off")
        if quality_factor is not None and display_quality:
            plt.text(
                10,
                10,
                f"quality_factor: {quality_factor}",
                color="white",
                backgroundcolor="black",
            )


def create_stable_colorizer(
    root_folder: Path = Path("./"),
    weights_name: str = "ColorizeStable_gen",
    results_dir="result_images",
    quality_factor: int = 35,
) -> ModelImageEnhancer:
    learn = init_wide_inference(root_folder=root_folder, weights_name=weights_name)
    filter = MultiStageFilter(
        [ColorizeFilter(learner=learn)], quality_factor=quality_factor
    )
    return ModelImageEnhancer(filter, results_dir=results_dir)


def create_artistic_colorizer(
    root_folder: Path = Path("./"),
    weights_name: str = "ColorizeArtistic_gen",
    results_dir="result_images",
    quality_factor: int = 35,
) -> ModelImageEnhancer:
    learn = init_deep_inference(root_folder=root_folder, weights_name=weights_name)
    filter = MultiStageFilter(
        [ColorizeFilter(learner=learn)], quality_factor=quality_factor
    )
    return ModelImageEnhancer(filter, results_dir=results_dir)
