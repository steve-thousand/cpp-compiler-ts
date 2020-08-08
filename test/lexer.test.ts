import { expect } from 'chai';
import { lex, Token, TokenType } from '../src/lexer';

describe('lexer', function () {
    describe('lexer()', function () {
        it('A simple case', function () {
            const tokens = lex("int x");
            expect(2).to.equal(tokens.length);
            expect(Token.ofType(TokenType.INT)).to.eql(tokens[0]);
            expect(Token.ofTypeAndValue(TokenType.IDENTIFIER, "x")).to.eql(tokens[1]);
        });

        /**
         * int main() {
         *  return 2;
         * }
         */
        it('Another simple case', function () {
            const tokens = lex("int main() {\n\treturn 2;\n}");
            expect(9).to.equal(tokens.length);
            expect(Token.ofType(TokenType.INT)).to.eql(tokens[0]);
            expect(Token.ofTypeAndValue(TokenType.IDENTIFIER, "main")).to.eql(tokens[1]);
            expect(Token.ofType(TokenType.PARENTHESES_OPEN)).to.eql(tokens[2]);
            expect(Token.ofType(TokenType.PARENTHESES_CLOSE)).to.eql(tokens[3]);
            expect(Token.ofType(TokenType.BRACE_OPEN)).to.eql(tokens[4]);
            expect(Token.ofType(TokenType.RETURN)).to.eql(tokens[5]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "2")).to.eql(tokens[6]);
            expect(Token.ofType(TokenType.SEMICOLON)).to.eql(tokens[7]);
            expect(Token.ofType(TokenType.BRACE_CLOSE)).to.eql(tokens[8]);
        });

        it('Negation', function () {
            const tokens = lex("return -1;");
            expect(4).to.equal(tokens.length);
            expect(Token.ofType(TokenType.RETURN)).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.MINUS)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[2]);
            expect(Token.ofType(TokenType.SEMICOLON)).to.eql(tokens[3]);
        });

        it('Logical negation', function () {
            const tokens = lex("return !1;");
            expect(4).to.equal(tokens.length);
            expect(Token.ofType(TokenType.RETURN)).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.UNARY_LOGICAL_NEGATION)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[2]);
            expect(Token.ofType(TokenType.SEMICOLON)).to.eql(tokens[3]);
        });

        it('Bitwise complement', function () {
            const tokens = lex("return ~1;");
            expect(4).to.equal(tokens.length);
            expect(Token.ofType(TokenType.RETURN)).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.UNARY_BITWISE_COMPLEMENT)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[2]);
            expect(Token.ofType(TokenType.SEMICOLON)).to.eql(tokens[3]);
        });

        it('Binary Addition', function () {
            const tokens = lex("1 + 3");
            expect(3).to.equal(tokens.length);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.BINARY_ADDITION)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary Subtraction', function () {
            const tokens = lex("1 - 3");
            expect(3).to.equal(tokens.length);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.MINUS)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary Multiplication', function () {
            const tokens = lex("1 * 3");
            expect(3).to.equal(tokens.length);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.BINARY_MULTIPLICATION)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary Division', function () {
            const tokens = lex("1 / 3");
            expect(3).to.equal(tokens.length);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.BINARY_DIVISION)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary And', function () {
            const tokens = lex("1 && 3");
            expect(3).to.equal(tokens.length);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.BINARY_AND)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary Or', function () {
            const tokens = lex("1 || 3");
            expect(3).to.equal(tokens.length);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.BINARY_OR)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });

        it('Binary Equal', function () {
            const tokens = lex("1 == 3");
            expect(3).to.equal(tokens.length);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.BINARY_EQUAL)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });
        it('Binary Not Equal', function () {
            const tokens = lex("1 != 3");
            expect(3).to.equal(tokens.length);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.BINARY_NOT_EQUAL)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });
        it('Binary Less Than', function () {
            const tokens = lex("1 < 3");
            expect(3).to.equal(tokens.length);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.BINARY_LESS_THAN)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });
        it('Binary Less Than Or Equal', function () {
            const tokens = lex("1 <= 3");
            expect(3).to.equal(tokens.length);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.BINARY_LESS_THAN_OR_EQUAL)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });
        it('Binary Greater Than', function () {
            const tokens = lex("1 > 3");
            expect(3).to.equal(tokens.length);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.BINARY_GREATER_THAN)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });
        it('Binary Greater Than Or Equal', function () {
            const tokens = lex("1 >= 3");
            expect(3).to.equal(tokens.length);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.BINARY_GREATER_THAN_OR_EQUAL)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "3")).to.eql(tokens[2]);
        });
    });
});