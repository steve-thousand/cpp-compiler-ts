import { AST, ProgramNode, FunctionDeclaration, ReturnStatement, Statement, Expression, UnaryFactor, UnaryOperator, LiteralFactor, SimpleExpression, Term, Factor, SimpleTerm, BinaryExpression, BinaryOperator, BinaryTerm, ExpressionFactor } from './parser';

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
    if (expression instanceof SimpleExpression) {
        generatedParts.push(generateTerm(expression.term));
    } else if (expression instanceof BinaryExpression) {
        generatedParts.push(generateTerm(expression.leftHandSide))
        generatedParts.push("push    %rax")
        generatedParts.push(generateTerm(expression.rightHandSide))
        generatedParts.push("movl    %eax, %ecx") //righthand in ecx
        generatedParts.push("pop    %rax") //left hand in eax
        switch (expression.operator) {
            case BinaryOperator.ADDITION:
                generatedParts.push("addl    %ecx, %eax")
                break;
            case BinaryOperator.SUBTRACTION:
                generatedParts.push("subl    %ecx, %eax")
                break;
        }
    }
    return generatedParts.join("\n");
}

function generateTerm(term: Term) {
    const generatedParts = [];
    if (term instanceof SimpleTerm) {
        generatedParts.push(generateFactor(term.factor));
    } else if (term instanceof BinaryTerm) {
        generatedParts.push(generateFactor(term.leftHandSide))
        generatedParts.push("push    %rax")
        generatedParts.push(generateFactor(term.rightHandSide))
        generatedParts.push("movl    %eax, %ecx") //righthand in ecx
        generatedParts.push("pop    %rax") //left hand in eax
        switch (term.operator) {
            case BinaryOperator.MULTIPLICATION:
                generatedParts.push("imul    %ecx, %eax")
                break;
            case BinaryOperator.DIVISION:
                generatedParts.push("cdq")
                generatedParts.push("idivl    %ecx")
                break;
        }
    }
    return generatedParts.join("\n");
}

function generateFactor(factor: Factor) {
    const generatedParts = [];
    if (factor instanceof LiteralFactor) {
        generatedParts.push("movl    $" + factor.value + ", %eax");
    } else if (factor instanceof UnaryFactor) {
        const operator = factor.operator;
        switch (operator) {
            case UnaryOperator.NEGATION:
                generatedParts.push(generateFactor(factor.factor))
                generatedParts.push("neg    %eax");
                break;
            case UnaryOperator.LOGICAL_NEGATION:
                generatedParts.push(generateFactor(factor.factor))
                generatedParts.push("cmpl    $0, %eax");
                generatedParts.push("movl    $0, %eax");
                generatedParts.push("sete    %al");
                break;
            case UnaryOperator.BITWISE_COMPLEMENT:
                generatedParts.push(generateFactor(factor.factor))
                generatedParts.push("xor    %eax, 0xFFFF");
                break;
        }
    } else if (factor instanceof ExpressionFactor) {
        generatedParts.push(generateExpression(factor.expression));
    }
    return generatedParts.join("\n");
}