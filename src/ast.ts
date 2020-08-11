//marker interface
export interface Node { }

export enum BinaryOperator {
    ADDITION,
    SUBTRACTION,
    MULTIPLICATION,
    DIVISION,
    MODULO,
    BITWISE_AND,
    BITWISE_OR,
    BITWISE_XOR,
    BITWISE_SHIFT_LEFT,
    BITWISE_SHIFT_RIGHT,
    EQUAL,
    NOT_EQUAL,
    GREATER_THAN,
    GREATER_THAN_OR_EQUAL,
    LESS_THAN,
    LESS_THAN_OR_EQUAL,
    OR,
    AND,
    ASSIGNMENT,
    COMPOUND_ASSIGNMENT_ADDITION,
    COMPOUND_ASSIGNMENT_SUBTRACTION,
    COMPOUND_ASSIGNMENT_MULTIPLICATION,
    COMPOUND_ASSIGNMENT_DIVISION,
    COMPOUND_ASSIGNMENT_MODULO,
    COMPOUND_ASSIGNMENT_BITSHIFT_LEFT,
    COMPOUND_ASSIGNMENT_BITSHIFT_RIGHT,
    COMPOUND_ASSIGNMENT_BITWISE_AND,
    COMPOUND_ASSIGNMENT_BITWISE_OR,
    COMPOUND_ASSIGNMENT_BITWISE_XOR
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
export class Assignment extends Expression {
    readonly identifier: string;
    readonly expression: Expression;
    constructor(identifier: string, expression: Expression) {
        super();
        this.identifier = identifier;
        this.expression = expression;
    }
}
export class VarReference extends Expression {
    readonly identifier: string;
    constructor(identifier: string) {
        super();
        this.identifier = identifier;
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
export class Declaration extends Statement {
    readonly identifier: string;
    readonly expression: Expression;
    constructor(identifier: string, expression?: Expression) {
        super();
        this.identifier = identifier;
        this.expression = expression;
    }
}
export class ExpStatement extends Statement {
    readonly expression: Expression;
    constructor(expression: Expression) {
        super();
        this.expression = expression;
    }
}

export class FunctionDeclaration implements Node { }
export class Func extends FunctionDeclaration {
    readonly identifier: string;
    readonly statements: Statement[]
    constructor(identifier: string, statements: Statement[]) {
        super();
        this.identifier = identifier;
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