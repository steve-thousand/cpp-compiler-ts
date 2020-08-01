import { AST, ProgramNode, FunctionDeclaration, ReturnStatement, Statement } from './parser';

//TODO maybe not a string?
export function generate(ast: AST): string {
    const generatedParts = [];
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
    if (statement instanceof ReturnStatement) {
        return "movl    $" + statement.expression.constant.value + ", %eax\nret";
    }
}