from flask import Flask, render_template, request, send_file
from flask_socketio import SocketIO, emit
from PIL import Image
from io import BytesIO
from os import path
import cv2
import numpy as np
import onnxruntime as ort

app = Flask(__name__)
socketio = SocketIO(app)

model_path = path.join(path.dirname(__file__), 'models', 'silueta.onnx')
session = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])

def remove_bg(img: Image.Image):
    img = img.convert("RGB")
    arr = np.array(img)
    h, w, _ = arr.shape
    resized = cv2.resize(arr, (320, 320))  
    
    normalized = resized / 255.0
    input_blob = np.transpose(normalized, (2, 0, 1))[np.newaxis, :, :, :].astype(np.float32)
    
    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name
    pred = session.run([output_name], {input_name: input_blob})[0][0][0]

    mask = cv2.resize(pred, (w, h))
    mask = (mask * 255).astype(np.uint8)

    rgba = cv2.cvtColor(arr, cv2.COLOR_RGB2RGBA)
    rgba[:, :, 3] = mask
    output = Image.fromarray(rgba)
    return output

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            return 'No file uploaded', 400

        file = request.files['file']
        
        if file.filename == '':
            return 'No selected file', 400

        if file:
            socketio.emit('processing_status', {'status': 'Processing started'})
            
            input_image = Image.open(file.stream)
            output_image = remove_bg(input_image)
            
            img_io = BytesIO()
            output_image.save(img_io, 'PNG')
            img_io.seek(0)
            
            socketio.emit('processing_status', {'status': 'Processing completed'})
            
            filename = file.filename if file.filename is not None else "uploaded"
            return send_file(img_io, mimetype='image/png', as_attachment=True, download_name=f'{path.splitext(filename)[0]}_transparent_EraceIt.png')
    
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/privacy-policy')
def privacy_policy():
    return render_template('privacy-policy.html')

@app.route('/terms-and-conditions')
def terms_conditions():
    return render_template('terms-conditions.html')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=10000, debug=True)