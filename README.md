# Byte-Sized Secrets: Interactive Multi-Algorithm Encryption Tool

## Description

Byte-Sized Secrets is a web-based interactive tool that allows users to explore various classic cryptographic algorithms. It provides a user-friendly interface to encrypt plaintext using different ciphers and offers detailed, step-by-step walkthroughs of the encryption process for each algorithm, making complex cryptographic concepts accessible to beginners.

## Features

- **Multiple Algorithms:** Supports Caesar, Monoalphabetic, Playfair, Hill, Vigenere, One-Time Pad (OTP), and Columnar Transposition ciphers.
- **Interactive Encryption:** Encrypt plaintext with real-time output.
- **Detailed Walkthroughs:** Step-by-step explanations and visualizations for each algorithm, designed to be understandable for those new to cryptography.
- **Responsive Design:** Adapts to various screen sizes (desktops, laptops, tablets, mobile phones).
- **Custom Cursor:** A unique, cryptography-themed cursor for an enhanced user experience.
- **Dynamic Background Animation:** A subtle binary rain animation in the background.
- **About & Algorithms Pages:** Dedicated pages explaining cybersecurity basics and detailed descriptions of each implemented algorithm.

## Setup Instructions

### Prerequisites

- Python 3.x
- pip (Python package installer)

### Installation

1. **Clone the repository (or download the project files):**

   ```bash
   # If using Git
   git clone <repository_url>
   cd cns-app
   ```

   (If you downloaded a zip, extract it and navigate into the `cns-app` directory.)

2. **Install Python dependencies:**
   It's recommended to use a virtual environment to manage dependencies.

   ```bash
   python -m venv venv
   # On Windows
   .\venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

   Then install the required packages:

   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. **Ensure your virtual environment is activated** (as shown in the installation steps).
2. **Run the Flask application:**
   ```bash
   flask run
   ```
3. **Access the application:**
   Open your web browser and navigate to the address provided in your terminal (e.g., `http://127.0.0.1:5000/`).

## Usage

- Choose an encryption algorithm from the dropdown menu.  
- Type or paste your plaintext into the text area.  
- Adjust algorithm-specific settings (e.g., Caesar shift value, Vigenere keyword) as needed.  
- Click **Apply** to instantly view the ciphertext along with a detailed, step-by-step walkthrough of the encryption process.  
- Explore the **About** and **Algorithms** pages to learn more about cybersecurity fundamentals and the theory behind each cipher.  
