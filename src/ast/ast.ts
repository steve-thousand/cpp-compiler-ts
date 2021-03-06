//marker interface
export interface Node { }

export enum BinaryOperator {
    ADDITION = "+",
    SUBTRACTION = "-",
    MULTIPLICATION = "*",
    DIVISION = "/",
    MODULO = "%",
    BITWISE_AND = "&",
    BITWISE_OR = "|",
    BITWISE_XOR = "^",
    BITWISE_SHIFT_LEFT = "<<",
    BITWISE_SHIFT_RIGHT = ">>",
    EQUAL = "==",
    NOT_EQUAL = "!=",
    LESS_THAN = "<",
    LESS_THAN_OR_EQUAL = "<=",
    GREATER_THAN = ">",
    GREATER_THAN_OR_EQUAL = ">=",
    OR = "||",
    AND = "&&",
    ASSIGNMENT = "=",
    COMPOUND_ASSIGNMENT_ADDITION = "+=",
    COMPOUND_ASSIGNMENT_SUBTRACTION = "-=",
    COMPOUND_ASSIGNMENT_MULTIPLICATION = "*=",
    COMPOUND_ASSIGNMENT_DIVISION = "/=",
    COMPOUND_ASSIGNMENT_MODULO = "%=",
    COMPOUND_ASSIGNMENT_BITSHIFT_LEFT = "<<",
    COMPOUND_ASSIGNMENT_BITSHIFT_RIGHT = ">>",
    COMPOUND_ASSIGNMENT_BITWISE_AND = "&=",
    COMPOUND_ASSIGNMENT_BITWISE_OR = "|=",
    COMPOUND_ASSIGNMENT_BITWISE_XOR = "^="
}

export enum UnaryOperator {
    NEGATION = "-",
    BITWISE_COMPLEMENT = "~",
    LOGICAL_NEGATION = "!",
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
export class CondExp extends Expression {
    readonly condition: Expression;
    readonly ifExp: Expression;
    readonly elseExp: Expression;
    constructor(condition: Expression, ifExp: Expression, elseExp: Expression) {
        super();
        this.condition = condition;
        this.ifExp = ifExp;
        this.elseExp = elseExp;
    }
}
export class FuncCall extends Expression {
    readonly identifier: string;
    readonly args: Expression[];
    constructor(identifier: string, args: Expression[]) {
        super();
        this.identifier = identifier;
        this.args = args;
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
export class ExpStatement extends Statement {
    readonly expression: Expression;
    constructor(expression?: Expression) {
        super();
        this.expression = expression;
    }
}
export class Conditional extends Statement {
    readonly condition: Expression;
    readonly ifStatement: Statement;
    readonly elseStatement?: Statement;
    constructor(condition: Expression, ifStatement: Statement, elseStatement?: Statement) {
        super();
        this.condition = condition;
        this.ifStatement = ifStatement;
        this.elseStatement = elseStatement;
    }
}
export class Compound extends Statement {
    readonly blockItems: BlockItem[] = [];
    constructor(blockItems: BlockItem[]) {
        super();
        this.blockItems = blockItems;
    }
}
export class For extends Statement {
    readonly init?: Expression;
    readonly condition: Expression;
    readonly post?: Expression;
    readonly body: Statement;
    constructor(init: Expression, condition: Expression, post: Expression, body: Statement) {
        super();
        this.init = init;
        this.condition = condition;
        this.post = post;
        this.body = body;
    }
}
export class ForDecl extends Statement {
    readonly decl: Declaration;
    readonly condition: Expression;
    readonly post?: Expression;
    readonly body: Statement;
    constructor(decl: Declaration, condition: Expression, post: Expression, body: Statement) {
        super();
        this.decl = decl;
        this.condition = condition;
        this.post = post;
        this.body = body;
    }
}
export class While extends Statement {
    readonly condition: Expression;
    readonly body: Statement;
    constructor(condition: Expression, body: Statement) {
        super();
        this.condition = condition;
        this.body = body;
    }
}
export class Do extends Statement {
    readonly body: Statement;
    readonly condition: Expression;
    constructor(body: Statement, condition: Expression) {
        super();
        this.body = body;
        this.condition = condition;
    }
}
export class Break extends Statement { }
export class Continue extends Statement { }

export class Declaration implements Node { }

export class Declare extends Declaration {
    readonly identifier: string;
    readonly expression: Expression;
    constructor(identifier: string, expression?: Expression) {
        super();
        this.identifier = identifier;
        this.expression = expression;
    }
}

export type BlockItem = Statement | Declaration;

export class FunctionDeclaration implements Node { }
export class Func extends FunctionDeclaration {
    readonly identifier: string;
    readonly parameters: string[];
    readonly blockItems: BlockItem[];
    constructor(identifier: string, parameters: string[], blockItems: BlockItem[]) {
        super();
        this.identifier = identifier;
        this.parameters = parameters;
        this.blockItems = blockItems;
    }
}

export class Program implements Node {
    readonly functionDeclarations: FunctionDeclaration[];
    constructor(functionDeclarations: FunctionDeclaration[]) {
        this.functionDeclarations = functionDeclarations;
    }
}

export class AST {
    readonly program: Program;
    public constructor(program: Program) {
        this.program = program;
    }
}