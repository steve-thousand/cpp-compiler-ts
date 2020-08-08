import { ast } from './parser';

const FOUR_SPACES = "    ";

//TODO maybe not a string? stream it?
export function generate(ast: ast.AST): string {
    const programNode: ast.Program = ast.program;
    const mainFunction = programNode.functionDeclaration;
    return generateFunctionParts(<ast.Func>mainFunction);
}

function generateFunctionParts(functionDeclaration: ast.Func): string {
    const generatedParts = [];
    generatedParts.push(" .globl _" + functionDeclaration.name);
    generatedParts.push(label("_" + functionDeclaration.name))
    for (let statement of functionDeclaration.statements) {
        generatedParts.push(generateStatement(statement));
    }
    return generatedParts.join("\n");
}

function generateStatement(statement: ast.Statement): string {
    const generatedParts = [];
    if (statement instanceof ast.Return) {
        if (statement.expression) {
            generatedParts.push(generateExpression(statement.expression));
        }
        generatedParts.push(line("ret"))
    }
    return generatedParts.join("\n");
}

function generateExpression(expression: ast.Expression) {
    const generatedParts = [];
    if (expression instanceof ast.BinOp) {
        generatedParts.push(generateExpression(expression.left))
        generatedParts.push(line("push", "%rax"))
        generatedParts.push(generateExpression(expression.right))
        generatedParts.push(line("movl", "%eax", "%ecx")) //righthand in ecx
        generatedParts.push(line("pop", "%rax")) //left hand in eax
        switch (expression.operator) {
            case ast.BinaryOperator.ADDITION:
                generatedParts.push(line("addl", "%ecx", "%eax"))
                break;
            case ast.BinaryOperator.SUBTRACTION:
                generatedParts.push(line("subl", "%ecx", "%eax"))
                break;
            case ast.BinaryOperator.MULTIPLICATION:
                generatedParts.push(line("imul", "%ecx", "%eax"))
                break;
            case ast.BinaryOperator.DIVISION:
                generatedParts.push(line("cdq"))
                generatedParts.push(line("idivl", "%ecx"))
                break;
            case ast.BinaryOperator.EQUAL:
                generatedParts.push(line("cmpl", "%ecx", "%eax"))
                generatedParts.push(line("movl", "$0", "%eax"));
                generatedParts.push(line("sete", "%al"));
                break;
            case ast.BinaryOperator.NOT_EQUAL:
                generatedParts.push(line("cmpl", "%ecx", "%eax"))
                generatedParts.push(line("movl", "$0", "%eax"));
                generatedParts.push(line("setne", "%al"));
                break;
            case ast.BinaryOperator.LESS_THAN:
                generatedParts.push(line("cmpl", "%ecx", "%eax"))
                generatedParts.push(line("movl", "$0", "%eax"));
                generatedParts.push(line("setl", "%al"));
                break;
            case ast.BinaryOperator.LESS_THAN_OR_EQUAL:
                generatedParts.push(line("cmpl", "%ecx", "%eax"))
                generatedParts.push(line("movl", "$0", "%eax"));
                generatedParts.push(line("setle", "%al"));
                break;
            case ast.BinaryOperator.GREATER_THAN:
                generatedParts.push(line("cmpl", "%ecx", "%eax"))
                generatedParts.push(line("movl", "$0", "%eax"));
                generatedParts.push(line("setg", "%al"));
                break;
            case ast.BinaryOperator.GREATER_THAN_OR_EQUAL:
                generatedParts.push(line("cmpl", "%ecx", "%eax"))
                generatedParts.push(line("movl", "$0", "%eax"));
                generatedParts.push(line("setge", "%al"));
                break;
        }
    } else if (expression instanceof ast.UnOp) {
        const operator: ast.UnaryOperator = expression.operator;
        switch (operator) {
            case ast.UnaryOperator.NEGATION:
                generatedParts.push(generateExpression(expression.expression))
                generatedParts.push(line("neg", "%eax"));
                break;
            case ast.UnaryOperator.LOGICAL_NEGATION:
                generatedParts.push(generateExpression(expression.expression))
                generatedParts.push(line("cmpl", "$0", "%eax"));
                generatedParts.push(line("movl", "$0", "%eax"));
                generatedParts.push(line("sete", "%al"));
                break;
            case ast.UnaryOperator.BITWISE_COMPLEMENT:
                generatedParts.push(generateExpression(expression.expression))
                generatedParts.push(line("xor", "%eax", "0xFFFF"));
                break;
        }
    } else if (expression instanceof ast.Constant) {
        generatedParts.push(line("movl", "$" + expression.value, "%eax"));
    }
    return generatedParts.join("\n");
}

function label(label: string) {
    return label + ":";
}

function line(instruction, ...args): string {
    const parts = [];
    parts.push(FOUR_SPACES);
    parts.push(instruction);
    parts.push(FOUR_SPACES);
    parts.push(args.join(", "));
    return parts.join("");
}