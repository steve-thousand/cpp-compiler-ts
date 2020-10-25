/**
 * Useful guides that were followed to define some of these rules:
 * https://docs.oracle.com/cd/E26502_01/html/E28388/ennab.html#scrolltoc
 * https://imada.sdu.dk/~kslarsen/Courses/dm546-2019-spring/Material/IntelnATT.htm#:~:text=The%20direction%20of%20the%20operands,second%20operand%20is%20the%20destination.lltoc
 */

export enum Syntax {
    INTEL,
    AT_T
}

//god forgive me
export const DEFAULT_SYNTAX: Syntax = Syntax.AT_T;

/**
 * These enums don't technically need string values, but it is VERY helpful for debugging.
 */
export enum Opcode {
    ADD = "ADD",
    AND = "AND",
    CALL = "CALL",
    CDQ = "CDQ",
    CMP = "CMP",
    IDIV = "IDIV",
    IMUL = "IMUL",
    INT = "INT",
    JE = "JE",
    JMP = "JMP",
    MOV = "MOV",
    NEG = "NEG",
    OR = "OR",
    POP = "POP",
    PUSH = "PUSH",
    RET = "RET",
    SETE = "SETE",
    SETG = "SETG",
    SETGE = "SETGE",
    SETL = "SETL",
    SETLE = "SETLE",
    SETNE = "SETNE",
    SHL = "SHL",
    SHR = "SHR",
    SUB = "SUB",
    XOR = "XOR",
}

enum RegisterIndicator {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    STACK_POINTER = "STACK_POINTER",
    BASE_POINTER = "BASE_POINTER",
}

enum RegisterLength {
    CHAR_LOWER = "CHAR_LOWER",      //*l
    CHAR_HIGHER = "CHAR_HIGHER",    //*h
    SHORT = "SHORT",                //*x
    INT = "INT",                    //e*x
    LONG = "LONG"                   //r*x
}

export class Register {
    readonly register: RegisterIndicator;
    readonly length: RegisterLength;
    readonly offset: number = 0;

    static readonly RAX = Register.of(RegisterIndicator.A, RegisterLength.LONG);
    static readonly AL = Register.of(RegisterIndicator.A, RegisterLength.CHAR_LOWER);
    static readonly RBX = Register.of(RegisterIndicator.B, RegisterLength.LONG);
    static readonly RCX = Register.of(RegisterIndicator.C, RegisterLength.LONG);
    static readonly RDX = Register.of(RegisterIndicator.D, RegisterLength.LONG);
    static readonly RSP = Register.of(RegisterIndicator.STACK_POINTER, RegisterLength.LONG);
    static readonly RBP = Register.of(RegisterIndicator.BASE_POINTER, RegisterLength.LONG);

    private constructor(register: RegisterIndicator, length: RegisterLength, offset: number) {
        this.register = register;
        this.length = length;
        this.offset = offset;
    }
    private static of(register: RegisterIndicator, length: RegisterLength, offset?: number) {
        return new Register(register, length, offset);
    }
    static offset(reg: Register, offset: number) {
        return new Register(reg.register, reg.length, offset);
    }
    toAssembly(syntax: Syntax): string {
        const name = this.getName(syntax);
        if (this.offset) {
            if (syntax === Syntax.AT_T) {
                return `${this.offset}(${name})`
            } else {
                return `[${name}${this.offset >= 0 ? "+" + this.offset : this.offset}]`
            }
        } else {
            return name;
        }
    }
    private getName(syntax: Syntax): string {
        const prefix = syntax === Syntax.AT_T ? "%" : "";
        switch (this.register) {
            case RegisterIndicator.A:
            case RegisterIndicator.B:
            case RegisterIndicator.C:
            case RegisterIndicator.D:
                let registerLetter = RegisterIndicator[this.register].toLowerCase();
                switch (this.length) {
                    case RegisterLength.LONG:
                        return `${prefix}r${registerLetter}x`
                    case RegisterLength.INT:
                        return `${prefix}e${registerLetter}x`
                    case RegisterLength.SHORT:
                        return `${prefix}${registerLetter}x`
                    case RegisterLength.CHAR_HIGHER:
                        return `${prefix}${registerLetter}h`
                    case RegisterLength.CHAR_LOWER:
                        return `${prefix}${registerLetter}l`
                }
                break;
            case RegisterIndicator.BASE_POINTER:
                registerLetter = "b";
            case RegisterIndicator.STACK_POINTER:
                registerLetter = registerLetter ? registerLetter : "s";
                switch (this.length) {
                    case RegisterLength.LONG:
                        return `${prefix}r${registerLetter}p`
                    case RegisterLength.INT:
                        return `${prefix}e${registerLetter}p`
                    case RegisterLength.SHORT:
                        return `${prefix}${registerLetter}p`
                    case RegisterLength.CHAR_HIGHER:
                    case RegisterLength.CHAR_LOWER:
                        return `${prefix}${registerLetter}pl`
                }
        }
    }
}

export interface AsmStatement {
    toAssembly(syntax: Syntax): string
}

export interface AsmDirective extends AsmStatement { }

export class Global implements AsmDirective {
    readonly global: string;
    constructor(global: string) {
        this.global = global;
    }
    toAssembly(syntax: Syntax): string {
        return " .globl " + this.global;
    }
}


export class Label implements AsmStatement {
    readonly label: string
    constructor(label: string) {
        this.label = label;
    }
    toAssembly(syntax: Syntax): string {
        return this.label + ":";
    }
}

abstract class Immediate {
    readonly value: string
    constructor(value) {
        this.value = value;
    }
    toAssembly(syntax: Syntax): string {
        return this.getPrefix(syntax) + this.value + this.getSuffix(syntax);
    }
    abstract getPrefix(syntax: Syntax): string;
    abstract getSuffix(syntax: Syntax): string;
}

export class ImmediateHex extends Immediate {
    getPrefix(syntax: Syntax): string {
        return syntax === Syntax.AT_T ? "$0x" : "";
    }
    getSuffix(syntax: Syntax) {
        return syntax === Syntax.INTEL ? "h" : "";
    }
}

export class ImmediateInt extends Immediate {
    getPrefix(syntax: Syntax): string {
        return syntax === Syntax.AT_T ? "$" : "";
    }
    getSuffix(syntax: Syntax): string {
        return "";
    }
}

/**
 * Valid operands for an instruction.
 */
type Operand = number | Immediate | Register | Label;

export class Operation implements AsmStatement {
    opcode: Opcode;
    operands?: Operand[];
    comment?: string;
    constructor({ opcode, operands, comment }: {
        opcode: Opcode, operands?: Operand[], comment?: string
    }) {
        this.opcode = opcode, this.operands = operands, this.comment = comment;
    }
    toAssembly(syntax: Syntax): string {
        return lineAndComment(syntax, this.comment, this.opcode, this.operands)
    }
}

export class OpBuilder {
    private opcode: Opcode;
    private operands: Operand[];
    private comment: string;
    constructor(opcode: Opcode) {
        this.opcode = opcode;
    }
    build(): Operation {
        return new Operation({ opcode: this.opcode, operands: this.operands, comment: this.comment });
    }
    /**
     * Operands should be provided in AT&T syntax order, where source comes first, followed by destination.
     * @param operands the operands to pass to the provided instruction
     */
    withOperands(...operands: Operand[]) {
        this.operands = operands;
        return this;
    }
    withComment(comment: string) {
        this.comment = comment;
        return this;
    }
}

function lineAndComment(syntax: Syntax, comment, opcode: Opcode, operands: Operand[]): string {
    const parts = [];
    parts.push("    ");

    const opcodeName = Opcode[opcode].toLowerCase();
    parts.push(opcodeName);
    parts.push(' '.repeat(8 - opcodeName.length));

    let operandStrings = [];
    if (operands) {
        for (let operand of operands) {
            if (typeof operand === 'string') {
                operandStrings.push(operand);
            } else if (typeof operand === 'number') {
                //for ease of writing, I assume all numbers passed in are integers
                operandStrings.push(new ImmediateInt(operand).toAssembly(syntax));
            } else if (operand instanceof Immediate) {
                operandStrings.push(operand.toAssembly(syntax));
            } else if (operand instanceof Register) {
                operandStrings.push(operand.toAssembly(syntax));
            } else if (operand instanceof Label) {
                operandStrings.push(operand.label);
            } else {
                operandStrings.push(operand);
            }
        }
    }
    if (syntax === Syntax.INTEL) {
        operandStrings = operandStrings.reverse();
    }
    const operandString = operandStrings.join(", ");
    parts.push(operandString);

    if (comment) {
        const offset = 30 - operandString.length
        parts.push(' '.repeat(offset) + " // " + comment);
    }
    return parts.join("");
}