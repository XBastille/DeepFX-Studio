import cv2
import numpy as np
from pathlib import Path

def create_manual_mask(input_img, output_dir):
    img = cv2.imread(input_img)
    mask = np.zeros(img.shape[:2], dtype=np.uint8)
    
    def draw_mask(event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            cv2.circle(mask, (x,y), 3, 255, -1)
        elif event == cv2.EVENT_MOUSEMOVE and flags & cv2.EVENT_FLAG_LBUTTON:
            cv2.circle(mask, (x,y), 3, 255, -1)
    
    window_name = "Draw Mask (Draw with left mouse button, 's' to save, 'q' to quit)"
    cv2.namedWindow(window_name)
    cv2.setMouseCallback(window_name, draw_mask)
    
    while True:
        display = img.copy()
        display[mask == 255] = [0, 0, 255]
        cv2.imshow(window_name, display)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('s'):
            img_stem = Path(input_img).stem
            out_dir = Path(output_dir) / img_stem
            out_dir.mkdir(parents=True, exist_ok=True)
            cv2.imwrite(str(out_dir / "mask_0.png"), mask)
            break
        elif key == ord('q'):
            break
    
    cv2.destroyAllWindows()

if __name__ == "__main__":
    input_img = "input_path"
    output_dir = "./results"
    create_manual_mask(input_img, output_dir)
