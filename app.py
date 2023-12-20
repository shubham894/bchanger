from flask import Flask, request, jsonify, render_template, url_for
import requests
from werkzeug.utils import secure_filename
import os
import base64

app = Flask(__name__)

# Endpoint for rendering the HTML page
@app.route('/')
def index():
    return render_template('index.html')

# Endpoint to handle the upload and process the image
@app.route('/upload', methods=['POST'])
def upload():
    if 'image' in request.files:
        image_file = request.files['image']

        # Secure the filename
        filename = secure_filename(image_file.filename)

        # Temporary save the file to send it to the FastAPI server
        temp_path = os.path.join('temp', filename)
        image_file.save(temp_path)

        # URL of your FastAPI application
        fastapi_url = 'http://134.209.130.208/image_backgroung_remove'

        # Prepare the file in 'multipart/form-data' format
        files = {'img_file': (filename, open(temp_path, 'rb'), 'image/jpeg')}

        # Model type parameter (if needed, adjust accordingly)
        data = {'model_type': '1'}

        # Make the POST request to the FastAPI server
        response = requests.post(fastapi_url, files=files, data=data)

        if response.status_code == 200:
            # Assuming the response contains a base64-encoded image
            response_data = response.json()

            # Decode the base64 string back to an image
            imgdata = base64.b64decode(response_data['file_base64'])

            # Define path for output image
            output_path = os.path.join('static', 'output_image.png')

            # Write the resulting image to a file in static folder
            with open(output_path, 'wb') as f:
                f.write(imgdata)

            return jsonify({'processed_image': url_for('static', filename='output_image.png')})
        else:
            return jsonify({'error': 'Failed to process image'}), 500

    return jsonify({'error': 'No image uploaded'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0')
