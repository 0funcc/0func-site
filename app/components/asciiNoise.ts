const NOISE = "▓▒░#=-";

function noisyChar() {
    return NOISE[Math.floor(Math.random() * NOISE.length)];
}

function glitchEdges(chars: string[], edgeSize: number): string[] {
    const result = [...chars];
    for (let i = 0; i < edgeSize && i < result.length; i++) {
        result[i] = noisyChar();
        result[result.length - 1 - i] = noisyChar();
    }
    return result;
}

export function noisyLine(n: number, settling: boolean): string {
    const chars = Array.from({ length: Math.max(n, 0) }, () => "─");
    if (!settling || n < 12) return chars.join("");
    return glitchEdges(chars, 5).join("");
}

export function noisyColumn(rows: number, settling: boolean): string {
    const chars = Array.from({ length: Math.max(rows, 0) }, () => "│");
    if (!settling || rows < 6) return chars.join("\n");
    return glitchEdges(chars, 2).join("\n");
}
