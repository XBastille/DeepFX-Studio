import os

import PIL
import torch
from facenet_pytorch import MTCNN
from torchvision import transforms

mtcnn = MTCNN(image_size=256, margin=80)


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


def analyze_facial_features(image_input):
    detected_boxes, detected_prob, detected_landmarks = mtcnn.detect(
        image_input, landmarks=True
    )
    if not mtcnn.keep_all:
        detected_boxes, detected_prob, detected_landmarks = mtcnn.select_boxes(
            detected_boxes,
            detected_prob,
            detected_landmarks,
            image_input,
            method=mtcnn.selection_method,
        )
    return detected_boxes, detected_landmarks


def ensure_even_dimension(dimension):
    return int(dimension) if (dimension % 2 == 0) else int(dimension + 1)


def calculate_image_dimensions(
    boxes, image, max_res=1_500_000, face_target=256, custom_ratio=0, scale_limit=2
):
    width, height = image.size
    scaling_factor = 2

    if (boxes is not None) and len(boxes) > 0:
        scaling_factor = face_target / max(boxes[0][2:] - boxes[0][:2])
        scaling_factor = min(scaling_factor, scale_limit)

    if custom_ratio > 0:
        scaling_factor = custom_ratio

    new_width = width * scaling_factor
    new_height = height * scaling_factor

    total_px = new_width * new_height
    if total_px > max_res:
        adjustment = pow(total_px / max_res, 1 / 2)
        new_width = int(new_width / adjustment)
        new_height = int(new_height / adjustment)

    final_width = ensure_even_dimension(int(new_width))
    final_height = ensure_even_dimension(int(new_height))

    return image.resize((final_width, final_height))


def optimize_image_size(
    input_image, max_res=1_500_000, face_target=256, custom_ratio=0, scale_limit=2
):
    detected_boxes, _ = analyze_facial_features(input_image)
    return calculate_image_dimensions(
        detected_boxes, input_image, max_res, face_target, custom_ratio, scale_limit
    )


means = [0.485, 0.456, 0.406]
stds = [0.229, 0.224, 0.225]

if torch.cuda.is_available():
    t_stds = torch.tensor(stds).cuda().half()[:, None, None]
    t_means = torch.tensor(means).cuda().half()[:, None, None]
else:
    t_stds = torch.tensor(stds).float()[:, None, None]
    t_means = torch.tensor(means).float()[:, None, None]

img_transforms = transforms.Compose(
    [transforms.ToTensor(), transforms.Normalize(means, stds)]
)


def transform_tensor_to_img(tensor_data):
    return (
        tensor_data.mul(t_stds).add(t_means).mul(255.0).clamp(0, 255).permute(1, 2, 0)
    )


def execute_transformation(input_path, model_path="ai_filter/filters/pretrained_models/pretrained_models/Arcane.jit"):
    transformer = torch.jit.load(model_path).eval().cuda().half()
    source_image = PIL.Image.open(input_path).convert("RGB")
    optimized_image = optimize_image_size(
        source_image, face_target=300, max_res=1_500_000, scale_limit=2
    )
    model_identifier = get_model_name(model_path)
    result_path = get_unique_output_path(input_path, "static", model_identifier)
    processed_tensor = img_transforms(optimized_image)[None, ...].cuda().half()

    with torch.no_grad():
        generated_output = transformer(processed_tensor)[0]
        final_img = transform_tensor_to_img(generated_output)
        output_array = final_img.detach().cpu().numpy().astype("uint8")
        result_img = PIL.Image.fromarray(output_array)
        result_img.save(result_path)

    return result_path


if __name__ == "__main__":
    model_path = "ai_filter/filters/pretrained_models/pretrained_models/Arcane.jit"
    input_image = "profile.jpeg"

    output_path = execute_transformation(input_image, model_path)
    print(f"Image saved to: {output_path}")
