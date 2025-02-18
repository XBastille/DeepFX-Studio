import logging
from abc import ABC, abstractmethod

import cv2
from deoldify import device as compute_manager
from fastai import *
from fastai.basic_data import DatasetType
from fastai.basic_train import Learner
from fastai.core import *
from fastai.vision import *
from fastai.vision.data import *
from fastai.vision.image import *
from PIL import Image as PilImage


class ImgFilterInterface(ABC):
    @abstractmethod
    def process(
        self, source_img: PilImage, processed_img: PilImage, quality_factor: int
    ) -> PilImage:
        pass


class BaseImgFilter(ImgFilterInterface):
    def __init__(self, learner: Learner, stats: tuple = imagenet_stats):
        super().__init__()
        self.learner = learner

        if not compute_manager.is_accelerated():
            self.learner.model = self.learner.model.cpu()

        self.device = next(self.learner.model.parameters()).device
        self.normalize, self.denormalize = normalize_funcs(*stats)

    def _transform_img(self, img: PilImage) -> PilImage:
        return img

    def _resize_to_square(self, source: PilImage, target_size: int) -> PilImage:
        target_dimensions = (target_size, target_size)
        return source.resize(target_dimensions, resample=PIL.Image.BILINEAR)

    def _prepare_for_model(self, source: PilImage, size: int) -> PilImage:
        resized = self._resize_to_square(source, size)
        return self._transform_img(resized)

    def _execute_model(self, source: PilImage, size: int) -> PilImage:
        prepared_img = self._prepare_for_model(source, size)
        tensor = pil2tensor(prepared_img, np.float32)
        tensor = tensor.to(self.device)
        tensor.div_(255)
        tensor, y = self.normalize((tensor, tensor), do_x=True)

        try:
            output = self.learner.pred_batch(
                ds_type=DatasetType.Valid,
                batch=(tensor[None], y[None]),
                reconstruct=True,
            )
        except RuntimeError as error:
            if "memory" not in str(error):
                raise error
            logging.warn(
                "Warning: quality_factor was too high, causing memory overflow. Returning original image."
            )
            return prepared_img

        result = output[0]
        result = self.denormalize(result.px, do_x=False)
        result = image2np(result * 255).astype(np.uint8)
        return PilImage.fromarray(result)

    def _restore_dimensions(self, processed: PilImage, source: PilImage) -> PilImage:
        original_size = source.size
        return processed.resize(original_size, resample=PIL.Image.BILINEAR)


class ColorizeFilter(BaseImgFilter):
    def __init__(self, learner: Learner, stats: tuple = imagenet_stats):
        super().__init__(learner=learner, stats=stats)
        self.base_size = 16

    def process(
        self,
        source_img: PilImage,
        processed_img: PilImage,
        quality_factor: int,
        bnw_output: bool = True,
    ) -> PilImage:
        target_size = quality_factor * self.base_size
        model_output = self._execute_model(processed_img, target_size)
        restored_img = self._restore_dimensions(model_output, source_img)

        return (
            self._bnw_output(restored_img, source_img) if bnw_output else restored_img
        )

    def _transform_image(self, img: PilImage) -> PilImage:
        return img.convert("LA").convert("RGB")

    def _bnw_output(self, colored: PilImage, source: PilImage) -> PilImage:
        colored_array = np.asarray(colored)
        source_array = np.asarray(source)
        colored_yuv = cv2.cvtColor(colored_array, cv2.COLOR_RGB2YUV)
        source_yuv = cv2.cvtColor(source_array, cv2.COLOR_RGB2YUV)
        bnwd = np.copy(source_yuv)
        bnwd[:, :, 1:3] = colored_yuv[:, :, 1:3]
        result = cv2.cvtColor(bnwd, cv2.COLOR_YUV2RGB)
        return PilImage.fromarray(result)


class MultiStageFilter(BaseImgFilter):
    def __init__(self, filters: List[ImgFilterInterface], quality_factor: int):
        self.filters = filters
        self.quality_factor = quality_factor

    def process(
        self,
        source_img: PilImage,
        processed_img: PilImage,
        quality_factor: int = None,
        bnw_output: bool = True,
    ) -> PilImage:
        current_quality = (
            self.quality_factor if quality_factor is None else quality_factor
        )
        for filter_stage in self.filters:
            processed_img = filter_stage.process(
                source_img, processed_img, current_quality, bnw_output
            )

        return processed_img
