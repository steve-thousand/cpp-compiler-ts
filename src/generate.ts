import { ast } from './parser';
import { Instruction, Opcode, Register, Label, Global, OpBuilder } from './assembly';

const RAX = Register.RAX;
const RCX = Register.RCX;
const RDX = Register.RDX;
const AL = Register.AL;

const RBP = Register.RBP;
const RSP = Register.RSP;

class UniqueIdGenerator {
    private count: number = 0;
    get(): number {
        this.count++;
        return this.count;
    }
}

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

//TODO: will need a context stack to be able to resolve an identifier from a parent scope
class Stack<T> {
    private internal: T[] = [];

    push(t: T) {
        this.internal.push(t);
    }

    pop(): T {
        return this.internal.pop();
    }

    peek(): T {
        return this.internal[this.internal.length - 1];
    }
}

export class InstructionGenerator {

    private uniq = new UniqueIdGenerator();
    private contextStack = new Stack<Context>();

    generateExpression(expression: ast.Expression): Instruction[] {
        let instructions: Instruction[] = [];
        if (expression instanceof ast.BinOp) {
            const id = this.uniq.get();

            //instructions to calculate left and right hand sides
            instructions = instructions.concat(this.generateExpression(expression.left))
            instructions.push(new OpBuilder(Opcode.PUSH).withOperands(RAX).build());
            instructions = instructions.concat(this.generateExpression(expression.right))
            instructions.push(new OpBuilder(Opcode.MOV).withOperands(RAX, RCX).build()); //righthand in rcx
            instructions.push(new OpBuilder(Opcode.POP).withOperands(RAX).build()); //left hand in rax

            switch (expression.operator) {
                case ast.BinaryOperator.ADDITION:
                    instructions.push(new OpBuilder(Opcode.ADD).withOperands(RCX, RAX).withComment("+").build());
                    break;
                case ast.BinaryOperator.SUBTRACTION:
                    instructions.push(new OpBuilder(Opcode.SUB).withOperands(RCX, RAX).withComment("-").build());
                    break;
                case ast.BinaryOperator.MULTIPLICATION:
                    instructions.push(new OpBuilder(Opcode.IMUL).withOperands(RCX, RAX).withComment("*").build());
                    break;
                case ast.BinaryOperator.DIVISION:
                    instructions.push(new OpBuilder(Opcode.CDQ).build());
                    instructions.push(new OpBuilder(Opcode.IDIV).withOperands(RCX).withComment("/").build());
                    break;
                case ast.BinaryOperator.MODULO:
                    //https://stackoverflow.com/a/8232170/3529744
                    instructions.push(new OpBuilder(Opcode.CDQ).build());
                    instructions.push(new OpBuilder(Opcode.IDIV).withOperands(RCX).withComment("%").build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(RDX, RAX).build());
                    break;
                case ast.BinaryOperator.BITWISE_AND:
                    instructions.push(new OpBuilder(Opcode.AND).withOperands(RCX, RAX).withComment("&").build());
                    break;
                case ast.BinaryOperator.BITWISE_OR:
                    instructions.push(new OpBuilder(Opcode.OR).withOperands(RCX, RAX).withComment("|").build());
                    break;
                case ast.BinaryOperator.BITWISE_XOR:
                    instructions.push(new OpBuilder(Opcode.XOR).withOperands(RCX, RAX).withComment("^").build());
                    break;
                case ast.BinaryOperator.BITWISE_SHIFT_LEFT:
                    instructions.push(new OpBuilder(Opcode.SHL).withOperands(RCX, RAX).withComment("<<").build());
                    break;
                case ast.BinaryOperator.BITWISE_SHIFT_RIGHT:
                    instructions.push(new OpBuilder(Opcode.SHR).withOperands(RCX, RAX).withComment(">>").build());
                    break;
                case ast.BinaryOperator.EQUAL:
                    instructions.push(new OpBuilder(Opcode.CMP).withOperands(RCX, RAX).build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.SETE).withOperands(AL).build());
                    break;
                case ast.BinaryOperator.NOT_EQUAL:
                    instructions.push(new OpBuilder(Opcode.CMP).withOperands(RCX, RAX).build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.SETNE).withOperands(AL).build());
                    break;
                case ast.BinaryOperator.LESS_THAN:
                    instructions.push(new OpBuilder(Opcode.CMP).withOperands(RCX, RAX).build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.SETL).withOperands(AL).build());
                    break;
                case ast.BinaryOperator.LESS_THAN_OR_EQUAL:
                    instructions.push(new OpBuilder(Opcode.CMP).withOperands(RCX, RAX).build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.SETLE).withOperands(AL).build());
                    break;
                case ast.BinaryOperator.GREATER_THAN:
                    instructions.push(new OpBuilder(Opcode.CMP).withOperands(RCX, RAX).build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.SETG).withOperands(AL).build());
                    break;
                case ast.BinaryOperator.GREATER_THAN_OR_EQUAL:
                    instructions.push(new OpBuilder(Opcode.CMP).withOperands(RCX, RAX).build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.SETGE).withOperands(AL).build());
                    break;
                case ast.BinaryOperator.OR:
                    let clauseLabel = "_clause_" + id;
                    let endLabel = "_end_" + id;
                    instructions.push(new OpBuilder(Opcode.CMP).withOperands(0, RAX).withComment("|| start").build());
                    instructions.push(new OpBuilder(Opcode.JE).withOperands(clauseLabel).withComment("|| short circuit").build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(1, RAX).build());
                    instructions.push(new OpBuilder(Opcode.JMP).withOperands(endLabel).build());
                    instructions.push(new Label(clauseLabel));
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(RCX, RAX).build());
                    instructions.push(new OpBuilder(Opcode.CMP).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.SETNE).withOperands(AL).withComment("|| end").build());
                    instructions.push(new Label(endLabel));
                    break;
                case ast.BinaryOperator.AND:
                    endLabel = "_end_" + id;
                    instructions.push(new OpBuilder(Opcode.CMP).withOperands(0, RAX).withComment("&& start").build());
                    instructions.push(new OpBuilder(Opcode.JE).withOperands(endLabel).withComment("&& short circuit").build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(RCX, RAX).build());
                    instructions.push(new OpBuilder(Opcode.CMP).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.SETNE).withOperands(AL).withComment("&& end").build());
                    instructions.push(new Label(endLabel));
                    break;
            }
        } else if (expression instanceof ast.UnOp) {
            const operator: ast.UnaryOperator = expression.operator;
            switch (operator) {
                case ast.UnaryOperator.NEGATION:
                    instructions = instructions.concat(this.generateExpression(expression.expression))
                    instructions.push(new OpBuilder(Opcode.NEG).withOperands(RAX).build());
                    break;
                case ast.UnaryOperator.LOGICAL_NEGATION:
                    instructions = instructions.concat(this.generateExpression(expression.expression))
                    instructions.push(new OpBuilder(Opcode.CMP).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.SETE).withOperands(AL).build());
                    break;
                case ast.UnaryOperator.BITWISE_COMPLEMENT:
                    instructions = instructions.concat(this.generateExpression(expression.expression))
                    instructions.push(new OpBuilder(Opcode.XOR).withOperands(RAX, "0xFFFF").build());
                    break;
            }
        } else if (expression instanceof ast.Constant) {

            instructions.push(new OpBuilder(Opcode.MOV).withOperands(expression.value, RAX).build());

        } else if (expression instanceof ast.Assignment) {

            const identifier = expression.identifier;
            instructions = instructions.concat(this.generateExpression(expression.expression))
            const size = this.contextStack.peek().getIdentifier(identifier);
            instructions.push(new OpBuilder(Opcode.MOV)
                .withOperands(RAX, Register.offset(RBP, size))
                .withComment(`\`${identifier}\` assignment`)
                .build());

        } else if (expression instanceof ast.VarReference) {

            const identifier = expression.identifier;
            const size = this.contextStack.peek().getIdentifier(identifier);
            instructions.push(new OpBuilder(Opcode.MOV)
                .withOperands(Register.offset(RBP, size), RAX)
                .withComment(`\`${identifier}\` reference`)
                .build());

        } else if (expression instanceof ast.CondExp) {

            const id = this.uniq.get();
            const postConditionalLabel = "_post_conditional_" + id;
            const elseLabel = "_else_" + id;

            instructions = instructions.concat(this.generateExpression(expression.condition));
            instructions.push(new OpBuilder(Opcode.CMP).withOperands(0, RAX).withComment("if").build());
            instructions.push(new OpBuilder(Opcode.JE).withOperands(elseLabel).withComment("false").build());

            //if true
            instructions = instructions.concat(this.generateExpression(expression.ifExp));
            instructions.push(new OpBuilder(Opcode.JMP).withOperands(postConditionalLabel).withComment("if done").build());
            instructions.push(new Label(elseLabel));

            //if false
            instructions = instructions.concat(this.generateExpression(expression.elseExp));
            instructions.push(new Label(postConditionalLabel));

        }
        return instructions;
    }

    generateStatement(statement: ast.Statement, functionIdentifier: string): Instruction[] {
        let instructions: Instruction[] = [];
        if (statement instanceof ast.Return) {
            if (statement.expression) {
                instructions = instructions.concat(this.generateExpression(statement.expression));
            }
            const size = this.contextStack.peek().getSize();
            if (size) {
                instructions.push(new OpBuilder(Opcode.ADD)
                    .withOperands(size, RSP)
                    .withComment(`deallocate ${size} bytes`)
                    .build());
            }
            instructions.push(new OpBuilder(Opcode.RET).withComment(functionIdentifier + " - return").build());
        } else if (statement instanceof ast.Declaration) {

            const identifier = statement.identifier;
            this.contextStack.peek().addIdentifier(identifier, 8);
            instructions.push(new OpBuilder(Opcode.SUB)
                .withOperands(8, RSP)
                .withComment(`allocate \`${identifier}\`, ${8} bytes`)
                .build());

            if (statement.expression) {
                instructions = instructions.concat(this.generateExpression(statement.expression))
                const size = this.contextStack.peek().getIdentifier(identifier);
                instructions.push(new OpBuilder(Opcode.MOV)
                    .withOperands(RAX, Register.offset(RBP, size))
                    .withComment(`\`${identifier}\` assignment`)
                    .build());
            }

        } else if (statement instanceof ast.ExpStatement) {
            instructions = instructions.concat(this.generateExpression(statement.expression));
        } else if (statement instanceof ast.Conditional) {

            const id = this.uniq.get();
            const postConditionalLabel = "_post_conditional_" + id;
            const elseLabel = "_else_" + id;

            instructions = instructions.concat(this.generateExpression(statement.condition));
            instructions.push(new OpBuilder(Opcode.CMP).withOperands(0, RAX).withComment("if").build());
            instructions.push(new OpBuilder(Opcode.JE).withOperands(statement.elseStatement ? elseLabel : postConditionalLabel).withComment("false").build());
            instructions = instructions.concat(this.generateStatement(statement.ifStatement, functionIdentifier));

            if (statement.elseStatement) {
                instructions.push(new OpBuilder(Opcode.JMP).withOperands(postConditionalLabel).withComment("if done").build());
                instructions.push(new Label(elseLabel));
                instructions = instructions.concat(this.generateStatement(statement.elseStatement, functionIdentifier));
            }

            instructions.push(new Label(postConditionalLabel));
        }
        return instructions;
    }

    generateFunctionParts(functionDeclaration: ast.Func): Instruction[] {
        let instructions: Instruction[] = [];
        instructions.push(new Global("_" + functionDeclaration.identifier));
        instructions.push(new Label("_" + functionDeclaration.identifier));
        this.contextStack.push(new Context());
        for (let statement of functionDeclaration.statements) {
            instructions = instructions.concat(this.generateStatement(statement, functionDeclaration.identifier));
        }
        this.contextStack.pop();
        return instructions
    }

    generate(ast: ast.AST): Instruction[] {
        const programNode: ast.Program = ast.program;
        const mainFunction = programNode.functionDeclaration;
        return this.generateFunctionParts(<ast.Func>mainFunction);
    }
}