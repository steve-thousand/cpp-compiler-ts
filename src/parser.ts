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

//grammar
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

//stateful crawler
class TokenCrawler {

    private index: number = 0;
    private readonly tokens: Token[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;;
    }

    parseFactor(): ast.Expression {
        const token = this.tokens[this.index];
        if (token.type == TokenType.PARENTHESES_OPEN) {
            this.index++;
            const expression = this.parseExpression();
            this.index++; //once again for the end parenthesis (should we check?)
            return expression;
        } else if (token.isUnaryOperator()) {
            this.index++;
            return new ast.UnOp(unary(token.type), this.parseFactor());
        } else if (token.type == TokenType.LITERAL_INTEGER) {
            this.index++;
            return new ast.Constant(parseInt(token.value));
        }
    }

    parseTerm(): ast.Expression {
        const factor: ast.Node = this.parseFactor();
        const tokenType: TokenType = this.tokens[this.index].type;
        if (tokenType === TokenType.BINARY_MULTIPLICATION || tokenType === TokenType.BINARY_DIVISION) {
            this.index++;
            const otherFactor = this.parseFactor();
            return new ast.BinOp(tokenType === TokenType.BINARY_MULTIPLICATION ? ast.BinaryOperator.MULTIPLICATION : ast.BinaryOperator.DIVISION, factor, otherFactor)
        } else {
            return factor
        }
    }

    private parseExpression(): ast.Expression {
        const term: ast.Node = this.parseTerm();
        const tokenType: TokenType = this.tokens[this.index].type;
        if (tokenType === TokenType.BINARY_ADDITION || tokenType === TokenType.MINUS) {
            this.index++;
            const otherTerm = this.parseTerm();
            return new ast.BinOp(tokenType === TokenType.BINARY_ADDITION ? ast.BinaryOperator.ADDITION : ast.BinaryOperator.SUBTRACTION, term, otherTerm);
        } else {
            return term;
        }
    }

    /**
     * TODO: there is some confusing logic around statements and expressions and knowing how to detect the end of either
     */
    private parseStatement(): ast.Statement {
        let statement: ast.Statement;
        while (this.index < this.tokens.length) {
            const token = this.tokens[this.index];
            this.index++;
            if (token.type === TokenType.SEMICOLON) {
                return statement;
            }
            if (token.type == TokenType.RETURN) {
                //is there an expression, or does it simply terminate?
                if (this.tokens[this.index].type !== TokenType.SEMICOLON) {
                    //RETURNED EXPRESSION!
                    statement = new ast.Return(this.parseExpression());
                } else {
                    statement = new ast.Return(null);
                }
            }
        }
    }

    private parseFunctionBody(): ast.Statement[] {
        const statements: ast.Statement[] = [];
        while (this.index < this.tokens.length) {
            const token = this.tokens[this.index];
            this.index++;
            if (token.type == TokenType.BRACE_CLOSE) {
                return statements;
            } else {
                this.index--;
                statements.push(this.parseStatement());
            }
        }
    }

    parseProgram(): ast.Program {
        let mainFunction: ast.FunctionDeclaration;
        while (this.index < this.tokens.length) {
            const token = this.tokens[this.index];
            this.index++;
            if (token.type == TokenType.INT) {
                //for now I'm just going to assume this is the main and only function, will improve later
                const functionName: string = this.tokens[this.index++].value;
                this.index += 3;
                const statements: ast.Statement[] = this.parseFunctionBody();
                mainFunction = new ast.Func(functionName, statements);
                break;
            }
        }
        return new ast.Program(mainFunction);
    }

}

export function parse(tokens: Token[]): ast.AST {
    const tokenCrawler: TokenCrawler = new TokenCrawler(tokens);
    return new ast.AST(tokenCrawler.parseProgram());
}