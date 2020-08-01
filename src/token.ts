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

export class Token {
    readonly type: TokenType
    readonly value: string;
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
    isPrimitiveType() {
        return this.type === TokenType.KEYWORD && this.value === "int";
    }
}