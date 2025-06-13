import os

import cv2
import numpy as np
import onnxruntime as ort


def check_folder(path):
    if not os.path.exists(path):
        os.makedirs(path)
    return path


def get_model_name(model_path):
    return os.path.splitext(os.path.basename(model_path))[0]


def get_unique_output_path(input_path, output_dir, model_name):
    input_filename = os.path.splitext(os.path.basename(input_path))[0]
    output_subdir = os.path.join(output_dir, model_name)
    check_folder(output_subdir)

    base_path = os.path.join(output_subdir, f"{input_filename}.jpg")
    if not os.path.exists(base_path):
        return base_path

    counter = 1
    while os.path.exists(
        os.path.join(output_subdir, f"{input_filename}_{counter}.jpg")
    ):
        counter += 1
    return os.path.join(output_subdir, f"{input_filename}_{counter}.jpg")


def transform_input_img(img, model_name):
    height, width = img.shape[:2]

    def calculate_dims(dims):
        if "tiny" in os.path.basename(model_name):
            return 256 if dims < 256 else dims - dims % 16
        return 256 if dims < 256 else dims - dims % 8

    processed = cv2.resize(img, (calculate_dims(width), calculate_dims(height)))
    normalized = cv2.cvtColor(processed, cv2.COLOR_BGR2RGB).astype(np.float32)
    final = (normalized / 127.5) - 1.0
    return final


def prepare_input_data(img_location, model_name):
    original = cv2.imread(img_location).astype(np.float32)
    transformed = transform_input_img(original, model_name)
    batched = np.expand_dims(transformed, axis=0)
    return batched, original.shape


def export_processed_img(generated_data, target_path, dimensions):
    denormalized = (np.squeeze(generated_data) + 1.0) / 2 * 255
    bounded = np.clip(denormalized, 0, 255).astype(np.uint8)
    resized = cv2.resize(bounded, dimensions)
    cv2.imwrite(target_path, cv2.cvtColor(resized, cv2.COLOR_RGB2BGR))


def execute_inference(source_path, model_path, compute_device="gpu"):
    if ort.get_device() == "GPU" and compute_device == "gpu":
        inference_engine = ort.InferenceSession(
            model_path, providers=["CUDAExecutionProvider", "CPUExecutionProvider"]
        )
    else:
        inference_engine = ort.InferenceSession(
            model_path, providers=["CPUExecutionProvider"]
        )
    input_tensor = inference_engine.get_inputs()[0].name
    output_tensor = inference_engine.get_outputs()[0].name
    model_identifier = get_model_name(model_path)
    result_path = get_unique_output_path(source_path, "outputs", model_identifier)

    input_tensor_data, original_dims = prepare_input_data(source_path, model_path)
    generated_output = inference_engine.run(None, {input_tensor: input_tensor_data})
    export_processed_img(
        generated_output[0], result_path, (original_dims[1], original_dims[0])
    )
    return result_path


if __name__ == "__main__":
    # Supported Image Formats: jpg, png

    Shinkai = "ai_filter/filters/pretrained_models/Shinkai.onnx"
    JP_face = "ai_filter/filters/pretrained_models/JP_face.onnx"
    PortraitSketch = "ai_filter/filters/pretrained_models/PortraitSketch.onnx"
    Paprika = "ai_filter/filters/pretrained_models/Paprika.onnx"
    Hayao = "ai_filter/filters/pretrained_models/Hayao.onnx"

    input_img = "jpeg_img3_success.jpeg"

    Shinkai_output_path = execute_inference(input_img, Shinkai)
    JP_face_output_path = execute_inference(input_img, JP_face)
    PortraitSketch_output_path = execute_inference(input_img, PortraitSketch)
    Paprika_output_path = execute_inference(input_img, Paprika)
    Hayao_output_path = execute_inference(input_img, Hayao)
