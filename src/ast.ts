//marker interface
export interface Node { }

export enum BinaryOperator {
    ADDITION,
    SUBTRACTION,
    MULTIPLICATION,
    DIVISION,
    EQUAL,
    NOT_EQUAL,
    GREATER_THAN,
    GREATER_THAN_OR_EQUAL,
    LESS_THAN,
    LESS_THAN_OR_EQUAL,
    OR,
    AND
}

export enum UnaryOperator {
    NEGATION,
    BITWISE_COMPLEMENT,
    LOGICAL_NEGATION,
}

export abstract class Expression implements Node { }
export class BinOp extends Expression {
    readonly operator: BinaryOperator;
    readonly left: Expression;
    readonly right: Expression;
    constructor(operator: BinaryOperator, left: Expression, right: Expression) {
        super();
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}
export class UnOp extends Expression {
    readonly operator: UnaryOperator;
    readonly expression: Expression;
    constructor(operator: UnaryOperator, expression: Expression) {
        super();
        this.operator = operator;
        this.expression = expression;
    }
}
export class Constant extends Expression {
    readonly value: number;
    constructor(value: number) {
        super();
        this.value = value;
    }
}

export abstract class Statement implements Node { }
export class Return extends Statement {
    readonly expression: Expression;
    constructor(expression: Expression) {
        super();
        this.expression = expression;
    }
}

export class FunctionDeclaration implements Node { }
export class Func extends FunctionDeclaration {
    readonly name: string;
    readonly statements: Statement[]
    constructor(name: string, statements: Statement[]) {
        super();
        this.name = name;
        this.statements = statements;
    }
}

export class Program implements Node {
    readonly functionDeclaration: FunctionDeclaration;
    constructor(functionDeclaration: FunctionDeclaration) {
        this.functionDeclaration = functionDeclaration;
    }
}

export class AST {
    readonly program: Program;
    public constructor(program: Program) {
        this.program = program;
    }
}