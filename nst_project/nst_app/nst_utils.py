import numpy as np
import tensorflow as tf
import tensorflow_hub as hub
import matplotlib.pyplot as plt
from PIL import Image

class NeuralStyleTransfer:
    def __init__(self, model_path=None):
        self.model_path = model_path
    
    def stylize_image(self, content_image_path, style_image_path):
        content_image = plt.imread(content_image_path)
        style_image = plt.imread(style_image_path)

        content_image = content_image.astype(np.float32)[np.newaxis, ...] / 255.0
        style_image = style_image.astype(np.float32)[np.newaxis, ...] / 255.0
        style_image = tf.image.resize(style_image, (256, 256))

        hub_module = hub.load(self.model_path)

        outputs = hub_module(tf.constant(content_image), tf.constant(style_image))
        stylized_image = outputs[0]

        stylized_image = np.array(stylized_image)
        stylized_image = stylized_image.reshape(
            stylized_image.shape[1], stylized_image.shape[2], stylized_image.shape[3]
        )
        
        return stylized_image