export enum TokenType {
    BRACE_OPEN,
    BRACE_CLOSE,

    PARENTHESES_OPEN,
    PARENTHESES_CLOSE,

    SEMICOLON,

    KEYWORD,
    IDENTIFIER,
    LITERAL_INTEGER
}

const SINGLE_TOKENS: Map<string, TokenType> = new Map([
    ['{', TokenType.BRACE_OPEN],
    ['}', TokenType.BRACE_CLOSE],
    ['(', TokenType.PARENTHESES_OPEN],
    [')', TokenType.PARENTHESES_CLOSE],
    [';', TokenType.SEMICOLON]
]);

const WHITE_SPACE = [' ', '\n', '\t'];

function test(code: string, startIndex: number, currentIndex: number): Token[] {
    const char_at = currentIndex < code.length ? code[currentIndex] : null;

    //check if we have reached the boundary between two tokens
    if (!char_at || SINGLE_TOKENS.has(char_at) || WHITE_SPACE.indexOf(char_at) > -1) {
        const tokens = []

        //what was previous token
        const substring = code.substr(startIndex, currentIndex - startIndex);
        switch (substring) {
            case 'int':
            case 'return':
                tokens.push(Token.ofTypeAndValue(TokenType.KEYWORD, substring))
                break;
            default:
                if (/[a-zA-Z]+/.test(substring)) {
                    tokens.push(Token.ofTypeAndValue(TokenType.IDENTIFIER, substring))
                } else if (/[0-9]+/.test(substring)) {
                    tokens.push(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, substring))
                }
        }

        if (SINGLE_TOKENS.has(char_at)) {
            tokens.push(Token.ofType(SINGLE_TOKENS.get(char_at)))
        }

        return tokens;
    }

}

export function lex(code: string): TokenType[] {
    let tokens = [];
    let startIndex = 0;
    let currentIndex = 0;
    while (currentIndex < code.length + 1) {
        const subTokens = test(code, startIndex, currentIndex);
        if (subTokens) {
            tokens = tokens.concat(subTokens);
            startIndex = ++currentIndex;
        } else {
            currentIndex++;
        }
    }
    return tokens;
}

export class Token {
    type: TokenType
    value: string;
    constructor(type: TokenType, value: string) {
        this.type = type;
        this.value = value;
    }
    static ofType(tokenType: TokenType): Token {
        return new Token(tokenType, undefined);
    }
    static ofTypeAndValue(tokenType: TokenType, value: string): Token {
        return new Token(tokenType, value);
    }
}