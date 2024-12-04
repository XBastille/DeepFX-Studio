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


def process_image(img, model_name):
    h, w = img.shape[:2]

    def to_8s(x):
        if "tiny" in os.path.basename(model_name):
            return 256 if x < 256 else x - x % 16
        else:
            return 256 if x < 256 else x - x % 8

    img = cv2.resize(img, (to_8s(w), to_8s(h)))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32) / 127.5 - 1.0
    return img


def load_test_data(image_path, model_name):
    img0 = cv2.imread(image_path).astype(np.float32)
    img = process_image(img0, model_name)
    img = np.expand_dims(img, axis=0)
    return img, img0.shape


def save_images(images, image_path, size):
    images = (np.squeeze(images) + 1.0) / 2 * 255
    images = np.clip(images, 0, 255).astype(np.uint8)
    images = cv2.resize(images, size)
    cv2.imwrite(image_path, cv2.cvtColor(images, cv2.COLOR_RGB2BGR))


def process_single_image(input_path, model_path, device="gpu"):
    if ort.get_device() == "GPU" and device == "gpu":
        session = ort.InferenceSession(
            model_path, providers=["CUDAExecutionProvider", "CPUExecutionProvider"]
        )
    else:
        session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])

    x = session.get_inputs()[0].name
    y = session.get_outputs()[0].name

    model_name = get_model_name(model_path)
    output_path = get_unique_output_path(input_path, "outputs", model_name)

    sample_image, shape = load_test_data(input_path, model_path)
    fake_img = session.run(None, {x: sample_image})
    save_images(fake_img[0], output_path, (shape[1], shape[0]))

    return output_path


if __name__ == "__main__":
    model_path = "models/model_name"
    input_image = "inputs/image_name"
    output_path = process_single_image(input_image, model_path)
    print(f"Image saved to: {output_path}")
