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
    }
}

function tokenIs(tokenType: TokenType, ...tokenTypes: TokenType[]) {
    return tokenTypes.indexOf(tokenType) > -1;
}

/**
 * <PROGRAM> = <FUNCTION>
 * <FUNCTION> = "int" <IDENTIFIER>"(){" <STATEMENT[]> "}""
 * <STATEMENT> = return <EXPRESSION>;
 * <EXPRESSION> = <LOGICAL_AND_EXP> { "||" <LOGICAL_AND_EXP }
 * <LOGICAL_AND_EXP> = <EQUALITY_EXP> { "&&" <EQUALITY_EXP> }
 * <EQUALITY_EXP> = <RELATIONAL_EXP> { ("!=" | "==") <RELATIONAL_EXP> }
 * <RELATIONAL_EXP> = <ADDITIVE_EXP> { ("<" | ">" | "<=" | ">=") <ADDITIVE_EXP> }
 * <ADDITIVE_EXP> = <TERM> { ("+" | "-") <TERM> }
 * <TERM> = <FACTOR> { ("*" | "/") <FACTOR> }
 * <FACTOR> = "(" <EXPRESSION> ")" | <UNARY_OPERATOR> <FACTOR> | <LITERAL>
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
            const func = new ast.Func(identifier, [this.STATEMENT(tokens)]);
            tokens.shift(); //"}"
            return func;
        }
    },
    STATEMENT: function (tokens: Token[]) {
        if (tokens[0].type === TokenType.RETURN) {
            tokens.shift();
            const expression = this.EXPRESSION(tokens);
            tokens.shift(); //";"
            return new ast.Return(expression);
        }
    },
    EXPRESSION: function (tokens: Token[]) {
        const logical = this.LOGICAL_AND_EXP(tokens);
        if (tokenIs(tokens[0].type, TokenType.BINARY_OR)) {
            tokens.shift();
            return new ast.BinOp(ast.BinaryOperator.OR, logical, this.LOGICAL_AND_EXP(tokens));
        } else {
            return logical;
        }
    },
    LOGICAL_AND_EXP: function (tokens: Token[]) {
        const equality = this.EQUALITY_EXP(tokens);
        if (tokenIs(tokens[0].type, TokenType.BINARY_AND)) {
            tokens.shift();
            return new ast.BinOp(ast.BinaryOperator.AND, equality, this.RELATIONAL_EXP(tokens));
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
        const additive = this.ADDITIVE_EXP(tokens);
        if (tokenIs(tokens[0].type, TokenType.BINARY_LESS_THAN, TokenType.BINARY_LESS_THAN_OR_EQUAL, TokenType.BINARY_GREATER_THAN, TokenType.BINARY_GREATER_THAN_OR_EQUAL)) {
            return new ast.BinOp(binary(tokens.shift().type), additive, this.RELATIONAL_EXP(tokens));
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
        if (tokenIs(tokens[0].type, TokenType.BINARY_MULTIPLICATION, TokenType.BINARY_DIVISION)) {
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
        } else {
            return new ast.Constant(parseInt(tokens.shift().value));
        }
    }
}

export function parse(tokens: Token[]): ast.AST {
    return new ast.AST(GRAMMAR.PROGRAM(tokens));
}