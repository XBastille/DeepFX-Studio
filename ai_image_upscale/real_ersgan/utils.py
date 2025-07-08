import itertools

import numpy as np


def extend_edges(source_img, extension_size):
    dims = source_img.shape
    height, width = dims[:2]
    extended = np.zeros(
        [height + extension_size * 2, width + extension_size * 2, dims[2]]
    ).astype(np.uint8)
    extended[
        extension_size:-extension_size, extension_size:-extension_size, :
    ] = source_img

    extended[0:extension_size, extension_size:-extension_size, :] = np.flip(
        source_img[0:extension_size, :, :], axis=0
    )
    extended[-extension_size:, extension_size:-extension_size, :] = np.flip(
        source_img[-extension_size:, :, :], axis=0
    )
    extended[:, 0:extension_size, :] = np.flip(
        extended[:, extension_size : extension_size * 2, :], axis=1
    )
    extended[:, -extension_size:, :] = np.flip(
        extended[:, -extension_size * 2 : -extension_size, :], axis=1
    )

    return extended


def remove_padding(source_img, padding_amount):
    return source_img[padding_amount:-padding_amount, padding_amount:-padding_amount, :]


def normalize_array(img_data, expand=True):
    """
    Normalizes image data to range [0,1] and optionally adds batch dimension.

    Arguments:
    img_data -- input image array with values in range [0,255]
    expand -- if True, adds batch dimension at axis 0

    Returns:
    normalized -- normalized float array with values in range [0,1]
    """
    normalized = img_data / 255.0
    if expand:
        normalized = np.expand_dims(normalized, axis=0)
    return normalized


def denormalize_tensor(tensor_output):
    """
    Converts normalized tensor output back to uint8 image format.

    Arguments:
    tensor_output -- normalized tensor with values in range [0,1]

    Returns:
    image -- uint8 image array with values in range [0,255]
    """
    processed = tensor_output.clip(0, 1) * 255
    return np.uint8(processed)


def add_padding(patch_data, padding_width, channels_last=True):
    """
    Adds edge padding to image patches.

    Arguments:
    patch_data -- input image or patch array
    padding_width -- width of padding to add on each side
    channels_last -- if True, expects channels in last dimension

    Returns:
    padded -- padded array with edge padding
    """
    if channels_last:
        return np.pad(
            patch_data,
            ((padding_width, padding_width), (padding_width, padding_width), (0, 0)),
            "edge",
        )
    return np.pad(
        patch_data,
        ((0, 0), (padding_width, padding_width), (padding_width, padding_width)),
        "edge",
    )


def remove_patch_padding(patch_collection, padding_width):
    return patch_collection[
        :, padding_width:-padding_width, padding_width:-padding_width, :
    ]


def create_overlapping_patches(source_array, patch_dims, overlap_size=2):
    """
    Divides image into overlapping patches for processing.

    Arguments:
    source_array -- input image array
    patch_dims -- dimensions of each patch
    overlap_size -- size of overlap between patches

    Returns:
    patches -- array of overlapping image patches
    padded_shape -- shape of padded intermediate image
    """
    max_x, max_y, _ = source_array.shape
    x_remainder = max_x % patch_dims
    y_remainder = max_y % patch_dims

    x_extension = (patch_dims - x_remainder) % patch_dims
    y_extension = (patch_dims - y_remainder) % patch_dims

    extended = np.pad(
        source_array, ((0, x_extension), (0, y_extension), (0, 0)), "edge"
    )
    padded = add_padding(extended, overlap_size, channels_last=True)

    max_x, max_y, _ = padded.shape
    patches = []

    x_starts = range(overlap_size, max_x - overlap_size, patch_dims)
    y_starts = range(overlap_size, max_y - overlap_size, patch_dims)

    for x, y in itertools.product(x_starts, y_starts):
        x_start = x - overlap_size
        y_start = y - overlap_size
        x_end = x + patch_dims + overlap_size
        y_end = y + patch_dims + overlap_size
        patch = padded[x_start:x_end, y_start:y_end, :]
        patches.append(patch)

    return np.array(patches), padded.shape


def reconstruct_from_patches(patches, padded_shape, target_dims, overlap_size=4):
    """
    Reconstructs full image from processed overlapping patches.

    Arguments:
    patches -- array of processed image patches
    padded_shape -- shape of padded intermediate image
    target_dims -- final target dimensions of output
    overlap_size -- size of overlap between patches

    Returns:
    reconstructed -- reconstructed full image array
    """
    max_x, max_y, _ = padded_shape
    unpadded_patches = remove_patch_padding(patches, overlap_size)
    patch_dims = unpadded_patches.shape[1]
    patches_per_row = max_y // patch_dims

    reconstructed = np.zeros((max_x, max_y, 3))

    current_row = -1
    current_col = 0

    for idx in range(len(patches)):
        if idx % patches_per_row == 0:
            current_row += 1
            current_col = 0
        reconstructed[
            current_row * patch_dims : (current_row + 1) * patch_dims,
            current_col * patch_dims : (current_col + 1) * patch_dims,
            :,
        ] = unpadded_patches[idx]
        current_col += 1

    return reconstructed[0 : target_dims[0], 0 : target_dims[1], :]
