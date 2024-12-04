import matplotlib.pyplot as plt
import matplotlib.image as mpimg

def on_click(event):
    x, y = event.xdata, event.ydata
    if x is not None and y is not None:
        print(f"Clicked at coordinates: x={x}, y={y}")
    else:
        print("Click was outside the image bounds.")

image_path = 'input_path' 

img = mpimg.imread(image_path)
fig, ax = plt.subplots()
ax.imshow(img)
ax.set_title('Click on the image to get coordinates')

fig.canvas.mpl_connect('button_press_event', on_click)

plt.show()












