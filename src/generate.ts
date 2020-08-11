import { ast } from './parser';

const FOUR_SPACES = "    ";

const contextStack = [];

class Context {
    private offset: number = 0;
    private identifierMap: Map<string, number> = new Map();;
    addIdentifier(identifier: string, size: number) {
        this.offset += size;
        this.identifierMap.set(identifier, this.offset)
        return this.offset;
    }
    getIdentifier(identifier: string) {
        return this.identifierMap.get(identifier);
    }
    getSize() {
        return this.offset
    }
}

class UniqueIdGenerator {
    private count: number = 0;
    get(): number {
        this.count++;
        return this.count;
    }
}

const uniq = new UniqueIdGenerator();

//TODO maybe not a string? stream it?
export function generate(ast: ast.AST): string {
    const programNode: ast.Program = ast.program;
    const mainFunction = programNode.functionDeclaration;
    return generateFunctionParts(<ast.Func>mainFunction);
}

function generateFunctionParts(functionDeclaration: ast.Func): string {
    const generatedParts = [];
    generatedParts.push(" .globl _" + functionDeclaration.identifier);
    generatedParts.push(label("_" + functionDeclaration.identifier))
    // generatedParts.push(line("pushq", "%rbp"));
    // generatedParts.push(line("movq", "%rsp", "%rbp"));
    contextStack.push(new Context());
    for (let statement of functionDeclaration.statements) {
        generatedParts.push(generateStatement(statement, functionDeclaration.identifier));
    }
    contextStack.shift();
    return generatedParts.join("\n");
}

function generateStatement(statement: ast.Statement, functionIdentifier: string): string {
    const generatedParts = [];
    if (statement instanceof ast.Return) {
        if (statement.expression) {
            generatedParts.push(generateExpression(statement.expression));
        }
        const size = contextStack[contextStack.length - 1].getSize();
        if (size) {
            generatedParts.push(lineAndComment(`deallocate ${size} bytes`, "addq", "$" + size, "%rsp"))
        }
        // generatedParts.push(line("movq", "%rbp", "%rsp"))
        // generatedParts.push(line("popq", "%rbp"));
        generatedParts.push(lineAndComment(functionIdentifier + " - return", "ret"))
    } else if (statement instanceof ast.Declaration) {
        //push to stack
        const identifier = statement.identifier;
        contextStack[contextStack.length - 1].addIdentifier(identifier, 8);
        generatedParts.push(lineAndComment(`allocate \`${identifier}\`, ${8} bytes`, "subq", "$8", "%rsp"))
        if (statement.expression) {
            generatedParts.push(generateExpression(statement.expression))
            generatedParts.push(lineAndComment(`\`${identifier}\` assignment`, "movq", "%rax", contextStack[contextStack.length - 1].getIdentifier(identifier) + "(%rbp)"));
        }
        // generatedParts.push(lineAndComment("`" + identifier + "` declaration" + (statement.expression ? " and assignment" : ""), "push", "%rax"));
    } else if (statement instanceof ast.ExpStatement) {
        generatedParts.push(generateExpression(statement.expression));
    }
    return generatedParts.join("\n");
}

function generateExpression(expression: ast.Expression) {
    const generatedParts = [];
    if (expression instanceof ast.BinOp) {
        const id = uniq.get();
        generatedParts.push(generateExpression(expression.left))
        generatedParts.push(line("pushq", "%rax"))
        generatedParts.push(generateExpression(expression.right))
        generatedParts.push(line("movq", "%rax", "%rcx")) //righthand in rcx
        generatedParts.push(line("popq", "%rax")) //left hand in rax
        switch (expression.operator) {
            case ast.BinaryOperator.ADDITION:
                generatedParts.push(lineAndComment("+", "addq", "%rcx", "%rax"))
                break;
            case ast.BinaryOperator.SUBTRACTION:
                generatedParts.push(lineAndComment("-", "subq", "%rcx", "%rax"))
                break;
            case ast.BinaryOperator.MULTIPLICATION:
                generatedParts.push(lineAndComment("*", "imulq", "%rcx", "%rax"))
                break;
            case ast.BinaryOperator.DIVISION:
                generatedParts.push(line("cdq"))
                generatedParts.push(lineAndComment("/", "idivq", "%rcx"))
                break;
            case ast.BinaryOperator.MODULO:
                //https://stackoverflow.com/a/8232170/3529744
                generatedParts.push(line("cdq"))
                generatedParts.push(lineAndComment("%", "idivq", "%rcx"))
                generatedParts.push(line("movq", "%rdx", "%rax"));
                break;
            case ast.BinaryOperator.BITWISE_AND:
                generatedParts.push(lineAndComment("&", "and", "%rcx", "%rax"))
                break;
            case ast.BinaryOperator.BITWISE_OR:
                generatedParts.push(lineAndComment("|", "or", "%rcx", "%rax"))
                break;
            case ast.BinaryOperator.BITWISE_XOR:
                generatedParts.push(lineAndComment("^", "xor", "%rcx", "%rax"))
                break;
            case ast.BinaryOperator.BITWISE_SHIFT_LEFT:
                generatedParts.push(lineAndComment("<<", "shl", "%rcx", "%rax"))
                break;
            case ast.BinaryOperator.BITWISE_SHIFT_RIGHT:
                generatedParts.push(lineAndComment(">>", "shr", "%rcx", "%rax"))
                break;
            case ast.BinaryOperator.EQUAL:
                generatedParts.push(line("cmpq", "%rcx", "%rax"))
                generatedParts.push(line("movq", "$0", "%rax"));
                generatedParts.push(line("sete", "%al"));
                break;
            case ast.BinaryOperator.NOT_EQUAL:
                generatedParts.push(line("cmpq", "%rcx", "%rax"))
                generatedParts.push(line("movq", "$0", "%rax"));
                generatedParts.push(line("setne", "%al"));
                break;
            case ast.BinaryOperator.LESS_THAN:
                generatedParts.push(line("cmpq", "%rcx", "%rax"))
                generatedParts.push(line("movq", "$0", "%rax"));
                generatedParts.push(line("setl", "%al"));
                break;
            case ast.BinaryOperator.LESS_THAN_OR_EQUAL:
                generatedParts.push(line("cmpq", "%rcx", "%rax"))
                generatedParts.push(line("movq", "$0", "%rax"));
                generatedParts.push(line("setle", "%al"));
                break;
            case ast.BinaryOperator.GREATER_THAN:
                generatedParts.push(line("cmpq", "%rcx", "%rax"))
                generatedParts.push(line("movq", "$0", "%rax"));
                generatedParts.push(line("setg", "%al"));
                break;
            case ast.BinaryOperator.GREATER_THAN_OR_EQUAL:
                generatedParts.push(line("cmpq", "%rcx", "%rax"))
                generatedParts.push(line("movq", "$0", "%rax"));
                generatedParts.push(line("setge", "%al"));
                break;
            case ast.BinaryOperator.OR:
                generatedParts.push(lineAndComment("|| start", "cmpq", "$0", "%rax"))
                generatedParts.push(lineAndComment("|| short circuit", "je", "_clause" + id))
                generatedParts.push(line("movq", "$1", "%rax"));
                generatedParts.push(line("jmp", "_end" + id))
                generatedParts.push(label("_clause" + id))
                generatedParts.push(line("movq", "%rcx", "%rax"))
                generatedParts.push(line("cmpq", "$0", "%rax"))
                generatedParts.push(line("movq", "$0", "%rax"))
                generatedParts.push(lineAndComment("|| end", "setne", "%al"));
                generatedParts.push(label("_end" + id))
                break;
            case ast.BinaryOperator.AND:
                generatedParts.push(lineAndComment("&& start", "cmpq", "$0", "%rax"))
                generatedParts.push(lineAndComment("&& short circuit", "je", "_end" + id))
                generatedParts.push(line("movq", "%rcx", "%rax"))
                generatedParts.push(line("cmpq", "$0", "%rax"))
                generatedParts.push(line("movq", "$0", "%rax"))
                generatedParts.push(lineAndComment("&& end", "setne", "%al"));
                generatedParts.push(label("_end" + id))
                break;
        }
    } else if (expression instanceof ast.UnOp) {
        const operator: ast.UnaryOperator = expression.operator;
        switch (operator) {
            case ast.UnaryOperator.NEGATION:
                generatedParts.push(generateExpression(expression.expression))
                generatedParts.push(line("neg", "%rax"));
                break;
            case ast.UnaryOperator.LOGICAL_NEGATION:
                generatedParts.push(generateExpression(expression.expression))
                generatedParts.push(line("cmpq", "$0", "%rax"));
                generatedParts.push(line("movq", "$0", "%rax"));
                generatedParts.push(line("sete", "%al"));
                break;
            case ast.UnaryOperator.BITWISE_COMPLEMENT:
                generatedParts.push(generateExpression(expression.expression))
                generatedParts.push(line("xor", "%rax", "0xFFFF"));
                break;
        }
    } else if (expression instanceof ast.Constant) {
        generatedParts.push(line("movq", "$" + expression.value, "%rax"));
    } else if (expression instanceof ast.Assignment) {
        const identifier = expression.identifier;
        generatedParts.push(generateExpression(expression.expression))
        generatedParts.push(lineAndComment("`" + identifier + "` assignment", "movq", "%rax", contextStack[contextStack.length - 1].getIdentifier(identifier) + "(%rbp)"));
    } else if (expression instanceof ast.VarReference) {
        const identifier = expression.identifier;
        generatedParts.push(lineAndComment("`" + identifier + "` reference", "movq", contextStack[contextStack.length - 1].getIdentifier(identifier) + "(%rbp)", "%rax"));
    }
    return generatedParts.join("\n");
}

function label(label: string) {
    return label + ":";
}

function line(instruction, ...args): string {
    return lineAndComment(undefined, instruction, ...args);
}

function lineAndComment(comment, instruction, ...args): string {
    const parts = [];
    parts.push(FOUR_SPACES);
    parts.push(instruction);
    parts.push(' '.repeat(8 - instruction.length));
    const argsString = args.join(", ");
    parts.push(argsString);
    if (comment) {
        const offset = 30 - argsString.length
        parts.push(' '.repeat(offset) + " // " + comment);
    }
    return parts.join("");
}