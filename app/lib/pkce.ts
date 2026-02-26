const toBase64Url = (bytes: Uint8Array) => {
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

const createCodeVerifier = () => {
    const array = new Uint8Array(32);
    return toBase64Url(crypto.getRandomValues(array));
}

const createCodeChallenge = async (codeVerifier: string) => {
    const bytes = new TextEncoder().encode(codeVerifier);
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return toBase64Url(new Uint8Array(hash));
}

export { toBase64Url, createCodeVerifier, createCodeChallenge }