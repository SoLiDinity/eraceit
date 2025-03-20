from flask import Flask, render_template, request, send_file
from flask_socketio import SocketIO, emit
from rembg import remove
from PIL import Image
from io import BytesIO
from os import path

app = Flask(__name__)
socketio = SocketIO(app)

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
            output_image = remove(input_image, post_process_mask=True)
            
            img_io = BytesIO()
            output_image.save(img_io, 'PNG')
            img_io.seek(0)
            
            socketio.emit('processing_status', {'status': 'Processing completed'})
            
            return send_file(img_io, mimetype='image/png', as_attachment=True, download_name=f'{path.splitext(file.filename)[0]}_transparent_EraceIt.png')
    
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
    app.run()