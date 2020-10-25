import { expect } from 'chai';
import * as asm from '../../src/asm';

/**
 * A collection of test cases, defining an operation along with the expected assembly output for 
 * both AT&T and Intel syntaxes respectively.
 */
const syntaxTestCases: [asm.Operation, string, string][] = [
    [
        new asm.OpBuilder(asm.Opcode.MOV)
            .withOperands(asm.Register.RAX, asm.Register.RBP)
            .build(),
        '    mov     %rax, %rbp',
        '    mov     rbp, rax',
    ],
    [
        new asm.OpBuilder(asm.Opcode.MOV)
            .withOperands(new asm.ImmediateInt("1"), asm.Register.RAX)
            .build(),
        '    mov     $1, %rax',
        '    mov     rax, 1',
    ],
    [
        new asm.OpBuilder(asm.Opcode.INT)
            .withOperands(new asm.ImmediateHex("80"))
            .build(),
        '    int     $0x80',
        '    int     80h',
    ],
    [
        new asm.OpBuilder(asm.Opcode.INT)
            .withOperands(new asm.ImmediateHex("FFFF"))
            .build(),
        '    int     $0xFFFF',
        '    int     FFFFh',
    ],
    [
        new asm.OpBuilder(asm.Opcode.MOV)
            .withOperands(asm.Register.RAX, asm.Register.offset(asm.Register.RBP, -16))
            .build(),
        '    mov     %rax, -16(%rbp)',
        '    mov     [rbp-16], rax',
    ],
    [
        new asm.OpBuilder(asm.Opcode.MOV)
            .withOperands(asm.Register.RAX, asm.Register.offset(asm.Register.RBP, 3))
            .build(),
        '    mov     %rax, 3(%rbp)',
        '    mov     [rbp+3], rax',
    ],
]

describe('assembly', function () {
    describe('parameterized syntax tests', function () {
        let count = 0;
        for (const syntaxTestCase of syntaxTestCases) {
            it(`test ${count} - AT_T  - "${syntaxTestCase[1]}"`, function () {
                expect(syntaxTestCase[0].toAssembly(asm.Syntax.AT_T)).to.equal(syntaxTestCase[1]);
            })
            it(`test ${count} - Intel - "${syntaxTestCase[2]}"`, function () {
                expect(syntaxTestCase[0].toAssembly(asm.Syntax.INTEL)).to.equal(syntaxTestCase[2]);
            })
            count++;
        }
    });
});