const setBreak = (sentence: string): string => {
    const words = sentence.split(' ');
    return words.reduce((acc, word, i) => {
        if (i > 0 && i % 2 === 0) return `${acc}\r\n${word}`;
        return `${acc} ${word}`;
    }, '').trim();
};

export default setBreak;
