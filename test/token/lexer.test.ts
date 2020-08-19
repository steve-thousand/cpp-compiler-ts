import { expect } from 'chai';
import * as tokenize from '../../src/tokenize';

describe('tokenize.lexer', function () {
    describe('tokenize.lexer()', function () {
        it('A simple case', function () {
            const tokens = tokenize.lex("int x");
            expect(2).to.equal(tokens.length);
            expect(tokenize.Token.ofType(tokenize.TokenType.INT)).to.eql(tokens[0]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.IDENTIFIER, "x")).to.eql(tokens[1]);
        });

        /**
         * int main() {
         *  return 2;
         * }
         */
        it('Another simple case', function () {
            const tokens = tokenize.lex("int main() {\n\treturn 2;\n}");
            expect(9).to.equal(tokens.length);
            expect(tokenize.Token.ofType(tokenize.TokenType.INT)).to.eql(tokens[0]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.IDENTIFIER, "main")).to.eql(tokens[1]);
            expect(tokenize.Token.ofType(tokenize.TokenType.PARENTHESES_OPEN)).to.eql(tokens[2]);
            expect(tokenize.Token.ofType(tokenize.TokenType.PARENTHESES_CLOSE)).to.eql(tokens[3]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BRACE_OPEN)).to.eql(tokens[4]);
            expect(tokenize.Token.ofType(tokenize.TokenType.RETURN)).to.eql(tokens[5]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "2")).to.eql(tokens[6]);
            expect(tokenize.Token.ofType(tokenize.TokenType.SEMICOLON)).to.eql(tokens[7]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BRACE_CLOSE)).to.eql(tokens[8]);
        });

        it('Negation', function () {
            const tokens = tokenize.lex("return -1;");
            expect(4).to.equal(tokens.length);
            expect(tokenize.Token.ofType(tokenize.TokenType.RETURN)).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.MINUS)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[2]);
            expect(tokenize.Token.ofType(tokenize.TokenType.SEMICOLON)).to.eql(tokens[3]);
        });

        it('Logical negation', function () {
            const tokens = tokenize.lex("return !1;");
            expect(4).to.equal(tokens.length);
            expect(tokenize.Token.ofType(tokenize.TokenType.RETURN)).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.UNARY_LOGICAL_NEGATION)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[2]);
            expect(tokenize.Token.ofType(tokenize.TokenType.SEMICOLON)).to.eql(tokens[3]);
        });

        it('Bitwise complement', function () {
            const tokens = tokenize.lex("return ~1;");
            expect(4).to.equal(tokens.length);
            expect(tokenize.Token.ofType(tokenize.TokenType.RETURN)).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.UNARY_BITWISE_COMPLEMENT)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[2]);
            expect(tokenize.Token.ofType(tokenize.TokenType.SEMICOLON)).to.eql(tokens[3]);
        });

        it('Binary Addition', function () {
            const tokens = tokenize.lex("1 + 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_ADDITION)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary Subtraction', function () {
            const tokens = tokenize.lex("1 - 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.MINUS)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary Multiplication', function () {
            const tokens = tokenize.lex("1 * 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_MULTIPLICATION)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary Division', function () {
            const tokens = tokenize.lex("1 / 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_DIVISION)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary Modulo', function () {
            const tokens = tokenize.lex("1 % 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_MODULO)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary And', function () {
            const tokens = tokenize.lex("1 && 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_AND)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary Or', function () {
            const tokens = tokenize.lex("1 || 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_OR)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary Bitwise AND', function () {
            const tokens = tokenize.lex("1 & 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_BITWISE_AND)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary Bitwise OR', function () {
            const tokens = tokenize.lex("1 | 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_BITWISE_OR)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary Bitwise XOR', function () {
            const tokens = tokenize.lex("1 ^ 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_BITWISE_XOR)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary Bitwise Shift Left', function () {
            const tokens = tokenize.lex("1 << 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_BITWISE_SHIFT_LEFT)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary Bitwise Shift Right', function () {
            const tokens = tokenize.lex("1 >> 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_BITWISE_SHIFT_RIGHT)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary Equal', function () {
            const tokens = tokenize.lex("1 == 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_EQUAL)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });
        it('Binary Not Equal', function () {
            const tokens = tokenize.lex("1 != 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_NOT_EQUAL)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });
        it('Binary Less Than', function () {
            const tokens = tokenize.lex("1 < 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_LESS_THAN)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });
        it('Binary Less Than Or Equal', function () {
            const tokens = tokenize.lex("1 <= 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_LESS_THAN_OR_EQUAL)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });
        it('Binary Greater Than', function () {
            const tokens = tokenize.lex("1 > 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_GREATER_THAN)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });
        it('Binary Greater Than Or Equal', function () {
            const tokens = tokenize.lex("1 >= 3");
            expect(3).to.equal(tokens.length);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(tokenize.Token.ofType(tokenize.TokenType.BINARY_GREATER_THAN_OR_EQUAL)).to.eql(tokens[1]);
            expect(tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });
        it('Declaration', function () {
            const tokens = tokenize.lex("int a;");
            expect([
                tokenize.Token.ofType(tokenize.TokenType.INT),
                tokenize.Token.ofTypeAndValue(tokenize.TokenType.IDENTIFIER, "a"),
                tokenize.Token.ofType(tokenize.TokenType.SEMICOLON)
            ]).to.eql(tokens)
        });
        it('Assignment', function () {
            const tokens = tokenize.lex("int a = 1");
            expect([
                tokenize.Token.ofType(tokenize.TokenType.INT),
                tokenize.Token.ofTypeAndValue(tokenize.TokenType.IDENTIFIER, "a"),
                tokenize.Token.ofType(tokenize.TokenType.ASSIGNMENT),
                tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1")
            ]).to.eql(tokens)
        });
        it('If', function () {
            const tokens = tokenize.lex("if(0 == 1)");
            expect([
                tokenize.Token.ofType(tokenize.TokenType.IF),
                tokenize.Token.ofType(tokenize.TokenType.PARENTHESES_OPEN),
                tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "0"),
                tokenize.Token.ofType(tokenize.TokenType.BINARY_EQUAL),
                tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1"),
                tokenize.Token.ofType(tokenize.TokenType.PARENTHESES_CLOSE)
            ]).to.eql(tokens)
        });
        it('If else', function () {
            const tokens = tokenize.lex("if(0 == 1){}else{}");
            expect([
                tokenize.Token.ofType(tokenize.TokenType.IF),
                tokenize.Token.ofType(tokenize.TokenType.PARENTHESES_OPEN),
                tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "0"),
                tokenize.Token.ofType(tokenize.TokenType.BINARY_EQUAL),
                tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1"),
                tokenize.Token.ofType(tokenize.TokenType.PARENTHESES_CLOSE),
                tokenize.Token.ofType(tokenize.TokenType.BRACE_OPEN),
                tokenize.Token.ofType(tokenize.TokenType.BRACE_CLOSE),
                tokenize.Token.ofType(tokenize.TokenType.ELSE),
                tokenize.Token.ofType(tokenize.TokenType.BRACE_OPEN),
                tokenize.Token.ofType(tokenize.TokenType.BRACE_CLOSE)
            ]).to.eql(tokens)
        });
        it('Ternary', function () {
            const tokens = tokenize.lex("0 == 1 ? a : b");
            expect([
                tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "0"),
                tokenize.Token.ofType(tokenize.TokenType.BINARY_EQUAL),
                tokenize.Token.ofTypeAndValue(tokenize.TokenType.LITERAL_INTEGER, "1"),
                tokenize.Token.ofType(tokenize.TokenType.QUESTION_MARK),
                tokenize.Token.ofTypeAndValue(tokenize.TokenType.IDENTIFIER, "a"),
                tokenize.Token.ofType(tokenize.TokenType.COLON),
                tokenize.Token.ofTypeAndValue(tokenize.TokenType.IDENTIFIER, "b")
            ]).to.eql(tokens)
        });
        it('For', function () {
            const tokens = tokenize.lex("for(;;)");
            expect([
                tokenize.Token.ofType(tokenize.TokenType.FOR),
                tokenize.Token.ofType(tokenize.TokenType.PARENTHESES_OPEN),
                tokenize.Token.ofType(tokenize.TokenType.SEMICOLON),
                tokenize.Token.ofType(tokenize.TokenType.SEMICOLON),
                tokenize.Token.ofType(tokenize.TokenType.PARENTHESES_CLOSE),
            ]).to.eql(tokens)
        });
    });
});