import { Token, TokenType } from './token';
import * as ast from './ast';

export { ast as ast }

function unary(tokenType: TokenType): ast.UnaryOperator {
    switch (tokenType) {
        case TokenType.MINUS:
            return ast.UnaryOperator.NEGATION;
        case TokenType.UNARY_BITWISE_COMPLEMENT:
            return ast.UnaryOperator.BITWISE_COMPLEMENT;
        case TokenType.UNARY_LOGICAL_NEGATION:
            return ast.UnaryOperator.LOGICAL_NEGATION;
    }
}

function binary(tokenType: TokenType): ast.BinaryOperator {
    switch (tokenType) {
        case TokenType.BINARY_ADDITION:
            return ast.BinaryOperator.ADDITION;
        case TokenType.MINUS:
            return ast.BinaryOperator.SUBTRACTION;
        case TokenType.BINARY_MULTIPLICATION:
            return ast.BinaryOperator.MULTIPLICATION;
        case TokenType.BINARY_DIVISION:
            return ast.BinaryOperator.DIVISION;
        case TokenType.BINARY_MODULO:
            return ast.BinaryOperator.MODULO;
        case TokenType.BINARY_BITWISE_AND:
            return ast.BinaryOperator.BITWISE_AND;
        case TokenType.BINARY_BITWISE_OR:
            return ast.BinaryOperator.BITWISE_OR;
        case TokenType.BINARY_BITWISE_XOR:
            return ast.BinaryOperator.BITWISE_XOR;
        case TokenType.BINARY_BITWISE_SHIFT_LEFT:
            return ast.BinaryOperator.BITWISE_SHIFT_LEFT;
        case TokenType.BINARY_BITWISE_SHIFT_RIGHT:
            return ast.BinaryOperator.BITWISE_SHIFT_RIGHT;
        case TokenType.BINARY_EQUAL:
            return ast.BinaryOperator.EQUAL;
        case TokenType.BINARY_NOT_EQUAL:
            return ast.BinaryOperator.NOT_EQUAL;
        case TokenType.BINARY_GREATER_THAN:
            return ast.BinaryOperator.GREATER_THAN;
        case TokenType.BINARY_GREATER_THAN_OR_EQUAL:
            return ast.BinaryOperator.GREATER_THAN_OR_EQUAL;
        case TokenType.BINARY_LESS_THAN:
            return ast.BinaryOperator.LESS_THAN;
        case TokenType.BINARY_LESS_THAN_OR_EQUAL:
            return ast.BinaryOperator.LESS_THAN_OR_EQUAL;
        case TokenType.BINARY_OR:
            return ast.BinaryOperator.OR;
        case TokenType.BINARY_AND:
            return ast.BinaryOperator.AND;
        case TokenType.ASSIGNMENT:
            return ast.BinaryOperator.ASSIGNMENT;
        case TokenType.COMPOUND_ASSIGNMENT_ADDITION:
            return ast.BinaryOperator.COMPOUND_ASSIGNMENT_ADDITION;
        case TokenType.COMPOUND_ASSIGNMENT_SUBTRACTION:
            return ast.BinaryOperator.COMPOUND_ASSIGNMENT_SUBTRACTION;
        case TokenType.COMPOUND_ASSIGNMENT_MULTIPLICATION:
            return ast.BinaryOperator.COMPOUND_ASSIGNMENT_MULTIPLICATION;
        case TokenType.COMPOUND_ASSIGNMENT_DIVISION:
            return ast.BinaryOperator.COMPOUND_ASSIGNMENT_DIVISION;
        case TokenType.COMPOUND_ASSIGNMENT_MODULO:
            return ast.BinaryOperator.COMPOUND_ASSIGNMENT_MODULO;
        case TokenType.COMPOUND_ASSIGNMENT_BITSHIFT_LEFT:
            return ast.BinaryOperator.COMPOUND_ASSIGNMENT_BITSHIFT_LEFT;
        case TokenType.COMPOUND_ASSIGNMENT_BITSHIFT_RIGHT:
            return ast.BinaryOperator.COMPOUND_ASSIGNMENT_BITSHIFT_RIGHT;
        case TokenType.COMPOUND_ASSIGNMENT_BITWISE_AND:
            return ast.BinaryOperator.COMPOUND_ASSIGNMENT_BITWISE_AND;
        case TokenType.COMPOUND_ASSIGNMENT_BITWISE_OR:
            return ast.BinaryOperator.COMPOUND_ASSIGNMENT_BITWISE_OR;
        case TokenType.COMPOUND_ASSIGNMENT_BITWISE_XOR:
            return ast.BinaryOperator.COMPOUND_ASSIGNMENT_BITWISE_XOR;
    }
}

function tokenIs(tokenType: TokenType, ...tokenTypes: TokenType[]) {
    return tokenTypes.indexOf(tokenType) > -1;
}

function isTokenAssignment(tokenType: TokenType) {
    switch (tokenType) {
        case TokenType.ASSIGNMENT:
        case TokenType.COMPOUND_ASSIGNMENT_ADDITION:
        case TokenType.COMPOUND_ASSIGNMENT_SUBTRACTION:
        case TokenType.COMPOUND_ASSIGNMENT_MULTIPLICATION:
        case TokenType.COMPOUND_ASSIGNMENT_DIVISION:
        case TokenType.COMPOUND_ASSIGNMENT_MODULO:
        case TokenType.COMPOUND_ASSIGNMENT_BITSHIFT_LEFT:
        case TokenType.COMPOUND_ASSIGNMENT_BITSHIFT_RIGHT:
        case TokenType.COMPOUND_ASSIGNMENT_BITWISE_AND:
        case TokenType.COMPOUND_ASSIGNMENT_BITWISE_OR:
        case TokenType.COMPOUND_ASSIGNMENT_BITWISE_XOR:
            return true;
        default:
            return false;
    }
}

function isCompoundAssignment(tokenType: TokenType) {
    switch (tokenType) {
        case TokenType.COMPOUND_ASSIGNMENT_ADDITION:
            return ast.BinaryOperator.ADDITION;
        case TokenType.COMPOUND_ASSIGNMENT_SUBTRACTION:
            return ast.BinaryOperator.SUBTRACTION;
        case TokenType.COMPOUND_ASSIGNMENT_MULTIPLICATION:
            return ast.BinaryOperator.MULTIPLICATION;
        case TokenType.COMPOUND_ASSIGNMENT_DIVISION:
            return ast.BinaryOperator.DIVISION;
        case TokenType.COMPOUND_ASSIGNMENT_MODULO:
            return ast.BinaryOperator.MODULO;
        case TokenType.COMPOUND_ASSIGNMENT_BITSHIFT_LEFT:
            return ast.BinaryOperator.BITWISE_SHIFT_LEFT;
        case TokenType.COMPOUND_ASSIGNMENT_BITSHIFT_RIGHT:
            return ast.BinaryOperator.BITWISE_SHIFT_RIGHT;
        case TokenType.COMPOUND_ASSIGNMENT_BITWISE_AND:
            return ast.BinaryOperator.BITWISE_AND;
        case TokenType.COMPOUND_ASSIGNMENT_BITWISE_OR:
            return ast.BinaryOperator.BITWISE_OR;
        case TokenType.COMPOUND_ASSIGNMENT_BITWISE_XOR:
            return ast.BinaryOperator.BITWISE_XOR;
        default:
            return false;
    }
}

/**
 * <PROGRAM> = <FUNCTION>
 * <FUNCTION> = "int" <IDENTIFIER>"(){" <STATEMENT[]> "}""
 * <STATEMENT> = return <EXPRESSION>; | <EXPRESSION>; | "int" IDENTIFIER {"=" <EXPRESSION>}
 * <EXPRESSION> = IDENTIFIER ASSIGNMENT_OPERATOR <EXPRESSION> | <LOGICAL_OR_EXP>
 * <LOGICAL_OR_EXP> = <LOGICAL_AND_EXP> { "||" <LOGICAL_AND_EXP }
 * <LOGICAL_AND_EXP> = <BITWISE_OR> { "&&" <BITWISE_OR> }
 * <BITWISE_OR> = <BITWISE_XOR> { "|" <BITWISE_XOR> }
 * <BITWISE_XOR> = <BITWISE_AND> { "^" <BITWISE_AND> }
 * <BITWISE_AND> = <EQUALITY_EXP> { "&" <EQUALITY_EXP> }
 * <EQUALITY_EXP> = <RELATIONAL_EXP> { ("!=" | "==") <RELATIONAL_EXP> }
 * <RELATIONAL_EXP> = <BITWISE_SHIFT_EXP> { ("<" | ">" | "<=" | ">=") <BITWISE_SHIFT_EXP> }
 * <BITWISE_SHIFT_EXP> = <ADDITIVE_EXP> { ("<<" | ">>") <ADDITIVE_EXP> }
 * <ADDITIVE_EXP> = <TERM> { ("+" | "-") <TERM> }
 * <TERM> = <FACTOR> { ("*" | "/" | "%") <FACTOR> }
 * <FACTOR> = "(" <EXPRESSION> ")" | <UNARY_OPERATOR> <FACTOR> | <LITERAL> | IDENTIFIER
 */
const GRAMMAR = {
    PROGRAM: function (tokens: Token[]) {
        const functionDeclaration = this.FUNCTION(tokens);
        return new ast.Program(functionDeclaration);
    },
    FUNCTION: function (tokens: Token[]) {
        if (tokens[0].type === TokenType.INT) {
            tokens.shift();
            const identifier = tokens.shift().value;
            tokens.shift(); //"("
            tokens.shift(); //")"
            tokens.shift(); //"{"
            const statements: ast.Statement[] = [];
            // @ts-ignore
            while (tokens[0].type !== TokenType.BRACE_CLOSE) {
                statements.push(this.STATEMENT(tokens));
            }
            tokens.shift(); //"}"
            const func = new ast.Func(identifier, statements);
            return func;
        }
    },
    STATEMENT: function (tokens: Token[]) {
        let expression;
        if (tokens[0].type === TokenType.RETURN) {
            tokens.shift();
            expression = this.EXPRESSION(tokens);
            tokens.shift(); //";"
            return new ast.Return(expression);
        }

        expression = this.EXPRESSION(tokens);
        if (expression) {
            tokens.shift(); //";"
            return new ast.ExpStatement(expression);
        }

        if (tokens[0].type === TokenType.INT) {
            tokens.shift();
            const identifier = tokens.shift();
            expression = undefined;
            // @ts-ignore
            if (tokens[0].type === TokenType.ASSIGNMENT) {
                tokens.shift(); //"="
                expression = this.EXPRESSION(tokens);
            }
            const declaration = new ast.Declaration(identifier.value, expression);
            tokens.shift(); //";"
            return declaration;
        }
    },
    EXPRESSION: function (tokens: Token[]) {
        if (tokens[0].type === TokenType.IDENTIFIER && isTokenAssignment(tokens[1].type)) {
            const identifier = tokens.shift();
            const operator = tokens.shift(); //"="
            const compoundOperator = isCompoundAssignment(operator.type);
            if (compoundOperator !== false) {
                return new ast.Assignment(identifier.value, new ast.BinOp(compoundOperator, new ast.VarReference(identifier.value), this.EXPRESSION(tokens)));
            } else {
                return new ast.Assignment(identifier.value, this.EXPRESSION(tokens));
            }
        } else {
            return this.LOGICAL_OR_EXP(tokens);
        }
    },
    LOGICAL_OR_EXP: function (tokens: Token[]) {
        const equality = this.LOGICAL_AND_EXP(tokens);
        if (tokenIs(tokens[0].type, TokenType.BINARY_OR)) {
            tokens.shift();
            return new ast.BinOp(ast.BinaryOperator.OR, equality, this.LOGICAL_AND_EXP(tokens));
        } else {
            return equality;
        }
    },
    LOGICAL_AND_EXP: function (tokens: Token[]) {
        const equality = this.BITWISE_OR_EXP(tokens);
        if (tokenIs(tokens[0].type, TokenType.BINARY_AND)) {
            tokens.shift();
            return new ast.BinOp(ast.BinaryOperator.AND, equality, this.BITWISE_OR_EXP(tokens));
        } else {
            return equality;
        }
    },
    BITWISE_OR_EXP: function (tokens: Token[]) {
        const equality = this.BITWISE_XOR_EXP(tokens);
        if (tokenIs(tokens[0].type, TokenType.BINARY_BITWISE_OR)) {
            tokens.shift();
            return new ast.BinOp(ast.BinaryOperator.BITWISE_OR, equality, this.BITWISE_XOR_EXP(tokens));
        } else {
            return equality;
        }
    },
    BITWISE_XOR_EXP: function (tokens: Token[]) {
        const equality = this.BITWISE_AND_EXP(tokens);
        if (tokenIs(tokens[0].type, TokenType.BINARY_BITWISE_XOR)) {
            tokens.shift();
            return new ast.BinOp(ast.BinaryOperator.BITWISE_XOR, equality, this.BITWISE_AND_EXP(tokens));
        } else {
            return equality;
        }
    },
    BITWISE_AND_EXP: function (tokens: Token[]) {
        const equality = this.EQUALITY_EXP(tokens);
        if (tokenIs(tokens[0].type, TokenType.BINARY_BITWISE_AND)) {
            tokens.shift();
            return new ast.BinOp(ast.BinaryOperator.BITWISE_AND, equality, this.EQUALITY_EXP(tokens));
        } else {
            return equality;
        }
    },
    EQUALITY_EXP: function (tokens: Token[]) {
        const relational = this.RELATIONAL_EXP(tokens);
        if (tokenIs(tokens[0].type, TokenType.BINARY_EQUAL, TokenType.BINARY_NOT_EQUAL)) {
            return new ast.BinOp(binary(tokens.shift().type), relational, this.RELATIONAL_EXP(tokens));
        } else {
            return relational;
        }
    },
    RELATIONAL_EXP: function (tokens: Token[]) {
        const additive = this.BITWISE_SHIFT_EXP(tokens);
        if (tokenIs(tokens[0].type, TokenType.BINARY_LESS_THAN, TokenType.BINARY_LESS_THAN_OR_EQUAL, TokenType.BINARY_GREATER_THAN, TokenType.BINARY_GREATER_THAN_OR_EQUAL)) {
            return new ast.BinOp(binary(tokens.shift().type), additive, this.BITWISE_SHIFT_EXP(tokens));
        } else {
            return additive;
        }
    },
    BITWISE_SHIFT_EXP: function (tokens: Token[]) {
        const additive = this.ADDITIVE_EXP(tokens);
        if (tokenIs(tokens[0].type, TokenType.BINARY_BITWISE_SHIFT_LEFT, TokenType.BINARY_BITWISE_SHIFT_RIGHT)) {
            return new ast.BinOp(binary(tokens.shift().type), additive, this.ADDITIVE_EXP(tokens));
        } else {
            return additive;
        }
    },
    ADDITIVE_EXP: function (tokens: Token[]) {
        const term = this.TERM(tokens);
        if (tokenIs(tokens[0].type, TokenType.BINARY_ADDITION, TokenType.MINUS)) {
            return new ast.BinOp(binary(tokens.shift().type), term, this.RELATIONAL_EXP(tokens));
        } else {
            return term;
        }
    },
    TERM: function (tokens: Token[]) {
        const factor = this.FACTOR(tokens);
        if (tokenIs(tokens[0].type, TokenType.BINARY_MULTIPLICATION, TokenType.BINARY_DIVISION, TokenType.BINARY_MODULO)) {
            return new ast.BinOp(binary(tokens.shift().type), factor, this.RELATIONAL_EXP(tokens));
        } else {
            return factor;
        }
    },
    FACTOR: function (tokens: Token[]) {
        if (tokens[0].type === TokenType.PARENTHESES_OPEN) {
            tokens.shift(); //"("
            const expression = this.EXPRESSION(tokens);
            tokens.shift(); //")"
            return expression;
        } else if (unary(tokens[0].type) !== undefined) {
            const operatorToken = tokens.shift();
            const expression = this.EXPRESSION(tokens);
            return new ast.UnOp(unary(operatorToken.type), expression);
        } else if (tokens[0].type === TokenType.LITERAL_INTEGER) {
            return new ast.Constant(parseInt(tokens.shift().value));
        } else if (tokens[0].type === TokenType.IDENTIFIER) {
            return new ast.VarReference(tokens.shift().value);
        }
    }
}

export function parse(tokens: Token[]): ast.AST {
    return new ast.AST(GRAMMAR.PROGRAM(tokens));
}