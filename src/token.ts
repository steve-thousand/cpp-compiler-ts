export enum TokenType {

    BRACE_OPEN,
    BRACE_CLOSE,
    PARENTHESES_OPEN,
    PARENTHESES_CLOSE,
    SEMICOLON,

    /*
    UNARY
    */

    UNARY_BITWISE_COMPLEMENT,
    UNARY_LOGICAL_NEGATION,

    /*
    BINARY OPERATORS
    */

    MINUS, //TODO for now this is subtraction and negation, is that gonna be weird?

    BINARY_ADDITION,
    BINARY_MULTIPLICATION,
    BINARY_DIVISION,

    BINARY_AND,
    BINARY_OR,

    BINARY_EQUAL,
    BINARY_NOT_EQUAL,
    BINARY_LESS_THAN,
    BINARY_LESS_THAN_OR_EQUAL,
    BINARY_GREATER_THAN,
    BINARY_GREATER_THAN_OR_EQUAL,

    /*
    KEYWORDS
    */

    INT,
    RETURN,

    /*
    VARIABLE
    */
    IDENTIFIER,
    LITERAL_INTEGER
}

const CONSTANT_TOKENS = {
    "{": TokenType.BRACE_OPEN,
    "}": TokenType.BRACE_CLOSE,
    "(": TokenType.PARENTHESES_OPEN,
    ")": TokenType.PARENTHESES_CLOSE,
    ";": TokenType.SEMICOLON,

    "~": TokenType.UNARY_BITWISE_COMPLEMENT,
    "!": TokenType.UNARY_LOGICAL_NEGATION,

    "-": TokenType.MINUS,

    "+": TokenType.BINARY_ADDITION,
    "*": TokenType.BINARY_MULTIPLICATION,
    "/": TokenType.BINARY_DIVISION,

    "&&": TokenType.BINARY_AND,
    "||": TokenType.BINARY_OR,

    "==": TokenType.BINARY_EQUAL,
    "!=": TokenType.BINARY_NOT_EQUAL,
    "<": TokenType.BINARY_LESS_THAN,
    "<=": TokenType.BINARY_LESS_THAN_OR_EQUAL,
    ">": TokenType.BINARY_GREATER_THAN,
    ">=": TokenType.BINARY_GREATER_THAN_OR_EQUAL,

    "int": TokenType.INT,
    "return": TokenType.RETURN
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

    static isConstantToken(value: string): Token {
        if (value in CONSTANT_TOKENS) {
            return Token.ofType(CONSTANT_TOKENS[value]);
        }
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