import { AST, ProgramNode, FunctionDeclaration, ReturnStatement, Statement, Expression, Constant, UnaryOperation, UnaryOperator } from './parser';

//TODO maybe not a string?
export function generate(ast: AST): string {
    const programNode: ProgramNode = ast.programNode;
    const mainFunction = programNode.mainFunction;
    return generateFunctionParts(mainFunction);
}

function generateFunctionParts(functionDeclaration: FunctionDeclaration): string {
    const generatedParts = [];
    generatedParts.push(" .globl _" + functionDeclaration.name);
    generatedParts.push("_" + functionDeclaration.name + ":")
    for (let statement of functionDeclaration.statements) {
        generatedParts.push(generateStatement(statement));
    }
    return generatedParts.join("\n");
}

function generateStatement(statement: Statement): string {
    const generatedParts = [];
    if (statement instanceof ReturnStatement) {
        if (statement.expression) {
            generatedParts.push(generateExpression(statement.expression));
        }
        generatedParts.push("ret")
    }
    return generatedParts.join("\n");
}

function generateExpression(expression: Expression) {
    const generatedParts = [];
    if (expression instanceof Constant) {
        generatedParts.push("movl    $" + expression.value + ", %eax");
    } else if (expression instanceof UnaryOperation) {
        const operator = expression.operator;
        switch (operator) {
            case UnaryOperator.NEGATION:
                generatedParts.push(generateExpression(expression.expression))
                generatedParts.push("neg    %eax");
                break;
            case UnaryOperator.LOGICAL_NEGATION:
                generatedParts.push(generateExpression(expression.expression))
                generatedParts.push("cmpl    $0, %eax");
                generatedParts.push("movl    $0, %eax");
                generatedParts.push("sete    %al");
                break;
            case UnaryOperator.BITWISE_COMPLEMENT:
                generatedParts.push(generateExpression(expression.expression))
                generatedParts.push("xor    %eax, 0xFFFF");
                break;
        }
    }
    return generatedParts.join("\n");
}