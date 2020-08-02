import { expect } from 'chai';
import { lex, Token, TokenType } from '../src/lexer';

describe('lexer', function () {
    describe('lexer()', function () {
        it('A simple case', function () {
            const tokens = lex("int x");
            expect(2).to.equal(tokens.length);
            expect(Token.ofTypeAndValue(TokenType.KEYWORD, "int")).to.eql(tokens[0]);
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
            expect(Token.ofTypeAndValue(TokenType.KEYWORD, "int")).to.eql(tokens[0]);
            expect(Token.ofTypeAndValue(TokenType.IDENTIFIER, "main")).to.eql(tokens[1]);
            expect(Token.ofType(TokenType.PARENTHESES_OPEN)).to.eql(tokens[2]);
            expect(Token.ofType(TokenType.PARENTHESES_CLOSE)).to.eql(tokens[3]);
            expect(Token.ofType(TokenType.BRACE_OPEN)).to.eql(tokens[4]);
            expect(Token.ofTypeAndValue(TokenType.KEYWORD, "return")).to.eql(tokens[5]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "2")).to.eql(tokens[6]);
            expect(Token.ofType(TokenType.SEMICOLON)).to.eql(tokens[7]);
            expect(Token.ofType(TokenType.BRACE_CLOSE)).to.eql(tokens[8]);
        });

        it('Negation', function () {
            const tokens = lex("return -1;");
            expect(4).to.equal(tokens.length);
            expect(Token.ofTypeAndValue(TokenType.KEYWORD, "return")).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.UNARY_NEGATION)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[2]);
            expect(Token.ofType(TokenType.SEMICOLON)).to.eql(tokens[3]);
        });

        it('Logical negation', function () {
            const tokens = lex("return !1;");
            expect(4).to.equal(tokens.length);
            expect(Token.ofTypeAndValue(TokenType.KEYWORD, "return")).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.UNARY_LOGICAL_NEGATION)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[2]);
            expect(Token.ofType(TokenType.SEMICOLON)).to.eql(tokens[3]);
        });

        it('Bitwise complement', function () {
            const tokens = lex("return ~1;");
            expect(4).to.equal(tokens.length);
            expect(Token.ofTypeAndValue(TokenType.KEYWORD, "return")).to.eql(tokens[0]);
            expect(Token.ofType(TokenType.UNARY_BITWISE_COMPLEMENT)).to.eql(tokens[1]);
            expect(Token.ofTypeAndValue(TokenType.LITERAL_INTEGER, "1")).to.eql(tokens[2]);
            expect(Token.ofType(TokenType.SEMICOLON)).to.eql(tokens[3]);
        });
    });
});