/**
 * The string values here are only for the sake of debugging. Trying to tell which token is which 
 * given only an integer is hard.
 */
export enum TokenType {

    BRACE_OPEN = "{",
    BRACE_CLOSE = "}",
    PARENTHESES_OPEN = "(",
    PARENTHESES_CLOSE = ")",
    SEMICOLON = ";",

    /*
    UNARY
    */

    UNARY_BITWISE_COMPLEMENT = "~",
    UNARY_LOGICAL_NEGATION = "!",

    /*
    BINARY OPERATORS
    */

    MINUS = "-", //TODO for now this is subtraction and negation, is that gonna be weird?

    BINARY_ADDITION = "+",
    BINARY_MULTIPLICATION = "*",
    BINARY_DIVISION = "/",
    BINARY_MODULO = "%",

    BINARY_AND = "&&",
    BINARY_OR = "||",

    BINARY_BITWISE_AND = "&",
    BINARY_BITWISE_OR = "|",
    BINARY_BITWISE_XOR = "^",
    BINARY_BITWISE_SHIFT_LEFT = "<<",
    BINARY_BITWISE_SHIFT_RIGHT = ">>",

    BINARY_EQUAL = "==",
    BINARY_NOT_EQUAL = "!=",
    BINARY_LESS_THAN = "<",
    BINARY_LESS_THAN_OR_EQUAL = "<=",
    BINARY_GREATER_THAN = ">",
    BINARY_GREATER_THAN_OR_EQUAL = ">=",

    ASSIGNMENT = "=",

    COMPOUND_ASSIGNMENT_ADDITION = "+=",
    COMPOUND_ASSIGNMENT_SUBTRACTION = "-=",
    COMPOUND_ASSIGNMENT_MULTIPLICATION = "*=",
    COMPOUND_ASSIGNMENT_DIVISION = "/=",
    COMPOUND_ASSIGNMENT_MODULO = "%=",
    COMPOUND_ASSIGNMENT_BITSHIFT_LEFT = "<<=",
    COMPOUND_ASSIGNMENT_BITSHIFT_RIGHT = ">>=",
    COMPOUND_ASSIGNMENT_BITWISE_AND = "&=",
    COMPOUND_ASSIGNMENT_BITWISE_OR = "|=",
    COMPOUND_ASSIGNMENT_BITWISE_XOR = "^=",

    COLON = ":",
    QUESTION_MARK = "?",

    /*
    KEYWORDS
    */

    INT = "int",
    RETURN = "return",
    IF = "if",
    ELSE = "else",
    FOR = "for",
    WHILE = "while",
    DO = "do",
    BREAK = "break",
    CONTINUE = "continue",

    /*
    VARIABLE
    */

    IDENTIFIER = "identifier",
    LITERAL_INTEGER = "literal_integer"
}

/**
 * This map helps us quickly tell if a given string is likely to be a constant Token.
 */
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
    "%": TokenType.BINARY_MODULO,

    "&&": TokenType.BINARY_AND,
    "||": TokenType.BINARY_OR,

    "&": TokenType.BINARY_BITWISE_AND,
    "|": TokenType.BINARY_BITWISE_OR,
    "^": TokenType.BINARY_BITWISE_XOR,
    "<<": TokenType.BINARY_BITWISE_SHIFT_LEFT,
    ">>": TokenType.BINARY_BITWISE_SHIFT_RIGHT,

    "==": TokenType.BINARY_EQUAL,
    "!=": TokenType.BINARY_NOT_EQUAL,
    "<": TokenType.BINARY_LESS_THAN,
    "<=": TokenType.BINARY_LESS_THAN_OR_EQUAL,
    ">": TokenType.BINARY_GREATER_THAN,
    ">=": TokenType.BINARY_GREATER_THAN_OR_EQUAL,

    "=": TokenType.ASSIGNMENT,

    "+=": TokenType.COMPOUND_ASSIGNMENT_ADDITION,
    "-=": TokenType.COMPOUND_ASSIGNMENT_SUBTRACTION,
    "*=": TokenType.COMPOUND_ASSIGNMENT_MULTIPLICATION,
    "/=": TokenType.COMPOUND_ASSIGNMENT_DIVISION,
    "%=": TokenType.COMPOUND_ASSIGNMENT_MODULO,
    "<<=": TokenType.COMPOUND_ASSIGNMENT_BITSHIFT_LEFT,
    ">>=": TokenType.COMPOUND_ASSIGNMENT_BITSHIFT_RIGHT,
    "&=": TokenType.COMPOUND_ASSIGNMENT_BITWISE_AND,
    "|=": TokenType.COMPOUND_ASSIGNMENT_BITWISE_OR,
    "^=": TokenType.COMPOUND_ASSIGNMENT_BITWISE_XOR,

    ":": TokenType.COLON,
    "?": TokenType.QUESTION_MARK,

    "int": TokenType.INT,
    "return": TokenType.RETURN,
    "if": TokenType.IF,
    "else": TokenType.ELSE,
    "for": TokenType.FOR,
    "while": TokenType.WHILE,
    "do": TokenType.DO,
    "break": TokenType.BREAK,
    "continue": TokenType.CONTINUE
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
}