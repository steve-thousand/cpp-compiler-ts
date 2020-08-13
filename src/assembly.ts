export enum Opcode {
    ADD,
    AND,
    CDQ,
    CMP,
    IDIV,
    IMUL,
    JE,
    JMP,
    MOV,
    NEG,
    OR,
    POP,
    PUSH,
    RET,
    SETE,
    SETG,
    SETGE,
    SETL,
    SETLE,
    SETNE,
    SHL,
    SHR,
    SUB,
    XOR,
}

enum RegisterIndicator {
    A,
    B,
    C,
    D,
    STACK_POINTER,
    BASE_POINTER
}

enum RegisterLength {
    CHAR_LOWER,     //*l
    CHAR_HIGHER,    //*h
    SHORT,          //*x
    INT,            //e*x
    LONG            //r*x
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
    toAssembly(): string {
        const name = this.getName();
        if (this.offset) {
            return `${this.offset}(${name})`
        } else {
            return name;
        }
    }
    private getName(): string {
        switch (this.register) {
            case RegisterIndicator.A:
            case RegisterIndicator.B:
            case RegisterIndicator.C:
            case RegisterIndicator.D:
                let registerLetter = RegisterIndicator[this.register].toLowerCase();
                switch (this.length) {
                    case RegisterLength.LONG:
                        return `%r${registerLetter}x`
                    case RegisterLength.INT:
                        return `%e${registerLetter}x`
                    case RegisterLength.SHORT:
                        return `%${registerLetter}x`
                    case RegisterLength.CHAR_HIGHER:
                        return `%${registerLetter}h`
                    case RegisterLength.CHAR_LOWER:
                        return `%${registerLetter}l`
                }
                break;
            case RegisterIndicator.BASE_POINTER:
                registerLetter = "b";
            case RegisterIndicator.STACK_POINTER:
                registerLetter = registerLetter ? registerLetter : "s";
                switch (this.length) {
                    case RegisterLength.LONG:
                        return `%r${registerLetter}p`
                    case RegisterLength.INT:
                        return `%e${registerLetter}p`
                    case RegisterLength.SHORT:
                        return `%${registerLetter}p`
                    case RegisterLength.CHAR_HIGHER:
                    case RegisterLength.CHAR_LOWER:
                        return `%${registerLetter}pl`
                }
        }
    }
}

export interface Instruction {
    toAssembly(): string
}

export class Global implements Instruction {
    readonly global: string;
    constructor(global: string) {
        this.global = global;
    }
    toAssembly(): string {
        return " .globl " + this.global;
    }
}


export class Label implements Instruction {
    readonly label: string
    constructor(label: string) {
        this.label = label;
    }
    toAssembly(): string {
        return this.label + ":";
    }
}

type Operand = number | string | Register;

class Operation implements Instruction {
    opcode: Opcode;
    operands?: Operand[];
    comment?: string;
    constructor({ opcode, operands, comment }: {
        opcode: Opcode, operands?: Operand[], comment?: string
    }) {
        this.opcode = opcode, this.operands = operands, this.comment = comment;
    }
    toAssembly(): string {
        return lineAndComment(this.comment, this.opcode, this.operands)
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
    withOperands(...operands: Operand[]) {
        this.operands = operands;
        return this;
    }
    withComment(comment: string) {
        this.comment = comment;
        return this;
    }
}

const FOUR_SPACES = "    ";

function lineAndComment(comment, opcode: Opcode, operands: Operand[]): string {
    const parts = [];
    parts.push(FOUR_SPACES);

    const opcodeName = Opcode[opcode].toLowerCase();
    parts.push(opcodeName);
    parts.push(' '.repeat(8 - opcodeName.length));

    const operandStrings = [];
    if (operands) {
        for (let operand of operands) {
            if (typeof operand === 'string') {
                operandStrings.push(operand);
            } else if (typeof operand === 'number') {
                operandStrings.push("$" + operand);
            } else if (operand instanceof Register) {
                operandStrings.push(operand.toAssembly());
            } else {
                operandStrings.push(operand);
            }
        }
    }
    const operandString = operandStrings.join(", ");
    parts.push(operandString);

    if (comment) {
        const offset = 30 - operandString.length
        parts.push(' '.repeat(offset) + " // " + comment);
    }
    return parts.join("");
}