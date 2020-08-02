import { Token, TokenType } from './token';

//stateful crawler
class TokenCrawler {

    private index: number = 0;
    private readonly tokens: Token[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;;
    }

    private parseExpression(): Expression {
        let expression: Expression;
        while (this.index < this.tokens.length) {
            const token = this.tokens[this.index];
            this.index++;
            switch (token.type) {
                case TokenType.UNARY_NEGATION:
                    return new UnaryOperation(UnaryOperator.NEGATION, this.parseExpression());
                case TokenType.UNARY_BITWISE_COMPLEMENT:
                    return new UnaryOperation(UnaryOperator.BITWISE_COMPLEMENT, this.parseExpression());
                case TokenType.UNARY_LOGICAL_NEGATION:
                    return new UnaryOperation(UnaryOperator.LOGICAL_NEGATION, this.parseExpression());
                case TokenType.IDENTIFIER:
                    //UHHHHH
                    break;
                case TokenType.LITERAL_INTEGER:
                    const value = token.value;
                    return new Constant(parseInt(value));
            }
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

export interface Expression extends Node { }

export interface Statement extends Node { }

export class Constant implements Expression {
    readonly value: number;
    constructor(value: number) {
        this.value = value;
    }
}

export enum UnaryOperator {
    NEGATION,
    BITWISE_COMPLEMENT,
    LOGICAL_NEGATION,
}

export class UnaryOperation implements Expression {
    readonly operator: UnaryOperator;
    readonly expression: Expression;
    constructor(operator: UnaryOperator, expression: Expression) {
        this.operator = operator;
        this.expression = expression;
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