import { assert, expect } from 'chai';
import { lex, Token } from '../src/lexer';
import { parse, AST } from '../src/parser';
import { generate } from '../src/generate';

const return2 = ` .globl _main
_main:
movl    $2, %eax
ret`;


describe('generator', function () {
    describe('generate()', function () {
        it('A simple case', function () {
            const tokens: Token[] = lex("int main() {\n\treturn 2;\n}");
            const ast: AST = parse(tokens);
            const generated = generate(ast);
            expect(return2).to.equal(generated);
        });
        it('Negation', function () {
            const tokens: Token[] = lex("int main() {\n\treturn -5;\n}");
            const ast: AST = parse(tokens);
            const generated = generate(ast);
            expect(
                " .globl _main\n" +
                "_main:\n" +
                "movl    $5, %eax\n" +
                "neg    %eax\n" +
                "ret"
            ).to.equal(generated);
        });
        it('Bitwise complement', function () {
            const tokens: Token[] = lex("int main() {\n\treturn ~5;\n}");
            const ast: AST = parse(tokens);
            const generated = generate(ast);
            expect(
                " .globl _main\n" +
                "_main:\n" +
                "movl    $5, %eax\n" +
                "xor    %eax, 0xFFFF\n" +
                "ret"
            ).to.equal(generated);
        });
        it('Logical negation', function () {
            const tokens: Token[] = lex("int main() {\n\treturn !5;\n}");
            const ast: AST = parse(tokens);
            const generated = generate(ast);
            expect(
                " .globl _main\n" +
                "_main:\n" +
                "movl    $5, %eax\n" +
                "cmpl    $0, %eax\n" +
                "movl    $0, %eax\n" +
                "sete    %al\n" +
                "ret"
            ).to.equal(generated);
        });
    });
});