<?php

use Illuminate\Encryption\Encrypter;

require dirname(__DIR__).'/vendor/autoload.php';
umask(0077);
try {
    $action = $argv[1] ?? '';
    $keyPath = $argv[2] ?? '';
    if ($action === 'key') {
        $stream = fopen($keyPath, 'x');
        if ($stream === false || fwrite($stream, random_bytes(32)) !== 32) {
            throw new RuntimeException('Key output unavailable.');
        }
        fclose($stream);
        exit(0);
    }
    if (! in_array($action, ['encrypt', 'decrypt'], true) || ! is_file($keyPath) || (fileperms($keyPath) & 0077) !== 0) {
        throw new RuntimeException('A private key file and valid operation are required.');
    }
    $key = file_get_contents($keyPath);
    $input = $argv[3] ?? '';
    $output = $argv[4] ?? '';
    if (! is_string($key) || strlen($key) !== 32 || ! is_file($input) || filesize($input) > 128 * 1024 * 1024 || file_exists($output)) {
        throw new RuntimeException('Invalid input, size or existing output.');
    }
    $bytes = file_get_contents($input);
    if ($bytes === false) {
        throw new RuntimeException('Input unavailable.');
    }
    $encrypter = new Encrypter($key, 'aes-256-cbc');
    $result = $action === 'encrypt' ? $encrypter->encryptString($bytes) : $encrypter->decryptString($bytes);
    $stream = fopen($output, 'x');
    if ($stream === false || fwrite($stream, $result) !== strlen($result)) {
        throw new RuntimeException('Output unavailable.');
    }
    fclose($stream);
} catch (Throwable) {
    fwrite(STDERR, "Backup encryption/decryption failed; no key or payload diagnostics emitted.\n");
    exit(1);
}
