export function generateUniqueName(
    basis: string,
    randomizerLength?: number
): string {
    return `${basis}_${randomString(randomizerLength)}`;
}

/**
 * Generate a random lowercase string of length n
 * @param length number of random chars in string
 */
export function randomString(length: number = 8): string {
    let randString: string = '';
    let randomAscii: number;
    for (let i = 0; i < length; i = i + 1) {
        randomAscii = Math.floor(Math.random() * 25 + 97);
        randString += String.fromCharCode(randomAscii);
    }

    return randString;
}

export function randomIntFromInterval(min: number, max: number): string {
    return String(Math.floor(Math.random() * (max - min + 1) + min));
}
export function generateNumber(): string {
    return randomIntFromInterval(10000000, 999999999);
}

export function generateSn(): string{
    const nonZeroFilled = String(Math.floor(Math.random() * 10000000000));
    return nonZeroFilled.padStart(10, '0');
}