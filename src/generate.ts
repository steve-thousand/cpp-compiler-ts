import { ast } from './parser';

//TODO maybe not a string? stream it?
export function generate(ast: ast.AST): string {
    const programNode: ast.Program = ast.program;
    const mainFunction = programNode.functionDeclaration;
    return generateFunctionParts(<ast.Func>mainFunction);
}

function generateFunctionParts(functionDeclaration: ast.Func): string {
    const generatedParts = [];
    generatedParts.push(" .globl _" + functionDeclaration.name);
    generatedParts.push("_" + functionDeclaration.name + ":")
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
        generatedParts.push("ret")
    }
    return generatedParts.join("\n");
}

function generateExpression(expression: ast.Expression) {
    const generatedParts = [];
    if (expression instanceof ast.BinOp) {
        generatedParts.push(generateExpression(expression.left))
        generatedParts.push("push    %rax")
        generatedParts.push(generateExpression(expression.right))
        generatedParts.push("movl    %eax, %ecx") //righthand in ecx
        generatedParts.push("pop    %rax") //left hand in eax
        switch (expression.operator) {
            case ast.BinaryOperator.ADDITION:
                generatedParts.push("addl    %ecx, %eax")
                break;
            case ast.BinaryOperator.SUBTRACTION:
                generatedParts.push("subl    %ecx, %eax")
                break;
            case ast.BinaryOperator.MULTIPLICATION:
                generatedParts.push("imul    %ecx, %eax")
                break;
            case ast.BinaryOperator.DIVISION:
                generatedParts.push("cdq")
                generatedParts.push("idivl    %ecx")
                break;
        }
    } else if (expression instanceof ast.UnOp) {
        const operator: ast.UnaryOperator = expression.operator;
        switch (operator) {
            case ast.UnaryOperator.NEGATION:
                generatedParts.push(generateExpression(expression.expression))
                generatedParts.push("neg    %eax");
                break;
            case ast.UnaryOperator.LOGICAL_NEGATION:
                generatedParts.push(generateExpression(expression.expression))
                generatedParts.push("cmpl    $0, %eax");
                generatedParts.push("movl    $0, %eax");
                generatedParts.push("sete    %al");
                break;
            case ast.UnaryOperator.BITWISE_COMPLEMENT:
                generatedParts.push(generateExpression(expression.expression))
                generatedParts.push("xor    %eax, 0xFFFF");
                break;
        }
    } else if (expression instanceof ast.Constant) {
        generatedParts.push("movl    $" + expression.value + ", %eax");
    }
    return generatedParts.join("\n");
}