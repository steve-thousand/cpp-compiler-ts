import { Token, TokenType } from './token';

//grammar
/**
 * <PROGRAM> = <FUNCTION>
 * <FUNCTION> = "int" <IDENTIFIER>"(){" <STATEMENT[]> "}""
 * <STATEMENT> = return <EXPRESSION>;
 * <EXPRESSION> = <TERM> { ("+" | "-") <TERM> }
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

    parseFactor(): Factor {
        const token = this.tokens[this.index];
        if (token.type == TokenType.PARENTHESES_OPEN) {
            this.index++;
            const expression = this.parseExpression();
            this.index++; //once again for the end parenthesis (should we check?)
            return new ExpressionFactor(expression);
        } else if (token.isUnaryOperator()) {
            this.index++;
            return new UnaryFactor(unary(token.type), this.parseFactor());
        } else if (token.type == TokenType.LITERAL_INTEGER) {
            this.index++;
            return new LiteralFactor(parseInt(token.value));
        }
    }

    parseTerm(): Term {
        const factor: Factor = this.parseFactor();
        const tokenType: TokenType = this.tokens[this.index].type;
        if (tokenType === TokenType.BINARY_MULTIPLICATION || tokenType === TokenType.BINARY_DIVISION) {
            this.index++;
            const otherFactor = this.parseFactor();
            return new BinaryTerm(tokenType === TokenType.BINARY_MULTIPLICATION ? BinaryOperator.MULTIPLICATION : BinaryOperator.DIVISION, factor, otherFactor)
        } else {
            return new SimpleTerm(factor);
        }
    }

    private parseExpression(): Expression {
        const term: Term = this.parseTerm();
        const tokenType: TokenType = this.tokens[this.index].type;
        if (tokenType === TokenType.BINARY_ADDITION || tokenType === TokenType.MINUS) {
            this.index++;
            const otherTerm = this.parseTerm();
            return new BinaryExpression(tokenType === TokenType.BINARY_ADDITION ? BinaryOperator.ADDITION : BinaryOperator.SUBTRACTION, term, otherTerm);
        } else {
            return new SimpleExpression(term);
        }
    }

    /**
     * TODO: there is some confusing logic around statements and expressions and knowing how to detect the end of either
     */
    private parseStatement(): Statement {
        let statement: Statement;
        while (this.index < this.tokens.length) {
            const token = this.tokens[this.index];
            this.index++;
            if (token.type === TokenType.SEMICOLON) {
                return statement;
            }
            if (token.type == TokenType.KEYWORD && token.value === "return") {
                //is there an expression, or does it simply terminate?
                if (this.tokens[this.index].type !== TokenType.SEMICOLON) {
                    //RETURNED EXPRESSION!
                    statement = new ReturnStatement(this.parseExpression());
                } else {
                    statement = new ReturnStatement(null);
                }
            }
        }
    }

    private parseFunctionBody(): Statement[] {
        const statements: Statement[] = [];
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

    parseProgram(): ProgramNode {
        let mainFunction: FunctionDeclaration;
        while (this.index < this.tokens.length) {
            const token = this.tokens[this.index];
            this.index++;
            if (token.type == TokenType.KEYWORD) {
                if (token.isPrimitiveType()) {
                    //for now I'm just going to assume this is the main and only function, will improve later
                    const functionName: string = this.tokens[this.index++].value;
                    this.index += 3;
                    const statements: Statement[] = this.parseFunctionBody();
                    mainFunction = new FunctionDeclaration(functionName, statements);
                    break;
                }
            }
        }
        return new ProgramNode(mainFunction);
    }

}

export function parse(tokens: Token[]): AST {
    const tokenCrawler: TokenCrawler = new TokenCrawler(tokens);
    return new AST(tokenCrawler.parseProgram());
}

export interface Node { }

export interface Factor extends Node { }

export interface Term extends Node { }

export interface Expression extends Node { }

export interface Statement extends Node { }

export class LiteralFactor implements Factor {
    readonly value: number;
    constructor(value: number) {
        this.value = value;
    }
}

export class ExpressionFactor implements Factor {
    readonly expression: Expression;
    constructor(expression: Expression) {
        this.expression = expression;
    }
}

export class SimpleTerm implements Term {
    readonly factor: Factor;
    constructor(factor: Factor) {
        this.factor = factor;
    }
}

export class SimpleExpression implements Expression {
    readonly term: Term;
    constructor(term: Term) {
        this.term = term;
    }
}

export enum BinaryOperator {
    ADDITION,
    SUBTRACTION,
    MULTIPLICATION,
    DIVISION
}

export class BinaryTerm implements Term {
    readonly operator: BinaryOperator;
    readonly leftHandSide: Factor;
    readonly rightHandSide: Factor;
    constructor(operator: BinaryOperator, leftHandSide: Factor, rightHandSide: Factor) {
        this.operator = operator;
        this.leftHandSide = leftHandSide;
        this.rightHandSide = rightHandSide;
    }
}

export class BinaryExpression implements Expression {
    readonly operator: BinaryOperator;
    readonly leftHandSide: Term;
    readonly rightHandSide: Term;
    constructor(operator: BinaryOperator, leftHandSide: Term, rightHandSide: Term) {
        this.operator = operator;
        this.leftHandSide = leftHandSide;
        this.rightHandSide = rightHandSide;
    }
}

export enum UnaryOperator {
    NEGATION,
    BITWISE_COMPLEMENT,
    LOGICAL_NEGATION,
}

function unary(tokenType: TokenType): UnaryOperator {
    switch (tokenType) {
        case TokenType.MINUS:
            return UnaryOperator.NEGATION;
        case TokenType.UNARY_BITWISE_COMPLEMENT:
            return UnaryOperator.BITWISE_COMPLEMENT;
        case TokenType.UNARY_LOGICAL_NEGATION:
            return UnaryOperator.LOGICAL_NEGATION;
    }
}

export class UnaryFactor implements Factor {
    readonly operator: UnaryOperator;
    readonly factor: Factor;
    constructor(operator: UnaryOperator, factor: Factor) {
        this.operator = operator;
        this.factor = factor;
    }
}


export class ReturnStatement implements Statement {
    public expression: Expression;
    constructor(expression: Expression) {
        this.expression = expression;
    }
}

export class FunctionDeclaration implements Node {
    readonly name: string;
    statements: Statement[];

    public constructor(name: string, statements: Statement[]) {
        this.name = name;
        this.statements = statements;
    }

    public addStatement(statement: Statement) {
        this.statements.push(statement);
    }
}

export class ProgramNode implements Node {
    mainFunction: FunctionDeclaration;
    constructor(mainFunction: FunctionDeclaration) {
        this.mainFunction = mainFunction;;
    }
}

export class AST {
    readonly programNode: ProgramNode;
    public constructor(programNode: ProgramNode) {
        this.programNode = programNode;
    }
}

class Stack<T> {

    private array: T[];

    constructor() {
        this.array = [];
    }

    public push(item: T): void {
        this.array.push(item);
    }

    public pop(): T {
        return this.array.pop();
    }

    public peek(): T {
        return this.array[this.array.length - 1];
    }
}