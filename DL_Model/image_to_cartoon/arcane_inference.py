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


def detect(img):
    batch_boxes, batch_probs, batch_points = mtcnn.detect(img, landmarks=True)
    if not mtcnn.keep_all:
        batch_boxes, batch_probs, batch_points = mtcnn.select_boxes(
            batch_boxes, batch_probs, batch_points, img, method=mtcnn.selection_method
        )
    return batch_boxes, batch_points


def makeEven(_x):
    return int(_x) if (_x % 2 == 0) else int(_x + 1)


def scale(
    boxes, _img, max_res=1_500_000, target_face=256, fixed_ratio=0, max_upscale=2
):
    x, y = _img.size
    ratio = 2

    if (boxes is not None) and len(boxes) > 0:
        ratio = target_face / max(boxes[0][2:] - boxes[0][:2])
        ratio = min(ratio, max_upscale)

    if fixed_ratio > 0:
        ratio = fixed_ratio

    x *= ratio
    y *= ratio

    res = x * y
    if res > max_res:
        ratio = pow(res / max_res, 1 / 2)
        x = int(x / ratio)
        y = int(y / ratio)

    x = makeEven(int(x))
    y = makeEven(int(y))

    return _img.resize((x, y))


def scale_by_face_size(
    _img, max_res=1_500_000, target_face=256, fix_ratio=0, max_upscale=2
):
    boxes, _ = detect(_img)
    return scale(boxes, _img, max_res, target_face, fix_ratio, max_upscale)


means = [0.485, 0.456, 0.406]
stds = [0.229, 0.224, 0.225]
t_stds = torch.tensor(stds).cuda().half()[:, None, None]
t_means = torch.tensor(means).cuda().half()[:, None, None]

img_transforms = transforms.Compose(
    [transforms.ToTensor(), transforms.Normalize(means, stds)]
)


def tensor2im(var):
    return var.mul(t_stds).add(t_means).mul(255.0).clamp(0, 255).permute(1, 2, 0)


def process_image(input_path, model_path):
    model = torch.jit.load(model_path).eval().cuda().half()

    input_image = PIL.Image.open(input_path).convert("RGB")
    input_image = scale_by_face_size(
        input_image, target_face=300, max_res=1_500_000, max_upscale=2
    )

    model_name = get_model_name(model_path)
    output_path = get_unique_output_path(input_path, "outputs", model_name)

    transformed_image = img_transforms(input_image)[None, ...].cuda().half()

    with torch.no_grad():
        result_image = model(transformed_image)[0]
        output_image = tensor2im(result_image)
        output_image = output_image.detach().cpu().numpy().astype("uint8")
        output_image = PIL.Image.fromarray(output_image)
        output_image.save(output_path)

    return output_path


if __name__ == "__main__":
    model_path = "models/ArcaneGANv0.4.jit"
    input_image = "inputs/image_name"

    output_path = process_image(input_image, model_path)
    print(f"Image saved to: {output_path}")
