import os
import pprint
import sys

import matplotlib.pyplot as plt
import numpy as np
import scipy.io
import scipy.misc
import tensorflow as tf
import tensorflow_hub as hub
from matplotlib.pyplot import imshow
from PIL import Image
from tensorflow.python.framework.ops import EagerTensor


class NeuralStyleTransfer:
    def __init__(self, model_path=None):
        self.img_size = 400
        self.pp = pprint.PrettyPrinter(indent=4)
        self.model_path = model_path
        self.vgg = self._load_vgg_model()
        self.content_image = None
        self.style_image = None
        self.generated_image = None
        self.optimizer = tf.keras.optimizers.Adam(
            learning_rate=0.02, beta_1=0.99, epsilon=1e-1
        )

    def _load_vgg_model(self):
        vgg = tf.keras.applications.VGG19(
            include_top=False,
            input_shape=(self.img_size, self.img_size, 3),
            weights="imagenet",
        )
        vgg.trainable = False
        return vgg

    def compute_content_cost(self, content_output, generated_output):
        """
        Computes the content cost

        Arguments:
        a_C -- tensor of dimension (1, n_H, n_W, n_C), hidden layer activations representing content of the image C
        a_G -- tensor of dimension (1, n_H, n_W, n_C), hidden layer activations representing content of the image G

        Returns:
        J_content -- scalar that you compute using equation 1 above.
        """
        a_C = content_output[-1]
        a_G = generated_output[-1]
        m, n_H, n_W, n_C = a_G.get_shape().as_list()
        a_C_unrolled = tf.reshape(a_C, shape=[m, -1, n_C])
        a_G_unrolled = tf.reshape(a_G, shape=[m, -1, n_C])
        return tf.reduce_sum(tf.square(tf.subtract(a_C_unrolled, a_G_unrolled))) / (
            4.0 * n_H * n_C * n_W
        )

    def gram_matrix(self, A):
        """
        Argument:
        A -- matrix of shape (n_C, n_H*n_W)

        Returns:
        GA -- Gram matrix of A, of shape (n_C, n_C)
        """
        return tf.matmul(A, tf.transpose(A))

    def compute_layer_style_cost(self, a_S, a_G):
        """
        Arguments:
        a_S -- tensor of dimension (1, n_H, n_W, n_C), hidden layer activations representing style of the image S
        a_G -- tensor of dimension (1, n_H, n_W, n_C), hidden layer activations representing style of the image G

        Returns:
        J_style_layer -- tensor representing a scalar value, style cost defined above by equation (2)
        """
        m, n_H, n_W, n_C = a_G.get_shape().as_list()
        a_S = tf.transpose(tf.reshape(a_S, shape=[-1, n_C]))
        a_G = tf.transpose(tf.reshape(a_G, shape=[-1, n_C]))
        GS = self.gram_matrix(a_S)
        GG = self.gram_matrix(a_G)
        return tf.reduce_sum(tf.square(GS - GG)) / (4.0 * ((n_C * n_H * n_W) ** 2))

    def compute_style_cost(
        self, style_image_output, generated_image_output, STYLE_LAYERS
    ):
        """
        Computes the overall style cost from several chosen layers

        Arguments:
        style_image_output -- our tensorflow model
        generated_image_output --
        STYLE_LAYERS -- A python list containing:
                            - the names of the layers we would like to extract style from
                            - a coefficient for each of them

        Returns:
        J_style -- tensor representing a scalar value, style cost defined above by equation (2)
        """
        J_style = 0
        a_S = style_image_output[:-1]
        a_G = generated_image_output[:-1]
        for i, weight in zip(range(len(a_S)), STYLE_LAYERS):
            J_style_layer = self.compute_layer_style_cost(a_S[i], a_G[i])
            J_style += weight[1] * J_style_layer
        return J_style

    @tf.function()
    def total_cost(self, J_content, J_style, alpha=10, beta=40):
        """
        Computes the total cost function

        Arguments:
        J_content -- content cost coded above
        J_style -- style cost coded above
        alpha -- hyperparameter weighting the importance of the content cost
        beta -- hyperparameter weighting the importance of the style cost

        Returns:
        J -- total cost as defined by the formula above.
        """
        return alpha * J_content + beta * J_style

    def get_layer_outputs(self, vgg, layer_names):
        """Creates a vgg model that returns a list of intermediate output values."""
        outputs = [vgg.get_layer(layer[0]).output for layer in layer_names]
        return tf.keras.Model([vgg.input], outputs)

    def load_and_preprocess_images(self, content_image_path, style_image_path):
        self.content_image = tf.constant(
            np.reshape(
                np.array(
                    Image.open(content_image_path).resize(
                        (self.img_size, self.img_size)
                    )
                ),
                ((1,) + (self.img_size, self.img_size, 3)),
            )
        )
        self.style_image = tf.constant(
            np.reshape(
                np.array(
                    Image.open(style_image_path).resize((self.img_size, self.img_size))
                ),
                ((1,) + (self.img_size, self.img_size, 3)),
            )
        )
        self.generated_image = tf.Variable(
            tf.image.convert_image_dtype(self.content_image, tf.float32)
        )
        noise = tf.random.uniform(tf.shape(self.generated_image), -0.25, 0.25)
        self.generated_image = tf.add(self.generated_image, noise)
        self.generated_image = tf.clip_by_value(
            self.generated_image, clip_value_min=0.0, clip_value_max=1.0
        )

    def setup_gpu(self):
        physical_devices = tf.config.list_physical_devices("GPU")
        if physical_devices:
            tf.config.experimental.set_memory_growth(physical_devices[0], True)

    def get_layer_outputs(self, layer_names):
        outputs = [self.vgg.get_layer(layer[0]).output for layer in layer_names]
        return tf.keras.Model([self.vgg.input], outputs)

    def set_content_and_style_targets(self):
        vgg_model_outputs = self.get_layer_outputs(
            self.STYLE_LAYERS + self.content_layer
        )
        self.content_targets = vgg_model_outputs(self.content_image)
        self.style_targets = vgg_model_outputs(self.style_image)
        self.a_C = vgg_model_outputs(
            tf.Variable(tf.image.convert_image_dtype(self.content_image, tf.float32))
        )
        self.a_S = vgg_model_outputs(
            tf.Variable(tf.image.convert_image_dtype(self.style_image, tf.float32))
        )

    def clip_0_1(self, image):
        """
        Truncate all the pixels in the tensor to be between 0 and 1

        Arguments:
        image -- Tensor
        J_style -- style cost coded above

        Returns:
        Tensor
        """
        return tf.clip_by_value(image, clip_value_min=0.0, clip_value_max=1.0)

    def tensor_to_image(self, tensor):
        """
        Converts the given tensor into a PIL image

        Arguments:
        tensor -- Tensor

        Returns:
        Image: A PIL image
        """
        tensor = tensor * 255
        tensor = np.array(tensor, dtype=np.uint8)
        if np.ndim(tensor) > 3:
            assert tensor.shape[0] == 1
            tensor = tensor[0]
        return Image.fromarray(tensor)

    @tf.function()
    def train_step(self):
        with tf.GradientTape() as tape:
            a_G = self.vgg_model_outputs(self.generated_image)
            J_style = self.compute_style_cost(self.a_S, a_G)
            J_content = self.compute_content_cost(self.a_C, a_G)
            J = self.total_cost(J_content, J_style)
        grad = tape.gradient(J, self.generated_image)
        self.optimizer.apply_gradients([(grad, self.generated_image)])
        self.generated_image.assign(self.clip_0_1(self.generated_image))
        return J

    def train(self, epochs=10, save_interval=250):
        for i in range(epochs):
            cost = self.train_step()

            if i % save_interval == 0:
                tf.print(f"Epoch {i}, Cost: {cost}")
                image = self.tensor_to_image(self.generated_image)
                image.save(f"output/image_{i}.jpg")

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


if __name__ == "__main__":
    model_path = "https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2"
    content_image_path = r"./test-5.jpg"
    style_image_path = r"./logo.jpeg"
    nst = NeuralStyleTransfer(model_path=model_path)
    img = nst.stylize_image(content_image_path, style_image_path)
    plt.imsave("output.jpg", img)
    plt.imshow(img)
    plt.show()
