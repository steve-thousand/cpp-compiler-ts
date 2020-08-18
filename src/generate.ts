import { ast } from './parser';
import { AsmStatement, Opcode, Register, Label, Global, OpBuilder } from './assembly';

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

/**
 * Keeps a map of variable identifier to current stack frame offset. Optionally inherits from a 
 * provided variable map.
 */
class VariableMap {
    private map: Map<string, number> = new Map();
    private inherits: VariableMap;

    constructor(inherits?: VariableMap) {
        this.inherits = inherits;
    }

    public put(identifier: string, offset: number) {
        this.map.set(identifier, offset);
    }

    public get(identifier: string): number {
        if (this.map.has(identifier)) {
            return this.map.get(identifier);
        } else if (this.inherits) {
            //if this map does not have it's own ref of identifier, we can make use of the inherited map
            return this.inherits.get(identifier);
        } else {
            return undefined;
        }
    }
}

/**
 * Keeps information on current stack context. This may be a simple stack frame, or it may be a
 * compound statement inside of a stack frame.
 */
//TODO technically this is specifically for a compound statement, and always appears to be relevant to a single function call
class Context {
    private label: string;
    private offset: number = 0;
    private variableMap: VariableMap;
    constructor(label: string, identifierMap: VariableMap = new VariableMap()) {
        this.label = label;
        this.variableMap = identifierMap;
    }
    getLabel() {
        return this.label;
    }
    addIdentifier(identifier: string, size: number) {
        this.offset += size;
        this.variableMap.put(identifier, this.offset)
        return this.offset;
    }
    getIdentifier(identifier: string) {
        return this.variableMap.get(identifier);
    }
    pushOffset(offset: number) {
        this, offset += offset;
    }
    popOffset(offset: number) {
        this, offset -= offset;
    }
    getSize() {
        return this.offset
    }
    makeRelevantChildContext(): Context {
        const context = new Context(this.label);
        context.offset = this.offset;
        context.variableMap = new VariableMap(this.variableMap);
        return context;
    }
}

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

export class AssemblyGenerator {

    private uniq = new UniqueIdGenerator();
    private contextStack = new Stack<Context>();
    private loopStack = new Stack<number>(); //will this work when we go to a new function call?

    generateExpression(expression: ast.Expression): AsmStatement[] {
        let instructions: AsmStatement[] = [];
        if (expression instanceof ast.BinOp) {
            const id = this.uniq.get();

            //instructions to calculate left and right hand sides
            instructions = instructions.concat(this.generateExpression(expression.left))

            //we push the result of evaluating the left side so that we can retrieve it after evaluating the right side
            instructions.push(new OpBuilder(Opcode.PUSH).withOperands(RAX).build());
            this.contextStack.peek().pushOffset(8);

            instructions = instructions.concat(this.generateExpression(expression.right))
            instructions.push(new OpBuilder(Opcode.MOV).withOperands(RAX, RCX).build()); //righthand in rcx

            instructions.push(new OpBuilder(Opcode.POP).withOperands(RAX).build()); //left hand in rax
            this.contextStack.peek().popOffset(8);

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
                    instructions.push(new OpBuilder(Opcode.SETE).withOperands(AL).withComment("==").build());
                    break;
                case ast.BinaryOperator.NOT_EQUAL:
                    instructions.push(new OpBuilder(Opcode.CMP).withOperands(RCX, RAX).build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.SETNE).withOperands(AL).withComment("!=").build());
                    break;
                case ast.BinaryOperator.LESS_THAN:
                    instructions.push(new OpBuilder(Opcode.CMP).withOperands(RCX, RAX).build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.SETL).withOperands(AL).withComment("<").build());
                    break;
                case ast.BinaryOperator.LESS_THAN_OR_EQUAL:
                    instructions.push(new OpBuilder(Opcode.CMP).withOperands(RCX, RAX).build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.SETLE).withOperands(AL).withComment("<=").build());
                    break;
                case ast.BinaryOperator.GREATER_THAN:
                    instructions.push(new OpBuilder(Opcode.CMP).withOperands(RCX, RAX).build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.SETG).withOperands(AL).withComment(">").build());
                    break;
                case ast.BinaryOperator.GREATER_THAN_OR_EQUAL:
                    instructions.push(new OpBuilder(Opcode.CMP).withOperands(RCX, RAX).build());
                    instructions.push(new OpBuilder(Opcode.MOV).withOperands(0, RAX).build());
                    instructions.push(new OpBuilder(Opcode.SETGE).withOperands(AL).withComment(">=").build());
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
                .withOperands(RAX, Register.offset(RBP, -size))
                .withComment(`\`${identifier}\` assignment`)
                .build());

        } else if (expression instanceof ast.VarReference) {

            const identifier = expression.identifier;
            const size = this.contextStack.peek().getIdentifier(identifier);
            instructions.push(new OpBuilder(Opcode.MOV)
                .withOperands(Register.offset(RBP, -size), RAX)
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

        } else if (expression instanceof ast.FuncCall) {
            //gotta put them arguments on the stack
            for (const argExpression of expression.args) {
                //TODO should this be in reverse?
                instructions = instructions.concat(this.generateExpression(argExpression));
                instructions.push(new OpBuilder(Opcode.PUSH).withOperands(RAX).build());
            }

            //actually call
            instructions.push(new OpBuilder(Opcode.CALL).withOperands("_" + expression.identifier).build());

            //roll that stack back TODO: improve this
            instructions.push(new OpBuilder(Opcode.ADD).withOperands(8, Register.RSP).build());
        }
        return instructions;
    }

    generateDeclaration(declaration: ast.Declaration): AsmStatement[] {
        let instructions: AsmStatement[] = [];
        if (declaration instanceof ast.Declare) {
            const identifier = declaration.identifier;
            this.contextStack.peek().addIdentifier(identifier, 8);
            instructions.push(new OpBuilder(Opcode.SUB)
                .withOperands(8, RSP)
                .withComment(`allocate \`${identifier}\`, ${8} bytes`)
                .build());

            if (declaration.expression) {
                instructions = instructions.concat(this.generateExpression(declaration.expression))
                const size = this.contextStack.peek().getIdentifier(identifier);
                instructions.push(new OpBuilder(Opcode.MOV)
                    .withOperands(RAX, Register.offset(RBP, -size))
                    .withComment(`\`${identifier}\` assignment`)
                    .build());
            }
        }
        return instructions;
    }

    generateStatement(statement: ast.Statement): AsmStatement[] {
        let instructions: AsmStatement[] = [];
        if (statement instanceof ast.Return) {
            if (statement.expression) {
                instructions = instructions.concat(this.generateExpression(statement.expression));
            }
            instructions.push(new OpBuilder(Opcode.JMP).withOperands("_" + this.contextStack.peek().getLabel() + "_return").build());
        } else if (statement instanceof ast.ExpStatement) {
            if (statement.expression)
                instructions = instructions.concat(this.generateExpression(statement.expression));
        } else if (statement instanceof ast.Conditional) {

            const id = this.uniq.get();
            const postConditionalLabel = "_post_conditional_" + id;
            const elseLabel = "_else_" + id;

            instructions = instructions.concat(this.generateExpression(statement.condition));
            instructions.push(new OpBuilder(Opcode.CMP).withOperands(0, RAX).withComment("if").build());
            instructions.push(new OpBuilder(Opcode.JE).withOperands(statement.elseStatement ? elseLabel : postConditionalLabel).withComment("false").build());
            instructions = instructions.concat(this.generateStatement(statement.ifStatement));

            if (statement.elseStatement) {
                instructions.push(new OpBuilder(Opcode.JMP).withOperands(postConditionalLabel).withComment("if done").build());
                instructions.push(new Label(elseLabel));
                instructions = instructions.concat(this.generateStatement(statement.elseStatement));
            }

            instructions.push(new Label(postConditionalLabel));
        } else if (statement instanceof ast.Compound) {
            //time to start a new context! it should contain a deep copy of the parent context's variable map, 
            //but have an offset of 0
            let context = this.contextStack.peek().makeRelevantChildContext();
            this.contextStack.push(context);
            //TODO we should also do the thing where we save the stack pointer/base pointer?
            for (let blockItem of statement.blockItems) {
                instructions = instructions.concat(this.generateBlockItem(blockItem));
            }
            //we need to deallocate space allocated for this compound statement
            context = this.contextStack.pop();
            if (context.getSize() > this.contextStack.peek().getSize()) {
                const sizeDiff = context.getSize() - this.contextStack.peek().getSize();
                instructions.push(new OpBuilder(Opcode.ADD)
                    .withOperands(sizeDiff, RSP)
                    .withComment(`deallocate ${sizeDiff} bytes`)
                    .build());
            }
        } else if (statement instanceof ast.For || statement instanceof ast.ForDecl) {
            const id = this.uniq.get();
            this.loopStack.push(id);
            if (statement instanceof ast.For) {
                if (statement.init) {
                    instructions = instructions.concat(this.generateExpression(statement.init));
                }
            } else if (statement instanceof ast.ForDecl) {
                instructions = instructions.concat(this.generateDeclaration(statement.decl));
            }
            instructions.push(new Label("_loop_" + id));

            //evaluate condition to see if we should jump to the end
            instructions = instructions.concat(this.generateExpression(statement.condition));
            instructions.push(new OpBuilder(Opcode.CMP).withOperands(0, RAX).build());
            instructions.push(new OpBuilder(Opcode.JE).withOperands("_end_loop_" + id).build());

            //execute body
            instructions = instructions.concat(this.generateStatement(statement.body));

            //execute post-body
            if (statement.post) {
                instructions = instructions.concat(this.generateExpression(statement.post));
            }

            //back to top
            instructions.push(new OpBuilder(Opcode.JMP).withOperands("_loop_" + id).build())

            instructions.push(new Label("_end_loop_" + id));
            this.loopStack.pop();
        } else if (statement instanceof ast.While) {
            const id = this.uniq.get();
            this.loopStack.push(id);
            instructions.push(new Label("_loop_" + id));

            //evaluate condition to see if we should jump to the end
            instructions = instructions.concat(this.generateExpression(statement.condition));
            instructions.push(new OpBuilder(Opcode.CMP).withOperands(0, RAX).build());
            instructions.push(new OpBuilder(Opcode.JE).withOperands("_end_loop_" + id).build());

            //execute body
            instructions = instructions.concat(this.generateStatement(statement.body));

            //back to top
            instructions.push(new OpBuilder(Opcode.JMP).withOperands("_loop_" + id).build())

            instructions.push(new Label("_end_loop_" + id));
            this.loopStack.pop();
        } else if (statement instanceof ast.Do) {
            const id = this.uniq.get();
            this.loopStack.push(id);
            instructions.push(new Label("_loop_" + id));

            //execute body
            instructions = instructions.concat(this.generateStatement(statement.body));

            //evaluate condition to see if we should jump to the end
            instructions = instructions.concat(this.generateExpression(statement.condition));
            instructions.push(new OpBuilder(Opcode.CMP).withOperands(0, RAX).build());
            instructions.push(new OpBuilder(Opcode.JE).withOperands("_end_loop_" + id).build());

            //back to top
            instructions.push(new OpBuilder(Opcode.JMP).withOperands("_loop_" + id).build())

            instructions.push(new Label("_end_loop_" + id));
            this.loopStack.pop();
        } else if (statement instanceof ast.Break) {
            instructions.push(new OpBuilder(Opcode.JMP).withOperands("_end_loop_" + this.loopStack.peek()).build());
        } else if (statement instanceof ast.Continue) {
            instructions.push(new OpBuilder(Opcode.JMP).withOperands("_loop_" + this.loopStack.peek()).build());
        }
        return instructions;
    }

    generateBlockItem(blockItem: ast.BlockItem): AsmStatement[] {
        let instructions: AsmStatement[] = [];
        if (blockItem instanceof ast.Statement) {
            instructions = instructions.concat(this.generateStatement(blockItem));
        } else if (blockItem instanceof ast.Declaration) {
            instructions = instructions.concat(this.generateDeclaration(blockItem));
        }
        return instructions;
    }

    generateFunctionParts(functionDeclaration: ast.Func): AsmStatement[] {
        let instructions: AsmStatement[] = [];
        instructions.push(new Global("_" + functionDeclaration.identifier));
        instructions.push(new Label("_" + functionDeclaration.identifier));
        instructions.push(new OpBuilder(Opcode.PUSH).withOperands(RBP).build())
        instructions.push(new OpBuilder(Opcode.MOV).withOperands(RSP, RBP).build())

        //arguments?
        let offset = -8; //TODO: why does this need to start at -8 again? i think that's a bug
        const identifierMap: VariableMap = new VariableMap();
        //TODO reverse? this can be faster, but argument lists are usually pretty small
        for (const arg of functionDeclaration.parameters.reverse()) {
            offset -= 8;
            identifierMap.put(arg, offset);
        }

        this.contextStack.push(new Context(functionDeclaration.identifier, identifierMap));
        for (let blockItem of functionDeclaration.blockItems) {
            instructions = instructions.concat(this.generateBlockItem(blockItem));
        }

        instructions.push(new Label("_" + functionDeclaration.identifier + "_return"));

        //deallocate space if we have any
        const size = this.contextStack.peek().getSize();
        if (size) {
            instructions.push(new OpBuilder(Opcode.ADD)
                .withOperands(size, RSP)
                .withComment(`deallocate ${size} bytes`)
                .build());
        }

        instructions.push(new OpBuilder(Opcode.MOV).withOperands(RBP, RSP).build())
        instructions.push(new OpBuilder(Opcode.POP).withOperands(RBP).build())
        instructions.push(new OpBuilder(Opcode.RET).build())

        this.contextStack.pop();
        return instructions
    }

    generate(tree: ast.AST): AsmStatement[] {
        let instructions: AsmStatement[] = [];
        const programNode: ast.Program = tree.program;
        for (const functionDeclaration of programNode.functionDeclarations) {
            if (functionDeclaration instanceof ast.Func) {
                instructions = instructions.concat(this.generateFunctionParts(functionDeclaration));
            }
        }
        return instructions
    }
}