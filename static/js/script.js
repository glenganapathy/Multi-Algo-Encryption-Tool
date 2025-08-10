document.addEventListener('DOMContentLoaded', () => {
    const algorithmSelect = document.getElementById('algorithm');
    const plaintextInput = document.getElementById('plaintext');
    const algoInputsContainer = document.getElementById('algo-inputs');
    const applyBtn = document.getElementById('apply-btn');
    const downloadOtpBtn = document.getElementById('download-otp-btn');
    const ciphertextOutput = document.getElementById('ciphertext');
    const walkthroughOutput = document.getElementById('walkthrough');
    const aboutBtn = document.getElementById('about-btn');
    const algorithmsBtn = document.getElementById('algorithms-btn');

    aboutBtn.addEventListener('click', () => {
        window.location.href = '/about';
    });

    algorithmsBtn.addEventListener('click', () => {
        window.location.href = '/algorithms';
    });

    const updateAlgoInputs = () => {
        const algorithm = algorithmSelect.value;
        algoInputsContainer.innerHTML = '';
        downloadOtpBtn.style.display = 'none';
        ciphertextOutput.textContent = ''; // Clear ciphertext
        walkthroughOutput.innerHTML = ''; // Clear walkthrough

        if (algorithm === 'Caesar') {
            algoInputsContainer.innerHTML = `
                <div class="input-group">
                    <label for="shift">Shift</label>
                    <input type="number" id="shift" value="3">
                    <p>Shifts letters; non-letters preserved.</p>
                </div>`;
        } else if (algorithm === 'Mono') {
            algoInputsContainer.innerHTML = `
                <div class="input-group">
                    <label for="mono-map">Substitution Mapping (26 letters)</label>
                    <input type="text" id="mono-map" value="QWERTYUIOPASDFGHJKLZXCVBNM">
                    <button id="regenerate-mono">Random</button>
                </div>`;
            document.getElementById('regenerate-mono').addEventListener('click', () => {
                const letters = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
                for (let i = letters.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [letters[i], letters[j]] = [letters[j], letters[i]];
                }
                document.getElementById('mono-map').value = letters.join('');
            });
        } else if (algorithm === 'Playfair') {
            algoInputsContainer.innerHTML = `
                <div class="input-group">
                    <label for="play-key">Keyword (J→I)</label>
                    <input type="text" id="play-key" value="MONARCHY">
                    <p>Build 5×5 grid; digraphs operate on letters-only; padding shown in details.</p>
                </div>`;
        } else if (algorithm === 'Hill') {
            algoInputsContainer.innerHTML = `
                <div class="input-group">
                    <label for="hill-size">Matrix size</label>
                    <select id="hill-size">
                        <option value="2">2 × 2</option>
                        <option value="3">3 × 3</option>
                    </select>
                    <input type="hidden" id="hill-key" value="[[3,3],[2,5]]">
                    <button id="regenerate-hill">Generate Key</button>
                </div>`;
            document.getElementById('regenerate-hill').addEventListener('click', async () => {
                const size = document.getElementById('hill-size').value;
                const response = await fetch('/generate_hill_key', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ size })
                });
                const result = await response.json();
                document.getElementById('hill-key').value = JSON.stringify(result.key);
                const messageDiv = document.createElement('div');
                messageDiv.textContent = 'Key Generated Successfully!';
                messageDiv.style.color = '#4CAF50'; // Green color
                messageDiv.style.marginTop = '5px';
                messageDiv.style.fontSize = '0.8em';
                algoInputsContainer.appendChild(messageDiv);
                setTimeout(() => {
                    messageDiv.remove();
                }, 3000); // Remove message after 3 seconds
            });
        } else if (algorithm === 'Vigenere') {
            algoInputsContainer.innerHTML = `<div class="input-group">
                    <label for="vigenere-key">Key</label>
                    <input type="text" id="vigenere-key" value="LEMON">
                </div>`;
        } else if (algorithm === 'OTP') {
            algoInputsContainer.innerHTML = `<div class="input-group"><p>OTP uses secure random bytes; ciphertext & key shown in Base64 in the output panel.</p></div>`;
            downloadOtpBtn.style.display = 'inline-block';
        } else if (algorithm === 'Transposition') {
            algoInputsContainer.innerHTML = `
                <div class="input-group">
                    <label for="trans-key">Key (word for columns)</label>
                    <input type="text" id="trans-key" value="ZEBRAS">
                    <p>Columnar transposition uses full characters.</p>
                </div>`;
        }
    };

    const handleEncrypt = async () => {
        const algorithm = algorithmSelect.value;
        const plaintext = plaintextInput.value;
        let data = { algorithm, plaintext };

        if (algorithm === 'Caesar') {
            data.shift = document.getElementById('shift').value;
        } else if (algorithm === 'Mono') {
            data.monoMap = document.getElementById('mono-map').value;
        } else if (algorithm === 'Playfair') {
            data.playKey = document.getElementById('play-key').value;
        } else if (algorithm === 'Hill') {
            data.hillKey = document.getElementById('hill-key').value;
        } else if (algorithm === 'Vigenere') {
            data.vigenereKey = document.getElementById('vigenere-key').value;
        } else if (algorithm === 'Transposition') {
            data.transKey = document.getElementById('trans-key').value;
        } else if (algorithm === 'OTP') {
            handleOtpEncrypt();
            return;
        }

        const response = await fetch('/encrypt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        ciphertextOutput.textContent = result.cipher;
        walkthroughOutput.innerHTML = formatWalkthrough(algorithm, result);
    };

    const handleOtpEncrypt = () => {
        const encoder = new TextEncoder();
        const ptBytes = encoder.encode(plaintextInput.value);
        const keyBytes = new Uint8Array(ptBytes.length);
        crypto.getRandomValues(keyBytes);
        const ctBytes = new Uint8Array(ptBytes.length);
        for (let i = 0; i < ptBytes.length; i++) {
            ctBytes[i] = ptBytes[i] ^ keyBytes[i];
        }

        const toBase64 = (uint8) => {
            let binary = '';
            for (let i = 0; i < uint8.length; i++) {
                binary += String.fromCharCode(uint8[i]);
            }
            return btoa(binary);
        };

        const cipherB64 = toBase64(ctBytes);
        const keyB64 = toBase64(keyBytes);

        ciphertextOutput.textContent = cipherB64;
        walkthroughOutput.innerHTML = `
            <p><strong>One-Time Pad (Base64)</strong></p>
            <p>The One-Time Pad (OTP) is a theoretically unbreakable cipher. It requires a pre-shared random key of the same length as the message. The key is used only once.</p>
            <p><strong>Encryption:</strong></p>
            <ol>
                <li>Convert the plaintext and the key to bytes.</li>
                <li>XOR the plaintext bytes with the key bytes to produce the ciphertext bytes.</li>
                <li>Encode the ciphertext and key in Base64 for easy display.</li>
            </ol>
            <div>Ciphertext (Base64): <code>${cipherB64}</code></div>
            <div>Key (Base64): <code>${keyB64}</code></div>`;

        downloadOtpBtn.onclick = () => {
            const blob = new Blob([`key:${keyB64}\nct:${cipherB64}`], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'otp_key_and_cipher.txt';
            a.click();
            URL.revokeObjectURL(url);
        };
    };

    const formatWalkthrough = (algorithm, result) => {
        if (!result) return '';
        let html = `<p class="font-semibold"><strong>${algorithm}</strong></p>`;
        const { details, cipher } = result;
        if (!details) return html;

        if (algorithm === 'Caesar') {
            html += `<p>The Caesar cipher is a simple substitution cipher where each letter is shifted by a fixed number of positions down the alphabet. For example, with a shift of 3, A would be replaced by D, B would become E, and so on.</p>`
            html += `<p><strong>Shift:</strong> ${details.shift}</p>`
            html += `<ol class="list-decimal ml-5 mt-2">`;
            html += `<li><strong>Plaintext:</strong> ${details.plaintext}</li>`;
            html += `<li>The plaintext is converted to uppercase and only letters are shifted.</li>`;
            html += `<li>Each letter is shifted by ${details.shift} positions. For example, 'A' becomes '${String.fromCharCode(65 + details.shift)}'.</li>`;
            html += `<li><strong>Ciphertext:</strong> ${cipher}</li>`;
            html += `</ol>`;
        } else if (algorithm === 'Mono') {
            html += `<p>A monoalphabetic substitution cipher uses a fixed substitution alphabet for the entire message. Each letter in the plaintext is mapped to a corresponding letter in the substitution alphabet.</p>`;
            html += `<p class="mt-2"><strong>Mapping:</strong></p><p><code>ABCDEFGHIJKLMNOPQRSTUVWXYZ</code></p><p><code>${details.mapping}</code></p>`;
            html += `<p class="mt-2"><strong>Example:</strong></p>`;
            html += `<ol class="list-decimal ml-5 mt-2">`;
            html += `<li><strong>Plaintext:</strong> ${details.plaintext}</li>`;
            html += `<li>Each letter in the plaintext is replaced by its corresponding letter in the mapping. For example, 'A' is replaced by '${details.mapping[0]}'.</li>`;
            html += `<li><strong>Ciphertext:</strong> ${cipher}</li>`;
            html += `</ol>`;
        } else if (algorithm === 'Playfair') {
            const { grid, pairs, keyword, letters_only } = details;
            html += `<p>The Playfair cipher is a digraph substitution cipher, meaning it encrypts pairs of letters. It uses a 5x5 grid constructed from a keyword.</p>`;
            html += `<p><strong>Keyword:</strong> ${keyword}</p>`;
            html += `<div class="mt-3">
`;
            html += `<p><strong>1. Create the 5x5 Grid:</strong> The grid is filled with the unique letters of the keyword, followed by the remaining letters of the alphabet (with J omitted and replaced by I).</p>`;
            html += `<div class="grid-5x5">${grid.flat().map(c => `<div>${c}</div>`).join('')}</div>`;
            html += `<p><strong>2. Prepare the Plaintext:</strong> The plaintext is converted to uppercase, and any 'J's are replaced with 'I's. The letters are then grouped into pairs. If a pair has two identical letters, an 'X' is inserted between them. If the total number of letters is odd, an 'X' is appended to the end.</p>`;
            html += `<div class="mb-2 text-sm">Letters-only: <code class="bg-black p-1 rounded">${letters_only || '[none]'}</code></div>`;
            html += `<div class="mb-2">Digraphs: <code class="bg-black p-1 rounded">${(pairs||[]).map(p=>p.join('')).join(' ')}</code></div>`;
            html += `<p><strong>3. Encrypt the Digraphs:</strong></p>`;
            html += `<ul>`;
            html += `<li>If the letters in a pair are in the same row of the grid, they are replaced by the letters to their immediate right (wrapping around if necessary).</li>`;
            html += `<li>If the letters in a pair are in the same column, they are replaced by the letters immediately below them (wrapping around if necessary).</li>`;
            html += `<li>If the letters are in different rows and columns, they are replaced by the letters on the same row respectively but at the other pair of corners of the rectangle defined by the original pair.</li>`;
            html += `</ul>`;
            html += `<div>Letters-only cipher: <code class="bg-black p-1 rounded">${details.cipher}</code></div>`;
            html += `<div class="mt-2">Merged back into original positions: <strong>${cipher}</strong></div>`;
            html += `</div>`;
        } else if (algorithm === 'Hill') {
            const { steps, key_matrix, letters_only } = details;
            html += `<p>The Hill cipher is a polygraphic substitution cipher based on linear algebra. It encrypts blocks of letters using matrix multiplication.</p>`;
            html += `<p><strong>Key Matrix (${key_matrix.length}×${key_matrix.length}):</strong></p>`;
            html += `<div class="matrix">${key_matrix.map(row => `<div class="matrix-row">${row.map(val => `<div>${val}</div>`).join('')}</div>`).join('')}</div>`;
            html += `<div class="mt-3">
`;
            html += `<p><strong>1. Prepare the Plaintext:</strong> The plaintext is converted to uppercase and divided into blocks of size ${key_matrix.length}. If the last block is not full, it is padded with 'X's.</p>`;
            html += `<div class="mb-2">Letters-only: <code class="bg-black p-1 rounded">${letters_only || '[none]'}</code></div>`;
            html += `<p><strong>2. Encrypt Blocks:</strong> Each block of letters is converted into a vector of numbers (A=0, B=1, ...). This vector is then multiplied by the key matrix, and the result is taken modulo 26. The resulting vector is converted back to letters.</p>`;
            steps.forEach(step => {
                html += `<div>Block: <code>${step.block}</code> → <code>${step.result}</code> (Numeric: ${step.numeric.join(', ')})</div>`;
            });
            html += `<div class="mb-2">Padded cipher (letters-only): <code class="bg-black p-1 rounded">${details.cipher}</code></div>`;
            html += `<div class="mt-2">Merged: <strong>${cipher}</strong></div>`;
            html += `</div>`;
        } else if (algorithm === 'Vigenere') {
            html += `<p>The Vigenère cipher is a polyalphabetic substitution cipher that uses a keyword to shift each letter of the plaintext by a different amount. The key is repeated as many times as necessary to match the length of the plaintext.</p>`;
            html += `<p><strong>Key:</strong> ${details.key}</p>`;
            html += `<p class="mt-2"><strong>Example:</strong></p>`;
            html += `<ol class="list-decimal ml-5 mt-2">`;
            html += `<li><strong>Plaintext:</strong> ${details.plaintext}</li>`;
            html += `<li>For each letter in the plaintext, a corresponding letter from the key is used to determine the shift amount (A=0, B=1, ...).</li>`;
            html += `<li><strong>Ciphertext:</strong> ${cipher}</li>`;
            html += `</ol>`;
        } else if (algorithm === 'Transposition') {
            const { grid, order, key } = details;
            html += `<p>The Columnar Transposition cipher is a transposition cipher that rearranges the letters of the plaintext based on a keyword. The plaintext is written into a grid, and the columns are read out in an order determined by the alphabetical order of the characters in the key.</p>`;
            html += `<p><strong>Key:</strong> ${key}</p>`;
            html += `<div class="mt-2">
`;
            html += `<p><strong>1. Create the Grid:</strong> The plaintext is written into a grid with a number of columns equal to the length of the key.</p>`;
            html += `<div class="grid">${grid.map(row => `<div class="grid-row">${row.map(val => `<div>${val}</div>`).join('')}</div>`).join('')}</div>`;
            html += `<p><strong>2. Determine the Column Order:</strong> The columns are ordered based on the alphabetical order of the characters in the key.</p>`;
            html += `<div>Order: ${order.join(', ')}</div>`;
            html += `<p><strong>3. Read the Ciphertext:</strong> The ciphertext is read by reading the characters in each column, starting from the first column in the determined order.</p>`;
            html += `<div>Cipher: <code class="bg-black p-1 rounded">${cipher}</code></div>`;
            html += `</div>`;
        }
        return html;
    };

    algorithmSelect.addEventListener('change', updateAlgoInputs);
    applyBtn.addEventListener('click', handleEncrypt);

    updateAlgoInputs();

    // Background animation
    const backgroundAnimationContainer = document.querySelector('.background-animation');
    if (backgroundAnimationContainer) {
        const numChars = 100;
        const charPool = ['0', '1'];

        for (let i = 0; i < numChars; i++) {
            const char = document.createElement('span');
            char.classList.add('binary-char');
            char.textContent = charPool[Math.floor(Math.random() * charPool.length)];
            char.style.left = `${Math.random() * 100}vw`;
            char.style.animationDuration = `${Math.random() * 5 + 5}s`; // 5-10 seconds
            char.style.animationDelay = `${Math.random() * 5}s`; // 0-5 seconds delay
            backgroundAnimationContainer.appendChild(char);
        }
    }
});