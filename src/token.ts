export enum TokenType {
    BRACE_OPEN,
    BRACE_CLOSE,

    PARENTHESES_OPEN,
    PARENTHESES_CLOSE,

    SEMICOLON,

    MINUS, //TODO for now this is subtraction and negation, is that gonna be weird?
    UNARY_BITWISE_COMPLEMENT,
    UNARY_LOGICAL_NEGATION,

    BINARY_ADDITION,
    BINARY_MULTIPLICATION,
    BINARY_DIVISION,

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
    isOperator(): boolean {
        switch (this.type) {
            case TokenType.MINUS:
            case TokenType.UNARY_LOGICAL_NEGATION:
            case TokenType.UNARY_BITWISE_COMPLEMENT:
            case TokenType.BINARY_ADDITION:
            case TokenType.BINARY_MULTIPLICATION:
            case TokenType.BINARY_DIVISION:
                return true;
            default:
                return false;
        }
    }
    isUnaryOperator(): boolean {
        switch (this.type) {
            case TokenType.MINUS:
            case TokenType.UNARY_LOGICAL_NEGATION:
            case TokenType.UNARY_BITWISE_COMPLEMENT:
                return true;
            default:
                return false;
        }
    }
}