
import random
import re
import math

A_CODE = ord('A')

def is_letter(ch):
    return bool(re.match(r'[a-zA-Z]', ch))

def mod(n, m):
    return ((n % m) + m) % m

def only_letters_upper(s):
    return re.sub(r'[^A-Z]', '', s.upper())

def egcd(a, b):
    if b == 0:
        return (a, 1, 0)
    g, x1, y1 = egcd(b, a % b)
    return (g, y1, x1 - (a // b) * y1)

def mod_inv(a, m):
    g, x, _ = egcd(a, m)
    if g != 1 and g != -1:
        return None
    return ((x % m) + m) % m

def transform_per_letter_preserve(text, transform_fn):
    out = ""
    letter_index = 0
    for char in text:
        if not is_letter(char):
            out += char
            continue
        is_lower = char.islower()
        upper = char.upper()
        transformed_upper = transform_fn(upper, letter_index)
        letter_index += 1
        out += transformed_upper.lower() if is_lower else transformed_upper
    return out

def transform_letters_sequence_preserve(original_text, transform_sequence_fn):
    letters = [char.upper() for char in original_text if is_letter(char)]
    transformed = transform_sequence_fn("".join(letters))
    cipher_letters = list(transformed.get('cipher', ''))
    out = ""
    idx = 0
    for char in original_text:
        if not is_letter(char):
            out += char
            continue
        if idx < len(cipher_letters):
            c = cipher_letters[idx]
            idx += 1
            out += c.lower() if char.islower() else c
        else:
            out += char
    leftover = "".join(cipher_letters[idx:])
    return {"cipher": out + (f" [PAD:{leftover}]" if leftover else ""), "details": transformed}

def caesar_preserve(text, shift):
    return transform_per_letter_preserve(text, lambda upper, _: chr(A_CODE + mod(ord(upper) - A_CODE + shift, 26)))

def random_monoalphabetic():
    letters = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    random.shuffle(letters)
    return "".join(letters)

def mono_preserve(text, mapping):
    map_upper = mapping.upper()
    if len(map_upper) != 26:
        return text
    return transform_per_letter_preserve(text, lambda upper, _: map_upper[ord(upper) - A_CODE])

def make_playfair_grid(keyword="KEY"):
    key = only_letters_upper(keyword).replace("J", "I")
    used = set()
    arr = []
    for char in key:
        if char not in used:
            used.add(char)
            arr.append(char)
    for i in range(26):
        char = chr(A_CODE + i)
        if char == "J":
            continue
        if char not in used:
            used.add(char)
            arr.append(char)
    grid = []
    for r in range(5):
        grid.append(arr[r*5:(r+1)*5])
    return grid

def playfair_pairs_from_letters_only(s):
    pairs = []
    i = 0
    while i < len(s):
        a = s[i]
        b = s[i+1] if i + 1 < len(s) else None
        if not b:
            pairs.append([a, 'X'])
            break
        if a == b:
            pairs.append([a, 'X'])
            i += 1
        else:
            pairs.append([a, b])
            i += 2
    return pairs

def find_in_grid(grid, ch):
    for r in range(5):
        for c in range(5):
            if grid[r][c] == ch:
                return (r, c)
    return None

def playfair_encrypt_letters_only(letters_only, keyword):
    if not letters_only:
        return {"cipher": ""}
    grid = make_playfair_grid(keyword)
    s = letters_only.replace("J", "I").upper()
    pairs = playfair_pairs_from_letters_only(s)
    out = []
    for a, b in pairs:
        ra, ca = find_in_grid(grid, a)
        rb, cb = find_in_grid(grid, b)
        if ra == rb:
            out.append(grid[ra][(ca + 1) % 5])
            out.append(grid[rb][(cb + 1) % 5])
        elif ca == cb:
            out.append(grid[(ra + 1) % 5][ca])
            out.append(grid[(rb + 1) % 5][cb])
        else:
            out.append(grid[ra][cb])
            out.append(grid[rb][ca])
    return {"cipher": "".join(out), "grid": grid, "pairs": pairs}

def matrix_determinant(mat, modn):
    n = len(mat)
    if n == 2:
        return mod(mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0], modn)
    if n == 3:
        a = mat
        det = a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) - a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) + a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0])
        return mod(det, modn)
    return None

def matrix_multiply(A, B, modn):
    n = len(A)
    m = len(B[0])
    p = len(B)
    C = [[0] * m for _ in range(n)]
    for i in range(n):
        for j in range(m):
            for k in range(p):
                C[i][j] += A[i][k] * B[k][j]
    return [[mod(v, modn) for v in row] for row in C]

def hill_encrypt_letters_only(letters_only, key_matrix):
    if not letters_only:
        return {"cipher": ""}
    n = len(key_matrix)
    s = letters_only.upper()
    pad_len = (n - (len(s) % n)) % n
    padded = s + "X" * pad_len
    out = []
    steps = []
    for i in range(0, len(padded), n):
        block = [ord(char) - A_CODE for char in padded[i:i+n]]
        col = [[v] for v in block]
        res = matrix_multiply(key_matrix, col, 26)
        cipher_block = "".join([chr(A_CODE + mod(r[0], 26)) for r in res])
        out.append(cipher_block)
        steps.append({"block": "".join([chr(A_CODE + v) for v in block]), "result": cipher_block, "numeric": [r[0] for r in res]})
    return {"cipher": "".join(out), "steps": steps}

def generate_invertible_matrix(n):
    for _ in range(2000):
        mat = [[random.randint(0, 25) for _ in range(n)] for _ in range(n)]
        det = matrix_determinant(mat, 26)
        if det is not None and mod_inv(det, 26) is not None:
            return mat
    return None

def vigenere_preserve(text, key):
    key_upper = only_letters_upper(key)
    if not key_upper:
        return text
    pos = 0
    def transform_fn(upper, letter_index):
        nonlocal pos
        kch = key_upper[pos % len(key_upper)]
        ki = ord(kch) - A_CODE
        pos += 1
        return chr(A_CODE + mod(ord(upper) - A_CODE + ki, 26))
    return transform_per_letter_preserve(text, transform_fn)

def columnar_encrypt_full(text, key):
    if not key:
        return {"cipher": text, "grid": [], "order": []}
    cols = len(key)
    rows = math.ceil(len(text) / cols)
    padded_text = text.ljust(rows * cols, 'X')
    grid = [list(padded_text[i:i+cols]) for i in range(0, len(padded_text), cols)]
    key_order = sorted([(ch, idx) for idx, ch in enumerate(key)])
    order = [item[1] for item in key_order]
    cipher = ""
    for c in range(cols):
        col_idx = order[c]
        for r in range(rows):
            cipher += grid[r][col_idx]
    return {"cipher": cipher, "grid": grid, "order": order}
