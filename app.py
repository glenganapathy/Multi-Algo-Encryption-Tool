
from flask import Flask, render_template, request, jsonify
from utils import helpers

app = Flask(__name__, template_folder='templates', static_folder='static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/algorithms')
def algorithms():
    return render_template('algorithms.html')

@app.route('/encrypt', methods=['POST'])
def encrypt():
    data = request.get_json()
    plaintext = data.get('plaintext')
    algorithm = data.get('algorithm')

    if algorithm == 'Caesar':
        shift = int(data.get('shift', 3))
        cipher = helpers.caesar_preserve(plaintext, shift)
        return jsonify({'cipher': cipher, 'details': {'shift': shift, 'plaintext': plaintext}})

    elif algorithm == 'Mono':
        mapping = data.get('monoMap', helpers.random_monoalphabetic())
        cipher = helpers.mono_preserve(plaintext, mapping)
        return jsonify({'cipher': cipher, 'details': {'mapping': mapping, 'plaintext': plaintext}})

    elif algorithm == 'Playfair':
        keyword = data.get('playKey', 'KEY')
        letters_only = helpers.only_letters_upper(plaintext).replace('J', 'I')
        result = helpers.transform_letters_sequence_preserve(plaintext, lambda lo: helpers.playfair_encrypt_letters_only(lo, keyword))
        result['details']['plaintext'] = plaintext
        result['details']['keyword'] = keyword
        result['details']['letters_only'] = letters_only
        return jsonify(result)

    elif algorithm == 'Hill':
        key_matrix_str = data.get('hillKey', '[[3,3],[2,5]]')
        key_matrix = eval(key_matrix_str) # Be cautious with eval
        letters_only = helpers.only_letters_upper(plaintext)
        result = helpers.transform_letters_sequence_preserve(plaintext, lambda lo: helpers.hill_encrypt_letters_only(lo, key_matrix))
        result['details']['key_matrix'] = key_matrix
        result['details']['plaintext'] = plaintext
        result['details']['letters_only'] = letters_only
        return jsonify(result)

    elif algorithm == 'Vigenere':
        key = data.get('vigenereKey', 'LEMON')
        cipher = helpers.vigenere_preserve(plaintext, key)
        return jsonify({'cipher': cipher, 'details': {'key': key, 'plaintext': plaintext}})

    elif algorithm == 'Transposition':
        key = data.get('transKey', 'ZEBRAS')
        result = helpers.columnar_encrypt_full(plaintext, key)
        return jsonify({'cipher': result['cipher'], 'details': result})

    return jsonify({'error': 'Invalid algorithm'}), 400

@app.route('/generate_hill_key', methods=['POST'])
def generate_hill_key():
    data = request.get_json()
    size = int(data.get('size', 2))
    key = helpers.generate_invertible_matrix(size)
    return jsonify({'key': key})

if __name__ == '__main__':
    app.run(debug=True)
