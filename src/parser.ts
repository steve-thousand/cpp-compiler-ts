import { Token, TokenType } from './token';

export function parse(tokens: Token[]): AST {
    const stack: Stack<Node> = new Stack<Node>();
    stack.push(new ProgramNode());
    let index = 0;
    while (index < tokens.length) {
        const token = tokens[index];
        index++;
        switch (token.type) {
            case TokenType.PARENTHESES_OPEN:
                //function arguments
                break;
            case TokenType.PARENTHESES_CLOSE:
                //end of functional arguments
                break;
            case TokenType.BRACE_OPEN:
                //opening of function body
                break;
            case TokenType.BRACE_CLOSE:
                //closing of function body, let's pop node
                let functionDeclaration: FunctionDeclaration = <FunctionDeclaration>stack.pop();
                const programNode: ProgramNode = <ProgramNode>stack.peek();
                programNode.setMain(functionDeclaration);
                break;
            case TokenType.SEMICOLON:
                //end of a statement
                break;
            case TokenType.KEYWORD:
                //uhhhh
                if (token.isPrimitiveType()) {
                    //let's just say for now that this is always the return type of a function
                    const functionName: string = tokens[index++].value;
                    index += 3;
                    stack.push(new FunctionDeclaration(functionName));
                } else if (token.value === "return") {
                    stack.push(new ReturnStatement());
                    stack.push(new Expression());
                }
                break;
            case TokenType.IDENTIFIER:
                //UHHHHH
                break;
            case TokenType.LITERAL_INTEGER:
                const value = token.value;
                const expression: Expression = <Expression>stack.pop();
                expression.setConstant(new Constant(parseInt(value)));
                const statement: ReturnStatement = <ReturnStatement>stack.pop();
                statement.setExpression(expression);
                functionDeclaration = <FunctionDeclaration>stack.peek();
                functionDeclaration.addStatement(statement);
                break;
        }
    }
    return new AST(<ProgramNode>stack.pop());
}

export abstract class Node {

}

export class Return extends Node {
    private expression: Expression;
}

export class Constant extends Node {
    readonly value: number;
    constructor(value: number) {
        super();
        this.value = value;
    }
}

export class Expression extends Node {
    constant: Constant;
    public setConstant(constant: Constant) {
        this.constant = constant;
    }
}

export abstract class Statement extends Node { }

export class ReturnStatement extends Statement {
    expression: Expression
    public setExpression(expression: Expression) {
        this.expression = expression;
    }
}

export class FunctionDeclaration extends Node {
    readonly name: string;
    statements: Statement[];

    public constructor(name: string) {
        super();
        this.name = name;
        this.statements = [];
    }

    public addStatement(statement: Statement) {
        this.statements.push(statement);
    }
}

export class ProgramNode extends Node {
    mainFunction: FunctionDeclaration;
    public setMain(functionDeclaration: FunctionDeclaration) {
        this.mainFunction = functionDeclaration;
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